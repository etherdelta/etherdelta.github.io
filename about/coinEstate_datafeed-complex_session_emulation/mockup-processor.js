"use strict";

/* global console */
/* global require */
/* global exports */

var RequestProcessor = require("./request-processor").RequestProcessor;
var MockupHistoryProvider = require("./mockup-history-provider").MockupHistoryProvider;

function inherit(child, base) {
	var baseP = base.prototype,	childP;

	childP = child.prototype = Object.create(baseP);
	childP.constructor = child;
	childP._super = baseP;
}

function MockupProcessor(symbolsDatabase) {
	symbolsDatabase.addSymbols(MockupHistoryProvider.symbols());
	this._super.constructor(symbolsDatabase);
}

inherit(MockupProcessor, RequestProcessor);

MockupProcessor.prototype._sendSymbolInfo = function(symbolName, response) {
	if (symbolName.length && symbolName[symbolName.length - 1] === '*') {
		symbolName = symbolName.slice(0, symbolName.length - 1);
	}
	if (MockupHistoryProvider.isMockupSymbolName(symbolName)) {
		console.log(symbolName + " is a mockup");
		var result = MockupHistoryProvider.symbolInfo(symbolName);

		response.writeHead(200, this._defaultResponseHeader());
		response.write(JSON.stringify(result));
		response.end();
		return;
	}

	return this._super._sendSymbolInfo.apply(this, arguments);
};

MockupProcessor.prototype._sendSymbolHistory = function(symbol, startDateTimestamp, endDateTimestamp, resolution, response) {
	if (MockupHistoryProvider.isMockupSymbolName(symbol)) {
		console.log("History request: MOCKUP " + symbol + ", " + resolution);
		var originalResolution = resolution;
		if (resolution.toLowerCase() === 'd') {
			resolution = 1440;
		}

		var result = MockupHistoryProvider.history(symbol, resolution, startDateTimestamp, endDateTimestamp, originalResolution);

		if (result.t.length === 0) {
			result.s = "no_data";
		}

		response.writeHead(200, this._defaultResponseHeader());
		response.write(JSON.stringify(result));
		response.end();
		return;
	}

	return this._super._sendSymbolHistory.apply(this, arguments);
};

MockupProcessor.prototype._prepareSymbolInfo = function(symbolName) {
	var result = this._super._prepareSymbolInfo(symbolName);
	result.name = result.name + "*";
	return result;
};

exports.RequestProcessor = MockupProcessor;