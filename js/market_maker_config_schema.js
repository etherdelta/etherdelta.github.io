(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.market_maker_config_schema = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
//http://jsonschema.net/#/

var schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "displayProperty": "pair",
    "properties": {
      "pair": {
        "title": "Pair",
        "description": "The pair name should match what you see on EtherDelta, for example MKR/ETH",
        "type": "string"
      },
      "theo": {
        "title": "Neutral point",
        "description": "Neutral point for the price",
        "type": "number"
      },
      "minPrice": {
        "title": "Minimum price",
        "description": "Minimum possible price (typically 0)",
        "type": "number"
      },
      "maxPrice": {
        "title": "Maximum price",
        "description": "Maximum possible price (may be 1.00 for some prediction market tokens)",
        "type": "number"
      },
      "minEdge": {
        "title": "Minimum edge",
        "description": "Minimum percent edge away from your neutral point (0.01 = 1%)",
        "type": "number"
      },
      "edgeStep": {
        "title": "Edge step",
        "description": "Percent edge to widen for additional levels (0.01 = 1%)",
        "type": "number"
      },
      "ordersPerSide": {
        "title": "Orders per side",
        "description": "Number of orders to insert on the buy side and sell side",
        "type": "integer"
      },
      "expires": {
        "title": "Expires",
        "description": "Number of blocks until your orders expire",
        "type": "integer"
      }
    },
    "additionalProperties": false,
    "required": [
      "pair",
      "theo",
      "minEdge",
      "edgeStep",
      "ordersPerSide",
      "expires"
    ]
  }
};

// var schema = {
//   "$schema": "http://json-schema.org/draft-04/schema#",
//   "type": "object",
//   "additionalProperties": false,
//   "properties": {
//     "pairs": {
//       "type": "array",
//       "items": {
//         "type": "object",
//         "displayProperty": "pair",
//         "properties": {
//           "pair": {
//             "title": "Pair",
//             "description": "The pair name should match what you see on EtherDelta, for example MKR/ETH",
//             "type": "string"
//           },
//           "theo": {
//             "title": "Neutral point",
//             "description": "Neutral point for the price",
//             "type": "number"
//           },
//           "minPrice": {
//             "title": "Minimum price",
//             "description": "Minimum possible price (typically 0)",
//             "type": "number"
//           },
//           "maxPrice": {
//             "title": "Maximum price",
//             "description": "Maximum possible price (may be 1.00 for some prediction market tokens)",
//             "type": "number"
//           },
//           "minEdge": {
//             "title": "Minimum edge",
//             "description": "Minimum percent edge away from your neutral point (0.01 = 1%)",
//             "type": "number"
//           },
//           "edgeStep": {
//             "title": "Edge step",
//             "description": "Percent edge to widen for additional levels (0.01 = 1%)",
//             "type": "number"
//           },
//           "ordersPerSide": {
//             "title": "Orders per side",
//             "description": "Number of orders to insert on the buy side and sell side",
//             "type": "integer"
//           },
//           "expires": {
//             "title": "Expires",
//             "description": "Number of blocks until your orders expire",
//             "type": "integer"
//           }
//         },
//         "additionalProperties": false,
//         "required": [
//           "pair",
//           "theo",
//           "minEdge",
//           "edgeStep",
//           "ordersPerSide",
//           "expires"
//         ]
//       }
//     },
//   },
//   "required": [
//     "pairs"
//   ]
// };

module.exports = schema;

},{}]},{},[1])(1)
});