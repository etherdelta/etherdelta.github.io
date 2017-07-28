/* eslint-env browser */
/* global $, alertify, ga, EJS, google, web3 */
/* eslint no-console: ["error", { allow: ["log"] }] */

const getParameterByName = (nameIn, urlIn) => {
  const url = urlIn || window.location.href;
  const name = nameIn.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const configName = getParameterByName('config');
let config;
if (configName === 'testnet') {
  config = require('./config_testnet.js'); // eslint-disable-line global-require
} else {
  config = require('./config.js'); // eslint-disable-line global-require
}
const Web3 = require('web3');
const utility = require('./common/utility.js')(config);
const sha256 = require('js-sha256').sha256;
const BigNumber = require('bignumber.js');
require('datejs');
const async = typeof window === 'undefined' ? require('async') : require('async/dist/async.min.js');
const translations = require('./translations.js');

function EtherDelta() {
  this.q = async.queue((task, callback) => {
    task(callback);
  }, 1);
  this.addrs = undefined;
  this.pks = undefined;
  this.addrKinds = {};
  this.selectedAccount = 0;
  this.selectedToken = undefined;
  this.selectedBase = undefined;
  this.cookie = undefined;
  this.connection = undefined;
  this.nonce = undefined;
  this.price = undefined;
  this.priceUpdated = Date.now();
  this.contractEtherDelta = undefined;
  this.contractToken = undefined;
  this.eventsCache = {};
  this.publishingOrders = false;
  this.pendingTransactions = [];
  this.defaultdecimals = new BigNumber(1000000000000000000);
  this.language = 'en';
  this.minOrderSize = 0.01;
  this.messageToSend = undefined;
  this.translator = undefined;
  this.secondsPerBlock = 15;
  this.usersWithOrdersToUpdate = {};
  this.apiServerNonce = undefined;
  this.ordersResultByPair = { orders: [], blockNumber: 0 };
  this.topOrdersResult = { orders: [], blockNumber: 0 };
  this.selectedContract = undefined;
  this.returnTicker = {};
  this.web3 = undefined;
  this.daysOfData = 7;
  this.minGas = 0.005;
  window.addEventListener('load', () => {
    this.startEtherDelta();
  });
}
EtherDelta.prototype.ejs = function ejs(url, element, data) {
  if ($(`#${element}`).length) {
    new EJS({ url }).update(element, data);
    this.translator.lang(this.language);
  } else {
    console.log(`Failed to render template because ${element} does not exist.`);
  }
};
if (!alertify.dialogError) {
  alertify.dialog('dialogError', function factory() { // eslint-disable-line prefer-arrow-callback
    const header = '<span class="fa fa-times-circle fa-2x" style="vertical-align: middle; color: #ff0000;"></span> Error';
    return {
      build() {
        this.setHeader(header);
      },
    };
  }, true, 'alert');
}
if (!alertify.dialogInfo) {
  alertify.dialog('dialogInfo', function factory() { // eslint-disable-line prefer-arrow-callback
    const header = '<span class="fa fa-info-circle fa-2x" style="vertical-align: middle; color: #0000ff;"></span>';
    return {
      build() {
        this.setHeader(header);
      },
    };
  }, true, 'alert');
}
EtherDelta.prototype.dialogInfo = function dialogInfo(message) {
  console.log(message);
  alertify.dialogInfo(message);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Dialog',
    eventAction: 'Info',
  });
};
EtherDelta.prototype.dialogError = function dialogError(message) {
  console.log(message);
  alertify.dialogError(message);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Dialog',
    eventAction: 'Error',
  });
};
EtherDelta.prototype.alertSuccess = function alertSuccess(message) {
  console.log(message);
  alertify.success(message);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Alert',
    eventAction: 'Success',
  });
};
EtherDelta.prototype.txError = function txError(err) {
  console.log('Error', err);
  utility.getBalance(this.web3, this.addrs[this.selectedAccount], (errBalance, resultBalance) => {
    const balance = utility.weiToEth(resultBalance);
    if (this.connection.connection === 'RPC' && this.addrKinds[this.selectedAccount] !== 'MetaMask') {
      if (this.pks[this.selectedAccount]) {
        this.dialogError('You are using an EtherDelta account that has a private key attached, but you\'re connected to MetaMask. You should disable MetaMask from Chrome\'s Window -> Extensions menu (don\'t worry, this won\'t lose your MetaMask data), then refresh EtherDelta.');
        ga('send', {
          hitType: 'event',
          eventCategory: 'Error',
          eventAction: 'Ethereum - transaction error',
        });
      } else {
        this.dialogError('You are connected to MetaMask, but you are either using a non-MetaMask account, or you are not logged into the MetaMask account you have selected. Check this in MetaMask, then refresh and try again.');
        ga('send', {
          hitType: 'event',
          eventCategory: 'Error',
          eventAction: 'Ethereum - transaction error',
        });
      }
    } else if (this.connection.connection === 'Proxy' && !this.pks[this.selectedAccount]) {
      this.dialogError('You are using an EtherDelta account that doesn\'t have a private key attached. Perhaps you created the account using MetaMask, in which case you should make sure MetaMask is enabled and logged in to this account, then refresh EtherDelta. Or, if you have the private key, you can choose "Import account" from the accounts dropdown (upper right) to re-import the account with its private key.');
      ga('send', {
        hitType: 'event',
        eventCategory: 'Error',
        eventAction: 'Ethereum - transaction error',
      });
    } else if (this.connection.connection === 'Proxy' && !utility.verifyPrivateKey(this.addrs[this.selectedAccount], this.pks[this.selectedAccount])) {
      this.dialogError('You are using an EtherDelta account that has an invalid private key.');
      ga('send', {
        hitType: 'event',
        eventCategory: 'Error',
        eventAction: 'Ethereum - transaction error',
      });
    } else if (this.connection.connection === 'Proxy' && balance < 2 * this.minGas) {
      this.dialogError(
        `Your wallet's ETH balance (${balance} ETH) is not enough to cover the gas cost (Ethereum network fee). EtherDelta sends ${this.minGas} ETH with each transaction. This is an overestimate and the excess will get refunded to you. It's a good idea to send more than ${this.minGas} so you can pay for not only this transaction, but also future transactions you do on EtherDelta. The gas has to come directly from your Wallet (EtherDelta has no physical way of paying gas from your deposited ETH).`);
      ga('send', {
        hitType: 'event',
        eventCategory: 'Error',
        eventAction: 'Ethereum - transaction error',
      });
    } else {
      this.dialogError('You tried to send an Ethereum transaction but there was an error.');
      ga('send', {
        hitType: 'event',
        eventCategory: 'Error',
        eventAction: 'Ethereum - transaction error',
      });
    }
  });
};
EtherDelta.prototype.alertTxResult = function alertTxResult(err, txsIn) {
  const txs = Array.isArray(txsIn) ? txsIn : [txsIn];
  if (err) {
    this.txError(err);
  } else {
    if (txs.length === 1) {
      const tx = txs[0];
      if (
        tx.txHash &&
        tx.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        this.dialogInfo(
          `You just created an Ethereum transaction. Track its progress: <a href="https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/tx/${tx.txHash}" target="_blank">${tx.txHash}</a>.`);
      } else {
        this.txError();
      }
    } else if (txs.length > 1) {
      if (txs.findIndex(x => !x.txHash) < 0) {
        let message = 'You just created Ethereum transactions. Track their progress: <br />';
        txs.forEach((tx) => {
          message += `<a href="https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/tx/${tx.txHash}" target="_blank">${tx.txHash}</a><br />`;
        });
        this.dialogInfo(message);
      } else {
        this.txError();
      }
    }
    ga('send', {
      hitType: 'event',
      eventCategory: 'Ethereum',
      eventAction: `Ethereum transactions (${txs.length})`,
    });
  }
};
EtherDelta.prototype.enableTooltipsAndPopovers = function enableTooltipsAndPopovers() {
  $('[data-toggle="popover"]').popover({ trigger: 'hover' });
  $('[data-toggle="tooltip"]').tooltip();
};
EtherDelta.prototype.createAccount = function createAccount() {
  const newAccount = utility.createAccount();
  const addr = newAccount.address;
  const pk = newAccount.privateKey;
  this.addAccount(addr, pk);
  this.dialogInfo(
    `You just created an Ethereum account: ${addr}<br /><br />Please BACKUP the private key for this account: ${pk}`);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Create Account',
  });
};
EtherDelta.prototype.deleteAccount = function deleteAccount() {
  if (this.pks[this.selectedAccount]) {
    const addr = this.addrs[this.selectedAccount];
    const pk = this.pks[this.selectedAccount];
    this.dialogInfo(
      `You are about to remove an Ethereum account: ${addr}<br /><br />If it has funds, please BACKUP the private key for this account: ${pk}`);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Show private key and delete',
    });
  }
  this.addrs.splice(this.selectedAccount, 1);
  this.pks.splice(this.selectedAccount, 1);
  this.selectedAccount = 0;
  this.nonce = undefined;
  this.refresh(() => {}, true, true);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Delete Account',
  });
};
EtherDelta.prototype.selectAccount = function selectAccount(i) {
  this.selectedAccount = i;
  this.nonce = undefined;
  this.refresh(() => {}, true, true);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Select Account',
  });
};
EtherDelta.prototype.addAccount = function addAccount(newAddr, newPk) {
  let addr = newAddr.toLowerCase();
  let pk = newPk;
  if (addr.slice(0, 2) !== '0x') addr = `0x${addr}`;
  if (pk.slice(0, 2) === '0x') pk = pk.slice(2);
  addr = utility.toChecksumAddress(addr);
  let verifyPrivateKey;
  try {
    verifyPrivateKey = utility.verifyPrivateKey(addr, pk);
  } catch (err) {
    verifyPrivateKey = false;
  }
  if (pk && !verifyPrivateKey) {
    this.dialogError(`For account ${addr}, the private key is invalid.`);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Add Account - invalid private key',
    });
  } else if (!this.web3.isAddress(addr)) {
    this.dialogError(`The specified address, ${addr}, is invalid.`);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Add Account - invalid address',
    });
  } else {
    this.addrs.push(addr);
    this.pks.push(pk);
    this.selectedAccount = this.addrs.length - 1;
    this.nonce = undefined;
    this.refresh(() => {}, true, true);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Add Account',
    });
  }
};
EtherDelta.prototype.showPrivateKey = function showPrivateKey() {
  const addr = this.addrs[this.selectedAccount];
  const pk = this.pks[this.selectedAccount];
  if (!pk) {
    this.dialogError(
      `For account ${addr}, there is no private key available. You can still transact if you are connected to Ethereum and the account is unlocked.`);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Show private key - unavailable',
    });
  } else {
    this.dialogInfo(`For account ${addr}, the private key is ${pk}.`);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Show private key',
    });
  }
};
EtherDelta.prototype.addressLink = function addressLink(address) {
  return `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/address/${address}`;
};
EtherDelta.prototype.contractAddr = function contractAddr(addr) {
  this.config.contractEtherDeltaAddr = addr;
  this.displayConnectionDescription(() => {});
  this.loading(() => {});
  this.refresh(() => {}, true, true);
};
EtherDelta.prototype.displayAccounts = function displayAccounts(callback) {
  if (this.addrs.length <= 0 || this.addrs.length !== this.pks.length) {
    this.addrs = [this.config.ethAddr];
    this.pks = [this.config.ethAddrPrivateKey];
    this.selectedAccount = 0;
  }
  async.map(
    this.addrs.map((x, i) => i),
    (i, callbackMap) => {
      const addr = this.addrs[i];
      const pk = this.pks[i] ? true : false; // eslint-disable-line no-unneeded-ternary
      const kind = this.addrKinds[i];
      utility.getBalance(this.web3, addr, (err, balance) => {
        callbackMap(null, { addr, balance, pk, kind });
      });
    },
    (err, addresses) => {
      const addressLink = `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/address/${this.addrs[this.selectedAccount]}`;
      this.ejs(`${this.config.homeURL}/templates/addresses.ejs`, 'addresses', {
        addresses,
        selectedAccount: this.selectedAccount,
        addressLink,
        connection: this.connection.connection,
      });
      callback();
    });
};
EtherDelta.prototype.displayLanguages = function displayLanguages(callback) {
  const languages = Object.keys(translations.trades);
  this.ejs(`${this.config.homeURL}/templates/languages.ejs`, 'languages', {
    languages,
    language: this.language,
  });
  callback();
};
EtherDelta.prototype.selectLanguage = function selectLanguage(newLanguage) {
  this.language = newLanguage;
  window.title = translations.title[this.language];
  this.translator.lang(this.language);
  this.displayLanguages(() => {});
  this.refresh(() => {}, true, true);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Select language',
    eventLabel: newLanguage,
  });
};
EtherDelta.prototype.loadEvents = function loadEvents(callback) {
  let lastBlock = 0;
  Object.keys(this.eventsCache).forEach((id) => {
    const event = this.eventsCache[id];
    if (event.blockNumber > lastBlock && event.address === this.config.contractEtherDeltaAddr) {
      lastBlock = event.blockNumber;
    }
  });
  console.log('lastBlock', lastBlock);
  utility.getURL(`${this.config.apiServer}/events/${this.apiServerNonce}/${lastBlock}`, (err, result) => {
    if (!err && result !== 'error') {
      try {
        const res = JSON.parse(result);
        const blockNumber = res.blockNumber;
        const events = res.events;
        let newEvents = 0;
        Object.values(events).forEach((event) => {
          if (!this.eventsCache[event.transactionHash + event.logIndex]) {
            Object.keys(event.args).forEach((arg) => {
              if (typeof event.args[arg] === 'string' && event.args[arg].slice(0, 2) !== '0x') {
                Object.assign(event.args, { [arg]: new BigNumber(event.args[arg]) });
              }
            });
            newEvents += 1;
            this.eventsCache[event.transactionHash + event.logIndex] = event;
            // users with orders to update
            if (event.event === 'Trade') {
              this.usersWithOrdersToUpdate[event.args.give] = true;
              this.usersWithOrdersToUpdate[event.args.get] = true;
            } else if (['Deposit', 'Withdraw', 'Cancel'].indexOf(event.event) >= 0) {
              this.usersWithOrdersToUpdate[event.args.user] = true;
            }
          }
        });
        Object.keys(this.eventsCache).forEach((key) => {
          if (this.eventsCache[key].blockNumber <
          blockNumber - ((86400 * this.daysOfData) / this.secondsPerBlock)) {
            delete this.eventsCache[key];
          }
        });
        callback(null, newEvents);
      } catch (errGet) {
        console.log('Events log has not changed since last refresh.');
        callback(null, 0);
      }
    } else {
      this.apiServerNonce = Math.random().toString().slice(2) +
        Math.random().toString().slice(2);
      callback(null, 0);
    }
  });
};
EtherDelta.prototype.displayMyTransactions =
function displayMyTransactions(ordersIn, blockNumber, callback) {
  // only look at orders for the selected token and base
  let orders = ordersIn.filter(
    x =>
      (x.order.tokenGet.toLowerCase() === this.selectedToken.addr.toLowerCase() &&
        x.order.tokenGive.toLowerCase() === this.selectedBase.addr.toLowerCase() &&
        x.amount > 0) ||
      (x.order.tokenGive.toLowerCase() === this.selectedToken.addr.toLowerCase() &&
        x.order.tokenGet.toLowerCase() === this.selectedBase.addr.toLowerCase() &&
        x.amount < 0));
  // only include orders by the selected user
  orders = orders.filter(
    order => this.addrs[this.selectedAccount].toLowerCase() === order.order.user.toLowerCase());
  // filter only orders that match the smart contract address
  orders = orders.filter(order => order.order.contractAddr === this.config.contractEtherDeltaAddr);
  // final order filtering and sorting
  const buyOrders = orders.filter(x => x.amount > 0);
  const sellOrders = orders.filter(x => x.amount < 0);
  sellOrders.sort((a, b) => b.price - a.price || b.id - a.id);
  buyOrders.sort((a, b) => b.price - a.price || a.id - b.id);
  // events
  const myEvents = [];
  const events = Object.values(this.eventsCache);
  events.forEach((event) => {
    try {
      if (
        event.event === 'Trade' &&
        event.address === this.config.contractEtherDeltaAddr &&
        (event.args.get.toLowerCase() === this.addrs[this.selectedAccount].toLowerCase() ||
          event.args.give.toLowerCase() === this.addrs[this.selectedAccount].toLowerCase())
      ) {
        let trade;
        if (event.args.amountGive.toNumber() > 0 && event.args.amountGet.toNumber() > 0) {
          // don't show trades involving 0 amounts
          if (
            event.args.tokenGet.toLowerCase() === this.selectedToken.addr.toLowerCase() &&
            event.args.tokenGive.toLowerCase() === this.selectedBase.addr.toLowerCase()
          ) {
            // sell
            trade = {
              amount: -event.args.amountGet,
              price: event.args.amountGive
                .div(event.args.amountGet)
                .mul(this.getDivisor(event.args.tokenGet))
                .div(this.getDivisor(event.args.tokenGive)),
              buyer: event.args.get,
              seller: event.args.give,
            };
          } else if (
            event.args.tokenGet.toLowerCase() === this.selectedBase.addr.toLowerCase() &&
            event.args.tokenGive.toLowerCase() === this.selectedToken.addr.toLowerCase()
          ) {
            // buy
            trade = {
              amount: event.args.amountGive,
              price: event.args.amountGet
                .div(event.args.amountGive)
                .mul(this.getDivisor(event.args.tokenGive))
                .div(this.getDivisor(event.args.tokenGet)),
              buyer: event.args.give,
              seller: event.args.get,
            };
          }
        }
        if (trade) {
          const txLink = `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/tx/${event.transactionHash}`;
          myEvents.push({
            trade,
            id: (event.blockNumber * 1000) + event.transactionIndex,
            blockNumber: event.blockNumber,
            txLink,
          });
        }
      } else if (
        event.event === 'Deposit' &&
        event.address === this.config.contractEtherDeltaAddr &&
        (
          event.args.token === this.selectedBase.addr ||
          event.args.token === this.selectedToken.addr
        ) &&
        event.args.user.toLowerCase() === this.addrs[this.selectedAccount].toLowerCase()
      ) {
        const txLink = `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/tx/${event.transactionHash}`;
        const deposit = {
          token: event.args.token === this.selectedToken.addr ?
            this.selectedToken : this.selectedBase,
          amount: event.args.amount,
          balance: event.args.balance,
        };
        myEvents.push({
          deposit,
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          txLink,
        });
      } else if (
        event.event === 'Withdraw' &&
        event.address === this.config.contractEtherDeltaAddr &&
        (
          event.args.token === this.selectedBase.addr ||
          event.args.token === this.selectedToken.addr
        ) &&
        event.args.user.toLowerCase() === this.addrs[this.selectedAccount].toLowerCase()
      ) {
        const txLink = `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/tx/${event.transactionHash}`;
        const withdraw = {
          token: event.args.token === this.selectedToken.addr ?
            this.selectedToken : this.selectedBase,
          amount: event.args.amount,
          balance: event.args.balance,
        };
        myEvents.push({
          withdraw,
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          txLink,
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
  myEvents.sort((a, b) => b.id - a.id);
  // pending transactions
  async.map(
    this.pendingTransactions,
    (tx, callbackMap) => {
      utility.txReceipt(this.web3, tx.txHash, (err, result) => {
        if (!err && result && result.blockNumber) {
          callbackMap(null, undefined);
        } else {
          callbackMap(null, tx);
        }
      });
    },
    (err, results) => {
      this.pendingTransactions = results.filter(x => x);
      // display the template
      this.ejs(`${this.config.homeURL}/templates/myTrades.ejs`, 'myTrades', {
        translator: this.translator,
        selectedAddr: this.addrs[this.selectedAccount],
        selectedToken: this.selectedToken,
        selectedBase: this.selectedBase,
        myEvents,
        pendingTransactions: this.pendingTransactions,
        blockNumber,
      });
      this.ejs(`${this.config.homeURL}/templates/myOrders.ejs`, 'myOrders', {
        translator: this.translator,
        selectedAddr: this.addrs[this.selectedAccount],
        selectedToken: this.selectedToken,
        selectedBase: this.selectedBase,
        buyOrders,
        sellOrders,
        blockNumber,
      });
      callback();
    });
};
EtherDelta.prototype.isInCross = function isInCross(priceIn, kind) {
  const price = new BigNumber(priceIn);
  if (price === undefined || price <= 0) return undefined;
  const orders = this.ordersResultByPair.orders;
  // remove orders below the min order limit
  const ordersFiltered = orders.filter(order =>
    Number(order.ethAvailableVolume).toFixed(3) >= this.minOrderSize &&
    Number(order.ethAvailableVolumeBase).toFixed(3) >= this.minOrderSize)
  .filter(
    order => order.order.contractAddr === this.config.contractEtherDeltaAddr);
  // final order filtering and sorting
  const buyOrders = ordersFiltered.filter(x => x.amount > 0);
  const sellOrders = ordersFiltered.filter(x => x.amount < 0);
  sellOrders.sort((a, b) => b.price - a.price || b.id - a.id);
  buyOrders.sort((a, b) => b.price - a.price || a.id - b.id);
  const bid = buyOrders.length > 0 ? buyOrders[0].price : undefined;
  const ask = sellOrders.length > 0 ? sellOrders[sellOrders.length - 1].price : undefined;
  if (kind === 'buy' && ask && price > ask * 1.5) {
    return ask;
  } if (kind === 'sell' && bid && price < bid * 0.5) {
    return bid;
  }
  return undefined;
};
EtherDelta.prototype.displayVolumes = function displayVolumes(
  orders, returnTicker, blockNumber, callback) {
  let tokenVolumes = {};
  let pairVolumes = {};
  // the default pairs
  for (let i = 0; i < this.config.pairs.length; i += 1) {
    const token = this.getToken(this.config.pairs[i].token);
    const base = this.getToken(this.config.pairs[i].base);
    if (token && base) {
      const pair = `${token.name}/${base.name}`;
      if (!pairVolumes[pair]) {
        pairVolumes[pair] = {
          token,
          base,
          volume: 0,
          ethVolume: 0,
        };
      }
    }
  }
  // get trading volume
  Object.keys(this.returnTicker).forEach((returnKey) => {
    const ret = this.returnTicker[returnKey];
    const spl = returnKey.split('_');
    const A = spl[0];
    const B = spl[1];
    const pair = `${B}/${A}`;
    // console.log(pair)
    if (pairVolumes[pair]) {
      // console.log(pair, ret)
      pairVolumes[pair].volume = Number(ret.quoteVolume);
      pairVolumes[pair].ethVolume = Number(ret.baseVolume);
    }
    const tokenA = this.getToken(A);
    const tokenB = this.getToken(B);
    if (tokenA) {
      if (tokenVolumes[A]) {
        tokenVolumes[A].volume += Number(ret.baseVolume);
        tokenVolumes[A].ethVolume += Number(ret.baseVolume);
      } else {
        tokenVolumes[A] = {
          token: tokenA,
          volume: Number(ret.baseVolume),
          ethVolume: Number(ret.baseVolume),
        };
      }
    }
    if (tokenB) {
      if (tokenVolumes[B]) {
        tokenVolumes[B].volume += Number(ret.quoteVolume);
        tokenVolumes[B].ethVolume += Number(ret.baseVolume);
      } else {
        tokenVolumes[B] = {
          token: tokenB,
          volume: Number(ret.quoteVolume),
          ethVolume: Number(ret.baseVolume),
        };
      }
    }
  });
  // get bid and ask
  Object.keys(pairVolumes).forEach((pair) => {
    const pairVolume = pairVolumes[pair];
    const token = pairVolume.token;
    const base = pairVolume.base;
    // only look at orders for the selected token and base
    let ordersFiltered = orders.filter(
      x =>
        (x.order.tokenGet.toLowerCase() === token.addr.toLowerCase() &&
        x.order.tokenGive.toLowerCase() === base.addr.toLowerCase() && x.amount > 0) ||
        (x.order.tokenGive.toLowerCase() === token.addr.toLowerCase() &&
        x.order.tokenGet.toLowerCase() === base.addr.toLowerCase() && x.amount < 0));
    // remove orders below the min order limit
    ordersFiltered = ordersFiltered.filter(order =>
      Number(order.ethAvailableVolume).toFixed(3) >= this.minOrderSize &&
      Number(order.ethAvailableVolumeBase).toFixed(3) >= this.minOrderSize);
    // filter only orders that match the smart contract address
    ordersFiltered = ordersFiltered.filter(
      order => order.order.contractAddr === this.config.contractEtherDeltaAddr);
    // final order filtering and sorting
    const buyOrders = ordersFiltered.filter(x => x.amount > 0);
    const sellOrders = ordersFiltered.filter(x => x.amount < 0);
    sellOrders.sort((a, b) => b.price - a.price || b.id - a.id);
    buyOrders.sort((a, b) => b.price - a.price || a.id - b.id);
    const bid = buyOrders.length > 0 ? buyOrders[0].price : undefined;
    const ask = sellOrders.length > 0 ? sellOrders[sellOrders.length - 1].price : undefined;
    pairVolume.bid = bid;
    pairVolume.ask = ask;
  });
  tokenVolumes = Object.values(tokenVolumes);
  tokenVolumes.sort((a, b) => b.ethVolume - a.ethVolume);
  pairVolumes = Object.values(pairVolumes);
  pairVolumes.sort((a, b) => b.ethVolume - a.ethVolume);
  this.ejs(`${this.config.homeURL}/templates/volume.ejs`, 'volume', {
    tokenVolumes,
    pairVolumes,
  });
  callback();
};
EtherDelta.prototype.displayTradesAndChart = function displayTradesAndChart(callback) {
  // get the trade list
  const events = Object.values(this.eventsCache);
  const trades = [];
  events.forEach((event) => {
    if (event.event === 'Trade' && event.address === this.config.contractEtherDeltaAddr) {
      if (event.args.amountGive.toNumber() > 0 && event.args.amountGet.toNumber() > 0) {
        // don't show trades involving 0 amounts
        let trade;
        if (
          event.args.tokenGet.toLowerCase() === this.selectedToken.addr.toLowerCase() &&
          event.args.tokenGive.toLowerCase() === this.selectedBase.addr.toLowerCase()
        ) {
          // sell
          trade = {
            amount: -event.args.amountGet,
            price: event.args.amountGive
              .div(event.args.amountGet)
              .mul(this.getDivisor(event.args.tokenGet))
              .div(this.getDivisor(event.args.tokenGive)),
            id: (event.blockNumber * 1000) + event.transactionIndex,
            blockNumber: event.blockNumber,
            date: new Date(utility.hexToDec(event.timeStamp) * 1000),
            buyer: event.args.get,
            seller: event.args.give,
          };
        } else if (
          event.args.tokenGet.toLowerCase() === this.selectedBase.addr.toLowerCase() &&
          event.args.tokenGive.toLowerCase() === this.selectedToken.addr.toLowerCase()
        ) {
          // buy
          trade = {
            amount: event.args.amountGive,
            price: event.args.amountGet
              .div(event.args.amountGive)
              .mul(this.getDivisor(event.args.tokenGive))
              .div(this.getDivisor(event.args.tokenGet)),
            id: (event.blockNumber * 1000) + event.transactionIndex,
            blockNumber: event.blockNumber,
            date: new Date(utility.hexToDec(event.timeStamp) * 1000),
            buyer: event.args.give,
            seller: event.args.get,
          };
        }
        if (trade) {
          trade.txLink = `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/tx/${event.transactionHash}`;
          trades.push(trade);
        }
      }
    }
  });
  trades.sort((a, b) => b.id - a.id);
  this.ejs(`${this.config.homeURL}/templates/trades.ejs`, 'trades', {
    selectedAddr: this.addrs[this.selectedAccount],
    selectedToken: this.selectedToken,
    selectedBase: this.selectedBase,
    trades,
  });

  // candlestick chart
  function getDay(d) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  }
  const now = new Date();
  const data = trades
    .map(trade => [trade.date, trade.price.toNumber()])
    .filter(x => now - x[0] < 86400 * 1000 * 7);
  const values = data.map(x => x[1]);
  values.sort();
  let median = 0;
  if (values.length > 0) {
    median = values[Math.floor(values.length / 2)];
  }
  const days = { All: [], Sun: [], Mon: [], Tue: [], Wed: [], Thu: [], Fri: [], Sat: [] };
  for (let i = data.length - 1; i >= 0; i -= 1) {
    const date = data[i][0];
    const price = data[i][1];
    const day = getDay(date);
    if (day !== getDay(now) || now - date < 86400 * 1000) {
      if (Math.abs(price - median) / median < 3.0) {
        // remove outliers
        days[day].push(price);
        days.All.push(price);
      }
    }
  }
  const dataCandlestick = [];
  let date = new Date(now.getTime() - (86400 * 1000 * 6) - 1);
  while (date < now) {
    const day = getDay(date);
    const points = days[day];
    if (points && points.length > 0) {
      if (points[points.length - 1] > points[0]) {
        dataCandlestick.push([
          day,
          points.min(),
          points[0],
          points[points.length - 1],
          points.max(),
        ]);
      } else {
        dataCandlestick.push([
          day,
          points.max(),
          points[0],
          points[points.length - 1],
          points.min(),
        ]);
      }
    }
    date = new Date(date.getTime() + (86400 * 1000));
  }
  this.candlestickChart(
    'chartPrice',
    '',
    '',
    '',
    dataCandlestick,
    days.All.min() * 0.7,
    days.All.max() * 1.1);

  callback();
};
EtherDelta.prototype.candlestickChart =
function candlestickChart(elem, title, xtitle, ytitle, data, minValue, maxValue) {
  $(`#${elem}`).html('');
  google.charts.setOnLoadCallback(() => {
    try {
      if (data.length > 0) {
        const dataTable = google.visualization.arrayToDataTable(data, true);
        const options = {
          width: $(`#${elem}`).parent().width(),
          height: $(`#${elem}`).parent().height(),
          chartArea: { left: 50, width: '90%', height: '80%' },
          backgroundColor: { fill: 'transparent' },
          colors: ['#ccc'],
          hAxis: {
            title: xtitle,
            baselineColor: '#fff',
            gridlines: { color: '#fff' },
            textStyle: { color: '#fff' },
          },
          vAxis: {
            title: ytitle,
            viewWindowMode: 'explicit',
            viewWindow: {
              min: minValue,
              max: maxValue,
            },
            gridlines: { color: '#fff' },
            textStyle: { color: '#fff' },
          },
          legend: 'none',
          enableInteractivity: true,
          title,
          candlestick: {
            fallingColor: { strokeWidth: 0, fill: '#f00' },
            risingColor: { strokeWidth: 0, fill: '#0f0' },
          },
        };
        const chart = new google.visualization.CandlestickChart(document.getElementById(elem));
        chart.draw(dataTable, options);
      }
    } catch (err) {
      console.log(err);
    }
  });
};
EtherDelta.prototype.depthChart =
function depthChart(elem, title, xtitle, ytitle, data, minX, maxX) {
  $(`#${elem}`).html('');
  google.charts.setOnLoadCallback(() => {
    try {
      if (data.length > 1) {
        const dataTable = google.visualization.arrayToDataTable(data);

        const options = {
          width: $(`#${elem}`).parent().width(),
          height: $(`#${elem}`).parent().height(),
          chartArea: { left: 50, width: '90%', height: '80%' },
          backgroundColor: { fill: 'transparent' },
          colors: ['#0f0', '#f00'],
          title,
          hAxis: {
            viewWindowMode: 'explicit',
            viewWindow: {
              min: minX,
              max: maxX,
            },
            title: xtitle,
            titleTextStyle: { color: '#fff' },
            gridlines: { color: '#fff' },
            textStyle: { color: '#fff' },
          },
          vAxis: {
            minValue: 0,
            gridlines: { color: '#fff' },
            textStyle: { color: '#fff' },
          },
          legend: 'none',
          tooltip: { isHtml: true },
        };

        const chart = new google.visualization.SteppedAreaChart(document.getElementById(elem));
        chart.draw(dataTable, options);
      }
    } catch (err) {
      console.log(err);
    }
  });
};
EtherDelta.prototype.lineChart =
function lineChart(elem, title, xtype, ytype, xtitle, ytitle, data) {
  $(`#${elem}`).html('');
  google.charts.setOnLoadCallback(() => {
    try {
      if (data.length > 0) {
        const dataTable = new google.visualization.DataTable();
        dataTable.addColumn(xtype, 'X');
        dataTable.addColumn(ytype, ytitle);
        dataTable.addRows(data);
        const options = {
          width: $(`#${elem}`).parent().width(),
          height: $(`#${elem}`).parent().height(),
          chartArea: { left: 50, width: '90%', height: '80%' },
          hAxis: { title: xtitle },
          vAxis: { title: ytitle },
          legend: 'none',
          enableInteractivity: true,
          title,
        };
        const chart = new google.visualization.LineChart(document.getElementById(elem));
        chart.draw(dataTable, options);
      }
    } catch (err) {
      console.log(err);
    }
  });
};
EtherDelta.prototype.getOrdersByPair = function getOrdersByPair(tokenA, tokenB, callback) {
  utility.getURL(`${this.config.apiServer}/orders/${this.apiServerNonce}/${tokenA}/${tokenB}`, (err, result) => {
    if (!err && result !== 'error') {
      try {
        const res = JSON.parse(result);
        const blockNumber = res.blockNumber;
        let orders;
        if (Array.isArray(res.orders)) {
          orders = res.orders;
        } else {
          orders = Object.values(res.orders);
        }
        orders.forEach((x) => {
          Object.assign(x, {
            price: new BigNumber(x.price),
            // amount: new BigNumber(x.amount),
            // availableVolume: new BigNumber(x.availableVolume),
            // ethAvailableVolume: x.ethAvailableVolume,
            order: Object.assign(x.order, {
              amountGet: new BigNumber(x.order.amountGet),
              amountGive: new BigNumber(x.order.amountGive),
              expires: Number(x.order.expires),
              nonce: Number(x.order.nonce),
              tokenGet: x.order.tokenGet,
              tokenGive: x.order.tokenGive,
              user: x.order.user,
              r: x.order.r,
              s: x.order.s,
              v: x.order.v ? Number(x.order.v) : undefined,
            }),
          });
        });
        callback(null, { orders, blockNumber });
      } catch (errCatch) {
        callback(err, this.ordersResultByPair);
      }
    } else {
      this.apiServerNonce = Math.random().toString().slice(2) +
        Math.random().toString().slice(2);
      callback(err, this.ordersResultByPair);
    }
  });
};
EtherDelta.prototype.getReturnTicker = function getTopOrders(callback) {
  utility.getURL(`${this.config.apiServer}/returnTicker`, (err, result) => {
    if (!err && result !== 'error') {
      try {
        const res = JSON.parse(result);
        callback(null, res);
      } catch (errCatch) {
        callback(err, this.returnTicker);
      }
    } else {
      callback(err, this.returnTicker);
    }
  });
};
EtherDelta.prototype.getTopOrders = function getTopOrders(callback) {
  utility.getURL(`${this.config.apiServer}/topOrders/${this.apiServerNonce}`, (err, result) => {
    if (!err) {
      try {
        const res = JSON.parse(result);
        const blockNumber = res.blockNumber;
        let orders;
        if (Array.isArray(res.orders)) {
          orders = res.orders;
        } else {
          orders = Object.values(res.orders);
        }
        orders.forEach((x) => {
          Object.assign(x, {
            price: new BigNumber(x.price),
            // amount: new BigNumber(x.amount),
            // availableVolume: new BigNumber(x.availableVolume),
            // ethAvailableVolume: x.ethAvailableVolume,
            order: Object.assign(x.order, {
              amountGet: new BigNumber(x.order.amountGet),
              amountGive: new BigNumber(x.order.amountGive),
              expires: Number(x.order.expires),
              nonce: Number(x.order.nonce),
              tokenGet: x.order.tokenGet,
              tokenGive: x.order.tokenGive,
              user: x.order.user,
              r: x.order.r,
              s: x.order.s,
              v: x.order.v ? Number(x.order.v) : undefined,
            }),
          });
        });
        callback(null, { orders, blockNumber });
      } catch (errCatch) {
        callback(err, this.topOrdersResult);
      }
    } else {
      callback(err, this.topOrdersResult);
    }
  });
};
EtherDelta.prototype.displayOrderbook = function displayOrderbook(ordersIn, blockNumber, callback) {
  // only look at orders for the selected token and base
  let orders = ordersIn.filter(
    x =>
      (x.order.tokenGet.toLowerCase() === this.selectedToken.addr.toLowerCase() &&
        x.order.tokenGive.toLowerCase() === this.selectedBase.addr.toLowerCase() &&
        x.amount > 0) ||
      (x.order.tokenGive.toLowerCase() === this.selectedToken.addr.toLowerCase() &&
        x.order.tokenGet.toLowerCase() === this.selectedBase.addr.toLowerCase() &&
        x.amount < 0));
  // remove orders below the min order limit
  orders = orders.filter(order =>
    Number(order.ethAvailableVolume).toFixed(3) >= this.minOrderSize &&
    Number(order.ethAvailableVolumeBase).toFixed(3) >= this.minOrderSize);
  // filter only orders that match the smart contract address
  orders = orders.filter(order => order.order.contractAddr === this.config.contractEtherDeltaAddr);
  // final order filtering and sorting
  const buyOrders = orders.filter(x => x.amount > 0);
  const sellOrders = orders.filter(x => x.amount < 0);
  sellOrders.sort((a, b) => b.price - a.price || b.id - a.id);
  buyOrders.sort((a, b) => b.price - a.price || a.id - b.id);
  // get depth data
  const depthData = [];
  let median = 0;
  if (buyOrders.length > 0) median += buyOrders[0].price.toNumber();
  if (sellOrders.length > 0) median += sellOrders[sellOrders.length - 1].price.toNumber();
  if (buyOrders.length > 0 && sellOrders.length > 0) median /= 2;
  let cumul = 0;
  for (let i = 0; i < buyOrders.length; i += 1) {
    const price = buyOrders[i].price.toNumber();
    const volume = Number(
      utility.weiToEth(Math.abs(buyOrders[i].availableVolume),
        this.getDivisor(this.selectedToken)));
    cumul += volume;
    depthData.unshift([price, cumul, 0]);
    if (i === buyOrders.length - 1) depthData.unshift([price * 0.9, cumul, 0]);
  }
  cumul = 0;
  for (let i = sellOrders.length - 1; i >= 0; i -= 1) {
    const price = sellOrders[i].price.toNumber();
    const volume = Number(
      utility.weiToEth(
        Math.abs(sellOrders[i].availableVolume),
        this.getDivisor(this.selectedToken)));
    depthData.push([price, 0, cumul]);
    cumul += volume;
    if (i === 0) depthData.push([price * 1.1, 0, cumul]);
  }
  depthData.unshift([
    { label: 'Price', type: 'number' },
    { label: 'Cumulative bid size', type: 'number' },
    { label: 'Cumulative offer size', type: 'number' },
  ]);
  // // top 25 bids and offers:
  // buyOrders = buyOrders.slice(0,25);
  // sellOrders = sellOrders.slice(-25);
  this.ejs(`${this.config.homeURL}/templates/orderBook.ejs`, 'orderBook', {
    translator: this.translator,
    selectedAddr: this.addrs[this.selectedAccount],
    selectedToken: this.selectedToken,
    selectedBase: this.selectedBase,
    buyOrders,
    sellOrders,
    blockNumber,
  });
  $('#orderBookScroll')[0].scrollTop =
    $('#orderBookMid').position().top -
    ($('#orderBookScroll')[0].clientHeight / 2) -
    $('#orderBookMid')[0].clientHeight;
  const depthDataFiltered = depthData.slice(0, 1).concat(depthData.slice(1)
    .map(x => [x[0], Number(x[1]), x[2]])
    .filter(x => x[0] > median * 0.025 && x[0] < median * 1.75));
  this.depthChart('chartDepth', '', '', '', depthDataFiltered, median * 0.25, median * 1.75);
  callback();
};
EtherDelta.prototype.displayTokensAndBases = function displayTokensAndBases(callback) {
  const tokens = this.config.tokens.map(x => x);
  tokens.sort((a, b) => (a.name > b.name ? 1 : -1));
  this.ejs(`${this.config.homeURL}/templates/tokensDropdown.ejs`, 'tokensDropdown', {
    tokens,
    selectedToken: this.selectedToken,
  });
  this.ejs(`${this.config.homeURL}/templates/basesDropdown.ejs`, 'basesDropdown', {
    tokens,
    selectedBase: this.selectedBase,
  });
  callback();
};
EtherDelta.prototype.displayAllBalances = function displayAllBalances(callback) {
  const zeroAddr = '0x0000000000000000000000000000000000000000';
  // add selected token and base to config.tokens
  const tempTokens = [this.selectedToken, this.selectedBase];
  async.map(
    tempTokens,
    (token, callbackMap) => {
      if (token.addr === zeroAddr) {
        utility.call(
          this.web3,
          this.contractEtherDelta,
          this.config.contractEtherDeltaAddr,
          'balanceOf',
          [token.addr, this.addrs[this.selectedAccount]],
          (err, result) => {
            const balance = result;
            utility.getBalance(this.web3, this.addrs[this.selectedAccount],
              (errGetBalance, balanceOutside) => {
                const balanceObj = {
                  token,
                  balance,
                  balanceOutside,
                  tokenLink: `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/address/${this.addrs[this.selectedAccount]}`,
                };
                callbackMap(null, balanceObj);
              });
          });
      } else {
        utility.call(
          this.web3,
          this.contractEtherDelta,
          this.config.contractEtherDeltaAddr,
          'balanceOf',
          [token.addr, this.addrs[this.selectedAccount]],
          (err, result) => {
            const balance = result;
            utility.call(
              this.web3,
              this.contractToken,
              token.addr,
              'balanceOf',
              [this.addrs[this.selectedAccount]],
              (errBalanceOf, balanceOutside) => {
                const balanceObj = {
                  token,
                  balance,
                  balanceOutside,
                  tokenLink: `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/token/${token.addr}`,
                };
                callbackMap(null, balanceObj);
              });
          });
      }
    },
    (err, balances) => {
      this.ejs(`${this.config.homeURL}/templates/deposit.ejs`, 'deposit', {
        balances,
        addr: this.addrs[this.selectedAccount],
        selectedToken: this.selectedToken,
        selectedBase: this.selectedBase,
      });
      this.ejs(`${this.config.homeURL}/templates/withdraw.ejs`, 'withdraw', {
        balances,
        addr: this.addrs[this.selectedAccount],
        selectedToken: this.selectedToken,
        selectedBase: this.selectedBase,
      });
      this.ejs(`${this.config.homeURL}/templates/transfer.ejs`, 'transfer', {
        balances,
        addr: this.addrs[this.selectedAccount],
        selectedToken: this.selectedToken,
        selectedBase: this.selectedBase,
      });
      callback();
    });
};
EtherDelta.prototype.transfer = function transfer(addr, inputAmount, toAddr) {
  let amount = new BigNumber(Number(utility.ethToWei(inputAmount, this.getDivisor(addr))));
  const token = this.getToken(addr);
  if (amount.lte(0)) {
    this.dialogError('You must specify a valid amount to transfer.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Transfer - invalid amount',
      eventLabel: token.name,
      eventValue: inputAmount,
    });
    return;
  }
  if (!this.web3.isAddress(toAddr) || toAddr.slice(0, 39) === '0x0000000000000000000000000000000000000' || toAddr.toLowerCase() === this.addrs[this.selectedAccount].toLowerCase()) {
    this.dialogError('Please specify a valid address.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Transfer - invalid address',
      eventLabel: token.name,
      eventValue: inputAmount,
    });
  } else if (toAddr.toLowerCase() === this.config.contractEtherDeltaAddr.toLowerCase()) {
    this.dialogError('If you send funds directly to the EtherDelta smart contract, they will be lost. You need to use the Deposit tab to deposit.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Transfer - invalid address',
      eventLabel: token.name,
      eventValue: inputAmount,
    });
  } else if (addr.slice(0, 39) === '0x0000000000000000000000000000000000000') {
    // plain Ether transfer
    utility.getBalance(this.web3, this.addrs[this.selectedAccount], (err, balance) => {
      if (amount.gt(balance)) amount = balance;
      if (amount.lte(0)) {
        this.dialogError('You do not have anything to transfer. Note: you can only transfer from your "Wallet." If you have Ether on deposit, please withdraw first, then transfer.');
        ga('send', {
          hitType: 'event',
          eventCategory: 'Error',
          eventAction: 'Transfer - nothing to transfer',
          eventLabel: token.name,
          eventValue: inputAmount,
        });
      } else {
        utility.send(
          this.web3,
          undefined,
          toAddr,
          undefined,
          [{ gas: this.config.gasDeposit, value: amount.toNumber() }],
          this.addrs[this.selectedAccount],
          this.pks[this.selectedAccount],
          this.nonce,
          (errSend, result) => {
            this.nonce = result.nonce;
            this.addPending(errSend, { txHash: result.txHash });
            this.alertTxResult(errSend, result);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Transfer',
              eventLabel: token.name,
              eventValue: inputAmount,
            });
          });
      }
    });
  } else {
    // token transfer
    utility.call(
      this.web3,
      this.contractToken,
      token.addr,
      'balanceOf',
      [this.addrs[this.selectedAccount]],
      (err, result) => {
        if (amount.gt(result)) amount = result;
        if (amount.lte(0)) {
          this.dialogError('You do not have anything to transfer. Note: you can only transfer from your "Wallet." If you have tokens on deposit, please withdraw first, then transfer.');
          ga('send', {
            hitType: 'event',
            eventCategory: 'Error',
            eventAction: 'Transfer - nothing to transfer',
            eventLabel: token.name,
            eventValue: inputAmount,
          });
        } else {
          utility.send(
            this.web3,
            this.contractToken,
            token.addr,
            'transfer',
            [toAddr, amount, { gas: this.config.gasDeposit, value: 0 }],
            this.addrs[this.selectedAccount],
            this.pks[this.selectedAccount],
            this.nonce,
            (errSend, resultSend) => {
              this.nonce = resultSend.nonce;
              this.addPending(errSend, { txHash: resultSend.txHash });
              this.alertTxResult(errSend, resultSend);
              ga('send', {
                hitType: 'event',
                eventCategory: 'Action',
                eventAction: 'Transfer',
                eventLabel: token.name,
                eventValue: inputAmount,
              });
            });
        }
      });
  }
};
EtherDelta.prototype.deposit = function deposit(addr, inputAmount) {
  let amount = new BigNumber(Number(utility.ethToWei(inputAmount, this.getDivisor(addr))));
  const token = this.getToken(addr);
  if (amount.lte(0)) {
    this.dialogError('You must specify a valid amount to deposit.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Deposit - invalid amount',
      eventLabel: token.name,
      eventValue: inputAmount,
    });
    return;
  }
  if (addr.slice(0, 39) === '0x0000000000000000000000000000000000000') {
    utility.getBalance(this.web3, this.addrs[this.selectedAccount], (err, result) => {
      if (amount.gt(result) && amount.lt(result.times(new BigNumber(1.1)))) amount = result;
      if (amount.lte(result)) {
        utility.send(
          this.web3,
          this.contractEtherDelta,
          this.config.contractEtherDeltaAddr,
          'deposit',
          [{ gas: this.config.gasDeposit, value: amount.toNumber() }],
          this.addrs[this.selectedAccount],
          this.pks[this.selectedAccount],
          this.nonce,
          (errSend, resultSend) => {
            this.nonce = resultSend.nonce;
            this.addPending(errSend, { txHash: resultSend.txHash });
            this.alertTxResult(errSend, resultSend);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Deposit',
              eventLabel: token.name,
              eventValue: inputAmount,
            });
          });
      } else {
        this.dialogError("You can't deposit more Ether than you have.");
        ga('send', {
          hitType: 'event',
          eventCategory: 'Error',
          eventAction: 'Deposit - not enough balance',
          eventLabel: token.name,
          eventValue: inputAmount,
        });
      }
    });
  } else {
    utility.call(
      this.web3,
      this.contractToken,
      token.addr,
      'allowance',
      [this.addrs[this.selectedAccount], this.config.contractEtherDeltaAddr],
      (errAllowance, resultAllowance) => {
        if (resultAllowance.gt(0) && amount.gt(resultAllowance)) amount = resultAllowance;
        utility.call(
          this.web3,
          this.contractToken,
          token.addr,
          'balanceOf',
          [this.addrs[this.selectedAccount]],
          (errBalanceOf, resultBalanceOf) => {
            if (amount.gt(resultBalanceOf) &&
              amount.lt(resultBalanceOf.times(new BigNumber(1.1)))) amount = resultBalanceOf;
            if (amount.lte(resultBalanceOf)) {
              const txs = [];
              async.series(
                [
                  (callbackSeries) => {
                    if (resultAllowance.eq(0)) {
                      utility.send(
                        this.web3,
                        this.contractToken,
                        addr,
                        'approve',
                        [this.config.contractEtherDeltaAddr, amount,
                          { gas: this.config.gasApprove, value: 0 }],
                        this.addrs[this.selectedAccount],
                        this.pks[this.selectedAccount],
                        this.nonce,
                        (errSend, resultSend) => {
                          this.nonce = resultSend.nonce;
                          txs.push(resultSend);
                          callbackSeries(null, { errSend, resultSend });
                        });
                    } else {
                      callbackSeries(null, undefined);
                    }
                  },
                  (callbackSeries) => {
                    utility.send(
                      this.web3,
                      this.contractEtherDelta,
                      this.config.contractEtherDeltaAddr,
                      'depositToken',
                      [addr, amount, { gas: this.config.gasDeposit, value: 0 }],
                      this.addrs[this.selectedAccount],
                      this.pks[this.selectedAccount],
                      this.nonce,
                      (errSend, resultSend) => {
                        this.nonce = resultSend.nonce;
                        txs.push(resultSend);
                        callbackSeries(null, { errSend, resultSend });
                      });
                  },
                ],
                (err, results) => {
                  const [tx1, tx2] = results;
                  const errSend1 = tx1 ? tx1.errSend1 : undefined;
                  const errSend2 = tx2 ? tx2.errSend1 : undefined;
                  this.addPending(errSend1 || errSend2, txs);
                  this.alertTxResult(errSend1 || errSend2, txs);
                  ga('send', {
                    hitType: 'event',
                    eventCategory: 'Action',
                    eventAction: 'Deposit',
                    eventLabel: token.name,
                    eventValue: inputAmount,
                  });
                });
            } else {
              this.dialogError("You can't deposit more tokens than you have.");
              ga('send', {
                hitType: 'event',
                eventCategory: 'Error',
                eventAction: 'Deposit - not enough balance',
                eventLabel: token.name,
                eventValue: inputAmount,
              });
            }
          });
      });
  }
};
EtherDelta.prototype.withdraw = function withdraw(addr, amountIn) {
  let amount = new BigNumber(Number(utility.ethToWei(amountIn, this.getDivisor(addr))));
  const token = this.getToken(addr);
  if (amount.lte(0)) {
    this.dialogError('You must specify a valid amount to withdraw.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Withdraw - invalid amount',
      eventLabel: token.name,
      eventValue: amountIn,
    });
    return;
  }
  utility.call(
    this.web3,
    this.contractEtherDelta,
    this.config.contractEtherDeltaAddr,
    'balanceOf',
    [addr, this.addrs[this.selectedAccount]],
    (err, result) => {
      const balance = result;
      // if you try to withdraw more than your balance, the amount
      // will be modified so that you withdraw your exact balance:
      if (amount > balance) {
        amount = balance;
      }
      if (amount.lte(0)) {
        this.dialogError("You don't have anything to withdraw.");
        ga('send', {
          hitType: 'event',
          eventCategory: 'Error',
          eventAction: 'Withdraw - nothing to withdraw',
          eventLabel: token.name,
          eventValue: amountIn,
        });
      } else if (addr.slice(0, 39) === '0x0000000000000000000000000000000000000') {
        utility.send(
          this.web3,
          this.contractEtherDelta,
          this.config.contractEtherDeltaAddr,
          'withdraw',
          [amount, { gas: this.config.gasWithdraw, value: 0 }],
          this.addrs[this.selectedAccount],
          this.pks[this.selectedAccount],
          this.nonce,
          (errSend, resultSend) => {
            this.nonce = resultSend.nonce;
            this.addPending(errSend, { txHash: resultSend.txHash });
            this.alertTxResult(errSend, resultSend);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Withdraw',
              eventLabel: token.name,
              eventValue: amountIn,
            });
          });
      } else {
        utility.send(
          this.web3,
          this.contractEtherDelta,
          this.config.contractEtherDeltaAddr,
          'withdrawToken',
          [addr, amount, { gas: this.config.gasWithdraw, value: 0 }],
          this.addrs[this.selectedAccount],
          this.pks[this.selectedAccount],
          this.nonce,
          (errSend, resultSend) => {
            this.nonce = resultSend.nonce;
            this.addPending(errSend, { txHash: resultSend.txHash });
            this.alertTxResult(errSend, resultSend);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Withdraw',
              eventLabel: token.name,
              eventValue: amountIn,
            });
          });
      }
    });
};
EtherDelta.prototype.order = function order(direction, amount, price, expires, refresh) {
  utility.blockNumber(this.web3, (err, blockNumber) => {
    const orderObj = {
      baseAddr: this.selectedBase.addr,
      tokenAddr: this.selectedToken.addr,
      direction,
      amount,
      price,
      expires,
      refresh,
      nextExpiration: 0,
    };
    if (blockNumber >= orderObj.nextExpiration) {
      if (orderObj.nextExpiration === 0) {
        orderObj.nextExpiration = Number(orderObj.expires) + blockNumber;
        orderObj.nonce = utility.getRandomInt(0,
          Math.pow(2, 32)); // eslint-disable-line no-restricted-properties
        this.publishOrder(
          orderObj.baseAddr,
          orderObj.tokenAddr,
          orderObj.direction,
          orderObj.amount,
          orderObj.price,
          orderObj.nextExpiration,
          orderObj.nonce);
      }
    }
  });
};
EtherDelta.prototype.publishOrder = function publishOrder(
  baseAddr, tokenAddr, direction, amount, price, expires, orderNonce) {
  let tokenGet;
  let tokenGive;
  let amountGet;
  let amountGive;
  if (this.addrs[this.selectedAccount].slice(0, 39) === '0x0000000000000000000000000000000000000') {
    this.dialogError(
      "You haven't selected an account. Make sure you have an account selected from the Accounts dropdown in the upper right.");
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Order - no account selected',
      eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
    });
    return;
  } else if (amount < this.minOrderSize || amount * price < this.minOrderSize) {
    this.dialogError(`The minimum order size (for both tokens in your order) is ${this.minOrderSize}.`);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Order - below minimum size',
      eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
    });
    return;
  }
  if (direction === 'buy') {
    tokenGet = tokenAddr;
    tokenGive = baseAddr;
    amountGet = Math.floor(utility.ethToWei(amount, this.getDivisor(tokenGet)));
    const amountGetEth = utility.weiToEth(amountGet, this.getDivisor(tokenGet));
    amountGive = Math.floor(utility.ethToWei(amountGetEth * price, this.getDivisor(tokenGive)));
  } else if (direction === 'sell') {
    tokenGet = baseAddr;
    tokenGive = tokenAddr;
    amountGive = Math.floor(utility.ethToWei(amount, this.getDivisor(tokenGive)));
    const amountGiveEth = utility.weiToEth(amountGive, this.getDivisor(tokenGive));
    amountGet = Math.ceil(utility.ethToWei(amountGiveEth * price, this.getDivisor(tokenGet)));
  } else {
    return;
  }
  utility.call(
    this.web3,
    this.contractEtherDelta,
    this.config.contractEtherDeltaAddr,
    'balanceOf',
    [tokenGive, this.addrs[this.selectedAccount]],
    (err, result) => {
      const balance = result;
      if (balance.lt(new BigNumber(amountGive))) {
        this.dialogError(
          "You do not have enough funds to send this order. Please DEPOSIT first using the Deposit form in the upper left. Enter the amount you want to deposit and press the 'Deposit' button.");
        ga('send', {
          hitType: 'event',
          eventCategory: 'Error',
          eventAction: 'Order - not enough funds',
          eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
        });
      } else if (!this.config.ordersOnchain) {
        // offchain order
        const condensed = utility.pack(
          [
            this.config.contractEtherDeltaAddr,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            orderNonce,
          ],
          [160, 160, 256, 160, 256, 256, 256]);
        const hash = sha256(new Buffer(condensed, 'hex'));
        utility.sign(this.web3, this.addrs[this.selectedAccount],
        hash, this.pks[this.selectedAccount], (errSign, sig) => {
          if (errSign) {
            console.log(errSign);
            this.dialogError(
              'Order signing failed. Make sure you have an account selected from the Accounts dropdown in the upper right.');
            ga('send', {
              hitType: 'event',
              eventCategory: 'Error',
              eventAction: 'Order - could not sign',
              eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
            });
          } else {
            // Send order to offchain book:
            const order = {
              contractAddr: this.config.contractEtherDeltaAddr,
              tokenGet,
              amountGet,
              tokenGive,
              amountGive,
              expires,
              nonce: orderNonce,
              v: sig.v,
              r: sig.r,
              s: sig.s,
              user: this.addrs[this.selectedAccount],
            };
            this.alertSuccess('You sent an order to the order book!');
            utility.postURL(
              `${this.config.apiServer}/message`,
              { message: JSON.stringify(order) },
              (errPost) => {
                // console.log(result)
                if (!errPost) {
                  this.alertSuccess('Your order was received!');
                  this.refresh(() => {});
                  ga('send', {
                    hitType: 'event',
                    eventCategory: 'Action',
                    eventAction: 'Order',
                    eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
                  });
                } else {
                  this.dialogError(
                    'You tried sending an order to the order book but there was an error...');
                  ga('send', {
                    hitType: 'event',
                    eventCategory: 'Error',
                    eventAction: 'Order - error sending to order book',
                    eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
                  });
                }
              });
          }
        });
      } else {
        // onchain order
        utility.send(
          this.web3,
          this.contractEtherDelta,
          this.config.contractEtherDeltaAddr,
          'order',
          [
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            orderNonce,
            { gas: this.config.gasOrder, value: 0 },
          ],
          this.addrs[this.selectedAccount],
          this.pks[this.selectedAccount],
          this.nonce,
          (errSend, resultSend) => {
            this.nonce = resultSend.nonce;
            this.addPending(errSend, { txHash: resultSend.txHash });
            this.alertTxResult(errSend, resultSend);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Order - onchain',
              eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
            });
          });
      }
    });
};
EtherDelta.prototype.cancelOrder = function cancelOrder(orderIn) {
  const order = JSON.parse(decodeURIComponent(orderIn));
  if (order.user.toLowerCase() === this.addrs[this.selectedAccount].toLowerCase()) {
    utility.send(
      this.web3,
      this.contractEtherDelta,
      this.config.contractEtherDeltaAddr,
      'cancelOrder',
      [
        order.tokenGet,
        Number(order.amountGet),
        order.tokenGive,
        Number(order.amountGive),
        Number(order.expires),
        Number(order.nonce),
        Number(order.v),
        order.r,
        order.s,
        { gas: this.config.gasTrade, value: 0 },
      ],
      this.addrs[this.selectedAccount],
      this.pks[this.selectedAccount],
      this.nonce,
      (err, result) => {
        this.txHash = result.txHash;
        this.nonce = result.nonce;
        this.addPending(err, { txHash: result.txHash });
        this.alertTxResult(err, result);
        ga('send', {
          hitType: 'event',
          eventCategory: 'Action',
          eventAction: 'Cancel order',
          eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
        });
      });
  }
};
EtherDelta.prototype.trade = function trade(kind, order, inputAmount) {
  if (this.addrs[this.selectedAccount].slice(0, 39) === '0x0000000000000000000000000000000000000') {
    this.dialogError(
      "You haven't selected an account. Make sure you have an account selected from the Accounts dropdown in the upper right.");
    ga('send', {
      hitType: 'event',
      eventCategory: 'Error',
      eventAction: 'Trade - no account selected',
      eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
    });
    return;
  }
  let amount;
  if (kind === 'sell') {
    // if I'm selling a bid, the buyer is getting the token
    amount = new BigNumber(utility.ethToWei(inputAmount, this.getDivisor(order.tokenGet)));
  } else if (kind === 'buy') {
    // if I'm buying an offer, the seller is getting
    // the base and giving the token, so must convert to get terms
    amount = new BigNumber(utility.ethToWei(
      inputAmount * (Number(order.amountGet) / Number(order.amountGive)),
      this.getDivisor(order.tokenGive)));
  } else {
    return;
  }
  utility.call(
    this.web3,
    this.contractEtherDelta,
    this.config.contractEtherDeltaAddr,
    'balanceOf',
    [order.tokenGet, this.addrs[this.selectedAccount]],
    (err, result) => {
      const availableBalance = result;
      utility.call(
        this.web3,
        this.contractEtherDelta,
        this.config.contractEtherDeltaAddr,
        'availableVolume',
        [
          order.tokenGet,
          Number(order.amountGet),
          order.tokenGive,
          Number(order.amountGive),
          Number(order.expires),
          Number(order.nonce),
          order.user,
          Number(order.v),
          order.r,
          order.s,
        ],
        (errAvailableVolume, resultAvailableVolume) => {
          const availableVolume = resultAvailableVolume;
          if (amount.gt(availableBalance.divToInt(1.0031))) {
            // balance adjusted for fees (0.0001 to avoid rounding error)
            amount = availableBalance.divToInt(1.0031);
          }
          if (amount.gt(availableVolume)) amount = availableVolume;
          let v = Number(order.v);
          let r = order.r;
          let s = order.s;
          if (!(v && r && s)) {
            v = 0;
            r = '0x0';
            s = '0x0';
          }
          utility.call(
            this.web3,
            this.contractEtherDelta,
            this.config.contractEtherDeltaAddr,
            'testTrade',
            [
              order.tokenGet,
              Number(order.amountGet),
              order.tokenGive,
              Number(order.amountGive),
              Number(order.expires),
              Number(order.nonce),
              order.user,
              v,
              r,
              s,
              amount,
              this.addrs[this.selectedAccount],
            ],
            (errTestTrade, resultTestTrade) => {
              if (resultTestTrade && amount > 0) {
                utility.send(
                  this.web3,
                  this.contractEtherDelta,
                  this.config.contractEtherDeltaAddr,
                  'trade',
                  [
                    order.tokenGet,
                    Number(order.amountGet),
                    order.tokenGive,
                    Number(order.amountGive),
                    Number(order.expires),
                    Number(order.nonce),
                    order.user,
                    v,
                    r,
                    s,
                    amount,
                    { gas: this.config.gasTrade, value: 0 },
                  ],
                  this.addrs[this.selectedAccount],
                  this.pks[this.selectedAccount],
                  this.nonce,
                  (errSend, resultSend) => {
                    this.nonce = resultSend.nonce;
                    this.addPending(errSend, { txHash: resultSend.txHash });
                    this.alertTxResult(errSend, resultSend);
                    ga('send', {
                      hitType: 'event',
                      eventCategory: 'Action',
                      eventAction: 'Trade',
                      eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
                      eventValue: inputAmount,
                    });
                  });
              } else if (utility.weiToEth(availableVolume,
              this.getDivisor(this.selectedToken)) < this.minOrderSize) {
                this.dialogError(
                  "You cannot trade this order because it already traded. Someone else already traded this order and the order book hasn't updated yet.");
                ga('send', {
                  hitType: 'event',
                  eventCategory: 'Error',
                  eventAction: 'Trade - failed',
                  eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
                  eventValue: inputAmount,
                });
              } else {
                this.dialogError(
                  "You cannot trade this order because you don't have enough funds. Please DEPOSIT first using the Deposit form in the upper left. Enter the amount you want to deposit and press the 'Deposit' button.");
                ga('send', {
                  hitType: 'event',
                  eventCategory: 'Error',
                  eventAction: 'Trade - failed',
                  eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
                  eventValue: inputAmount,
                });
              }
            });
        });
    });
};
EtherDelta.prototype.addPending = function addPending(err, txsIn) {
  const txs = Array.isArray(txsIn) ? txsIn : [txsIn];
  txs.forEach((tx) => {
    if (!err && tx.txHash && tx.txHash !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
      Object.assign(tx, { txLink: `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/tx/${tx.txHash}` });
      this.pendingTransactions.push(tx);
    }
  });
  this.refresh(() => {}, true, true);
};
EtherDelta.prototype.updateUrl = function updateUrl() {
  let tokenName = this.selectedToken.name;
  let baseName = this.selectedBase.name;
  if (this.config.tokens.filter(x => x.name === tokenName).length === 0) {
    tokenName = this.selectedToken.addr;
  }
  if (this.config.tokens.filter(x => x.name === baseName).length === 0) {
    baseName = this.selectedBase.addr;
  }
  window.location.hash = `#${tokenName}-${baseName}`;
};
EtherDelta.prototype.getDivisor = function getDivisor(tokenOrAddress) {
  let result = 1000000000000000000;
  const token = this.getToken(tokenOrAddress);
  if (token && token.decimals !== undefined) {
    result = Math.pow(10, token.decimals); // eslint-disable-line no-restricted-properties
  }
  return new BigNumber(result);
};
EtherDelta.prototype.getToken = function getToken(addrOrToken, name, decimals) {
  let result;
  const lowerAddrOrToken = typeof addrOrToken === 'string' ? addrOrToken.toLowerCase() : addrOrToken;
  const matchingTokens = this.config.tokens.filter(
    x => x.addr.toLowerCase() === lowerAddrOrToken ||
    x.name === addrOrToken);
  const expectedKeys = JSON.stringify([
    'addr',
    'decimals',
    'name',
  ]);
  if (matchingTokens.length > 0) {
    result = matchingTokens[0];
  } else if (this.selectedToken.addr.toLowerCase() === lowerAddrOrToken) {
    result = this.selectedToken;
  } else if (this.selectedBase.addr.toLowerCase() === lowerAddrOrToken) {
    result = this.selectedBase;
  } else if (addrOrToken && addrOrToken.addr &&
  JSON.stringify(Object.keys(addrOrToken).sort()) === expectedKeys) {
    result = addrOrToken;
  } else if (typeof addrOrToken === 'string' && addrOrToken.slice(0, 2) === '0x' && name && decimals >= 0) {
    result = JSON.parse(JSON.stringify(this.config.tokens[0]));
    result.addr = lowerAddrOrToken;
    result.name = name;
    result.decimals = decimals;
  }
  return result;
};
EtherDelta.prototype.loadToken = function loadToken(addr, callback) {
  let token = this.getToken(addr);
  if (token) {
    callback(null, token);
  } else {
    token = JSON.parse(JSON.stringify(this.config.tokens[0]));
    if (addr.slice(0, 2) === '0x') {
      token.addr = addr.toLowerCase();
      utility.call(this.web3, this.contractToken, token.addr, 'decimals', [], (err, result) => {
        if (!err && result >= 0) token.decimals = result.toNumber();
        utility.call(this.web3, this.contractToken, token.addr, 'name', [], (errName, resultName) => {
          if (!errName && resultName) {
            token.name = resultName;
          } else {
            token.name = token.addr.slice(2, 6);
          }
          callback(null, token);
        });
      });
    } else {
      callback(null, token);
    }
  }
};
EtherDelta.prototype.selectToken = function selectToken(addrOrToken, name, decimals) {
  const token = this.getToken(addrOrToken, name, decimals);
  if (token) {
    this.loading(() => {});
    this.refresh(() => {}, true, true, token, this.selectedBase);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Token',
      eventAction: 'Select Token',
      eventLabel: this.selectedToken.name,
    });
  }
};
EtherDelta.prototype.selectBase = function selectBase(addrOrToken, name, decimals) {
  const base = this.getToken(addrOrToken, name, decimals);
  if (base) {
    this.loading(() => {});
    this.refresh(() => {}, true, true, this.selectedToken, base);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Token',
      eventAction: 'Select Base',
      eventLabel: this.selectedBase.name,
    });
  }
};
EtherDelta.prototype.selectTokenAndBase = function selectTokenAndBase(tokenAddr, baseAddr) {
  const token = this.getToken(tokenAddr);
  const base = this.getToken(baseAddr);
  if (token && base) {
    this.loading(() => {});
    this.refresh(() => {}, true, true, token, base);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Token',
      eventAction: 'Select Pair',
      eventLabel: `${this.selectedToken.name}/${this.selectedBase.name}`,
    });
  }
};
EtherDelta.prototype.setGasPrice = function setGasPrice(gasPrice) {
  if (gasPrice) {
    this.config.ethGasPrice = Number(gasPrice) * 1000000000;
    utility.createCookie('ethGasPrice', JSON.stringify(this.config.ethGasPrice), 999);
    this.minGas = (this.config.ethGasPrice * this.config.gasDeposit) / (10 ** 18);
  }
};
EtherDelta.prototype.displayBuySell = function displayBuySell(callback) {
  this.ejs(`${this.config.homeURL}/templates/buy.ejs`, 'buy', {
    selectedToken: this.selectedToken,
    selectedBase: this.selectedBase,
  });
  this.ejs(`${this.config.homeURL}/templates/sell.ejs`, 'sell', {
    selectedToken: this.selectedToken,
    selectedBase: this.selectedBase,
  });
  this.enableTooltipsAndPopovers();
  callback();
};
EtherDelta.prototype.displayTokenGuidesDropdown = function displayTokenGuidesDropdown() {
  const tokens = this.config.tokens.map(x => x);
  tokens.sort((a, b) => (a.name > b.name ? 1 : -1));
  this.ejs(`${this.config.homeURL}/templates/tokenGuidesDropdown.ejs`, 'tokenGuidesDropdown', {
    tokens,
  });
};
EtherDelta.prototype.displayHelpDropdown = function displayHelpDropdown() {
  this.ejs(`${this.config.homeURL}/templates/helpDropdown.ejs`, 'helpDropdown', {});
};
EtherDelta.prototype.displayHelp = function displayHelp(name) {
  $('#helpBody').html('');
  this.ejs(`${this.config.homeURL}/help/${name}.ejs`, 'helpBody', {});
  $('#helpModal').modal('show');
  ga('send', {
    hitType: 'event',
    eventCategory: 'Display',
    eventAction: 'Help',
    eventLabel: name,
  });
};
EtherDelta.prototype.displayScreencast = function displayScreencast(name) {
  $('#screencastBody').html('');
  this.ejs(`${this.config.homeURL}/help/${name}.ejs`, 'screencastBody', {});
  $('#screencastModal').modal('show');
  ga('send', {
    hitType: 'event',
    eventCategory: 'Display',
    eventAction: 'Screencast',
    eventLabel: name,
  });
};
EtherDelta.prototype.displayConnectionDescription = function displayConnectionDescription() {
  this.ejs(`${this.config.homeURL}/templates/connectionDescription.ejs`, 'connection', {
    connection: this.connection,
    contracts: this.config.contractEtherDeltaAddrs,
    contractAddr: this.config.contractEtherDeltaAddr,
    contractLink: `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/address/${this.config.contractEtherDeltaAddr}`,
  });
};
EtherDelta.prototype.displayTokenGuide = function displayTokenGuide(name) {
  const matchingTokens = this.config.tokens.filter(x => name === x.name);
  if (matchingTokens.length === 1) {
    const token = matchingTokens[0];
    $('#tokenGuideTitle').html(name);
    $('#tokenGuideBody').html('');
    const tokenLink = `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io/token/${token.addr}`;
    this.ejs(`${this.config.homeURL}/tokenGuides/details.ejs`, 'tokenGuideDetails', {
      token,
      tokenLink,
    });
    try {
      this.ejs(`${this.config.homeURL}/tokenGuides/${name}.ejs`, 'tokenGuideBody', {
        token,
        tokenLink,
      });
    } catch (err) {
      console.log(err);
    }
    ga('send', {
      hitType: 'event',
      eventCategory: 'Display',
      eventAction: 'Token Guide',
      eventLabel: name,
    });
    $('#tokenModal').modal('show');
  }
};
EtherDelta.prototype.checkContractUpgrade = function checkContractUpgrade() {
  if (
    (!this.selectedContract || this.selectedContract !== this.config.contractEtherDeltaAddr) &&
    (this.addrs.length > 1 ||
      (this.addrs.length === 1 && this.addrs[0].slice(0, 39) !== '0x0000000000000000000000000000000000000'))
  ) {
    this.dialogInfo(
      '<p>EtherDelta has a new smart contract. It is now selected.</p><p>Please use the "Smart Contract" menu to select the old one and withdraw from it.</p><p><a href="javascript:;" class="btn btn-default" onclick="alertify.closeAll(); bundle.EtherDelta.displayHelp(\'smartContract\')">Smart contract changelog</a></p>');
  }
};
EtherDelta.prototype.resetCaches = function resetCaches() {
  utility.eraseCookie(this.config.eventsCacheCookie);
  location.reload();
  ga('send', {
    hitType: 'event',
    eventCategory: 'Other',
    eventAction: 'Reset caches',
  });
};
EtherDelta.prototype.loading = function loading(callback) {
  [
    'deposit',
    'withdraw',
    'buy',
    'sell',
    'orderBook',
    'chartPrice',
    'chartDepth',
    'myTrades',
    'myOrders',
    'trades',
    'volume',
  ].forEach((div) => {
    this.ejs(`${this.config.homeURL}/templates/loading.ejs`, div, {});
  });
  callback();
};
EtherDelta.prototype.refresh = function refresh(callback, forceEventRead, initMarket, token, base) {
  this.q.push((done) => {
    if (token && base) {
      this.selectedToken = token;
      this.selectedBase = base;
      this.ordersResultByPair = { orders: [], blockNumber: 0 };
    }
    if (this.selectedToken.name === 'ETH' && ['USD.DC', 'BTC.DC'].indexOf(this.selectedBase.name) < 0) {
      const temp = this.selectedBase;
      this.selectedBase = this.selectedToken;
      this.selectedToken = temp;
    }
    console.log('Beginning refresh', new Date(), `${this.selectedToken.name}/${this.selectedBase.name}`);
    this.selectedContract = this.config.contractEtherDeltaAddr;
    utility.createCookie(
      this.config.userCookie,
      JSON.stringify({
        addrs: this.addrs,
        pks: this.pks,
        selectedAccount: this.selectedAccount,
        selectedToken: this.selectedToken,
        selectedBase: this.selectedBase,
        selectedContract: this.selectedContract,
      }),
      999);
    async.series(
      [
        (callbackSeries) => {
          if (initMarket) {
            this.apiServerNonce = Math.random().toString().slice(2) +
              Math.random().toString().slice(2);
            this.updateUrl();
            async.parallel(
              [
                (callbackParallel) => {
                  this.displayBuySell(() => {
                    callbackParallel(null, undefined);
                  });
                },
                (callbackParallel) => {
                  this.displayTokensAndBases(() => {
                    callbackParallel(null, undefined);
                  });
                }],
              () => {
                callbackSeries(null, undefined);
              });
          } else {
            callbackSeries(null, undefined);
          }
        },
        (callbackSeries) => {
          async.parallel(
            [
              (callbackParallel) => {
                console.log('Displaying my account balances', new Date());
                this.displayAccounts(() => {});
                this.displayAllBalances(() => {
                  console.log('Done displaying my account balances', new Date());
                });
                callbackParallel();
              },
              (callbackParallel) => {
                console.log('Loading events', new Date());
                this.loadEvents((err, newEvents) => {
                  console.log('Done loading events', newEvents, new Date());
                  callbackParallel(null, undefined);
                });
              },
              (callbackParallel) => {
                async.parallel(
                  [
                    (callbackParallel2) => {
                      this.getTopOrders((err, result) => {
                        if (!err && result) {
                          this.topOrdersResult = result;
                        } else {
                          console.log('Top levels have not changed since last refresh.');
                        }
                        callbackParallel2(null, undefined);
                      });
                    },
                    (callbackParallel2) => {
                      this.getReturnTicker((err, result) => {
                        if (!err && result) {
                          this.returnTicker = result;
                        } else {
                          console.log('Return ticker has not changed since last refresh.');
                        }
                        callbackParallel2(null, undefined);
                      });
                    },
                    (callbackParallel2) => {
                      this.getOrdersByPair(
                      this.selectedToken.addr,
                      this.selectedBase.addr,
                      (err, result) => {
                        if (!err && result) {
                          this.ordersResultByPair = result;
                        } else {
                          console.log('Order book has not changed since last refresh.');
                        }
                        callbackParallel2(null, undefined);
                      });
                    },
                  ],
                  () => {
                    console.log('Displaying order book', new Date());
                    this.displayOrderbook(this.ordersResultByPair.orders,
                    this.ordersResultByPair.blockNumber, () => {
                      console.log('Done displaying order book', new Date());
                      callbackParallel(null, undefined);
                    });
                  });
              }],
            () => {
              async.parallel(
                [
                  (callbackParallel3) => {
                    console.log('Displaying volumes', new Date());
                    this.displayVolumes(this.topOrdersResult.orders,
                    this.returnTicker,
                    this.topOrdersResult.blockNumber, () => {
                      console.log('Done displaying volumes', new Date());
                      callbackParallel3();
                    });
                  },
                  (callbackParallel3) => {
                    console.log('Displaying trades and chart', new Date());
                    this.displayTradesAndChart(() => {
                      console.log('Done displaying trades and chart', new Date());
                      callbackParallel3();
                    });
                  },
                  (callbackParallel3) => {
                    console.log('Displaying my transactions', new Date());
                    this.displayMyTransactions(
                      this.ordersResultByPair.orders,
                      this.ordersResultByPair.blockNumber,
                      () => {
                        console.log('Done displaying my transactions', new Date());
                        callbackParallel3();
                      });
                  }],
                () => {
                  callbackSeries(null, undefined);
                });
            });
        }],
      () => {
        console.log('Ending refresh', new Date());
        done();
        callback();
      });
  });
};
EtherDelta.prototype.refreshLoop = function refreshLoop() {
  const self = this;
  function loop() {
    self.refresh(() => {
      setTimeout(loop, 60 * 1000);
    });
  }
  loop();
};
EtherDelta.prototype.initDisplays = function initDisplays(callback) {
  this.loading(() => {});
  this.displayTokenGuidesDropdown(() => {});
  this.displayConnectionDescription(() => {});
  this.displayHelpDropdown(() => {});
  this.displayLanguages(() => {});
  this.checkContractUpgrade(() => {});
  this.refresh(
    () => {
      callback();
    },
    true,
    true);
};
EtherDelta.prototype.loadWeb3 = function loadWeb3(callback) {
  this.config = config;
  // web3
  if (typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
    // metamask situation
    this.web3 = new Web3(web3.currentProvider);
    console.log('Connecting to MetaMask', web3.currentProvider);
    async.until(
      () => this.connection,
      (callbackUntil) => {
        this.connection = {
          connection: 'RPC',
          provider: this.config.ethProvider,
          testnet: this.config.ethTestnet,
        };
        $('#pkDiv').hide();
        $('#gasPrice').replaceWith('<p>Set in MetaMask</p>');
        setTimeout(() => {
          callbackUntil(null);
        }, 500);
      },
      () => {
        callback();
      });
  } else if (typeof Web3 !== 'undefined' && window.location.protocol !== 'https:') {
    // mist/geth/parity situation
    console.log('Connecting to Mist/Geth/Parity');
    this.web3 = new Web3(new Web3.providers.HttpProvider(this.config.ethProvider));
    try {
      this.connection = { connection: 'RPC', provider: this.config.ethProvider, testnet: this.config.ethTestnet };
      const coinbase = this.web3.eth.coinbase;
      console.log(`Coinbase: ${coinbase}`);
      $('#pkDiv').hide();
      $('#gasPrice').replaceWith('<p>Set in MetaMask</p>');
    } catch (err) {
      this.connection = {
        connection: 'Proxy',
        provider: `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io`,
        testnet: this.config.ethTestnet,
      };
      $('#gasPrice').val(this.config.ethGasPrice / 1000000000);
      this.web3.setProvider(undefined);
    }
    callback();
  } else {
    // etherscan proxy
    console.log('Connecting to Etherscan proxy');
    this.web3 = new Web3();
    this.connection = {
      connection: 'Proxy',
      provider: `https://${this.config.ethTestnet ? `${this.config.ethTestnet}.` : ''}etherscan.io`,
      testnet: this.config.ethTestnet,
    };
    callback();
  }
};
EtherDelta.prototype.initContracts = function initContracts(callback) {
  this.web3.version.getNetwork((error, version) => {
    if (!error && version && Number(version) !== 1 && configName !== 'testnet') {
      this.dialogError('You are connected to the Ethereum testnet. Please connect to the Ethereum mainnet.');
    }
    this.config = config;
    const gasCookie = utility.readCookie('ethGasPrice');
    if (gasCookie) {
      this.config.ethGasPrice = JSON.parse(gasCookie);
    }
    this.minGas = (this.config.ethGasPrice * this.config.gasDeposit) / (10 ** 18);
    if (Array.isArray(this.config.apiServer)) {
      this.config.apiServer = this.config.apiServer[
        Math.floor(Math.random() * this.config.apiServer.length)];
      console.log('Selected API', this.config.apiServer);
    }
    // default selected token and base
    this.selectedToken = this.config.tokens.find(
      x => x.name === this.config.defaultPair.token) || this.config.tokens[1];
    this.selectedBase = this.config.tokens.find(
      x => x.name === this.config.defaultPair.base) || this.config.tokens[0];
    // default addr, pk
    this.addrs = [this.config.ethAddr];
    this.pks = [this.config.ethAddrPrivateKey];
    // get cookie
    let userCookie = utility.readCookie(this.config.userCookie);
    if (userCookie) {
      userCookie = JSON.parse(userCookie);
      this.addrs = userCookie.addrs;
      this.pks = userCookie.pks;
      this.selectedAccount = userCookie.selectedAccount;
      if (userCookie.language) this.language = userCookie.language;
      this.selectedContract = userCookie.selectedContract;
    }
    // translation
    this.translator = $('body').translate({ lang: this.language, t: translations });
    // events cache cookie
    // const eventsCacheCookie = utility.readCookie(this.config.eventsCacheCookie);
    // if (eventsCacheCookie) eventsCache = JSON.parse(eventsCacheCookie);
    // connection
    this.config.contractEtherDeltaAddr = this.config.contractEtherDeltaAddrs[0].addr;
    // get accounts
    this.web3.eth.defaultAccount = this.config.ethAddr;
    this.web3.eth.getAccounts((e, accounts) => {
      if (!e && accounts && accounts.length > 0) {
        accounts.forEach((addr) => {
          const index = this.addrs.indexOf(addr);
          if (index < 0) {
            this.addrs.push(addr);
            this.pks.push(undefined);
          }
        });
        this.addrs.forEach((addr, i) => {
          if (accounts.indexOf(addr) >= 0) {
            this.addrKinds[i] = 'MetaMask';
          }
        });
      } else if (this.connection.connection === 'RPC') {
        this.dialogError('You are using MetaMask but you are not logged in. Please log in to MetaMask and refresh.');
        ga('send', {
          hitType: 'event',
          eventCategory: 'Error',
          eventAction: 'Ethereum - MetaMask not logged in',
        });
      }
    });
    // load contract
    utility.loadContract(
      this.web3,
      this.config.contractEtherDelta,
      this.config.contractEtherDeltaAddr,
      (err, contractEtherDelta) => {
        this.contractEtherDelta = contractEtherDelta;
        utility.loadContract(
          this.web3,
          this.config.contractToken,
          '0x0000000000000000000000000000000000000000',
          (errLoadContract, contractToken) => {
            this.contractToken = contractToken;
            // select token and base
            const hash = window.location.hash.substr(1);
            const hashSplit = hash.split('-');
            // get token and base from hash
            async.parallel(
              [
                (callbackParallel) => {
                  if (hashSplit.length === 2) {
                    this.loadToken(hashSplit[0], (errLoadToken, result) => {
                      if (!errLoadToken && result) this.selectedToken = result;
                      callbackParallel(null, true);
                    });
                  } else {
                    callbackParallel(null, true);
                  }
                },
                (callbackParallel) => {
                  if (hashSplit.length === 2) {
                    this.loadToken(hashSplit[1], (errLoadToken, result) => {
                      if (!errLoadToken && result) this.selectedBase = result;
                      callbackParallel(null, true);
                    });
                  } else {
                    callbackParallel(null, true);
                  }
                }],
              () => {
                callback();
              });
          });
      });
  });
};
EtherDelta.prototype.startEtherDelta = function startEtherDelta() {
  console.log('Beginning init', new Date());
  this.loadWeb3(() => {
    console.log('Web3 done', new Date());
    this.initContracts(() => {
      console.log('Init contracts done', new Date());
      this.initDisplays(() => {
        console.log('Displays done', new Date());
        this.refreshLoop();
      });
    });
  });
};

const etherDelta = new EtherDelta();

module.exports = { EtherDelta: etherDelta, utility };
