var config = require('./config.js');
var utility = require('./common/utility.js');
var Web3 = require('web3');
var request = require('request');
var async = require('async');
var BigNumber = require('bignumber.js');
var sha256 = require('js-sha256').sha256;

function API(){
}

API.init = function(callback, allContracts, path, provider) {
  var self = this;

  //self.config, utility
  self.config = config;
  self.utility = utility;

  //web3
  self.web3 = new Web3();
  self.web3.eth.defaultAccount = self.config.ethAddr;
  if (provider) {
    self.config.ethProvider = provider;
  }
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

    //path
    if (path) {
      self.config.contractEtherDelta = path + self.config.contractEtherDelta;
      self.config.contractToken= path + self.config.contractToken;
    }

    //contracts
    self.contractEtherDelta;
    self.contractEtherDeltaAddrs = [self.config.contractEtherDeltaAddrs[0].addr];
    if (allContracts) self.contractEtherDeltaAddrs = self.config.contractEtherDeltaAddrs.map(function(x){return x.addr});
    self.contractToken;

    //storage
    self.storageMessagesCache = 'storage_messagesCache';
    self.storageEventsCache = 'storage_eventsCache';
    self.storageDeadOrdersCache = 'storage_deadOrdersCache';
    self.storageOrdersCache = 'storage_ordersCache';

    //other variables
    self.messagesCache = undefined;
    self.lastMessagesId = 0;
    self.eventsCache = {};
    self.deadOrdersCache = {};
    self.ordersCache = {};
    self.usersWithOrdersToUpdate = {};
    self.blockTimeSnapshot = undefined;
    self.minOrderSize = 0.1;

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
          API.readStorage(self.storageMessagesCache, function(err, result){
            self.messagesCache = !err ? result : {};
            callback(null, true);
          });
        },
        function(callback){
          API.readStorage(self.storageEventsCache, function(err, result){
            self.eventsCache = !err ? result : {};
            callback(null, true);
          });
        },
        function(callback){
          API.readStorage(self.storageDeadOrdersCache, function(err, result){
            self.deadOrdersCache = !err ? result : {};
            callback(null, true);
          });
        },
        function(callback){
          API.readStorage(self.storageOrdersCache, function(err, result){
            self.ordersCache = !err ? result : {};
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

API.readStorage = function(name, callback) {
  if (typeof(window)!='undefined') {
    var result = utility.readCookie(name);
    if (result) {
      try {
        result = JSON.parse(result);
        callback(null, result);
      } catch (err) {
        callback('fail', undefined);
      }
    } else {
      callback('fail', undefined);
    }
  } else {
    utility.readFile(name, function(err, result){
      if (!err) {
        try {
          var result = JSON.parse(result);
          callback(null, result);
        } catch (err) {
          callback(err, undefined);
        }
      } else {
        callback(err, undefined);
      }
    });
  }
}

API.writeStorage = function(name, obj, callback) {
  obj = JSON.stringify(obj);
  if (typeof(window)!='undefined') {
    utility.createCookie(name, obj);
    callback(null, true);
  } else {
    utility.writeFile(name, obj, function(err, result){
      if (!err) {
        callback(null, true);
      } else {
        callback(err, false);
      }
    });
  }
}

API.logs = function(callback) {
  var self = this;
  utility.blockNumber(self.web3, function(err, blockNumber) {
    for (id in self.eventsCache) {
      var event = self.eventsCache[id];
      for (arg in event.args) {
        if (typeof(event.args[arg])=='string' && event.args[arg].slice(0,2)!='0x') {
          event.args[arg] = new BigNumber(event.args[arg]);
        }
      }
    }
    async.map(self.contractEtherDeltaAddrs,
      function(contractEtherDeltaAddr, callbackMap) {
        var blocks = Object.values(self.eventsCache).filter(function(x){return x.address==contractEtherDeltaAddr}).map(function(x){return x.blockNumber});
        var startBlock = 0;
        if (blocks.length) startBlock = blocks.max();
        utility.logsOnce(self.web3, self.contractEtherDelta, contractEtherDeltaAddr, startBlock, 'latest', function(err, events) {
          var newEvents = 0;
          events.forEach(function(event){
            if (!self.eventsCache[event.transactionHash+event.logIndex]) {
              newEvents++;
              event.txLink = 'http://'+(self.config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
              self.eventsCache[event.transactionHash+event.logIndex] = event;
              //users with orders to update
              if (event.event=='Trade') {
                self.usersWithOrdersToUpdate[event.args.give] = true;
                self.usersWithOrdersToUpdate[event.args.get] = true;
              } else if (event.event=='Deposit' || event.event=='Withdraw' || event.event=='Cancel') {
                self.usersWithOrdersToUpdate[event.args.user] = true;
              }
            }
          });
          callbackMap(null, newEvents);
        });
      },
      function(err, result) {
        var newEvents = result.reduce(function(a,b){return a+b},0);
        API.writeStorage(self.storageEventsCache, self.eventsCache, function(err, result){});
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
  if (token && token.decimals!=undefined) {
    result = Math.pow(10,token.decimals);
  }
  return new BigNumber(result);
}

API.getToken = function(addrOrToken, name, decimals) {
  var self = this;
  var result = undefined;
  var matchingTokens = self.config.tokens.filter(function(x){return x.addr==addrOrToken || x.name==addrOrToken});
  var expectedKeys = JSON.stringify(['addr','decimals','gasApprove','gasDeposit','gasOrder','gasTrade','gasWithdraw','name']);
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

API.getMessages = function(callback) {
  var self = this;
  if (self.messagesCache) {
    callback(null, self.messagesCache)
  } else {
    API.readStorage(self.storageMessagesCache, function(err, result){
      var messagesResult = !err ? result : {};
      var keys = Object.keys(messagesResult);
      keys.sort();
      self.messagesCache = {};
      keys.forEach(function(key){
        self.messagesCache[key] = messagesResult[key];
        self.lastMessagesId = key; //last message id (will increment for the next one)
      });
      callback(null, self.messagesCache)
    });
  }
}

API.saveMessage = function(message, callback) {
  var self = this;
  self.messagesCache[self.lastMessagesId++] = message;
  API.writeStorage(self.storageMessagesCache, self.messagesCache, function(err, result){
    callback(null, true);
  })
}

API.getOrders = function(callback) {
  var self = this;
  API.getMessages(function(err, messages){
    utility.blockNumber(self.web3, function(err, blockNumber) {
      if (!err && blockNumber>0) {
        var orders = [];
        //get orders from messages
        var expectedKeys = JSON.stringify(['amountGet','amountGive','contractAddr','expires','nonce','r','s','tokenGet','tokenGive','user','v']);
        Object.keys(self.messagesCache).forEach(function(id) {
          try {
            var message = JSON.parse(JSON.stringify(self.messagesCache[id]));
            for (key in message) {
              if (typeof(message[key])=='number') message[key] = new BigNumber(message[key]);
            }
            if (typeof(message)=='object' && JSON.stringify(Object.keys(message).sort())==expectedKeys) {
              var order = undefined;
              //buy
              order = {amount: message.amountGet, price: message.amountGive.div(message.amountGet).mul(API.getDivisor(message.tokenGet)).div(API.getDivisor(message.tokenGive)), id: id, order: message};
              if (order && !self.deadOrdersCache[order.id]) orders.push(order);
              order = undefined;
              //sell
              order = {amount: -message.amountGive, price: message.amountGet.div(message.amountGive).mul(API.getDivisor(message.tokenGive)).div(API.getDivisor(message.tokenGet)), id: id, order: message};
              if (order && !self.deadOrdersCache[order.id]) orders.push(order);
            } else {
              delete self.messagesCache[id];
            }
          } catch (err) {
            delete self.messagesCache[id];
          }
        });
        //get orders from events
        var events = Object.values(self.eventsCache);
        events.forEach(function(event){
          if (event.event=='Order' && event.address==self.contractEtherDeltaAddrs[0]) {
            var order = undefined;
            //buy
            order = {amount: event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet).mul(API.getDivisor(event.args.tokenGet)).div(API.getDivisor(event.args.tokenGive)), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
            if (order && !self.deadOrdersCache[order.id]) orders.push(order);
            order = undefined;
            //sell
            order = {amount: -event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive).mul(API.getDivisor(event.args.tokenGive)).div(API.getDivisor(event.args.tokenGet)), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
            if (order && !self.deadOrdersCache[order.id]) orders.push(order);
          }
        });
        //get available volumes
        async.map(orders,
          function(order, callbackMap) {
            if (blockNumber<Number(order.order.expires)) {
              if (!self.ordersCache[order.id+(order.amount>=0 ? "buy" : "sell")] || self.usersWithOrdersToUpdate[order.order.user] || true) {
                utility.call(self.web3, self.contractEtherDelta, self.contractEtherDeltaAddrs[0], 'availableVolume', [order.order.tokenGet, Number(order.order.amountGet), order.order.tokenGive, Number(order.order.amountGive), Number(order.order.expires), Number(order.order.nonce), order.order.user, Number(order.order.v), order.order.r, order.order.s], function(err, result) {
                  if (!err) {
                    var availableVolume = result;
                    utility.call(self.web3, self.contractEtherDelta, self.contractEtherDeltaAddrs[0], 'amountFilled', [order.order.tokenGet, Number(order.order.amountGet), order.order.tokenGive, Number(order.order.amountGive), Number(order.order.expires), Number(order.order.nonce), order.order.user, Number(order.order.v), order.order.r, order.order.s], function(err, result) {
                      if (!err) {
                        var amountFilled = result;
                        if (amountFilled.lessThan(order.order.amountGet)) {
                          if (order.amount>=0) {
                            order.availableVolume = availableVolume;
                            order.ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), API.getDivisor(order.order.tokenGet));
                            order.amountFilled = amountFilled;
                          } else {
                            order.availableVolume = availableVolume.div(order.price).mul(API.getDivisor(order.order.tokenGive)).div(API.getDivisor(order.order.tokenGet));
                            order.ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), API.getDivisor(order.order.tokenGive));
                            order.amountFilled = amountFilled.div(order.price).mul(API.getDivisor(order.order.tokenGive)).div(API.getDivisor(order.order.tokenGet));
                          }
                          self.ordersCache[order.id+(order.amount>=0 ? "buy" : "sell")] = {availableVolume: order.availableVolume.toNumber(), ethAvailableVolume: order.ethAvailableVolume, amountFilled: order.amountFilled.toNumber()};
                          callbackMap(null, order);
                        } else {
                          // console.log(amountFilled.toNumber()/1000000000000000000, availableVolume.toNumber()/1000000000000000000, order.order.amountGet.toNumber()/1000000000000000000)
                          deadOrdersCache[order.id+(order.amount>=0 ? "buy" : "sell")] = true;
                          callbackMap(null, undefined);
                        }
                      } else {
                        callbackMap(null, undefined);
                      }
                    });
                  } else {
                    callbackMap(null, undefined);
                  }
                });
              } else {
                order.availableVolume = self.ordersCache[order.id+(order.amount>=0 ? "buy" : "sell")].availableVolume;
                order.ethAvailableVolume = self.ordersCache[order.id+(order.amount>=0 ? "buy" : "sell")].ethAvailableVolume;
                order.amountFilled = self.ordersCache[order.id+(order.amount>=0 ? "buy" : "sell")].amountFilled;
                callbackMap(null, order);
              }
            } else {
              self.deadOrdersCache[order.id+(order.amount>=0 ? "buy" : "sell")] = true;
              delete self.messagesCache[order.id+(order.amount>=0 ? "buy" : "sell")];
              callbackMap(null, undefined);
            }
          },
          function(err, ordersMapped){
            ordersMapped = ordersMapped.filter(function(x){return x!=undefined});
            //remove orders below the min order limit
            orders = orders.filter(function(order){return Number(order.ethAvailableVolume).toFixed(3)>=self.minOrderSize});
            //save to storage
            API.writeStorage(self.storageMessagesCache, self.messagesCache, function(err, result){});
            API.writeStorage(self.storageOrdersCache, self.ordersCache, function(err, result){});
            API.writeStorage(self.storageDeadOrdersCache, self.deadOrdersCache, function(err, result){});
            self.usersWithOrdersToUpdate = {};
            callback(null, {orders: ordersMapped, blockNumber: blockNumber});
          }
        );
      } else {
        callback('Block number invalid', undefined);
      }
    });
  });
}

API.getOrdersRemote = function(callback) {
  var self = this;
  utility.getURL(self.config.apiServer+'/orders', function(err, data){
    if (!err) {
      data = JSON.parse(data);
      var orders = data.orders;
      orders.forEach(function(x){
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
          })
        });
      });
      callback(null, {orders: orders, blockNumber: data.blockNumber});
    } else {
      callback(err, []);
    }
  })
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

API.getFees = function(callback) {
  var self = this;
  var fees = [];
  var feeTake = new BigNumber(0.003);
  var feeMake = new BigNumber(0.000);
  var events = Object.values(self.eventsCache);
  events.forEach(function(event){
    if (event.event=='Trade' && self.contractEtherDeltaAddrs.indexOf(event.address)>=0) {
      if (event.args.amountGive.toNumber()>0 && event.args.amountGet.toNumber()>0) { //don't show trades involving 0 amounts
        //take fee
        fees.push({token: API.getToken(event.args.tokenGive), amount: event.args.amountGive.times(feeTake), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber});
        //make fee
        fees.push({token: API.getToken(event.args.tokenGet), amount: event.args.amountGet.times(feeMake), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber});
      }
    }
  });
  fees.sort(function(a,b){ return b.id - a.id });
  callback(null, {fees: fees});
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

API.returnTicker = function(callback) {
  var tickers = {};
  var firstOldPrices = {};
  API.getTrades(function(err, result){
    var trades = result.trades;
    trades.sort(function(a,b){return a.blockNumber-b.blockNumber});
    trades.forEach(function(trade){
      if (trade.token && trade.base && trade.base.name=='ETH') {
        var pair = trade.base.name+'_'+trade.token.name;
        if (!tickers[pair]) {
          tickers[pair] = {"last":undefined,"percentChange":0,"baseVolume":0,"quoteVolume":0};
        }
        var tradeTime = API.blockTime(trade.blockNumber);
        var price = Number(trade.price);
        tickers[pair].last = price;
        if (!firstOldPrices[pair]) firstOldPrices[pair] = price;
        if (Date.now()-tradeTime.getTime() < 86400*1000*1) {
          var quoteVolume = Number(API.utility.weiToEth(Math.abs(trade.amount), API.getDivisor(trade.token)));
          var baseVolume = Number(API.utility.weiToEth(Math.abs(trade.amount * trade.price), API.getDivisor(trade.token)));
          tickers[pair].quoteVolume += quoteVolume;
          tickers[pair].baseVolume += baseVolume;
          tickers[pair].percentChange = (price - firstOldPrices[pair]) / firstOldPrices[pair];
        } else {
          firstOldPrices[pair] = price;
        }
      }
    });
    callback(null, tickers);
  });
}

API.publishOrder = function(addr, pk, baseAddr, tokenAddr, direction, amount, price, expires, orderNonce, callback) {
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
      if (!self.config.ordersOnchain) { //offchain order
        var condensed = utility.pack([self.contractEtherDeltaAddrs[0], tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
        var hash = sha256(new Buffer(condensed,'hex'));
        utility.sign(self.web3, addr, hash, pk, function(err, sig) {
          if (err) {
            callback('Could not sign order because of an error: '+err, false);
          } else {
            // Send order to Gitter channel:
            var order = {contractAddr: self.contractEtherDeltaAddrs[0], tokenGet: tokenGet, amountGet: amountGet, tokenGive: tokenGive, amountGive: amountGive, expires: expires, nonce: orderNonce, v: sig.v, r: sig.r, s: sig.s, user: addr};
            utility.postURL(self.config.apiServer+'/message', {message: JSON.stringify(order)}, function(err, result){
              if (!err) {
                callback(null, true);
              } else {
                callback('You tried sending an order to the order book but there was an error.', false);
              }
            });
          }
        });
      } else { //onchain order
        var token = API.getToken(tokenGet);
        API.utility.send(self.web3, self.contractEtherDelta, self.contractEtherDeltaAddrs[0], 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, {gas: token.gasOrder, value: 0}], addr, pk, nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          callback(null, true);
        });
      }
    }
  });
}

API.publishOrders = function(orders, addr, pk, expires, token, base, armed, callback, callbackSentOneOrder) {
  API.utility.blockNumber(API.web3, function(err, blockNumber) {
    orders.sort(function(a,b){return b.price-a.price});
    async.eachSeries(orders,
      function(order, callbackEach) {
        var amount = utility.weiToEth(Math.abs(order.volume), API.getDivisor(token.addr));
        var orderNonce = utility.getRandomInt(0,Math.pow(2,32));
        if (armed) {
          API.publishOrder(addr, pk, base.addr, token.addr, order.volume>0 ? 'buy' : 'sell', amount, order.price, blockNumber + expires, orderNonce, function(err, result){
            if (!err && result) {
              if (callbackSentOneOrder) {
                var message = 'Sent order: ' + (order.volume>0 ? 'buy' : 'sell') + ' ' + amount + ' ' + (token.name+'/'+base.name) + ' ' +  '@' + ' ' + order.price;
                callbackSentOneOrder(null, message);
              }
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
    return utility.weiToEth(order.availableVolume, API.getDivisor(token.addr))+' '+token.name+' @ '+order.price.toNumber().toFixed(5)+' '+token.name+'/'+base.name;
  } else {
    return utility.weiToEth(order.availableVolume, API.getDivisor(token.addr))+' '+token.name+' @ '+order.price.toNumber().toFixed(5)+' '+token.name+'/'+base.name;
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
