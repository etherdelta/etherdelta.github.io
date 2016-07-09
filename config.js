var config = {};

config.homeURL = 'https://etherdelta.github.io';
config.homeURL = 'http://localhost:8080';
config.contractEtherDelta = 'etherdelta.sol';
config.contractToken = 'token.sol';
config.contractReserveToken = 'reservetoken.sol';
config.contractEtherDeltaAddr = '0xc6b330df38d6ef288c953f1f2835723531073ce2';
config.ethTestnet = false;
config.ethProvider = 'http://localhost:8545';
config.ethGasPrice = 20000000000;
config.ethAddr = '0x0000000000000000000000000000000000000000';
config.ethAddrPrivateKey = '';
config.tokens = [
  {addr: '0x0000000000000000000000000000000000000000', name: 'ETH', divisor: 1000000000000000000},
  {addr: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413', name: 'DAO', divisor: 10000000000000000},
  {addr: '0xc66ea802717bfb9833400264dd12c2bceaa34a6d', name: 'MKR', divisor: 1000000000000000000},
  {addr: '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a', name: 'DGD', divisor: 1000000000},
];
config.gitterHost = 'https://api.gitter.im';
config.gitterStream = 'stream.gitter.im';
config.gitterToken = '7e7772f3f3b2b715122f0d1789cf173ef49238da';
config.gitterRoomID = '57756375c2f0db084a20cf77';

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
