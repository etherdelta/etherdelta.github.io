var config = {};

config.homeURL = 'https://etherdelta.github.io';
config.homeURL = 'http://localhost:8080';
config.contractEtherDelta = 'etherdelta.sol';
config.contractToken = 'token.sol';
config.contractReserveToken = 'reservetoken.sol';
config.contractEtherDeltaAddr = '0x91739eeb4f3600442ea6a42c43f7fa8cd8f78a3d';
config.ethTestnet = true;
config.ethProvider = 'http://localhost:8545';
config.ethGasPrice = 20000000000;
config.ethAddr = '0x0000000000000000000000000000000000000000';
config.ethAddrPrivateKey = '';
config.tokens = [
  {addr: '0x0000000000000000000000000000000000000000', name: 'ETH', divisor: 1000000000000000000},
  {addr: '0xedbaad5f8053f17a4a2ad829fd12c5d1332c9f1a', name: 'EUSD', divisor: 1000000000000000000},
  {addr: '0xf0c3d5c1a8f181f365d906447b67ea6510a8ac93', name: 'BKR', divisor: 1000000000000000000},
];
config.gitterHost = 'https://api.gitter.im';
config.gitterStream = 'stream.gitter.im';
config.gitterToken = '7e7772f3f3b2b715122f0d1789cf173ef49238da';
config.gitterRoomID = '57756375c2f0db084a20cf77';

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
