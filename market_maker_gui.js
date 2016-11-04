var async = require('async');
var API = require('./api.js');
var marketMakerConfig = require('./market_maker_config.js');
var marketMakerConfigSchema = require('./market_maker_config_schema.js');

function Main() {
}

Main.ejs = function(url, element, data) {
  if ($('#'+element).length) {
    new EJS({url: url}).update(element, data);
  } else {
    console.log('Failed to render template because '+element+' does not exist.')
  }
}

Main.alertInfo = function(message) {
  console.log(message);
  alertify.message(message);
}
Main.alertDialog = function(message) {
  console.log(message);
  alertify.alert('Alert', message, function(){});
}
Main.alertWarning = function(message) {
  console.log(message);
  alertify.warning(message);
}
Main.alertError = function(message) {
  console.log(message);
  alertify.error(message);
}
Main.alertSuccess = function(message) {
  console.log(message);
  alertify.success(message);
}

Main.generateOrders = function(callback) {
  API.getEtherDeltaTokenBalances(marketMakerConfig.account.address, function(err, result){
    var balances = result;
    API.getOrdersRemote(function(err, result){
      if (!err) {
        async.mapSeries(marketMakerConfig.pairs,
          function(pair, callbackMap) {
            var selectedToken = undefined;
            var selectedBase = undefined;
            var pairSplit = pair.pair ? pair.pair.split("/") : [];
            if (pairSplit.length==2) {
              selectedToken = API.getToken(pairSplit[0]);
              selectedBase = API.getToken(pairSplit[1]);
            }
            //final order filtering and sorting
            var buyOrders = result.orders.filter(function(x){return x.amount>0});
            var sellOrders = result.orders.filter(function(x){return x.amount<0});
            sellOrders.sort(function(a,b){ return b.price - a.price || b.id - a.id });
            buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
            buyOrders = buyOrders.filter(function(x){return x.order.tokenGet==selectedToken.addr && x.order.tokenGive==selectedBase.addr});
            sellOrders = sellOrders.filter(function(x){return x.order.tokenGive==selectedToken.addr && x.order.tokenGet==selectedBase.addr});
            var myBuyOrders = buyOrders.filter(function(x){return x.order.user.toLowerCase()==marketMakerConfig.account.address.toLowerCase()});
            var mySellOrders = sellOrders.filter(function(x){return x.order.user.toLowerCase()==marketMakerConfig.account.address.toLowerCase()});
            var myBuySize = myBuyOrders.map(function(x){return x.availableVolume * x.price.toNumber() * API.getDivisor(selectedBase)/API.getDivisor(selectedToken)}).reduce(function(a,b){return a+b},0);
            var mySellSize = mySellOrders.map(function(x){return Number(x.availableVolume)}).reduce(function(a,b){return a+b},0);

            var orders = [];

            var balance = balances[selectedBase.name];
            var onOrders = myBuySize;
            var n = eval(pair.buyNum);
            var enabled = eval(pair.buyEnabled);
            if (enabled) {
              for (var i=0; i<n; i++) {
                var price = eval(pair.buyPrice);
                var volume = eval(pair.buyVolume);
                if (Math.abs(volume)>0) {
                  orders.push({price: price, volume: volume});
                }
              }
            }
            balance = balances[selectedToken.name];
            onOrders = mySellSize;
            n = eval(pair.sellNum);
            enabled = eval(pair.sellEnabled);
            if (enabled) {
              for (var i=0; i<n; i++) {
                var price = eval(pair.sellPrice);
                var volume = eval(pair.sellVolume);
                if (Math.abs(volume)>0) {
                  orders.push({price: price, volume: -volume});
                }
              }
            }

            orders.sort((a,b) => b.price-a.price);
            callbackMap(null, {pair: pair, token: selectedToken, base: selectedBase, orders: orders});

          },
          function(err, pairOrders) {
            Main.ejs(API.config.homeURL+'/templates/'+'market_maker_orders.ejs', 'orders', {pairOrders: pairOrders});
            callback(null, pairOrders);
          }
        );
      }
    });
  });
}

Main.sendOrders = function(callback) {
  Main.generateOrders(function(err, pairOrders){
    async.eachSeries(pairOrders,
      function(pairOrder, callbackEach) {
        API.publishOrders(pairOrder.orders, marketMakerConfig.account.address, marketMakerConfig.account.privateKey ? marketMakerConfig.account.privateKey : undefined, pairOrder.pair.expires, pairOrder.token, pairOrder.base, true, function(err, result){
          callbackEach(null);
        }, function(err, message) {
          Main.alertSuccess(message);
        });
      },
      function(err) {
        Main.alertSuccess('Your orders were all sent.');
        callback(null, true);
      }
    );
  });
}

Main.saveConfig = function(callback, noAlert) {
  async.parallel(
    [
      function(callbackParallel) {
        API.writeStorage('EtherDeltaMM_account', marketMakerConfig.account, function(err, result){
          callbackParallel(null, undefined);
        });
      },
      function(callbackParallel) {
        API.writeStorage('EtherDeltaMM_pairs', marketMakerConfig.pairs, function(err, result){
          callbackParallel(null, undefined);
        });
      }
    ],
    function(err, results) {
      if (!noAlert) Main.alertSuccess('Config saved.');
      callback(null, true);
    }
  );
}

Main.forgetConfig = function(callback) {
  marketMakerConfig.account = undefined;
  marketMakerConfig.pairs = undefined;
  Main.saveConfig(function(err, result){
    marketMakerConfig.account = defaultConfig.account;
    marketMakerConfig.pairs = defaultConfig.pairs;
    Main.buildTreema(function(err, result){
      Main.alertSuccess('Config forgotten.');
      callback(null, true);
    })
  }, true);
}

Main.buildTreema = function(callback) {
  treemaAccount = $('#config_account').treema({ schema:marketMakerConfigSchema.account, data:marketMakerConfig.account });
  treemaAccount.build();
  var treemaPairs = $('#config_pairs').treema({ schema:marketMakerConfigSchema.pairs, data:marketMakerConfig.pairs });
  treemaPairs.build();
  callback(null, true);
}

Main.init = function(callback) {
  async.parallel(
    [
      function(callbackParallel) {
        API.init(function(err,result){
          API.logs(function(err, newEvents) {
            callbackParallel(null, undefined);
          });
        });
      },
      function(callbackParallel) {
        API.readStorage('EtherDeltaMM_account', function(err, result){
          if (!err) marketMakerConfig.account = result;
          callbackParallel(null, undefined);
        });
      },
      function(callbackParallel) {
        API.readStorage('EtherDeltaMM_pairs', function(err, result){
          if (!err) marketMakerConfig.pairs = result;
          callbackParallel(null, undefined);
        });
      }
    ],
    function(err, results) {
      Main.buildTreema(function(err, result){
        callback(null, true);
      });
    }
  );
}

var treemaAccount = undefined;
var treemaPairs = undefined;
var defaultConfig = API.clone(marketMakerConfig);

Main.init(function(){});

module.exports = {Main: Main, API: API};
