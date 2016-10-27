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
      "expires": {
        "title": "Expires",
        "description": "Number of blocks until your orders expire",
        "type": "integer"
      },
      "sellNum": {
        "title": "Sell number",
        "description": "Number of sell orders",
        "type": "number"
      },
      "sellVolume": {
        "title": "Sell volume",
        "description": "Formula for sell volume",
        "type": "string"
      },
      "sellPrice": {
        "title": "Sell price",
        "description": "Formula for sell price",
        "type": "string"
      },
      "buyPrice": {
        "title": "Buy price",
        "description": "Formula for buy price",
        "type": "string"
      },
      "buyVolume": {
        "title": "Buy volume",
        "description": "Formula for buy volume",
        "type": "string"
      },
      "buyNum": {
        "title": "Buy number",
        "description": "Number of buy orders",
        "type": "number"
      }
    },
    "additionalProperties": false,
    "required": [
      "pair",
      "expires",
      "sellNum",
      "sellVolume",
      "sellPrice",
      "buyPrice",
      "buyVolume",
      "buyNum"
    ]
  }
};

module.exports = schema;

},{}]},{},[1])(1)
});