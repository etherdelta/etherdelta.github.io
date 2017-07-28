/* eslint-env browser */
/* eslint no-console: ["error", { allow: ["log"] }] */

const Web3 = require('web3');
const request = require('request');
const async = require('async');
const BigNumber = require('bignumber.js');
const sha256 = require('js-sha256').sha256;

function API() {}

API.init = function init(callback, allContracts, path, provider, configName, lookbackIn) {
  const self = this;
  if (configName === 'testnet') {
    this.config = require('./config_testnet.js'); // eslint-disable-line global-require
  } else {
    this.config = require('./config.js'); // eslint-disable-line global-require
  }
  this.utility = require('./common/utility.js')(this.config); // eslint-disable-line global-require

  // web3
  this.web3 = new Web3();
  this.web3.eth.defaultAccount = this.config.ethAddr;
  if (provider) {
    this.config.ethProvider = provider;
  }
  this.web3.setProvider(new this.web3.providers.HttpProvider(this.config.ethProvider));

  // check mainnet vs testnet
  this.web3.version.getNetwork((error, version) => {
    if (!error && version && Number(version) !== 1) {
      throw new Error('You are connected to the Ethereum testnet. Please connect to the Ethereum mainnet.');
    }
    try {
      if (this.web3.currentProvider) {
        const coinbase = this.web3.eth.coinbase;
        console.log(`Coinbase: ${coinbase}`);
      }
    } catch (err) {
      this.web3.setProvider(undefined);
    }

    // path
    if (path) {
      this.config.contractEtherDelta = path + this.config.contractEtherDelta;
      this.config.contractToken = path + this.config.contractToken;
    }

    // contracts
    this.contractEtherDelta = undefined;
    this.contractEtherDeltaAddrs = [this.config.contractEtherDeltaAddrs[0].addr];
    if (allContracts) {
      this.contractEtherDeltaAddrs = this.config.contractEtherDeltaAddrs.map(x => x.addr);
    }
    this.contractToken = undefined;

    // storage
    this.storageEventsCache = 'storage_eventsCache';
    this.storageOrdersCache = 'storage_ordersCache';

    // other constiables
    this.lastMessagesId = 0;
    this.eventsCache = {};
    this.ordersCache = {};
    this.usersWithOrdersToUpdate = {};
    this.blockTimeSnapshot = undefined;
    this.minOrderSize = 0.01;
    this.pricesCache = undefined;
    this.nonce = undefined;

    async.series(
      [
        (callbackSeries) => {
          this.utility.loadContract(
            this.web3,
            this.config.contractEtherDelta,
            this.contractEtherDeltaAddrs[0],
            (err, contract) => {
              this.contractEtherDelta = contract;
              callbackSeries(null, true);
            });
        },
        (callbackSeries) => {
          this.utility.loadContract(this.web3, this.config.contractToken, this.config.ethAddr, (
            err,
            contract) => {
            this.contractToken = contract;
            callbackSeries(null, true);
          });
        },
        (callbackSeries) => {
          API.readStorage(this.storageEventsCache, (err, result) => {
            self.eventsCache = !err && result ? result : {};
            callbackSeries(null, true);
          });
        },
        (callbackSeries) => {
          API.readStorage(this.storageOrdersCache, (err, result) => {
            self.ordersCache = !err && result ? result : {};
            callbackSeries(null, true);
          });
        },
        (callbackSeries) => {
          API.getBlockNumber(() => {
            callbackSeries(null, true);
          });
        },
        (callbackSeries) => {
          API.logs(() => {
            callbackSeries(null, true);
          }, lookbackIn);
        },
      ],
      () => {
        callback(null, {
          contractEtherDelta: this.contractEtherDelta,
          contractToken: this.contractToken,
        });
      });
  });
};

API.readStorage = function readStorage(name, callback) {
  if (typeof window !== 'undefined') {
    const result = this.utility.readCookie(name);
    if (result) {
      try {
        const resultObj = JSON.parse(result);
        callback(null, resultObj);
      } catch (err) {
        callback('fail', undefined);
      }
    } else {
      callback('fail', undefined);
    }
  } else {
    this.utility.readFile(name, (err, result) => {
      if (!err) {
        try {
          const resultObj = JSON.parse(result);
          callback(null, resultObj);
        } catch (errTry) {
          callback(err, undefined);
        }
      } else {
        callback(err, undefined);
      }
    });
  }
};

API.writeStorage = function writeStorage(name, obj, callback) {
  const objStr = JSON.stringify(obj);
  if (typeof window !== 'undefined') {
    this.utility.createCookie(name, objStr);
    callback(null, true);
  } else {
    this.utility.writeFile(name, objStr, (err) => {
      if (!err) {
        callback(null, true);
      } else {
        callback(err, false);
      }
    });
  }
};

API.logs = function logs(callback, lookbackIn) {
  this.utility.blockNumber(this.web3, (err, blockNumber) => {
    const startBlock = lookbackIn ? blockNumber - lookbackIn : 1848513;
    Object.keys(this.eventsCache).forEach((id) => {
      const event = this.eventsCache[id];
      Object.keys(event.args).forEach((arg) => {
        if (typeof event.args[arg] === 'string' && event.args[arg].slice(0, 2) !== '0x') {
          event.args[arg] = new BigNumber(event.args[arg]);
        }
      });
      if (event.blockNumber < startBlock) delete this.eventsCache[id]; // delete old events
    });
    async.mapSeries(
      this.contractEtherDeltaAddrs,
      (contractEtherDeltaAddr, callbackMap) => {
        const blocks = Object.values(this.eventsCache)
          .filter(x => x.address === contractEtherDeltaAddr)
          .map(x => x.blockNumber);
        const lastBlock = blocks.length ? blocks.max() : startBlock;
        const searches = [];
        const blockInterval = 12500;
        for (let b = blockNumber; b > lastBlock; b -= blockInterval) {
          searches.push([Math.max(lastBlock, b - blockInterval), b]);
        }
        async.mapSeries(
          searches,
          (searchRange, callbackMapSearch) => {
            this.utility.logsOnce(
              this.web3,
              this.contractEtherDelta,
              contractEtherDeltaAddr,
              searchRange[0],
              searchRange[1],
              (errEvents, events) => {
                let newEvents = 0;
                events.forEach((event) => {
                  if (!this.eventsCache[event.transactionHash + event.logIndex]) {
                    newEvents += 1;
                    Object.assign(event, { txLink: `http://${this.config.ethTestnet ? 'testnet.' : ''}etherscan.io/tx/${event.transactionHash}` });
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
                if (newEvents) {
                  callbackMapSearch(null, newEvents);
                } else {
                  callbackMapSearch(null, 0);
                }
              });
          },
          (errNewEvents, newEventsArr) => {
            const newEvents = newEventsArr.reduce((a, b) => a + b, 0);
            callbackMap(null, newEvents);
          });
      },
      (errMap, result) => {
        const newEvents = result.reduce((a, b) => a + b, 0);
        API.writeStorage(this.storageEventsCache, this.eventsCache, () => {});
        callback(null, newEvents);
      });
  });
};

API.getPrices = function getPrices(callback) {
  request.get('https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH&tsyms=BTC', (
    err1,
    httpResponse1,
    body1) => {
    const ethBTC = Number(JSON.parse(body1).ETH.BTC);
    request.get('http://api.coindesk.com/v1/bpi/currentprice/USD.json', (
      err2,
      httpResponse2,
      body2) => {
      const btcUSD = Number(JSON.parse(body2).bpi.USD.rate.replace(',', ''));
      const price = ethBTC * btcUSD;
      callback(null, { ETHBTC: ethBTC, BTCUSD: btcUSD, ETHUSD: price });
    });
  });
};

API.getCoinMarketCapTicker = function getCoinMarketCapTicker(callback) {
  const url = 'https://api.coinmarketcap.com/v1/ticker/';
  request.get(url, (err, httpResponse, body) => {
    const ticker = JSON.parse(body);
    callback(null, ticker);
  });
};

API.getBalance = function getBalance(addr, callback) {
  this.utility.getBalance(this.web3, addr, (err, balance) => {
    if (!err) {
      callback(null, balance);
    } else {
      callback(null, 0);
    }
  });
};

API.getEtherDeltaBalance = function getEtherDeltaBalance(addr, callback) {
  if (addr.length === 42) {
    const token = '0x0000000000000000000000000000000000000000'; // ether token
    this.utility.call(
      this.web3,
      this.contractEtherDelta,
      this.contractEtherDeltaAddrs[0],
      'balanceOf',
      [token, addr],
      (err, result) => {
        if (!err) {
          callback(null, result.toNumber());
        } else {
          callback(null, 0);
        }
      });
  } else {
    callback(null, 0);
  }
};

API.getEtherDeltaTokenBalances = function getEtherDeltaTokenBalances(addr, callback) {
  if (addr.length === 42) {
    async.reduce(
      this.config.tokens,
      {},
      (memo, token, callbackReduce) => {
        this.utility.call(
          this.web3,
          this.contractEtherDelta,
          this.contractEtherDeltaAddrs[0],
          'balanceOf',
          [token.addr, addr],
          (err, result) => {
            if (!err) {
              Object.assign(memo, { [token.name]: result.toNumber() });
              callbackReduce(null, memo);
            } else {
              callbackReduce(null, memo);
            }
          });
      },
      (err, tokenBalances) => {
        callback(null, tokenBalances);
      });
  } else {
    callback(null, {});
  }
};

API.getTokenBalances = function getTokenBalances(addr, callback) {
  if (addr.length === 42) {
    // Ethereum address
    async.reduce(
      this.config.tokens,
      {},
      (memo, token, callbackReduce) => {
        if (token.addr === '0x0000000000000000000000000000000000000000') {
          API.getBalance(addr, (err, result) => {
            Object.assign(memo, { [token.name]: result });
            callbackReduce(null, memo);
          });
        } else {
          this.utility.call(this.web3, this.contractToken, token.addr, 'balanceOf', [addr], (
            err,
            result) => {
            if (!err) {
              Object.assign(memo, { [token.name]: result.toNumber() });
              callbackReduce(null, memo);
            } else {
              callbackReduce(null, memo);
            }
          });
        }
      },
      (err, tokenBalances) => {
        callback(null, tokenBalances);
      });
  } else if (addr.length === 34) {
    // Bitcoin address
    request.get(`https://blockchain.info/q/addressbalance/${addr}`, (
      err,
      httpResponse,
      body) => {
      const balance = Number(body) /
        Math.pow(10, 8); // eslint-disable-line no-restricted-properties
      callback(null, {
        BTC: balance,
      });
    });
  }
};

API.getUSDValue = function getUSDValue(tokenName, balance, tokenPrices, tickers) {
  let token = API.getToken(tokenName);
  if (!token) token = { name: tokenName, decimals: 0 };
  const tokenBalance = balance /
    Math.pow(10, token.decimals); // eslint-disable-line no-restricted-properties
  let price = 0;
  const tokenMatch = tokenPrices.filter(x => x.name === token.name)[0];
  const ETHUSD = Number(tickers.filter(x => x.symbol === 'ETH')[0].price_usd);
  if (tokenMatch) {
    if (tokenMatch.price) {
      if (tokenMatch.unit === 'ETH') {
        price = tokenMatch.price;
      } else if (tokenMatch.unit === 'USD') {
        price = tokenMatch.price / ETHUSD;
      }
    } else if (tokenMatch.api_symbol) {
      const tickerMatch = tickers.filter(
        x => x.symbol === tokenMatch.api_symbol ||
        x.id === tokenMatch.api_symbol)[0];
      if (tickerMatch) {
        price = tickerMatch.price_usd / ETHUSD;
      }
    }
  } else if (token.name.slice(-1) === 'N') {
    const yesVersion = token.name.replace(/N$/, 'Y');
    const tokenYesMatches = tokenPrices.filter(x => x.name === yesVersion);
    if (tokenYesMatches.length === 1) {
      price = 1.0 - tokenYesMatches[0].price;
    }
  }
  return {
    price,
    eth: tokenBalance * price,
    usd: tokenBalance * price * ETHUSD,
    balance: tokenBalance,
  };
};

API.getUSDBalance = function getUSDBalance(addr, tokenPrices, callback) {
  async.parallel(
    [
      (callbackParallel) => {
        API.getTokenBalances(addr, callbackParallel);
      },
      (callbackParallel) => {
        API.getEtherDeltaTokenBalances(addr, callbackParallel);
      },
      (callbackParallel) => {
        API.getCoinMarketCapTicker(callbackParallel);
      },
    ],
    (err, results) => {
      const balances = { Wallet: results[0], EtherDelta: results[1] };
      const tickers = results[2];
      let total = 0;
      const ETHUSD = Number(tickers.filter(x => x.symbol === 'ETH')[0].price_usd);
      const BTCUSD = Number(tickers.filter(x => x.symbol === 'BTC')[0].price_usd);
      Object.keys(balances).forEach((dapp) => {
        const balance = balances[dapp];
        if (typeof balance === 'object' && balance.ETH !== undefined) {
          let totalBalance = 0;
          Object.keys(balance).forEach((name) => {
            const value = API.getUSDValue(name, balance[name], tokenPrices, tickers);
            totalBalance += value.balance * value.price;
            if (!balances[name]) balances[name] = 0;
            balances[name] += value.usd;
          });
          balances[dapp] = totalBalance;
        } else {
          balances[dapp] = balance;
        }
        total += balances[dapp];
      });
      const ethValue = total;
      const usdValue = total * ETHUSD;
      const result = {
        usdValue,
        ethValue,
        balances,
        prices: { ETHUSD, BTCUSD },
      };
      callback(null, result);
    });
};

API.getDivisor = function getDivisor(tokenOrAddress) {
  let result = 1000000000000000000;
  const token = API.getToken(tokenOrAddress);
  if (token && token.decimals >= 0) {
    result = Math.pow(10, token.decimals); // eslint-disable-line no-restricted-properties
  }
  return new BigNumber(result);
};

API.getTokenByAddr = function getTokenByAddr(addr, callback) {
  let token;
  const matchingTokens = this.config.tokens.filter(x => x.addr === addr || x.name === addr);
  if (matchingTokens.length > 0) {
    token = matchingTokens[0];
    callback(token);
  } else if (addr.slice(0, 2) === '0x') {
    token = JSON.parse(JSON.stringify(this.config.tokens[0]));
    token.addr = addr;
    this.utility.call(this.web3, this.contractToken, token.addr, 'decimals', [], (errDecimals, resultDecimals) => {
      if (!errDecimals && resultDecimals >= 0) token.decimals = resultDecimals.toNumber();
      this.utility.call(this.web3, this.contractToken, token.addr, 'name', [], (errName, resultName) => {
        if (!errName && resultName) {
          token.name = resultName;
        } else {
          token.name = token.addr.slice(2, 6);
        }
        this.config.tokens.push(token);
        callback(token);
      });
    });
  } else {
    callback(token);
  }
};

API.getToken = function getToken(addrOrToken, name, decimals) {
  let result;
  const matchingTokens = this.config.tokens.filter(
    x => x.addr === addrOrToken ||
    x.name === addrOrToken);
  const expectedKeys = JSON.stringify([
    'addr',
    'decimals',
    'name',
  ]);
  if (matchingTokens.length > 0) {
    result = matchingTokens[0];
  } else if (addrOrToken.addr && JSON.stringify(Object.keys(addrOrToken).sort()) === expectedKeys) {
    result = addrOrToken;
  } else if (addrOrToken.slice(0, 2) === '0x' && name && decimals >= 0) {
    result = JSON.parse(JSON.stringify(this.config.tokens[0]));
    result.addr = addrOrToken;
    result.name = name;
    result.decimals = decimals;
  }
  return result;
};

API.saveOrders = function saveOrders(callback) {
  API.writeStorage(this.storageOrdersCache, this.ordersCache, (err, result) => {
    callback(err, result);
  });
};

API.addOrderFromMessage = function addOrderFromMessage(messageIn, callback) {
  const message = messageIn;
  Object.keys(message).forEach((key) => {
    if (typeof message[key] === 'number') {
      Object.assign(message, {
        [key]: new BigNumber(String(message[key])),
      });
    }
  });
  const expectedKeys = JSON.stringify([
    'amountGet',
    'amountGive',
    'contractAddr',
    'expires',
    'nonce',
    'r',
    's',
    'tokenGet',
    'tokenGive',
    'user',
    'v',
  ]);
  if (typeof message === 'object' && JSON.stringify(Object.keys(message).sort()) === expectedKeys) {
    const id = sha256(Math.random().toString());
    const buyOrder = {
      amount: message.amountGet,
      price: message.amountGive
        .div(message.amountGet)
        .mul(API.getDivisor(message.tokenGet))
        .div(API.getDivisor(message.tokenGive)),
      id: `${id}_buy`,
      order: message,
      updated: undefined,
    };
    const sellOrder = {
      amount: -message.amountGive,
      price: message.amountGet
        .div(message.amountGive)
        .mul(API.getDivisor(message.tokenGive))
        .div(API.getDivisor(message.tokenGet)),
      id: `${id}_sell`,
      order: message,
      updated: undefined,
    };
    async.parallel(
      [
        (callbackParallel) => {
          API.updateOrder(buyOrder, (err, result) => {
            if (!err) this.ordersCache[`${id}_buy`] = result;
            callbackParallel(null);
          });
        },
        (callbackParallel) => {
          API.updateOrder(sellOrder, (err, result) => {
            if (!err) this.ordersCache[`${id}_sell`] = result;
            callbackParallel(null);
          });
        },
      ],
      () => {
        callback(null, true);
      });
  } else {
    callback('Failed to add order.', false);
  }
};

API.addOrderFromEvent = function addOrderFromEvent(event, callback) {
  if (event.event === 'Order' && event.address === this.contractEtherDeltaAddrs[0]) {
    const id = (event.blockNumber * 1000) + event.transactionIndex;
    if (!this.ordersCache[`${id}_buy`]) {
      const buyOrder = {
        amount: event.args.amountGet,
        price: event.args.amountGive
          .div(event.args.amountGet)
          .mul(API.getDivisor(event.args.tokenGet))
          .div(API.getDivisor(event.args.tokenGive)),
        id: `${id}_buy`,
        order: Object.assign(event.args, {
          contractAddr: event.address,
        }),
        updated: undefined,
      };
      const sellOrder = {
        amount: -event.args.amountGive,
        price: event.args.amountGet
          .div(event.args.amountGive)
          .mul(API.getDivisor(event.args.tokenGive))
          .div(API.getDivisor(event.args.tokenGet)),
        id: `${id}_sell`,
        order: Object.assign(event.args, {
          contractAddr: event.address,
        }),
        updated: undefined,
      };
      async.parallel(
        [
          (callbackParallel) => {
            API.updateOrder(buyOrder, (err, result) => {
              if (!err) {
                this.ordersCache[`${id}_buy`] = result;
              } else {
                delete this.ordersCache[`${id}_buy`];
              }
              callbackParallel(null);
            });
          },
          (callbackParallel) => {
            API.updateOrder(sellOrder, (err, result) => {
              if (!err) {
                this.ordersCache[`${id}_sell`] = result;
              } else {
                delete this.ordersCache[`${id}_sell`];
              }
              callbackParallel(null);
            });
          },
        ],
        () => {
          callback(null, true);
        });
    } else {
      callback('Order exists.', false);
    }
  } else {
    callback('Failed to add order.', false);
  }
};

API.updateOrder = function updateOrder(orderIn, callback) {
  const order = orderIn;
  API.getBlockNumber((err, blockNumber) => {
    if (!(!err && blockNumber && blockNumber > 0)) {
      // if the block number doesn't make sense, assume the order is ok and try again later
      callback(null, order);
    } else if (blockNumber < Number(order.order.expires)) {
      async.each(
        [order.order.tokenGive, order.order.tokenGet],
        (tokenAddr, callbackEach) => {
          API.getTokenByAddr(tokenAddr, () => {
            // this function will check if the token is already in the config,
            // and if not, it will grab the details from the blockchain and save to config
            callbackEach(null);
          });
        },
        () => {
          this.utility.call(
            this.web3,
            this.contractEtherDelta,
            this.contractEtherDeltaAddrs[0],
            'availableVolume',
            [
              order.order.tokenGet,
              Number(order.order.amountGet),
              order.order.tokenGive,
              Number(order.order.amountGive),
              Number(order.order.expires),
              Number(order.order.nonce),
              order.order.user,
              Number(order.order.v),
              order.order.r,
              order.order.s,
            ],
            (errAvail, resultAvail) => {
              if (!errAvail) {
                const availableVolume = resultAvail;
                if (order.amount >= 0) {
                  order.price = new BigNumber(order.order.amountGive)
                    .div(new BigNumber(order.order.amountGet))
                    .mul(API.getDivisor(order.order.tokenGet))
                    .div(API.getDivisor(order.order.tokenGive));
                  order.availableVolume = availableVolume;
                  order.ethAvailableVolume = this.utility.weiToEth(
                    Math.abs(order.availableVolume),
                    API.getDivisor(order.order.tokenGet));
                  order.availableVolumeBase = Math.abs(availableVolume
                    .mul(order.price)
                    .mul(API.getDivisor(order.order.tokenGive))
                    .div(API.getDivisor(order.order.tokenGet)));
                  order.ethAvailableVolumeBase = this.utility.weiToEth(order.availableVolumeBase,
                    API.getDivisor(order.order.tokenGive));
                } else {
                  order.price = new BigNumber(order.order.amountGet)
                    .div(new BigNumber(order.order.amountGive))
                    .mul(API.getDivisor(order.order.tokenGive))
                    .div(API.getDivisor(order.order.tokenGet));
                  order.availableVolume = availableVolume
                    .div(order.price)
                    .mul(API.getDivisor(order.order.tokenGive))
                    .div(API.getDivisor(order.order.tokenGet));
                  order.ethAvailableVolume = this.utility.weiToEth(
                    Math.abs(order.availableVolume),
                    API.getDivisor(order.order.tokenGive));
                  order.availableVolumeBase = Math.abs(availableVolume);
                  order.ethAvailableVolumeBase = this.utility.weiToEth(
                    order.availableVolumeBase,
                    API.getDivisor(order.order.tokenGet));
                }
                if (Number(order.ethAvailableVolume).toFixed(3) >= this.minOrderSize &&
                Number(order.ethAvailableVolumeBase).toFixed(3) >= this.minOrderSize) {
                  this.utility.call(
                    this.web3,
                    this.contractEtherDelta,
                    this.contractEtherDeltaAddrs[0],
                    'amountFilled',
                    [
                      order.order.tokenGet,
                      Number(order.order.amountGet),
                      order.order.tokenGive,
                      Number(order.order.amountGive),
                      Number(order.order.expires),
                      Number(order.order.nonce),
                      order.order.user,
                      Number(order.order.v),
                      order.order.r,
                      order.order.s,
                    ],
                    (errFilled, resultFilled) => {
                      if (!errFilled && resultFilled) {
                        const amountFilled = resultFilled;
                        if (amountFilled.lessThan(order.order.amountGet)) {
                          order.updated = new Date();
                          if (order.amount >= 0) {
                            order.amountFilled = amountFilled;
                          } else {
                            order.amountFilled = amountFilled
                              .div(order.price)
                              .mul(API.getDivisor(order.order.tokenGive))
                              .div(API.getDivisor(order.order.tokenGet));
                          }
                          callback(null, order);
                        } else {
                          callback('Order is filled', undefined);
                        }
                      } else {
                        callback(null, order);
                      }
                    });
                } else if (!order.updated) {
                  // may want to not count this as an error and try again
                  callback('Volume too low', undefined);
                } else {
                  callback('Volume too low', undefined);
                }
              } else {
                // if there's an error, assume the order is ok and try again later
                callback(null, order);
              }
            });
        });
    } else {
      callback('Expired', undefined);
    }
  });
};

API.getTopOrders = function getTopOrders() {
  const buys = {};
  const sells = {};
  Object.keys(API.ordersCache).forEach((key) => {
    const order = API.ordersCache[key];
    const keyKind = key.split('_')[1];
    const tokenPair = `${order.order.tokenGive}/${order.order.tokenGet}_${keyKind}`;
    if (Number(order.ethAvailableVolume).toFixed(3) >= this.minOrderSize &&
    Number(order.ethAvailableVolumeBase).toFixed(3) >= this.minOrderSize) {
      if (keyKind === 'buy') {
        if (!buys[tokenPair]) {
          buys[tokenPair] = order;
        } else if (Number(order.price) > Number(buys[tokenPair].price)) {
          buys[tokenPair] = order;
        }
      } else if (keyKind === 'sell') {
        if (!sells[tokenPair]) {
          sells[tokenPair] = order;
        } else if (Number(order.price) < Number(sells[tokenPair].price)) {
          sells[tokenPair] = order;
        }
      }
    }
  });
  const orders = Object.values(buys).concat(Object.values(sells));
  return orders;
};

API.getOrdersByPair = function getOrdersByPair(tokenA, tokenB, n) {
  const orders = [];
  Object.keys(API.ordersCache).forEach((key) => {
    const order = API.ordersCache[key];
    if (((order.order.tokenGive.toLowerCase() === tokenA.toLowerCase() &&
    order.order.tokenGet.toLowerCase() === tokenB.toLowerCase())
    || (order.order.tokenGive.toLowerCase() === tokenB.toLowerCase() &&
    order.order.tokenGet.toLowerCase() === tokenA.toLowerCase())) &&
    Number(order.ethAvailableVolume).toFixed(3) >= this.minOrderSize &&
    Number(order.ethAvailableVolumeBase).toFixed(3) >= this.minOrderSize) {
      orders.push(order);
    }
  });
  if (n) {
    const topNOrders = [];
    const buys = [];
    const sells = [];
    orders.forEach((order) => {
      if (order.amount > 0 && order.order.tokenGive === tokenB &&
      order.order.tokenGet === tokenA) {
        buys.push(order);
      } else if (order.amount < 0 && order.order.tokenGive === tokenA &&
      order.order.tokenGet === tokenB) {
        sells.push(order);
      }
    });
    sells.sort((a, b) => a.price - b.price || a.id - b.id);
    buys.sort((a, b) => b.price - a.price || a.id - b.id);
    const limitPerAddr = 5;
    const addrsBuy = {};
    const addrsSell = {};
    const limitedBuys = [];
    const limitedSells = [];
    buys.forEach((x) => {
      if (!addrsBuy[x.order.user]) addrsBuy[x.order.user] = 0;
      addrsBuy[x.order.user] += 1;
      if (addrsBuy[x.order.user] <= limitPerAddr) limitedBuys.push(x);
    });
    sells.forEach((x) => {
      if (!addrsSell[x.order.user]) addrsSell[x.order.user] = 0;
      addrsSell[x.order.user] += 1;
      if (addrsSell[x.order.user] <= limitPerAddr) limitedSells.push(x);
    });
    limitedBuys.slice(0, n).forEach((order) => {
      topNOrders.push(order);
    });
    limitedSells.slice(0, n).forEach((order) => {
      topNOrders.push(order);
    });
    return topNOrders;
  }
  return orders;
};

API.getOrdersRemote = function getOrdersRemote(callback) {
  this.utility.getURL(`${this.config.apiServer}/orders`, (err, result) => {
    if (!err) {
      const data = JSON.parse(result);
      let orders;
      if (Array.isArray(data.orders)) {
        orders = data.orders;
      } else {
        orders = Object.values(data.orders);
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
            v: Number(x.order.v),
          }),
        });
      });
      callback(null, { orders, blockNumber: data.blockNumber });
    } else {
      callback(err, []);
    }
  });
};

API.blockTime = function blockTime(block) {
  return new Date(
    this.blockTimeSnapshot.date.getTime() +
      ((block - this.blockTimeSnapshot.blockNumber) * 1000 * 14));
};

API.getBlockNumber = function getBlockNumber(callback) {
  if (!this.blockTimeSnapshot || new Date() - this.blockTimeSnapshot.date > 14 * 1000) {
    this.utility.blockNumber(this.web3, (err, blockNumber) => {
      this.blockTimeSnapshot = { blockNumber, date: new Date() };
      callback(null, this.blockTimeSnapshot.blockNumber);
    });
  } else {
    callback(null, this.blockTimeSnapshot.blockNumber);
  }
};

API.getTrades = function getTrades(callback) {
  const trades = [];
  const events = Object.values(this.eventsCache);
  events.forEach((event) => {
    if (event.event === 'Trade' && this.contractEtherDeltaAddrs.indexOf(event.address) >= 0) {
      if (event.args.amountGive.toNumber() > 0 && event.args.amountGet.toNumber() > 0) {
        // don't show trades involving 0 amounts
        // sell
        trades.push({
          token: API.getToken(event.args.tokenGet),
          base: API.getToken(event.args.tokenGive),
          amount: event.args.amountGet,
          price: event.args.amountGive
            .div(event.args.amountGet)
            .mul(API.getDivisor(event.args.tokenGet))
            .div(API.getDivisor(event.args.tokenGive)),
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
          buyer: event.args.get,
          seller: event.args.give,
          txHash: event.transactionHash,
        });
        // buy
        trades.push({
          token: API.getToken(event.args.tokenGive),
          base: API.getToken(event.args.tokenGet),
          amount: event.args.amountGive,
          price: event.args.amountGet
            .div(event.args.amountGive)
            .mul(API.getDivisor(event.args.tokenGive))
            .div(API.getDivisor(event.args.tokenGet)),
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
          buyer: event.args.give,
          seller: event.args.get,
          txHash: event.transactionHash,
        });
      }
    }
  });
  trades.sort((a, b) => b.id - a.id);
  callback(null, { trades });
};

API.getFees = function getFees(callback) {
  const fees = [];
  const feeTake = new BigNumber(0.003);
  const feeMake = new BigNumber(0.000);
  const events = Object.values(this.eventsCache);
  events.forEach((event) => {
    if (event.event === 'Trade' && this.contractEtherDeltaAddrs.indexOf(event.address) >= 0) {
      if (event.args.amountGive.toNumber() > 0 && event.args.amountGet.toNumber() > 0) {
        // don't show trades involving 0 amounts
        // take fee
        fees.push({
          token: API.getToken(event.args.tokenGive),
          amount: event.args.amountGive.times(feeTake),
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
        });
        // make fee
        fees.push({
          token: API.getToken(event.args.tokenGet),
          amount: event.args.amountGet.times(feeMake),
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
        });
      }
    }
  });
  fees.sort((a, b) => b.id - a.id);
  callback(null, { fees });
};

API.getVolumes = function getVolumes(callback) {
  const volumes = [];
  const events = Object.values(this.eventsCache);
  events.forEach((event) => {
    if (event.event === 'Trade' && this.contractEtherDeltaAddrs.indexOf(event.address) >= 0) {
      if (event.args.amountGive.toNumber() > 0 && event.args.amountGet.toNumber() > 0) {
        // don't show trades involving 0 amounts
        volumes.push({
          token: API.getToken(event.args.tokenGive),
          amount: event.args.amountGive,
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
        });
        volumes.push({
          token: API.getToken(event.args.tokenGet),
          amount: event.args.amountGet,
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
        });
      }
    }
  });
  volumes.sort((a, b) => b.id - a.id);
  callback(null, { volumes });
};

API.getDepositsWithdrawals = function getDepositsWithdrawals(callback) {
  const depositsWithdrawals = [];
  const events = Object.values(this.eventsCache);
  events.forEach((event) => {
    if (event.event === 'Deposit' && this.contractEtherDeltaAddrs.indexOf(event.address >= 0)) {
      if (event.args.amount.toNumber() > 0) {
        const token = API.getToken(event.args.token);
        depositsWithdrawals.push({
          amount: event.args.amount,
          user: event.args.user,
          token,
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
        });
      }
    } else if (
      event.event === 'Withdraw' && this.contractEtherDeltaAddrs.indexOf(event.address) >= 0
    ) {
      if (event.args.amount.toNumber() > 0) {
        const token = API.getToken(event.args.token);
        depositsWithdrawals.push({
          amount: -event.args.amount,
          user: event.args.user,
          token,
          id: (event.blockNumber * 1000) + event.transactionIndex,
          blockNumber: event.blockNumber,
          date: new Date(this.utility.hexToDec(event.timeStamp) * 1000),
        });
      }
    }
  });
  depositsWithdrawals.sort((a, b) => b.id - a.id);
  callback(null, { depositsWithdrawals });
};

API.returnTicker = function returnTicker(callback) {
  const tickers = {};
  const firstOldPrices = {};
  const topOrders = API.getTopOrders();
  API.getTrades((err, result) => {
    const trades = result.trades;
    trades.sort((a, b) => a.blockNumber - b.blockNumber);
    trades.forEach((trade) => {
      if (trade.token && trade.base && trade.base.name === 'ETH') {
        const pair = `${trade.base.name}_${trade.token.name}`;
        const { token, base } = trade;
        if (!tickers[pair]) {
          let ordersFiltered = topOrders.filter(
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
            order => order.order.contractAddr === this.config.contractEtherDeltaAddrs[0].addr);
          // final order filtering and sorting
          const buyOrders = ordersFiltered.filter(x => x.amount > 0);
          const sellOrders = ordersFiltered.filter(x => x.amount < 0);
          sellOrders.sort((a, b) => b.price - a.price || b.id - a.id);
          buyOrders.sort((a, b) => b.price - a.price || a.id - b.id);
          const bid = buyOrders.length > 0 ? buyOrders[0].price : undefined;
          const ask = sellOrders.length > 0 ? sellOrders[sellOrders.length - 1].price : undefined;
          tickers[pair] = {
            last: undefined,
            percentChange: 0,
            baseVolume: 0,
            quoteVolume: 0,
            bid,
            ask,
          };
        }
        const tradeTime = trade.date;
        const price = Number(trade.price);
        tickers[pair].last = price;
        if (!tickers[pair].prices) tickers[pair].prices = [];
        if (Date.now() - tradeTime.getTime() < 86400 * 1000 * 1) { // 24 hours
          if (!firstOldPrices[pair]) firstOldPrices[pair] = price;
          const quoteVolume = Number(
            API.utility.weiToEth(Math.abs(trade.amount), API.getDivisor(trade.token)));
          const baseVolume = Number(
            API.utility.weiToEth(Math.abs(trade.amount * trade.price),
            API.getDivisor(trade.token)));
          if (Date.now() - tradeTime.getTime() < 60 * 60 * 1000) { // 1 hour
            tickers[pair].prices.push({ price, volume: quoteVolume });
          }
          tickers[pair].quoteVolume += quoteVolume;
          tickers[pair].baseVolume += baseVolume;
          tickers[pair].percentChange = (price - firstOldPrices[pair]) / firstOldPrices[pair];
        } else {
          firstOldPrices[pair] = price;
        }
      }
    });
    // 1 hour vwap
    Object.keys(tickers).forEach((pair) => {
      const volumeSum = tickers[pair].prices
        .map(x => x.volume)
        .reduce((a, b) => a + b, 0);
      if (volumeSum > 0) {
        tickers[pair].last = tickers[pair].prices
          .map(x => x.price * x.volume)
          .reduce((a, b) => a + b, 0) / volumeSum;
      }
      delete tickers[pair].prices;
      tickers[pair].percentChange =
        (tickers[pair].last - firstOldPrices[pair]) / firstOldPrices[pair];
    });
    callback(null, tickers);
  });
};

API.publishOrder = function publishOrder(
  addr,
  pk,
  baseAddr,
  tokenAddr,
  direction,
  amount,
  price,
  expires,
  orderNonce,
  callback) {
  let tokenGet;
  let tokenGive;
  let amountGet;
  let amountGive;
  if (direction === 'buy') {
    tokenGet = tokenAddr;
    tokenGive = baseAddr;
    amountGet = this.utility.ethToWei(amount, API.getDivisor(tokenGet));
    amountGive = this.utility.ethToWei(amount * price, API.getDivisor(tokenGive));
  } else if (direction === 'sell') {
    tokenGet = baseAddr;
    tokenGive = tokenAddr;
    amountGet = this.utility.ethToWei(amount * price, API.getDivisor(tokenGet));
    amountGive = this.utility.ethToWei(amount, API.getDivisor(tokenGive));
  } else {
    return;
  }
  this.utility.call(
    this.web3,
    this.contractEtherDelta,
    this.contractEtherDeltaAddrs[0],
    'balanceOf',
    [tokenGive, addr],
    (err, result) => {
      const balance = result;
      if (balance.lt(new BigNumber(amountGive))) {
        callback('You do not have enough funds to send this order.', false);
      } else if (!this.config.ordersOnchain) {
          // offchain order
        const condensed = this.utility.pack(
          [
            this.contractEtherDeltaAddrs[0],
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            orderNonce,
          ],
            [160, 160, 256, 160, 256, 256, 256]);
        const hash = sha256(new Buffer(condensed, 'hex'));
        this.utility.sign(this.web3, addr, hash, pk, (errSign, sig) => {
          if (errSign) {
            callback(`Could not sign order because of an error: ${err}`, false);
          } else {
              // Send order to Gitter channel:
            const order = {
              contractAddr: this.contractEtherDeltaAddrs[0],
              tokenGet,
              amountGet,
              tokenGive,
              amountGive,
              expires,
              nonce: orderNonce,
              v: sig.v,
              r: sig.r,
              s: sig.s,
              user: addr,
            };
            this.utility.postURL(
                `${this.config.apiServer}/message`,
                { message: JSON.stringify(order) },
                (errPost) => {
                  if (!errPost) {
                    callback(null, true);
                  } else {
                    callback(
                      'You tried sending an order to the order book but there was an error.',
                      false);
                  }
                });
          }
        });
      } else {
          // onchain order
        API.utility.send(
            this.web3,
            this.contractEtherDelta,
            this.contractEtherDeltaAddrs[0],
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
            addr,
            pk,
            this.nonce,
            (errSend, resultSend) => {
              // const txHash = resultSend.txHash;
              this.nonce = resultSend.nonce;
              callback(null, true);
            });
      }
    });
};

API.publishOrders = function publishOrders(
  orders,
  addr,
  pk,
  expires,
  token,
  base,
  armed,
  callback,
  callbackSentOneOrder) {
  API.utility.blockNumber(API.web3, (err, blockNumber) => {
    orders.sort((a, b) => b.price - a.price);
    async.eachSeries(
      orders,
      (order, callbackEach) => {
        const amount = this.utility.weiToEth(Math.abs(order.volume), API.getDivisor(token.addr));
        const orderNonce = this.utility.getRandomInt(0,
          Math.pow(2, 32)); // eslint-disable-line no-restricted-properties
        if (armed) {
          API.publishOrder(
            addr,
            pk,
            base.addr,
            token.addr,
            order.volume > 0 ? 'buy' : 'sell',
            amount,
            order.price,
            blockNumber + expires,
            orderNonce,
            (errPublish, resultPublish) => {
              if (!errPublish && resultPublish) {
                if (callbackSentOneOrder) {
                  const message =
                    `Sent order: ${
                    order.volume > 0 ? 'buy' : 'sell'
                    } ${
                    amount
                    } ${
                    token.name}/${base.name
                    } ` +
                    '@' +
                    ` ${
                    order.price}`;
                  callbackSentOneOrder(null, message);
                }
                console.log(
                  'Sent order:',
                  order.volume > 0 ? 'buy' : 'sell',
                  amount,
                  `${token.name}/${base.name}`,
                  '@',
                  order.price);
              } else {
                console.log('Error sending order:', err);
              }
              callbackEach(null);
            });
        } else {
          console.log(
            'Order (not armed):',
            order.volume > 0 ? 'buy' : 'sell',
            amount,
            `${token.name}/${base.name}`,
            '@',
            order.price);
          callbackEach(null);
        }
      },
      () => {
        callback(null, true);
      });
  });
};

API.formatOrder = function formatOrder(order, token, base) {
  if (order.amount >= 0) {
    return (
      `${this.utility.weiToEth(order.availableVolume, API.getDivisor(token.addr))
      } ${
      token.name
      } @ ${
      order.price.toNumber().toFixed(5)
      } ${
      token.name
      }/${
      base.name}`
    );
  }
  return (
      `${this.utility.weiToEth(order.availableVolume, API.getDivisor(token.addr))
      } ${
      token.name
      } @ ${
      order.price.toNumber().toFixed(5)
      } ${
      token.name
      }/${
      base.name}`
  );
};

API.clip = function clip(valueIn, minIn, maxIn) {
  let value = valueIn;
  let min = minIn;
  let max = maxIn;
  if (min > max) {
    const tmp = min;
    min = max;
    max = tmp;
  }
  if (min) value = Math.max(value, min);
  if (max) value = Math.min(value, max);
  return value;
};

API.clone = function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
};

API.generateImpliedPairs = function generateImpliedPairs(pairs) {
  let returnPairs = API.clone(pairs);
  function splitPair(pair) {
    const pairSplit = pair.split('/');
    if (pairSplit.length === 2) {
      const token = pairSplit[0];
      const base = pairSplit[1];
      return { token, base };
    }
    return undefined;
  }

  // split pairs
  let newPairs = [];
  returnPairs.forEach((pair) => {
    const split = splitPair(pair.pair);
    if (split) {
      Object.assign(pair, {
        token: split.token,
        base: split.base,
      });
      newPairs.push(pair);
    }
  });
  returnPairs = API.clone(newPairs);

  // set min and max price for Y and N
  newPairs = [];
  returnPairs.forEach((pair) => {
    const newPair = API.clone(pair);
    if (pair.token.slice(-1) === 'Y' && pair.base === 'ETH') {
      newPair.minPrice = 0;
      newPair.maxPrice = 1;
    } else if (pair.token.slice(-1) === 'N' && pair.base === 'ETH') {
      newPair.minPrice = 1;
      newPair.maxPrice = 0;
    }
    newPairs.push(newPair);
  });
  returnPairs = API.clone(newPairs);

  // generate N/ETH from Y/ETH and vice/versa
  newPairs = API.clone(returnPairs);
  returnPairs.forEach((pair) => {
    if (
      pair.token.slice(-1) === 'Y' &&
      pair.base === 'ETH' &&
      newPairs.filter(x => x.token === pair.token.replace(/Y$/, 'N')).length === 0
    ) {
      const newPair = API.clone(pair);
      newPair.token = pair.token.replace(/Y$/, 'N');
      newPair.pair = `${newPair.token}/${newPair.base}`;
      newPair.theo = 1 - pair.theo;
      newPairs.push(newPair);
    } else if (
      pair.token.slice(-1) === 'N' &&
      pair.base === 'ETH' &&
      newPairs.filter(x => x.token === pair.token.replace(/N$/, 'Y')).length === 0
    ) {
      const newPair = API.clone(pair);
      newPair.token = pair.token.replace(/N$/, 'Y');
      newPair.pair = `${newPair.token}/${newPair.base}`;
      newPair.theo = 1 - pair.theo;
      newPairs.push(newPair);
    }
  });
  returnPairs = API.clone(newPairs);

  // generate Y/N from Y/ETH and N/ETH
  newPairs = API.clone(returnPairs);
  returnPairs.forEach((pair1) => {
    returnPairs.forEach((pair2) => {
      if (pair1.base === pair2.base && pair1.token !== pair2.token) {
        const newPair = API.clone(pair1);
        newPair.token = pair1.token;
        newPair.base = pair2.token;
        newPair.pair = `${newPair.token}/${newPair.base}`;
        newPair.theo = pair1.theo / pair2.theo;
        if (pair1.minPrice === 0) {
          newPair.minPrice = 0;
        } else {
          try {
            newPair.minPrice = pair1.minPrice / pair2.maxPrice;
          } catch (err) {
            newPair.minPrice = null;
          }
        }
        if (pair1.maxPrice === 0) {
          newPair.maxPrice = 0;
        } else {
          try {
            newPair.maxPrice = pair1.maxPrice / pair2.minPrice;
          } catch (err) {
            newPair.maxPrice = undefined;
          }
        }
        newPair.minEdge = Math.max(pair1.minEdge, pair2.minEdge);
        newPair.edgeStep = Math.max(pair1.edgeStep, pair2.edgeStep);
        newPair.ordersPerSide = Math.min(pair1.ordersPerSide, pair2.ordersPerSide);
        newPair.expires = Math.min(pair1.expires, pair2.expires);
        newPairs.push(newPair);
      }
    });
  });
  returnPairs = API.clone(newPairs);

  // remove duplicates
  newPairs = [];
  returnPairs.forEach((pair) => {
    const newPair = API.clone(pair);
    if (
      newPairs.filter(x => (
          (x.token === newPair.token && x.base === newPair.base) ||
          (x.token === newPair.base && x.base === newPair.token)
        )).length === 0
    ) {
      newPairs.push(newPair);
    }
  });
  returnPairs = API.clone(newPairs);

  return returnPairs;
};

module.exports = API;
