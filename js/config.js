(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.config = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
var configs = {};

//mainnet
configs["1"] = {
  homeURL: 'https://etherdelta.github.io',
  // homeURL: 'http://localhost:8080',
  contractEtherDelta: 'smart_contract/etherdelta.sol',
  contractToken: 'smart_contract/token.sol',
  contractReserveToken: 'smart_contract/reservetoken.sol',
  contractEtherDeltaAddrs: [
    {addr: '0x373c55c277b866a69dc047cad488154ab9759466', info: 'Deployed 10/24/2016'},
    {addr: '0x4aea7cf559f67cedcad07e12ae6bc00f07e8cf65', info: 'Deployed 08/30/2016 -- please withdraw'},
    {addr: '0x2136bbba2edca21afdddee838fff19ea70d10f03', info: 'Deployed 08/03/2016 -- please withdraw'},
    {addr: '0xc6b330df38d6ef288c953f1f2835723531073ce2', info: 'Deployed 07/08/2016 -- please withdraw'}
  ],
  ethTestnet: false,
  ethProvider: 'http://localhost:8545',
  ethGasPrice: 20000000000,
  ethAddr: '0x0000000000000000000000000000000000000123',
  ethAddrPrivateKey: '',
  tokens: [
    {addr: '0x0000000000000000000000000000000000000000', name: 'ETH', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xd8912c10681d8b21fd3742244f44658dba12264e', name: 'PLU', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xaf30d2a7e90d7dc361c8c4585e9bb7d2f6f15bc7', name: '1ST', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x936f78b9852d12f5cb93177c1f84fb8513d06263', name: 'GNTW', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x01afc37f4f85babc47c0e2d0eababc7fb49793c8', name: 'GNTM', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    // {addr: '0xa74476443119a942de498590fe1f2454d7d4ac0d', name: 'GNT', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x5c543e7ae0a1104f78406c340e9c64fd9fce5170', name: 'VSL', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xac709fcb44a43c35f0da4e3163b117a17f3770f5', name: 'ARC', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x14f37b574242d366558db61f3335289a5035c506', name: 'HKG', decimals: 3, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x888666ca69e0f178ded6d75b5726cee99a87d698', name: 'ICN', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x48c80f1f4d53d5951e5d5438b54cba84f29f32a5', name: 'REP', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009', name: 'SNGLS', decimals: 0, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x4df812f6064def1e5e029f1ca858777cc98d2d81', name: 'XAUR', decimals: 8, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xc66ea802717bfb9833400264dd12c2bceaa34a6d', name: 'MKR', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    // {addr: '0x569348f5204f0491a137c0b8bd5b0ab72c5a659c', name: 'NEWB', decimals: 0, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a', name: 'DGD', decimals: 9, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x9a526b18eeb7195b7324f7271fc02c6b5e11ff5e', name: 'TRMPY', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x4a41659df69d663d000764d3b235908e5937c6b2', name: 'TRMPN', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xce3d9c3f3d302436d12f18eca97a3b00e97be7cd', name: 'EPOSY', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x289fe11c6f46e28f9f1cfc72119aee92c1da50d0', name: 'EPOSN', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x0105d415be226a6edbdbfe5bc31e6f4b2b1d2698', name: 'ETCWY', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x1f0dc965d1dcdd8ad0559d170123a92dfc7e111f', name: 'ETCWN', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413', name: 'DAO', decimals: 16, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x55e7c4a77821d5c50b4570b08f9f92896a25e012', name: 'P+', decimals: 0, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x45e42d659d9f9466cd5df622506033145a9b89bc', name: 'NXC', decimals: 3, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x6f47980674550d8c8240e6eaf3b594f562adc7a9', name: 'DCN', decimals: 0, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x01a7018e6d1fde8a68d12f59b6532fb523b6259d', name: 'USD.DC', decimals: 8, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xffad42d96e43df36652c8eaf61a7e6dba2ad0e41', name: 'BTC.DC', decimals: 8, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
  ],
  pairs: [
    {token: 'PLU', base: 'ETH'},
    {token: 'NXC', base: 'ETH'},
    {token: 'GNTW', base: 'ETH'},
    {token: 'GNTM', base: 'ETH'},
    {token: 'ICN', base: 'ETH'},
    {token: 'REP', base: 'ETH'},
    {token: 'SNGLS', base: 'ETH'},
    {token: 'ARC', base: 'ETH'},
    {token: 'VSL', base: 'ETH'},
    {token: '1ST', base: 'ETH'},
    {token: 'HKG', base: 'ETH'},
    {token: 'ETH', base: 'USD.DC'},
    {token: 'ETH', base: 'BTC.DC'},
    {token: 'XAUR', base: 'ETH'},
    {token: 'MKR', base: 'ETH'},
    {token: 'DGD', base: 'ETH'},
    {token: 'TRMPY', base: 'ETH'},
    {token: 'TRMPN', base: 'ETH'},
  ],
  ordersOnchain: false,
  gitterHost: 'https://api.gitter.im',
  gitterStream: 'stream.gitter.im',
  gitterToken: '7e7772f3f3b2b715122f0d1789cf173ef49238da',
  gitterRoomID: '57756375c2f0db084a20cf77',
  chatServer: 'https://etherdeltachat.herokuapp.com:443',
  apiServer: 'https://api.etherdelta.com',
  // apiServer: 'http://localhost:3000',
  userCookie: 'EtherDelta',
  eventsCacheCookie: 'EtherDelta_eventsCache',
  deadOrdersCacheCookie: 'EtherDelta_deadOrdersCache',
  ordersCacheCookie: 'EtherDelta_ordersCache',
  defaultToken: 1,
  defaultBase: 0,
  etherscanAPIKey: '44JPUFZGPI8GUIG8XR5ZRRF7WSE2XJVS1T',
};

//testnet
configs["2"] = {
  homeURL: 'https://etherdelta.github.io',
  // homeURL: 'http://localhost:8080',
  contractEtherDelta: 'smart_contract/etherdelta.sol',
  contractToken: 'smart_contract/token.sol',
  contractReserveToken: 'smart_contract/reservetoken.sol',
  contractEtherDeltaAddrs: [
    {addr: '0xf80cd360e96fa96b8b7d9e95d5a7911ac5f09ec2', info: 'Deployed 10/24/2016'},
    {addr: '0xcdd152384c55dd4e5b5a3128cc90e0d9311570de', info: 'Deployed 10/06/2016'},
    {addr: '0x24b0ed7ba8d6d969bfe8409b4e6aeee3a40f8855', info: 'Deployed 08/03/2016'},
    {addr: '0x91739eeb4f3600442ea6a42c43f7fa8cd8f78a3d', info: 'Deployed 06/30/2016'},
    {addr: '0x0000000000000000000000000000000000000000', info: 'Zero contract'}
  ],
  ethTestnet: true,
  ethProvider: 'http://localhost:8545',
  ethGasPrice: 20000000000,
  ethAddr: '0x0000000000000000000000000000000000000000',
  ethAddrPrivateKey: '',
  tokens: [
    {addr: '0x0000000000000000000000000000000000000000', name: 'ETH', decimals: 18, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x9a210726fb7fdcb2b701b75e43c94c532eba0de4', name: 'TESTTRMPY', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0x77cafe1d95fd9d03143df9e1dffb401580aabaa5', name: 'TESTTRMPN', decimals: 18, gasApprove: 250000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xedbaad5f8053f17a4a2ad829fd12c5d1332c9f1a', name: 'EUSD100', decimals: 16, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 250000, gasOrder: 250000},
    // {addr: '0xedbaad5f8053f17a4a2ad829fd12c5d1332c9f1a', name: 'EUSD', decimals: 18, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xf0c3d5c1a8f181f365d906447b67ea6510a8ac93', name: 'BKR', decimals: 18, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 250000, gasOrder: 250000},
    {addr: '0xaf7d1722464786c0311d20ab7d98bee6a4b0f38d', name: 'HFYES', decimals: 18, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 250000, gasOrder: 250000},
  ],
  pairs: [
    {token: 'ETH', base: 'EUSD100'},
    {token: 'BKR', base: 'ETH'},
  ],
  ordersOnchain: false,
  gitterHost: 'https://api.gitter.im',
  gitterStream: 'stream.gitter.im',
  gitterToken: '7e7772f3f3b2b715122f0d1789cf173ef49238da',
  gitterRoomID: '57756375c2f0db084a20cf77',
  chatServer: 'https://etherdeltachat.herokuapp.com:443',
  apiServer: 'https://etherdeltapublicapi.herokuapp.com',
  // apiServer: 'http://localhost:3000',
  userCookie: 'EtherDelta_testnet',
  eventsCacheCookie: 'EtherDelta_eventsCache_testnet',
  deadOrdersCacheCookie: 'EtherDelta_deadOrdersCache_testnet',
  ordersCacheCookie: 'EtherDelta_ordersCache_testnet',
  defaultToken: 0,
  defaultBase: 1,
  etherscanAPIKey: '44JPUFZGPI8GUIG8XR5ZRRF7WSE2XJVS1T',
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
//default config
var index = "1"; //mainnet
if (typeof(window)!='undefined') {
  var network = getParameterByName("network");
  if (network) {
    index = network;
  }
} else if (global.network) {
  index = global.network;
}
var config = configs[index];

try {
  global.config = config;
  global.configs = configs;
  module.exports = config;
} catch (err) {}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});