var commandLineArgs = require('command-line-args');
var async = require('async');
var API = require('./api.js');
var marketMakerConfig = require('./market_maker_config.js');

var cli = [
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'address', type: String },
	{ name: 'armed', type: Boolean, defaultValue: false},
];
var cliOptions = commandLineArgs(cli);

if (cliOptions.help) {
	console.log(cli);
} else if (cliOptions.address) {

	API.init(function(err,result){
		//this runs once:
    API.logs(function(err, newEvents) {
    });
		var pairs = marketMakerConfig.pairs;
		async.forever(
	    function(nextForever) {
				API.getEtherDeltaTokenBalances(cliOptions.address, function(err, result){
					var balances = result;
					API.getOrdersRemote(function(err, result){
						if (!err) {
							async.eachSeries(pairs,
								function(pair, callbackEach) {
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
				          var myBuyOrders = buyOrders.filter(function(x){return x.order.user.toLowerCase()==cliOptions.address.toLowerCase()});
				          var mySellOrders = sellOrders.filter(function(x){return x.order.user.toLowerCase()==cliOptions.address.toLowerCase()});
				          var myBuySize = myBuyOrders.map(function(x){return x.availableVolume * x.price.toNumber() * API.getDivisor(selectedBase)/API.getDivisor(selectedToken)}).reduce(function(a,b){return a+b},0);
				          var mySellSize = mySellOrders.map(function(x){return Number(x.availableVolume)}).reduce(function(a,b){return a+b},0);
									console.log(selectedToken.name+'/'+selectedBase.name);
									console.log('----------------------');
									console.log('Lowest offer', sellOrders.length>0 ? API.formatOrder(sellOrders[0], selectedToken, selectedBase) : 'None');
									console.log('Highest bid', buyOrders.length>0 ? API.formatOrder(buyOrders[0], selectedToken, selectedBase) : 'None');
									console.log('Balance', API.utility.weiToEth(balances[selectedToken.name], API.getDivisor(selectedToken)), selectedToken.name);
									console.log('Balance', API.utility.weiToEth(balances[selectedBase.name], API.getDivisor(selectedBase)), selectedBase.name);
									console.log('On buy orders', API.utility.weiToEth(myBuySize, API.getDivisor(selectedBase)), selectedBase.name);
									console.log('On sell orders', API.utility.weiToEth(mySellSize, API.getDivisor(selectedToken)), selectedToken.name);

									var orders = [];

									var n = pair.buyNum;
						      var balance = balances[selectedBase.name];
									var onOrders = myBuySize;
						      for (var i=0; i<n; i++) {
						        var price = eval(pair.buyPrice);
						        var volume = eval(pair.buyVolume);
										if (Math.abs(volume)>0) {
											orders.push({price: price, volume: volume});
										}
						      }
									n = pair.sellNum;
						      balance = balances[selectedToken.name];
									onOrders = mySellSize;
						      for (var i=0; i<n; i++) {
						        var price = eval(pair.sellPrice);
						        var volume = eval(pair.sellVolume);
										if (Math.abs(volume)>0) {
											orders.push({price: price, volume: -volume});
										}
						      }

									API.publishOrders(orders, cliOptions.address, undefined, pair.expires, selectedToken, selectedBase, cliOptions.armed, function(err, result){
										callbackEach(null);
									});
								},
								function(err) {
									setTimeout(function(){nextForever(null)}, 60*1000);
								}
							);
						}
					});
				});
	    },
	    function(err) {
				console.log(err);
	    }
		);
  });

}
