var config = require('./config.js');
var utility = require('./common/utility.js');
var Web3 = require('web3');
var request = require('request');
var async = require('async');
var BigNumber = require('bignumber.js');
var sha256 = require('js-sha256').sha256;

function API(){
}

API.init = function(callback, allContracts, path) {
  var self = this;

  //self.config, utility
  self.config = config;
  self.utility = utility;

  //path
  if (path) {
    self.config.contractEtherDelta = path + self.config.contractEtherDelta;
    self.config.contractToken= path + self.config.contractToken;
  }

  //web3
  self.web3 = new Web3();
  self.web3.eth.defaultAccount = self.config.ethAddr;
  self.web3.setProvider(new self.web3.providers.HttpProvider(self.config.ethProvider));

  //check mainnet vs testnet
  self.web3.version.getNetwork(function(error, version){
    if (version in configs) self.config = configs[version];
    try {
      if (self.web3.currentProvider) {
        self.web3.eth.coinbase;
      }
    } catch(err) {
      self.web3.setProvider(undefined);
    }

    //contracts
    self.contractEtherDelta;
    self.contractEtherDeltaAddrs = [self.config.contractEtherDeltaAddrs[0].addr];
    if (allContracts) self.contractEtherDeltaAddrs = self.config.contractEtherDeltaAddrs.map(function(x){return x.addr});
    self.contractToken;

    //other variables
    self.gitterMessagesCache = {};
    self.eventsCache = {};
    self.deadOrders = {};
    self.blockTimeSnapshot = undefined;

    async.series(
      [
        function(callback){
          utility.loadContract(self.web3, self.config.contractEtherDelta, self.contractEtherDeltaAddrs[0], function(err, contract){
            self.contractEtherDelta = contract;
            callback(null, true);
          });
        },
        function(callback){
          utility.loadContract(self.web3, self.config.contractToken, self.config.ethAddr, function(err, contract){
            self.contractToken = contract;
            callback(null, true);
          });
        },
        function(callback){
          utility.readFile('storage_gitterMessagesCache', function(err, result){
            if (!err) {
              try {
                self.gitterMessagesCache = JSON.parse(result);
              } catch (err) {
                self.gitterMessagesCache = {};
              }
            }
            callback(null, true);
          });
        },
        function(callback){
          utility.readFile('storage_eventsCache', function(err, result){
            if (!err) {
              try {
                self.eventsCache = JSON.parse(result);
              } catch (err) {
                self.eventsCache = {};
              }
            }
            callback(null, true);
          });
        },
        function(callback){
          utility.readFile('storage_deadOrders', function(err, result){
            if (!err) {
              try {
                self.deadOrders = JSON.parse(result);
              } catch(err) {
                self.deadOrders = {};
              }
            }
            callback(null, true);
          });
        },
        function(callback) {
          utility.blockNumber(self.web3, function(err, blockNumber) {
            self.blockTimeSnapshot = {blockNumber: blockNumber, date: new Date()};
            callback(null, true);
          });
        },
        function(callback) {
          API.logs(function(err, numLogs) {
            callback(null, true);
          });
        }
      ],
      function(err, results){
        callback(null, {contractEtherDelta: self.contractEtherDelta, contractToken: self.contractToken});
      }
    );
  });
}

API.logs = function(callback) {
  var self = this;
  utility.blockNumber(self.web3, function(err, blockNumber) {
    var startBlock = 0;
    for (id in self.eventsCache) {
      var event = self.eventsCache[id];
      if (event.blockNumber>startBlock && self.contractEtherDeltaAddrs.indexOf(event.address)>=0) {
        startBlock = event.blockNumber;
      }
      for (arg in event.args) {
        if (typeof(event.args[arg])=='string' && event.args[arg].slice(0,2)!='0x') {
          event.args[arg] = new BigNumber(event.args[arg]);
        }
      }
    }
    async.map(self.contractEtherDeltaAddrs,
      function(contractEtherDeltaAddr, callbackMap) {
        utility.logsOnce(self.web3, self.contractEtherDelta, contractEtherDeltaAddr, startBlock, 'latest', function(err, events) {
          var newEvents = 0;
          events.forEach(function(event){
            if (!self.eventsCache[event.transactionHash+event.logIndex]) {
              newEvents++;
              event.txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
              self.eventsCache[event.transactionHash+event.logIndex] = event;
            }
          })
          callbackMap(null, newEvents);
        });
      },
      function(err, result) {
        var newEvents = result.reduce(function(a,b){return a+b},0);
        utility.writeFile('storage_eventsCache', JSON.stringify(self.eventsCache), function(err, result){});
        callback(null, newEvents);
      }
    );
  });
}

API.getPrices = function(callback) {
  var self = this;
  var ethBTC = undefined;
  var btcUSD = undefined;
  request.get('https://poloniex.com/public?command=returnTicker', function(err, httpResponse, body) {
    ethBTC = JSON.parse(body).BTC_ETH.last;
    request.get('http://api.coindesk.com/v1/bpi/currentprice/USD.json', function(err, httpResponse, body) {
      btcUSD = JSON.parse(body).bpi.USD.rate;
      var price = ethBTC * btcUSD;
      callback(null, {"ETHBTC": ethBTC, "BTCUSD": btcUSD, "ETHUSD": price});
    });
  });
}

API.getBalance = function(addr, callback) {
  var self = this;
  utility.getBalance(this.web3, addr, function(err, balance){
    if (!err) {
      callback(null, balance);
    } else {
      callback(null, 0);
    }
  })
}

API.getEtherDeltaBalance = function(addr, callback) {
  var self = this;
  var token = '0x0000000000000000000000000000000000000000'; //ether token
  utility.call(self.web3, self.contractEtherDelta, self.contractEtherDeltaAddrs[0], 'balanceOf', [token, addr], function(err, result) {
    if (!err) {
      callback(null, result.toNumber());
    } else {
      callback(null, 0);
    }
  });
}

API.getEtherDeltaTokenBalances = function(addr, callback){
  var self = this;
  async.reduce(self.config.tokens, {},
    function(memo, token, callbackReduce){
      utility.call(self.web3, self.contractEtherDelta, self.contractEtherDeltaAddrs[0], 'balanceOf', [token.addr, addr], function(err, result) {
        if (!err) {
          memo[token.name] = result.toNumber();
          callbackReduce(null, memo);
        } else {
          callbackReduce(null, memo);
        }
      });
    },
    function(err, tokenBalances) {
      callback(null, tokenBalances);
    }
  );
}

API.getTokenBalances = function(addr, callback){
  var self = this;
  async.reduce(self.config.tokens, {},
    function(memo, token, callbackReduce){
      if (token.addr=='0x0000000000000000000000000000000000000000') {
        API.getBalance(addr, function(err, result){
          memo[token.name] = result;
          callbackReduce(null, memo);
        });
      } else {
        utility.call(self.web3, self.contractToken, token.addr, 'balanceOf', [addr], function(err, result) {
          if (!err) {
            memo[token.name] = result.toNumber();
            callbackReduce(null, memo);
          } else {
            callbackReduce(null, memo);
          }
        });
      }
    },
    function(err, tokenBalances) {
      callback(null, tokenBalances);
    }
  );
}

API.getUSDBalance = function(addr, tokenPrices, callback) {
  var self = this;
  API.getPrices(function(err, prices){
    async.parallel(
      [
        function(callback){
          API.getTokenBalances(addr, callback);
        },
        function(callback){
          API.getEtherDeltaTokenBalances(addr, callback);
        }
      ],
      function(err, results){
        var balances = {'Tokens': results[0], 'EtherDelta Tokens': results[1]};
        var total = 0;
        for (var dapp in balances) {
          var balance = balances[dapp];
          if (typeof(balance)=='object' && typeof(balance['ETH'])!=undefined) {
            var totalBalance = 0;
            var ethToken = self.config.tokens[0];
            Object.keys(balance).forEach(function(name) {
              var tokenBalance = balance[name];
              var token = API.getToken(name);
              var price = 0;
              var tokenMatches = tokenPrices.filter(function(x){return x.name==token.name});
              if (tokenMatches.length==1) {
                price = tokenMatches[0].price;
              } else {
                if (token.name.slice(-1)=='N') {
                  var yesVersion = token.name.replace(/N$/, 'Y');
                  var tokenYesMatches = tokenPrices.filter(function(x){return x.name==yesVersion});
                  if (tokenYesMatches.length==1) {
                    price = 1.0 - tokenYesMatches[0].price;
                  }
                }
              }
              totalBalance += tokenBalance * price * Math.pow(10,ethToken.decimals) / Math.pow(10,token.decimals);
            });
            balances[dapp] = Number(utility.weiToEth(totalBalance));
          } else {
            balances[dapp] = Number(utility.weiToEth(balance));
          }
          total += balances[dapp];
        }
        var ethValue = total;
        var usdValue = total*prices.ETHUSD;
        var result = {ethValue: ethValue, usdValue: usdValue, balances: balances, prices: prices};
        callback(null, result);
      }
    );
  });
}

API.getDivisor = function(tokenOrAddress) {
  var self = this;
  var result = 1000000000000000000;
  var token = API.getToken(tokenOrAddress);
  if (token && token.decimals) {
    result = Math.pow(10,token.decimals);
  }
  return new BigNumber(result);
}

API.getToken = function(addrOrToken, name, decimals) {
  var self = this;
  var result = undefined;
  var matchingTokens = self.config.tokens.filter(function(x){return x.addr==addrOrToken || x.name==addrOrToken});
  var expectedKeys = JSON.stringify(['addr','decimals','gasApprove','gasDeposit','gasTrade','gasWithdraw','name']);
  if (matchingTokens.length>0) {
    result = matchingTokens[0];
  } else if (addrOrToken.addr && JSON.stringify(Object.keys(addrOrToken).sort())==expectedKeys) {
    result = addrOrToken;
  } else if (addrOrToken.slice(0,2)=='0x' && name!='' && decimals>=0) {
    result = JSON.parse(JSON.stringify(self.config.tokens[0]));
    result.addr = addrOrToken;
    result.name = name;
    result.decimals = decimals;
  }
  return result;
}

API.getGitterMessages = function(callback) {
  var self = this;
  utility.getGitterMessages(self.gitterMessagesCache, function(err, result){
    self.gitterMessagesCache = result.gitterMessages;
    var newMessagesFound = result.newMessagesFound;
    utility.writeFile('storage_gitterMessagesCache', JSON.stringify(self.gitterMessagesCache), function(err, result){});
    callback(null, newMessagesFound);
  });
}

API.getOrderBook = function(callback) {
  var self = this;
  API.getGitterMessages(function(err, newMessagesFound){
    utility.blockNumber(self.web3, function(err, blockNumber) {
      var orders = [];
      //get orders from gitter messages
      var expectedKeys = JSON.stringify(['amountGet','amountGive','expires','nonce','r','s','tokenGet','tokenGive','user','v']);
      Object.keys(self.gitterMessagesCache).forEach(function(id) {
        var message = JSON.parse(JSON.stringify(self.gitterMessagesCache[id]));
        for (key in message) {
          if (typeof(message[key])=='number') message[key] = new BigNumber(message[key]);
        }
        if (typeof(message)=='object' && JSON.stringify(Object.keys(message).sort())==expectedKeys) {
          var order = undefined;
          //buy
          order = {amount: message.amountGet, price: message.amountGive.div(message.amountGet).mul(API.getDivisor(message.tokenGet)).div(API.getDivisor(message.tokenGive)), id: id, order: message};
          if (order && !self.deadOrders[order.id]) orders.push(order);
          order = undefined;
          //sell
          order = {amount: -message.amountGive, price: message.amountGet.div(message.amountGive).mul(API.getDivisor(message.tokenGive)).div(API.getDivisor(message.tokenGet)), id: id, order: message};
          if (order && !self.deadOrders[order.id]) orders.push(order);
        }
      });
      //get orders from events
      var events = Object.values(self.eventsCache);
      events.forEach(function(event){
        if (event.event=='Order' && event.address==self.contractEtherDeltaAddrs[0]) {
          var order = undefined;
          //buy
          order = {amount: event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet).mul(API.getDivisor(event.args.tokenGet)).div(API.getDivisor(event.args.tokenGive)), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
          if (order && !self.deadOrders[order.id]) orders.push(order);
          order = undefined;
          //sell
          order = {amount: -event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive).mul(API.getDivisor(event.args.tokenGive)).div(API.getDivisor(event.args.tokenGet)), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
          if (order && !self.deadOrders[order.id]) orders.push(order);
        }
      });
      //get available volumes
      async.reduce(orders, [],
        function(memo, order, callbackReduce) {
          if (blockNumber<Number(order.order.expires)) {
            utility.call(self.web3, self.contractEtherDelta, self.contractEtherDeltaAddrs[0], 'availableVolume', [order.order.tokenGet, Number(order.order.amountGet), order.order.tokenGive, Number(order.order.amountGive), Number(order.order.expires), Number(order.order.nonce), order.order.user, Number(order.order.v), order.order.r, order.order.s], function(err, result) {
              if (!err) {
                var ethAvailableVolume = 0;
                if (order.amount>=0) {
                  order.availableVolume = result;
                  ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), API.getDivisor(order.order.tokenGet));
                } else {
                  order.availableVolume = result.div(order.price).mul(API.getDivisor(order.order.tokenGive)).div(API.getDivisor(order.order.tokenGet));
                  ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), API.getDivisor(order.order.tokenGive));
                }
                if (Number(ethAvailableVolume).toFixed(3)>=0.001) { //min order size is 0.001
                  memo.push(order);
                //an order isn't truly dead until it expires, because the volume might be unavailable due to funds needing to be deposited
                // } else {
                //   self.deadOrders[order.id] = true;
                }
                callbackReduce(null, memo);
              } else {
                callbackReduce(null, memo);
              }
            });
          } else {
            self.deadOrders[order.id] = true;
            callbackReduce(null, memo);
          }
        },
        function(err, ordersReduced){
          //store dead orders
          utility.writeFile('storage_deadOrders', JSON.stringify(self.deadOrders), function(err, result){});
          //final order filtering and sorting
          var buyOrders = ordersReduced.filter(function(x){return x.amount>0});
          var sellOrders = ordersReduced.filter(function(x){return x.amount<0});
          buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
          sellOrders.sort(function(a,b){ return a.price - b.price || a.id - b.id });
          callback(null, {buyOrders: buyOrders, sellOrders: sellOrders});
        }
      );
    });
  });
}

API.blockTime = function(block) {
  var self = this;
  return new Date(self.blockTimeSnapshot.date.getTime()+((block - self.blockTimeSnapshot.blockNumber)*1000*14));
}

API.getTrades = function(callback) {
  var self = this;
  var trades = [];
  var events = Object.values(self.eventsCache);
  events.forEach(function(event){
    if (event.event=='Trade' && self.contractEtherDeltaAddrs.indexOf(event.address)>=0) {
      if (event.args.amountGive.toNumber()>0 && event.args.amountGet.toNumber()>0) { //don't show trades involving 0 amounts
        //sell
        trades.push({token: API.getToken(event.args.tokenGet), base: API.getToken(event.args.tokenGive), amount: -event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet).mul(API.getDivisor(event.args.tokenGet)).div(API.getDivisor(event.args.tokenGive)), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.get, seller: event.args.give});
        //buy
        trades.push({token: API.getToken(event.args.tokenGive), base: API.getToken(event.args.tokenGet), amount: event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive).mul(API.getDivisor(event.args.tokenGive)).div(API.getDivisor(event.args.tokenGet)), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.give, seller: event.args.get});
      }
    }
  });
  trades.sort(function(a,b){ return b.id - a.id });
  callback(null, {trades: trades});
}

API.getVolumes = function(callback) {
  var self = this;
  var volumes = [];
  var events = Object.values(self.eventsCache);
  events.forEach(function(event){
    if (event.event=='Trade' && self.contractEtherDeltaAddrs.indexOf(event.address)>=0) {
      if (event.args.amountGive.toNumber()>0 && event.args.amountGet.toNumber()>0) { //don't show trades involving 0 amounts
        volumes.push({token: API.getToken(event.args.tokenGive), amount: event.args.amountGive, id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber});
        volumes.push({token: API.getToken(event.args.tokenGet), amount: event.args.amountGet, id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber});
      }
    }
  });
  volumes.sort(function(a,b){ return b.id - a.id });
  callback(null, {volumes: volumes});
}

API.getDepositsWithdrawals = function(callback) {
  var self = this;
  var depositsWithdrawals = [];
  var events = Object.values(self.eventsCache);
  events.forEach(function(event){
    if (event.event=='Deposit' && self.contractEtherDeltaAddrs.indexOf(event.address>=0)) {
      if (event.args.amount.toNumber()>0) {
        var token = API.getToken(event.args.token);
        depositsWithdrawals.push({amount: event.args.amount, user: event.args.user, token: token, id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber});
      }
    } else if (event.event=='Withdraw' && self.contractEtherDeltaAddrs.indexOf(event.address)>=0) {
      if (event.args.amount.toNumber()>0) {
        var token = API.getToken(event.args.token);
        depositsWithdrawals.push({amount: -event.args.amount, user: event.args.user, token: token, id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber});
      }
    }
  });
  depositsWithdrawals.sort(function(a,b){ return b.id - a.id });
  callback(null, {depositsWithdrawals: depositsWithdrawals});
}

API.publishOrder = function(addr, baseAddr, tokenAddr, direction, amount, price, expires, orderNonce, callback) {
  var self = this;
  var tokenGet = undefined;
  var tokenGive = undefined;
  var amountGet = undefined;
  var amountGive = undefined;
  if (direction=='buy') {
    tokenGet = tokenAddr;
    tokenGive = baseAddr;
    amountGet = utility.ethToWei(amount, API.getDivisor(tokenGet));
    amountGive = utility.ethToWei(amount * price, API.getDivisor(tokenGive));
  } else if (direction=='sell') {
    tokenGet = baseAddr;
    tokenGive = tokenAddr;
    amountGet = utility.ethToWei(amount * price, API.getDivisor(tokenGet));
    amountGive = utility.ethToWei(amount, API.getDivisor(tokenGive));
  } else {
    return;
  }
  utility.call(self.web3, self.contractEtherDelta, self.contractEtherDeltaAddrs[0], 'balanceOf', [tokenGive, addr], function(err, result) {
    var balance = result;
    if (balance.lt(new BigNumber(amountGive))) {
      callback('You do not have enough funds to send this order.', false);
    } else {
      var condensed = utility.pack([tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 256, 160, 256, 256, 256]);
      var hash = sha256(new Buffer(condensed,'hex'));
      utility.sign(self.web3, addr, hash, undefined, function(err, sig) {
        if (err) {
          callback('Could not sign order because of an error: '+err, false);
        } else {
          // Send order to Gitter channel:
          var order = {tokenGet: tokenGet, amountGet: amountGet, tokenGive: tokenGive, amountGive: amountGive, expires: expires, nonce: orderNonce, v: sig.v, r: sig.r, s: sig.s, user: addr};
          utility.postGitterMessage(JSON.stringify(order), function(err, result){
            if (!err) {
              callback(null, true);
            } else {
              callback('You tried sending an order to the order book but there was an error.', false);
            }
          });
        }
      });
    }
  });
}

API.publishOrders = function(orders, addr, expires, token, base, armed, callback) {
  API.utility.blockNumber(API.web3, function(err, blockNumber) {
    orders.sort(function(a,b){return b.price-a.price});
    async.each(orders,
      function(order, callbackEach) {
        var amount = utility.weiToEth(Math.abs(order.volume), API.getDivisor(token.addr));
        var orderNonce = utility.getRandomInt(0,Math.pow(2,32));
        if (armed) {
          API.publishOrder(addr, base.addr, token.addr, order.volume>0 ? 'buy' : 'sell', amount, order.price, blockNumber + expires, orderNonce, function(err, result){
            if (!err && result) {
              console.log('Sent order:', order.volume>0 ? 'buy' : 'sell', amount, token.name+'/'+base.name, '@', order.price);
            } else {
              console.log('Error sending order:', err);
            }
            callbackEach(null);
          });
        } else {
          console.log('Order (not armed):', order.volume>0 ? 'buy' : 'sell', amount, token.name+'/'+base.name, '@', order.price);
          callbackEach(null);
        }
      },
      function(err) {
        callback(null, true);
      }
    );
  });
}

API.formatOrder = function(order, token, base) {
  if (order.amount>=0) {
    return utility.weiToEth(order.availableVolume.toNumber(), API.getDivisor(token.addr))+' '+token.name+' @ '+order.price.toNumber().toFixed(5)+' '+token.name+'/'+base.name;
  } else {
    return utility.weiToEth(order.availableVolume.toNumber(), API.getDivisor(token.addr))+' '+token.name+' @ '+order.price.toNumber().toFixed(5)+' '+token.name+'/'+base.name;
  }
}

API.clip = function(value, min, max) {
  if (min>max) {
    var tmp = min;
    min = max;
    max = tmp;
  }
  if (min) value = Math.max(value, min);
  if (max) value = Math.min(value, max);
  return value;
}

API.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}

API.generateImpliedPairs = function(pairs) {
  var returnPairs = API.clone(pairs);
  function splitPair(pair){
    var pairSplit = pair.split("/");
    if (pairSplit.length==2) {
      var token = pairSplit[0];
      var base = pairSplit[1];
      return {token: token, base: base}
    }
    return undefined;
  }

  //split pairs
  var newPairs = [];
  returnPairs.forEach(function(pair){
    var split = splitPair(pair.pair);
    if (split) {
      pair.token = split.token;
      pair.base = split.base;
      newPairs.push(pair);
    }
  });
  returnPairs = API.clone(newPairs);

  //set min and max price for Y and N
  newPairs = [];
  returnPairs.forEach(function(pair){
    var newPair = API.clone(pair);
    if (pair.token.slice(-1)=='Y' && pair.base=='ETH') {
      newPair.minPrice = 0;
      newPair.maxPrice = 1;
    } else if (pair.token.slice(-1)=='N' && pair.base=='ETH') {
      newPair.minPrice = 1;
      newPair.maxPrice = 0;
    }
    newPairs.push(newPair);
  });
  returnPairs = API.clone(newPairs);

  //generate N/ETH from Y/ETH and vice/versa
  newPairs = API.clone(returnPairs);
  returnPairs.forEach(function(pair){
    if (pair.token.slice(-1)=='Y' && pair.base=='ETH' && newPairs.filter(function(x){return x.token==pair.token.replace(/Y$/,'N')}).length==0) {
      var newPair = API.clone(pair);
      newPair.token = pair.token.replace(/Y$/,'N');
      newPair.pair = newPair.token+'/'+newPair.base;
      newPair.theo = 1-pair.theo;
      newPairs.push(newPair);
    } else if (pair.token.slice(-1)=='N' && pair.base=='ETH' && newPairs.filter(function(x){return x.token==pair.token.replace(/N$/,'Y')}).length==0) {
      var newPair = API.clone(pair);
      newPair.token = pair.token.replace(/N$/,'Y');
      newPair.pair = newPair.token+'/'+newPair.base;
      newPair.theo = 1-pair.theo;
      newPairs.push(newPair);
    }
  });
  returnPairs = API.clone(newPairs);

  //generate Y/N from Y/ETH and N/ETH
  newPairs = API.clone(returnPairs);
  returnPairs.forEach(function(pair1){
    returnPairs.forEach(function(pair2){
      if (pair1.base==pair2.base && pair1.token!=pair2.token) {
        var newPair = API.clone(pair1);
        //    {pair: 'ETH/EUSD100', theo: 1000, minPrice: 0, maxPrice: undefined, minEdge: 0.1, edgeStep: 0.05, ordersPerSide: 5, expires: 5}
        newPair.token = pair1.token;
        newPair.base = pair2.token;
        newPair.pair = newPair.token+'/'+newPair.base;
        newPair.theo = pair1.theo / pair2.theo;
        if (pair1.minPrice==0) {
          newPair.minPrice = 0;
        } else {
          try {
            newPair.minPrice = pair1.minPrice / pair2.maxPrice;
          } catch(err) {
            newPair.minPrice = null;
          }
        }
        if (pair1.maxPrice==0) {
          newPair.maxPrice = 0;
        } else {
          try {
            newPair.maxPrice = pair1.maxPrice / pair2.minPrice;
          } catch(err) {
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

  //remove duplicates
  newPairs = [];
  returnPairs.forEach(function(pair){
    var newPair = API.clone(pair);
    if (newPairs.filter(function(x){return (x.token==newPair.token && x.base==newPair.base) || (x.token==newPair.base && x.base==newPair.token)}).length==0) {
      newPairs.push(newPair);
    }
  });
  returnPairs = API.clone(newPairs);

  return returnPairs;
}

module.exports = API;
