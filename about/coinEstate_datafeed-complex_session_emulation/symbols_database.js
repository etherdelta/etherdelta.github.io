/*
	This file is a node.js module intended for use in different UDF datafeeds.
*/
//	This list should contain all the symbols available through your datafeed.
//	The current version is extremely incomplete (as it's just a sample): Quandl has much more of them.

"use strict";

/* global exports */

var symbols = [{"name":"A","description":"Agilent Technologies Inc.","exchange":"NYSE","type":"stock"},
{"name":"AA","description":"Alcoa Inc.","exchange":"NYSE","type":"stock"},
{"name":"AAL","description":"American Airlines Group Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AAPL","description":"Apple Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ABBV","description":"AbbVie Inc.","exchange":"NYSE","type":"stock"},
{"name":"ABT","description":"Abbott Laboratories","exchange":"NYSE","type":"stock"},
{"name":"ACHN","description":"Achillion Pharmaceuticals, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ACI","description":"Arch Coal Inc.","exchange":"NYSE","type":"stock"},
{"name":"ACN","description":"Accenture plc","exchange":"NYSE","type":"stock"},
{"name":"ADBE","description":"Adobe Systems Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ADSK","description":"Autodesk, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AEO","description":"American Eagle Outfitters, Inc.","exchange":"NYSE","type":"stock"},
{"name":"AGNC","description":"American Capital Agency Corp.","exchange":"NasdaqNM","type":"stock"},
{"name":"AIG","description":"American International Group, Inc.","exchange":"NYSE","type":"stock"},
{"name":"AKAM","description":"Akamai Technologies, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ALXN","description":"Alexion Pharmaceuticals, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AMAT","description":"Applied Materials, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AMD","description":"Advanced Micro Devices, Inc.","exchange":"NYSE","type":"stock"},
{"name":"AMGN","description":"Amgen Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AMZN","description":"Amazon.com Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ANF","description":"Abercrombie & Fitch Co.","exchange":"NYSE","type":"stock"},
{"name":"ANR","description":"Alpha Natural Resources, Inc.","exchange":"NYSE","type":"stock"},
{"name":"APA","description":"Apache Corp.","exchange":"NYSE","type":"stock"},
{"name":"APC","description":"Anadarko Petroleum Corporation","exchange":"NYSE","type":"stock"},
{"name":"ARC","description":"ARC Document Solutions, Inc.","exchange":"NYSE","type":"stock"},
{"name":"ARIA","description":"Ariad Pharmaceuticals Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ARNA","description":"Arena Pharmaceuticals, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ARR","description":"ARMOUR Residential REIT, Inc.","exchange":"NYSE","type":"stock"},
{"name":"AUXL","description":"Auxilium Pharmaceuticals Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AVGO","description":"Avago Technologies Limited","exchange":"NasdaqNM","type":"stock"},
{"name":"AVNR","description":"Avanir Pharmaceuticals, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AWAY","description":"HomeAway, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"AXP","description":"American Express Company","exchange":"NYSE","type":"stock"},
{"name":"AZO","description":"AutoZone, Inc.","exchange":"NYSE","type":"stock"},
{"name":"BA","description":"The Boeing Company","exchange":"NYSE","type":"stock"},
{"name":"BAC","description":"Bank of America Corporation","exchange":"NYSE","type":"stock"},
{"name":"BAX","description":"Baxter International Inc.","exchange":"NYSE","type":"stock"},
{"name":"BBBY","description":"Bed Bath & Beyond Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"BBT","description":"BB&T Corporation","exchange":"NYSE","type":"stock"},
{"name":"BBY","description":"Best Buy Co., Inc.","exchange":"NYSE","type":"stock"},
{"name":"BIDU","description":"Baidu, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"BIIB","description":"Biogen Idec Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"BK","description":"The Bank of New York Mellon Corporation","exchange":"NYSE","type":"stock"},
{"name":"BLK","description":"BlackRock, Inc.","exchange":"NYSE","type":"stock"},
{"name":"BMY","description":"Bristol-Myers Squibb Company","exchange":"NYSE","type":"stock"},
{"name":"BP","description":"BP plc","exchange":"NYSE","type":"stock"},
{"name":"BRCD","description":"Brocade Communications Systems, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"BRCM","description":"Broadcom Corp.","exchange":"NasdaqNM","type":"stock"},
{"name":"BTU","description":"Peabody Energy Corp.","exchange":"NYSE","type":"stock"},
{"name":"C","description":"Citigroup Inc.","exchange":"NYSE","type":"stock"},
{"name":"CHK","description":"Chesapeake Energy Corporation","exchange":"NYSE","type":"stock"},
{"name":"CNP","description":"CenterPoint Energy, Inc.","exchange":"NYSE","type":"stock"},
{"name":"CSCO","description":"Cisco Systems, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"D","description":"Dominion Resources, Inc.","exchange":"NYSE","type":"stock"},
{"name":"DAL","description":"Delta Air Lines Inc.","exchange":"NYSE","type":"stock"},
{"name":"DBD","description":"Diebold, Incorporated","exchange":"NYSE","type":"stock"},
{"name":"DD","description":"E. I. du Pont de Nemours and Company","exchange":"NYSE","type":"stock"},
{"name":"DDD","description":"3D Systems Corp.","exchange":"NYSE","type":"stock"},
{"name":"DE","description":"Deere & Company","exchange":"NYSE","type":"stock"},
{"name":"DECK","description":"Deckers Outdoor Corp.","exchange":"NYSE","type":"stock"},
{"name":"DEI","description":"Douglas Emmett Inc","exchange":"NYSE","type":"stock"},
{"name":"DHI","description":"DR Horton Inc.","exchange":"NYSE","type":"stock"},
{"name":"DIS","description":"The Walt Disney Company","exchange":"NYSE","type":"stock"},
{"name":"DLTR","description":"Dollar Tree, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"DNDN","description":"Dendreon Corp.","exchange":"NasdaqNM","type":"stock"},
{"name":"DO","description":"Diamond Offshore Drilling, Inc.","exchange":"NYSE","type":"stock"},
{"name":"DOV","description":"Dover Corporation","exchange":"NYSE","type":"stock"},
{"name":"DOW","description":"The Dow Chemical Company","exchange":"NYSE","type":"stock"},
{"name":"DRI","description":"Darden Restaurants, Inc.","exchange":"NYSE","type":"stock"},
{"name":"DV","description":"DeVry Education Group Inc.","exchange":"NYSE","type":"stock"},
{"name":"DVN","description":"Devon Energy Corporation","exchange":"NYSE","type":"stock"},
{"name":"EA","description":"Electronic Arts Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"EBAY","description":"eBay Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"EBIX","description":"Ebix Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ECYT","description":"Endocyte, Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"ED","description":"Consolidated Edison, Inc.","exchange":"NYSE","type":"stock"},
{"name":"EMC","description":"EMC Corporation","exchange":"NYSE","type":"stock"},
{"name":"ENT","description":"Global Eagle Entertainment Inc.","exchange":"NCM","type":"stock"},
{"name":"ESI","description":"ITT Educational Services Inc.","exchange":"NYSE","type":"stock"},
{"name":"ESRX","description":"Express Scripts Holding Company","exchange":"NasdaqNM","type":"stock"},
{"name":"ETFC","description":"E*TRADE Financial Corporation","exchange":"NasdaqNM","type":"stock"},
{"name":"EXC","description":"Exelon Corporation","exchange":"NYSE","type":"stock"},
{"name":"EXPE","description":"Expedia Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"F","description":"Ford Motor Co.","exchange":"NYSE","type":"stock"},
{"name":"FCEL","description":"FuelCell Energy Inc.","exchange":"NGM","type":"stock"},
{"name":"GALE","description":"Galena Biopharma, Inc.","exchange":"NCM","type":"stock"},
{"name":"GD","description":"General Dynamics Corp.","exchange":"NYSE","type":"stock"},
{"name":"GE","description":"General Electric Company","exchange":"NYSE","type":"stock"},
{"name":"GTAT","description":"GT Advanced Technologies Inc.","exchange":"NasdaqNM","type":"stock"},
{"name":"HD","description":"The Home Depot, Inc.","exchange":"NYSE","type":"stock"},
{"name":"IBM","description":"International Business Machines Corporation","exchange":"NYSE","type":"stock"},
{"name":"INTC","description":"Intel Corporation","exchange":"NasdaqNM","type":"stock"},
{"name":"JPM","description":"JPMorgan Chase & Co.","exchange":"NYSE","type":"stock"},
{"name":"KERX","description":"Keryx Biopharmaceuticals Inc.","exchange":"NCM","type":"stock"},
{"name":"KO","description":"The Coca-Cola Company","exchange":"NYSE","type":"stock"},
{"name":"LLY","description":"Eli Lilly and Company","exchange":"NYSE","type":"stock"},
{"name":"LUV","description":"Southwest Airlines Co.","exchange":"NYSE","type":"stock"},
{"name":"MCD","description":"McDonald's Corp.","exchange":"NYSE","type":"stock"},
{"name":"MNST","description":"Monster Beverage Corporation","exchange":"NasdaqNM","type":"stock"},
{"name":"MO","description":"Altria Group Inc.","exchange":"NYSE","type":"stock"},
{"name":"MSFT","description":"Microsoft Corporation","exchange":"NasdaqNM","type":"stock"},
{"name":"NLY","description":"Annaly Capital Management, Inc.","exchange":"NYSE","type":"stock"},
{"name":"NUS","description":"Nu Skin Enterprises Inc.","exchange":"NYSE","type":"stock"},
{"name":"OLED","description":"Universal Display Corp.","exchange":"NasdaqNM","type":"stock"},
{"name":"PNRA","description":"Panera Bread Company","exchange":"NasdaqNM","type":"stock"},
{"name":"RAD","description":"Rite Aid Corporation","exchange":"NYSE","type":"stock"},
{"name":"SAM","description":"Boston Beer Co. Inc.","exchange":"NYSE","type":"stock"},
{"name":"SCTY","description":"SolarCity Corporation","exchange":"NasdaqNM","type":"stock"},
{"name":"SD","description":"SandRidge Energy, Inc.","exchange":"NYSE","type":"stock"},
{"name":"STZ","description":"Constellation Brands Inc.","exchange":"NYSE","type":"stock"},
{"name":"T","description":"AT&T, Inc.","exchange":"NYSE","type":"stock"},
{"name":"UA","description":"Under Armour, Inc.","exchange":"NYSE","type":"stock"},
{"name":"USB","description":"U.S. Bancorp","exchange":"NYSE","type":"stock"},
{"name":"VZ","description":"Verizon Communications Inc.","exchange":"NYSE","type":"stock"},
{"name":"WDC","description":"Western Digital Corporation","exchange":"NasdaqNM","type":"stock"},
{"name":"WFC","description":"Wells Fargo & Company","exchange":"NYSE","type":"stock"},
{"name":"WLT","description":"Walter Energy, Inc.","exchange":"NYSE","type":"stock"},
{"name":"XOM","description":"Exxon Mobil Corporation","exchange":"NYSE","type":"stock"}];


function searchResultFromDatabaseItem(item) {
	return {
		symbol: item.name,
		full_name: item.name,
		description: item.description,
		exchange: item.exchange,
		type: item.type
	};
}


exports.search = function (searchString, type, exchange, maxRecords) {
	var MAX_SEARCH_RESULTS = !!maxRecords ? maxRecords : 50;
	var results = []; // array of WeightedItem { item, weight }
	var queryIsEmpty = !searchString || searchString.length === 0;
	var searchStringUpperCase = searchString.toUpperCase();

	for (var i = 0; i < symbols.length; ++i) {
		var item = symbols[i];

		if (type && type.length > 0 && item.type != type) {
			continue;
		}
		if (exchange && exchange.length > 0 && item.exchange != exchange) {
			continue;
		}

		var positionInName = item.name.toUpperCase().indexOf(searchStringUpperCase);
		var positionInDescription = item.description.toUpperCase().indexOf(searchStringUpperCase);

		if (queryIsEmpty || positionInName >= 0 || positionInDescription >= 0) {
			var found = false;
			for (var resultIndex = 0; resultIndex < results.length; resultIndex++) {
				if (results[resultIndex].item == item) {
					found = true;
					break;
				}
			}
			if (!found) {
				var weight = positionInName >= 0 ? positionInName : 8000 + positionInDescription;
				results.push({ item: item, weight: weight });
			}
		}
	}

	return results
		.sort(function (weightedItem1, weightedItem2) { return weightedItem1.weight - weightedItem2.weight; })
		.map(function (weightedItem) { return searchResultFromDatabaseItem(weightedItem.item); })
		.slice(0, Math.min(results.length, MAX_SEARCH_RESULTS));
};


exports.addSymbols = function(newSymbols) {
	symbols = symbols.concat(newSymbols);
};

exports.symbolInfo = function (symbolName) {

	var data = symbolName.split(':');
	var exchange = (data.length > 1 ? data[0] : "").toUpperCase();
	var symbol = (data.length > 1 ? data[1] : symbolName).toUpperCase();

	for (var i = 0; i < symbols.length; ++i) {
		var item = symbols[i];

		if (item.name.toUpperCase() == symbol && (exchange.length === 0 || exchange == item.exchange.toUpperCase())) {
			return item;
		}
	}

	return null;
};
