var configs = {};

//mainnet
configs["1"] = {
  homeURL: 'https://etherdelta.github.io',
  // homeURL: 'http://localhost:8080',
  contractEtherDelta: 'etherdelta.sol',
  contractToken: 'token.sol',
  contractReserveToken: 'reservetoken.sol',
  contractEtherDeltaAddrs: [
    {addr: '0xc6b330df38d6ef288c953f1f2835723531073ce2', info: 'Deployed 07/08/2016'}
  ],
  ethTestnet: false,
  ethProvider: 'http://localhost:8545',
  ethGasPrice: 20000000000,
  ethAddr: '0x0000000000000000000000000000000000000000',
  ethAddrPrivateKey: '',
  tokens: [
    {addr: '0x0000000000000000000000000000000000000000', name: 'ETH', divisor: 1000000000000000000, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000},
    {addr: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413', name: 'DAO', divisor: 10000000000000000, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000},
    {addr: '0xc66ea802717bfb9833400264dd12c2bceaa34a6d', name: 'MKR', divisor: 1000000000000000000, gasApprove: 150000, gasDeposit: 250000, gasWithdraw: 250000, gasTrade: 1000000},
    {addr: '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a', name: 'DGD', divisor: 1000000000, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000},
  ],
  gitterHost: 'https://api.gitter.im',
  gitterStream: 'stream.gitter.im',
  gitterToken: '7e7772f3f3b2b715122f0d1789cf173ef49238da',
  gitterRoomID: '57756375c2f0db084a20cf77',
  userCookie: 'EtherDelta',
  eventsCacheCookie: 'EtherDelta_eventsCache',
  defaultToken: 1,
  defaultBase: 0
};

//testnet
configs["2"] = {
  homeURL: 'https://etherdelta.github.io',
  // homeURL: 'http://localhost:8080',
  contractEtherDelta: 'etherdelta.sol',
  contractToken: 'token.sol',
  contractReserveToken: 'reservetoken.sol',
  contractEtherDeltaAddrs: [
    {addr: '0x91739eeb4f3600442ea6a42c43f7fa8cd8f78a3d', info: 'Deployed 06/30/2016'},
    {addr: '0x0000000000000000000000000000000000000000', info: 'Zero contract'}
  ],
  ethTestnet: true,
  ethProvider: 'http://localhost:8545',
  ethGasPrice: 20000000000,
  ethAddr: '0x0000000000000000000000000000000000000000',
  ethAddrPrivateKey: '',
  tokens: [
    {addr: '0x0000000000000000000000000000000000000000', name: 'ETH', divisor: 1000000000000000000, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000},
    {addr: '0xedbaad5f8053f17a4a2ad829fd12c5d1332c9f1a', name: 'EUSD', divisor: 1000000000000000000, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000},
    {addr: '0xf0c3d5c1a8f181f365d906447b67ea6510a8ac93', name: 'BKR', divisor: 1000000000000000000, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000},
  ],
  gitterHost: 'https://api.gitter.im',
  gitterStream: 'stream.gitter.im',
  gitterToken: '7e7772f3f3b2b715122f0d1789cf173ef49238da',
  gitterRoomID: '57756375c2f0db084a20cf77',
  userCookie: 'EtherDelta_testnet',
  eventsCacheCookie: 'EtherDelta_eventsCache_testnet',
  defaultToken: 0,
  defaultBase: 1
};

//default config
var config = configs["1"]; //mainnet

try {
  global.config = config;
  global.configs = configs;
  module.exports = config;
} catch (err) {}
