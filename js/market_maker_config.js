(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var config = {
  pairs: [
    {pair: 'MKR/ETH', theo: 2.5, minPrice: 0, maxPrice: undefined, minEdge: 0.2, edgeStep: 0.05, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPY/ETH', theo: 0.24, minPrice: 0, maxPrice: 1, minEdge: 0.19, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPN/ETH', theo: 0.76, minPrice: 0, maxPrice: 1, minEdge: 0.06, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    // {pair: 'ETCWY/ETH', theo: 0.075, minPrice: 0, maxPrice: 1, minEdge: 0.25, edgeStep: 0.25, ordersPerSide: 5, expires: 15000},
    // {pair: 'EPOSY/ETH', theo: 0.45, minPrice: 0, maxPrice: 1, minEdge: 0.1, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
  ],
  tokenPrices: [
    {name: 'ETH', price: 1.0},
    {name: 'MKR', price: 3.0},
    {name: 'DAO', price: 0.01},
    {name: 'PLU', price: 0.3},
    {name: 'DGD', price: 0},
    {name: 'EPOSY', price: 0.45},
    {name: 'ETCWY', price: 0.05},
    {name: 'TRMPY', price: 0.27},
  ]
};

module.exports = config;

},{}]},{},[1]);
