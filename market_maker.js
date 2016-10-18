var commandLineArgs = require('command-line-args');
var async = require('async');
var API = require('./api.js');
var marketMakerConfig = require('./market_maker_config.js');

var cli = [
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'address', type: String },
	{ name: 'implied', type: Boolean, defaultValue: false},
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
		if (cliOptions.implied) pairs = API.generateImpliedPairs(pairs);
		async.forever(
	    function(nextForever) {
				API.getEtherDeltaTokenBalances(cliOptions.address, function(err, result){
					console.log(result)
					var balances = result;
					API.getOrderBook(function(err, result){
						console.log(err)
						if (!err) {
							console.log(result)
							async.eachSeries(pairs,
								function(pair, callbackEach) {
									var selectedToken = undefined;
									var selectedBase = undefined;
									var pairSplit = pair.pair ? pair.pair.split("/") : [];
								  if (pairSplit.length==2) {
										selectedToken = API.getToken(pairSplit[0]);
										selectedBase = API.getToken(pairSplit[1]);
									}
									if (selectedToken && selectedBase) {
									}
									var buyOrders = result.buyOrders.filter(function(x){return x.order.tokenGet==selectedToken.addr && x.order.tokenGive==selectedBase.addr});
				          var sellOrders = result.sellOrders.filter(function(x){return x.order.tokenGive==selectedToken.addr && x.order.tokenGet==selectedBase.addr});
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
									if (myBuySize<balances[selectedBase.name]*0.75) {
										var placedOrders = myBuyOrders.length;
										var volumeToPlace = balances[selectedBase.name] - myBuySize;
										var ordersToPlace = pair.ordersPerSide - placedOrders;
										var bestPrice = pair.theo*(1-pair.minEdge);
										if (sellOrders.length>0 && bestPrice>sellOrders[0].price) bestPrice = sellOrders[0].price*(1-pair.minEdge);
										var worstPrice = bestPrice * Math.pow(1-pair.edgeStep,pair.ordersPerSide);
										bestPrice = API.clip(bestPrice, pair.minPrice, pair.maxPrice);
										worstPrice = API.clip(worstPrice, pair.minPrice, pair.maxPrice);
										var myExistingPrices = myBuyOrders.map(function(x){return Number(x.price)});
										var pricePoints = [];
										for (var i=0; i<pair.ordersPerSide; i++) pricePoints.push(worstPrice + (bestPrice-worstPrice)*i/(pair.ordersPerSide-1));
										while (placedOrders < pair.ordersPerSide) {
											var price = pricePoints.reduce(function(a,b){
												return myExistingPrices.map(function(x){return Math.abs(x-b)}).min()>myExistingPrices.map(function(x){return Math.abs(x-a)}).min() ? b : a
											}, pricePoints.min());
											var volume = (volumeToPlace/price*API.getDivisor(selectedToken)/API.getDivisor(selectedBase)/pair.ordersPerSide).toFixed(2);
											myExistingPrices.push(price);
											orders.push({volume: volume, price: price});
											placedOrders += 1;
										}
									}
									if (mySellSize<balances[selectedToken.name]*0.75) {
										var placedOrders = mySellOrders.length;
										var volumeToPlace = balances[selectedToken.name] - mySellSize;
										var ordersToPlace = pair.ordersPerSide - placedOrders;
										var bestPrice = pair.theo*(1+pair.minEdge);
										if (buyOrders.length>0 && bestPrice<buyOrders[0].price) bestPrice = buyOrders[0].price*(1+pair.minEdge);
										var worstPrice = bestPrice * Math.pow(1+pair.edgeStep,pair.ordersPerSide);
										bestPrice = API.clip(bestPrice, pair.minPrice, pair.maxPrice);
										worstPrice = API.clip(worstPrice, pair.minPrice, pair.maxPrice);
										var myExistingPrices = mySellOrders.map(function(x){return Number(x.price)});
										var pricePoints = [];
										for (var i=0; i<pair.ordersPerSide; i++) pricePoints.push(worstPrice + (bestPrice-worstPrice)*i/(pair.ordersPerSide-1));
										while (placedOrders < pair.ordersPerSide) {
											var price = pricePoints.reduce(function(a,b){
												return myExistingPrices.map(function(x){return Math.abs(x-b)}).min()>myExistingPrices.map(function(x){return Math.abs(x-a)}).min() ? b : a
											}, pricePoints.max());
											var volume = (volumeToPlace/pair.ordersPerSide).toFixed(2);
											myExistingPrices.push(price);
											orders.push({volume: -volume, price: price});
											placedOrders += 1;
										}
									}
									API.publishOrders(orders, cliOptions.address, pair.expires, selectedToken, selectedBase, cliOptions.armed, function(err, result){
										callbackEach(null);
									});
								},
								function(err) {
									setTimeout(function(){nextForever(null)}, 10*1000);
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
