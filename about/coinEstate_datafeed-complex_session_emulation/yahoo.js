/*
	This file is a node.js module.

	This is a sample implementation of UDF-compatible datafeed wrapper for Quandl (historical data) and yahoo.finance (quotes).
	Some algorithms may be incorrect because it's rather an UDF implementation sample
	then a proper datafeed implementation.
*/

/* global require */
/* global console */
/* global process */

"use strict";

var http = require("http"),
	url = require("url"),
	symbolsDatabase = require("./symbols_database"),
	RequestProcessor = require("./mockup-processor").RequestProcessor;

var requestProcessor = new RequestProcessor(symbolsDatabase);

//	Usage:
//		/config
//		/symbols?symbol=A
//		/search?query=B&limit=10
//		/history?symbol=C&from=DATE&resolution=E

var firstPort = process.env.YAHOO_PORT || 8888;
function getFreePort(callback) {
	var port = firstPort;
	firstPort++;

	var server = http.createServer();

	server.listen(port, function (err) {
		server.once('close', function () {
			callback(port);
		});
		server.close();
	});

	server.on('error', function (err) {
		getFreePort(callback);
	});
}

getFreePort(function(port) {
	http.createServer(function(request, response) {
		var uri = url.parse(request.url, true);
		var action = uri.pathname;
		return requestProcessor.processRequest(action, uri.query, response);

	}).listen(port);

	console.log("Datafeed running at\n => http://localhost:" + port + "/\nCTRL + C to shutdown");
});
