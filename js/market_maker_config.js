(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.market_maker_config = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var config = {
  pairs: [
    // {pair: 'MKR/ETH', theo: 2.5, minPrice: 0, minEdge: 0.2, edgeStep: 0.05, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPY/ETH', theo: 0.30, minPrice: 0, maxPrice: 1, minEdge: 0.25, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPN/ETH', theo: 0.70, minPrice: 0, maxPrice: 1, minEdge: 0.11, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    // {pair: 'ETCWY/ETH', theo: 0.075, minPrice: 0, maxPrice: 1, minEdge: 0.25, edgeStep: 0.25, ordersPerSide: 5, expires: 15000},
    // {pair: 'EPOSY/ETH', theo: 0.45, minPrice: 0, maxPrice: 1, minEdge: 0.1, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    // {pair: 'ETH/DUSD', theo: 12, minPrice: 0, minEdge: 0.02, edgeStep: 0.02, ordersPerSide: 5, expires: 15000},
    // {pair: 'BKR/ETH', theo: 0.5, minPrice: 0, minEdge: 0.2, edgeStep: 0.05, ordersPerSide: 5, expires: 500},
  ],
};

module.exports = config;

},{}]},{},[1])(1)
});