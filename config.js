var config = {};

config.home_url = 'https://etherdelta.github.io';
config.home_url = 'http://localhost:8080';
config.contract_etherdelta = 'etherdelta.sol';
config.contract_token = 'reservetoken.sol';
config.contract_etherdelta_addr = '0xffb1d106ad0c25b49275a1a1ee8330a4acab11d3';
config.eth_testnet = true;
config.eth_provider = 'http://localhost:8545';
config.eth_gas_price = 20000000000;
config.eth_addr = '0x0000000000000000000000000000000000000000';
config.eth_addr_pk = '';
config.tokens = [
  {addr: '0x0000000000000000000000000000000000000000', name: 'ETH'},
  {addr: '0x81694b0c5b2a88b5ff3d6368eaa5d94f9ab9cb6e', name: 'EUSD'},
  {addr: '0x24f49cf37b697636c86c7d911c9b5f67038ed89f', name: 'BKR'},
];

try {
  global.config = config;
  module.exports = config;
} catch (err) {}
