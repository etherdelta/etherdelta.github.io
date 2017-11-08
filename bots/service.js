const io = require('socket.io-client');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');
const ABIEtherDelta = require('./contracts/etherdelta.json');
const ABIToken = require('./contracts/token.json');
const sha256 = require('js-sha256').sha256;
const ethUtil = require('ethereumjs-util');
const Tx = require('ethereumjs-tx');

function Service() {
  const self = this;

  self.init = config => new Promise((resolve, reject) => {
    self.config = config;
    self.web3 = new Web3(new Web3.providers.HttpProvider(config.provider));
    self.contractEtherDelta = self.web3.eth.contract(ABIEtherDelta).at(config.addressEtherDelta);
    self.contractToken = self.web3.eth.contract(ABIToken);
    self.state = {
      orders: undefined,
      trades: undefined,
      myOrders: undefined,
      myTrades: undefined,
    };

    self.socket = io.connect(self.config.socketURL, { transports: ['websocket'] });
    self.socket.on('connect', () => {
      console.log('socket connected');
      resolve();
    });

    self.socket.on('disconnect', () => {
      console.log('socket disconnected');
    });

    setTimeout(() => {
      reject('Could not connect to socket');
    }, 10000);
  });

  self.getMarket = (token, user) => {
    if (!token || !self.web3.isAddress(token.addr)) throw new Error('Please enter a valid token');
    if (!user || !self.web3.isAddress(user.addr)) throw new Error('Please enter a valid address');
    self.socket.emit('getMarket', { token: token.addr, user: user.addr });
  };

  self.waitForMarket = (token, user) => new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Could not get market');
    }, 20000);
    self.state = {
      orders: undefined,
      trades: undefined,
      myOrders: undefined,
      myTrades: undefined,
    };
    self.socket.off('orders');
    self.socket.off('trades');
    const getMarketAndWait = () => {
      self.getMarket(token, user);
      self.socket.once('market', (market) => {
        if ((market.myTrades || !user.addr) && (market.orders && market.trades)) {
          self.updateOrders(market.orders, token, user);
          self.updateTrades(market.trades, token, user);
          self.socket.on('orders', (orders) => {
            self.updateOrders(orders, token, user);
          });
          self.socket.on('trades', (trades) => {
            self.updateTrades(trades, token, user);
          });
          resolve();
        } else {
          setTimeout(() => {
            getMarketAndWait();
          }, 2000);
        }
      });
    };
    getMarketAndWait();
  });

  self.updateOrders = (newOrders, token, user) => {
    const minOrderSize = 0.001;
    const newOrdersTransformed = {
      buys: newOrders.buys
        .filter(x => x.tokenGet.toLowerCase() === token.addr.toLowerCase())
        .map(x =>
        Object.assign({}, {
          id: x.id,
          date: new Date(x.updated),
          price: new BigNumber(x.price),
          amountGet: new BigNumber(x.amountGet),
          amountGive: new BigNumber(x.amountGive),
          deleted: x.deleted,
          expires: Number(x.expires),
          nonce: Number(x.nonce),
          tokenGet: x.tokenGet,
          tokenGive: x.tokenGive,
          user: x.user,
          r: x.r,
          s: x.s,
          v: x.v ? Number(x.v) : undefined,
          amount: self.toEth(x.amountGet, token.decimals).toNumber(),
          amountBase: self.toEth(x.amountGive, 18).toNumber(),
          availableVolume: Number(x.availableVolume),
          ethAvailableVolume: Number(x.ethAvailableVolume),
          availableVolumeBase: Number(x.availableVolumeBase),
          ethAvailableVolumeBase: Number(x.ethAvailableVolumeBase),
        })),
      sells: newOrders.sells
      .filter(x => x.tokenGive.toLowerCase() === token.addr.toLowerCase())
      .map(x =>
        Object.assign({}, {
          id: x.id,
          date: new Date(x.updated),
          price: new BigNumber(x.price),
          amountGet: new BigNumber(x.amountGet),
          amountGive: new BigNumber(x.amountGive),
          deleted: x.deleted,
          expires: Number(x.expires),
          nonce: Number(x.nonce),
          tokenGet: x.tokenGet,
          tokenGive: x.tokenGive,
          user: x.user,
          r: x.r,
          s: x.s,
          v: x.v ? Number(x.v) : undefined,
          amount: self.toEth(x.amountGive, token.decimals).toNumber(),
          amountBase: self.toEth(x.amountGet, 18).toNumber(),
          availableVolume: Number(x.availableVolume),
          ethAvailableVolume: Number(x.ethAvailableVolume),
          availableVolumeBase: Number(x.availableVolumeBase),
          ethAvailableVolumeBase: Number(x.ethAvailableVolumeBase),
        })),
    };
    if (!self.state.orders) self.state.orders = { buys: [], sells: [] };
    if (!self.state.myOrders) self.state.myOrders = { buys: [], sells: [] };
    newOrdersTransformed.buys.forEach((x) => {
      if (x.deleted || x.ethAvailableVolumeBase <= minOrderSize) {
        self.state.orders.buys = self.state.orders.buys.filter(y => y.id !== x.id);
        if (x.user.toLowerCase() === user.addr.toLowerCase()) {
          self.state.myOrders.buys = self.state.myOrders.buys.filter(y => y.id !== x.id);
        }
      } else if (self.state.orders.buys.find(y => y.id === x.id)) {
        self.state.orders.buys = self.state.orders.buys.map(y => (y.id === x.id ? x : y));
        if (x.user.toLowerCase() === user.addr.toLowerCase()) {
          self.state.myOrders.buys = self.state.myOrders.buys.map(y => (y.id === x.id ? x : y));
        }
      } else {
        self.state.orders.buys.push(x);
        if (x.user.toLowerCase() === user.addr.toLowerCase()) {
          self.state.myOrders.buys.push(x);
        }
      }
    });
    newOrdersTransformed.sells.forEach((x) => {
      if (x.deleted || x.ethAvailableVolumeBase <= minOrderSize) {
        self.state.orders.sells = self.state.orders.sells.filter(y => y.id !== x.id);
        if (x.user.toLowerCase() === user.addr.toLowerCase()) {
          self.state.myOrders.sells = self.state.myOrders.sells.filter(y => y.id !== x.id);
        }
      } else if (self.state.orders.sells.find(y => y.id === x.id)) {
        self.state.orders.sells = self.state.orders.sells.map(y => (y.id === x.id ? x : y));
        if (x.user.toLowerCase() === user.addr.toLowerCase()) {
          self.state.myOrders.sells = self.state.myOrders.sells.map(y => (y.id === x.id ? x : y));
        }
      } else {
        self.state.orders.sells.push(x);
        if (x.user.toLowerCase() === user.addr.toLowerCase()) {
          self.state.myOrders.sells.push(x);
        }
      }
    });
    self.state.orders = {
      sells: self.state.orders.sells.sort((a, b) =>
        a.price - b.price || a.amountGet - b.amountGet),
      buys: self.state.orders.buys.sort((a, b) =>
        b.price - a.price || b.amountGet - a.amountGet),
    };
    self.state.myOrders = {
      sells: self.state.myOrders.sells.sort((a, b) =>
        a.price - b.price || a.amountGet - b.amountGet),
      buys: self.state.myOrders.buys.sort((a, b) =>
        b.price - a.price || b.amountGet - a.amountGet),
    };
  };

  self.updateTrades = (newTrades, token, user) => {
    const newTradesTransformed = newTrades
    .filter(x => !x.tokenAddr || x.tokenAddr.toLowerCase() === token.addr.toLowerCase())
    .map(x =>
      Object.assign(x, {
        txHash: x.txHash,
        tokenAddr: x.tokenAddr,
        side: x.side,
        date: new Date(x.date),
        amount: Number(x.amount),
        amountBase: Number(x.amountBase),
        price: Number(x.price),
        buyer: x.buyer,
        seller: x.seller,
      }));
    if (!self.state.trades) self.state.trades = [];
    if (!self.state.myTrades) self.state.myTrades = [];
    newTradesTransformed.forEach((x) => {
      if (!self.state.trades.find(y => y.txHash === x.txHash)) {
        self.state.trades.push(x);
        if (x.buyer.toLowerCase() === user.addr.toLowerCase() ||
          x.seller.toLowerCase() === user.addr.toLowerCase()) {
          self.state.myTrades.push(x);
        }
      }
    });
    self.state.trades = self.state.trades
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.amount - a.amount);
    self.state.myTrades = self.state.myTrades
      .sort((a, b) => new Date(b.date) - new Date(a.date) || b.amount - a.amount);
  };

  self.printOrderBook = () => {
    console.log('Order book');
    const ordersPerSide = 10;
    const sells = self.state.orders.sells.slice(0, ordersPerSide).reverse();
    const buys = self.state.orders.buys.slice(0, ordersPerSide);
    sells.forEach((order) => {
      console.log(`${order.price.toFixed(9)} ${order.ethAvailableVolume.toFixed(3)}`);
    });
    if (buys.length > 0 && sells.length > 0) {
      console.log(`---- Spread (${(sells[sells.length - 1].price - buys[0].price).toFixed(9)}) ----`);
    } else {
      console.log('--------');
    }
    buys.forEach((order) => {
      console.log(`${order.price.toFixed(9)} ${order.ethAvailableVolume.toFixed(3)}`);
    });
  };

  self.printTrades = () => {
    console.log('Recent trades');
    const numTrades = 10;
    self.state.trades.slice(0, numTrades).forEach((trade) => {
      console.log(`${trade.date} ${trade.side} ${Math.abs(trade.amount).toFixed(3)} @ ${trade.price.toFixed(9)}`);
    });
  };

  self.getEtherDeltaBalance = (token, user) => new Promise((resolve, reject) => {
    self.contractEtherDelta.balanceOf(token === 'ETH' ? '0x0000000000000000000000000000000000000000' : token.addr, user.addr, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  self.getBalance = (token, user) => new Promise((resolve, reject) => {
    if (token === 'ETH') {
      self.web3.eth.getBalance(user.addr, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    } else {
      self.contractToken.at(token.addr).balanceOf(user.addr, (err, result) => {
        if (err) reject(err);
        resolve(result);
      });
    }
  });

  self.getBlockNumber = () => new Promise((resolve, reject) => {
    self.web3.eth.getBlockNumber((err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  self.getNextNonce = user => new Promise((resolve, reject) => {
    self.web3.eth.getTransactionCount(user.addr, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });

  self.takeOrder = (user, order, fraction) => new Promise((resolve, reject) => {
    self.getNextNonce(user)
    .then((nonce) => {
      const amount = order.amountGet.times(new BigNumber(String(fraction)));
      self.contractEtherDelta.testTrade.call(
        order.tokenGet,
        order.amountGet,
        order.tokenGive,
        order.amountGive,
        order.expires,
        order.nonce,
        order.user,
        order.v,
        order.r,
        order.s,
        amount,
        user.addr,
        (errTest, resultTest) => {
          if (errTest || !resultTest) reject('Order will fail');
          const data = self.contractEtherDelta.trade.getData(
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            order.expires,
            order.nonce,
            order.user,
            order.v,
            order.r,
            order.s,
            amount);
          const options = {
            gasPrice: self.config.gasPrice,
            gasLimit: self.config.gasLimit,
            nonce,
            data,
            to: self.config.addressEtherDelta,
          };
          const tx = new Tx(options);
          tx.sign(new Buffer(user.pk, 'hex'));
          const rawTx = `0x${tx.serialize().toString('hex')}`;
          self.web3.eth.sendRawTransaction(rawTx, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
    })
    .catch((err) => {
      reject(err);
    });
  });

  self.placeOrder = order => new Promise((resolve, reject) => {
    self.socket.emit('message', order);
    self.socket.once('messageResult', (messageResult) => {
      if (!messageResult) reject();
      resolve(messageResult);
    });
  });

  self.createOrder = (side, expires, price, amount, token, user) => {
    const zeroPad = (num, places) => {
      const zero = (places - num.toString().length) + 1;
      return Array(+(zero > 0 && zero)).join('0') + num;
    };

    const parseToDigitsArray = (str, base) => {
      const digits = str.split('');
      const ary = [];
      for (let i = digits.length - 1; i >= 0; i -= 1) {
        const n = parseInt(digits[i], base);
        if (isNaN(n)) return null;
        ary.push(n);
      }
      return ary;
    };

    const add = (x, y, base) => {
      const z = [];
      const n = Math.max(x.length, y.length);
      let carry = 0;
      let i = 0;
      while (i < n || carry) {
        const xi = i < x.length ? x[i] : 0;
        const yi = i < y.length ? y[i] : 0;
        const zi = carry + xi + yi;
        z.push(zi % base);
        carry = Math.floor(zi / base);
        i += 1;
      }
      return z;
    };

    const multiplyByNumber = (numIn, x, base) => {
      let num = numIn;
      if (num < 0) return null;
      if (num === 0) return [];
      let result = [];
      let power = x;
      while (true) { // eslint-disable-line no-constant-condition
        if (num & 1) { // eslint-disable-line no-bitwise
          result = add(result, power, base);
        }
        num = num >> 1; // eslint-disable-line operator-assignment, no-bitwise
        if (num === 0) break;
        power = add(power, power, base);
      }
      return result;
    };

    const convertBase = (str, fromBase, toBase) => {
      const digits = parseToDigitsArray(str, fromBase);
      if (digits === null) return null;
      let outArray = [];
      let power = [1];
      for (let i = 0; i < digits.length; i += 1) {
        if (digits[i]) {
          outArray = add(outArray,
            multiplyByNumber(digits[i], power, toBase), toBase);
        }
        power = multiplyByNumber(fromBase, power, toBase);
      }
      let out = '';
      for (let i = outArray.length - 1; i >= 0; i -= 1) {
        out += outArray[i].toString(toBase);
      }
      if (out === '') out = 0;
      return out;
    };

    const decToHex = (dec, lengthIn) => {
      let length = lengthIn;
      if (!length) length = 32;
      if (dec < 0) {
        // return convertBase((Math.pow(2, length) + decStr).toString(), 10, 16);
        return (new BigNumber(2)).pow(length).add(new BigNumber(dec)).toString(16);
      }
      let result = null;
      try {
        result = convertBase(dec.toString(), 10, 16);
      } catch (err) {
        result = null;
      }
      if (result) {
        return result;
      }
      return (new BigNumber(dec)).toString(16);
    };

    const pack = (dataIn, lengths) => {
      let packed = '';
      const data = dataIn.map(x => x);
      for (let i = 0; i < lengths.length; i += 1) {
        if (typeof (data[i]) === 'string' && data[i].substring(0, 2) === '0x') {
          if (data[i].substring(0, 2) === '0x') data[i] = data[i].substring(2);
          packed += zeroPad(data[i], lengths[i] / 4);
        } else if (typeof (data[i]) !== 'number' && !(data[i] instanceof BigNumber) && /[a-f]/.test(data[i])) {
          if (data[i].substring(0, 2) === '0x') data[i] = data[i].substring(2);
          packed += zeroPad(data[i], lengths[i] / 4);
        } else {
          // packed += zeroPad(new BigNumber(data[i]).toString(16), lengths[i]/4);
          packed += zeroPad(decToHex(data[i], lengths[i]), lengths[i] / 4);
        }
      }
      return packed;
    };

    const sign = (msgToSignIn, privateKeyIn) => {
      const prefixMessage = (msgIn) => {
        let msg = msgIn;
        msg = new Buffer(msg.slice(2), 'hex');
        msg = Buffer.concat([
          new Buffer(`\x19Ethereum Signed Message:\n${msg.length.toString()}`),
          msg]);
        msg = self.web3.sha3(`0x${msg.toString('hex')}`, { encoding: 'hex' });
        msg = new Buffer(msg.slice(2), 'hex');
        return `0x${msg.toString('hex')}`;
      };
      const privateKey = privateKeyIn.substring(0, 2) === '0x' ?
        privateKeyIn.substring(2, privateKeyIn.length) : privateKeyIn;
      const msgToSign = prefixMessage(msgToSignIn);
      try {
        const sig = ethUtil.ecsign(
          new Buffer(msgToSign.slice(2), 'hex'),
          new Buffer(privateKey, 'hex'));
        const r = `0x${sig.r.toString('hex')}`;
        const s = `0x${sig.s.toString('hex')}`;
        const v = sig.v;
        const result = { r, s, v, msg: msgToSign };
        return result;
      } catch (err) {
        throw new Error(err);
      }
    };
    if (side !== 'buy' && side !== 'sell') throw new Error('Side must be buy or sell');
    const amountBigNum = new BigNumber(String(amount));
    const amountBaseBigNum = new BigNumber(String(amount * price));
    const contractAddr = self.config.addressEtherDelta;
    const tokenGet = side === 'buy' ? token.addr : '0x0000000000000000000000000000000000000000';
    const tokenGive = side === 'sell' ? token.addr : '0x0000000000000000000000000000000000000000';
    const amountGet = side === 'buy' ?
      self.toWei(amountBigNum, token.decimals) :
      self.toWei(amountBaseBigNum, 18);
    const amountGive = side === 'sell' ?
      self.toWei(amountBigNum, token.decimals) :
      self.toWei(amountBaseBigNum, 18);
    const orderNonce = Number(Math.random().toString().slice(2));

    const unpacked = [
      contractAddr,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      expires,
      orderNonce,
    ];

    const condensed = pack(
      unpacked,
      [160, 160, 256, 160, 256, 256, 256]);
    const hash = `0x${sha256(new Buffer(condensed, 'hex'))}`;
    const sig = sign(hash, user.pk);

    const orderObject = {
      amountGet,
      amountGive,
      tokenGet,
      tokenGive,
      contractAddr,
      expires,
      nonce: orderNonce,
      user: user.addr,
      v: sig.v,
      r: sig.r,
      s: sig.s,
    };

    return orderObject;
  };

  self.toEth = (wei, decimals) => new BigNumber(String(wei))
    .div(new BigNumber(10 ** decimals));
  self.toWei = (eth, decimals) => new BigNumber(String(eth))
    .times(new BigNumber(10 ** decimals)).floor();
}

module.exports = Service;
