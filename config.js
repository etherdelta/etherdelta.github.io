/* eslint-env browser  */

module.exports = {
  homeURL: 'https://Sysdgit.github.io',
  contractEtherDelta: 'smart_contract/etherdelta.sol',
  contractToken: 'smart_contract/token.sol',
  contractReserveToken: 'smart_contract/reservetoken.sol',
  contractEtherDeltaAddrs: [
    { addr: '0x8d12a197cb00d4747a1fe03395095ce2a5cc6819', info: 'Deployed 02/09/2017' },
    { addr: '0x373c55c277b866a69dc047cad488154ab9759466', info: 'Deployed 10/24/2016 -- please withdraw' },
    { addr: '0x4aea7cf559f67cedcad07e12ae6bc00f07e8cf65', info: 'Deployed 08/30/2016 -- please withdraw' },
    { addr: '0x2136bbba2edca21afdddee838fff19ea70d10f03', info: 'Deployed 08/03/2016 -- please withdraw' },
    { addr: '0xc6b330df38d6ef288c953f1f2835723531073ce2', info: 'Deployed 07/08/2016 -- please withdraw' },
  ],
  ethTestnet: false,
  ethProvider: 'http://localhost:8545',
  ethGasPrice: 4000000000,
  ethAddr: '0x0000000000000000000000000000000000000000',
  ethAddrPrivateKey: '',
  gasApprove: 250000,
  gasDeposit: 250000,
  gasWithdraw: 250000,
  gasTrade: 250000,
  gasOrder: 250000,
  ordersOnchain: false,
  apiServer: ['https://cache1.etherdelta.com', 'https://cache2.etherdelta.com', 'https://cache3.etherdelta.com', 'https://cache4.etherdelta.com'],
  userCookie: 'EtherDelta',
  eventsCacheCookie: 'EtherDelta_eventsCache',
  deadOrdersCacheCookie: 'EtherDelta_deadOrdersCache',
  ordersCacheCookie: 'EtherDelta_ordersCache',
  etherscanAPIKey: 'GCGR1C9I17TYIRNYUDDEIJH1K5BRPH4UDE',
  tokens: [
    { addr: '0x0000000000000000000000000000000000000000', name: 'ETH', decimals: 18 },
    { addr: '0xd8912c10681d8b21fd3742244f44658dba12264e', name: 'PLU', decimals: 18 },
    { addr: '0xaf30d2a7e90d7dc361c8c4585e9bb7d2f6f15bc7', name: '1ST', decimals: 18 },
    { addr: '0x936f78b9852d12f5cb93177c1f84fb8513d06263', name: 'GNTW', decimals: 18 },
    { addr: '0x01afc37f4f85babc47c0e2d0eababc7fb49793c8', name: 'GNTM', decimals: 18 },
    { addr: '0xa74476443119a942de498590fe1f2454d7d4ac0d', name: 'GNT', decimals: 18 },
    { addr: '0x5c543e7ae0a1104f78406c340e9c64fd9fce5170', name: 'VSL', decimals: 18 },
    { addr: '0xac709fcb44a43c35f0da4e3163b117a17f3770f5', name: 'ARC', decimals: 18 },
    { addr: '0x14f37b574242d366558db61f3335289a5035c506', name: 'HKG', decimals: 3 },
    { addr: '0x888666ca69e0f178ded6d75b5726cee99a87d698', name: 'ICN', decimals: 18 },
    { addr: '0xe94327d07fc17907b4db788e5adf2ed424addff6', name: 'REP', decimals: 18 },
    { addr: '0xaec2e87e0a235266d9c5adc9deb4b2e29b54d009', name: 'SNGLS', decimals: 0 },
    { addr: '0x4df812f6064def1e5e029f1ca858777cc98d2d81', name: 'XAUR', decimals: 8 },
    { addr: '0xc66ea802717bfb9833400264dd12c2bceaa34a6d', name: 'MKR', decimals: 18 },
    { addr: '0xe0b7927c4af23765cb51314a0e0521a9645f0e2a', name: 'DGD', decimals: 9 },
    { addr: '0xce3d9c3f3d302436d12f18eca97a3b00e97be7cd', name: 'EPOSY', decimals: 18 },
    { addr: '0x289fe11c6f46e28f9f1cfc72119aee92c1da50d0', name: 'EPOSN', decimals: 18 },
    // { addr: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413', name: 'DAO', decimals: 16 },
    { addr: '0x55e7c4a77821d5c50b4570b08f9f92896a25e012', name: 'P+', decimals: 0 },
    { addr: '0x45e42d659d9f9466cd5df622506033145a9b89bc', name: 'NXC', decimals: 3 },
    { addr: '0x08d32b0da63e2C3bcF8019c9c5d849d7a9d791e6', name: 'DCN', decimals: 0 },
    { addr: '0x01a7018e6d1fde8a68d12f59b6532fb523b6259d', name: 'USD.DC', decimals: 8 },
    { addr: '0xffad42d96e43df36652c8eaf61a7e6dba2ad0e41', name: 'BTC.DC', decimals: 8 },
    // { addr: '0x949bed886c739f1a3273629b3320db0c5024c719', name: 'AMIS', decimals: 9 },
    { addr: '0xb9e7f8568e08d5659f5d29c4997173d84cdf2607', name: 'SWT', decimals: 18 },
    // { addr: '0xf77089f2f00fca83501705b711cbb10a0de77628', name: 'BME', decimals: 0 },
    { addr: '0xb802b24e0637c2b87d2e8b7784c055bbe921011a', name: 'EMV', decimals: 2 },
    { addr: '0x6531f133e6deebe7f2dce5a0441aa7ef330b4e53', name: 'TIME', decimals: 8 },
    // { addr: '0x059d4329078dcA62c521779c0Ce98EB9329349e6', name: 'TIG', decimals: 18 },
    { addr: '0xbeb9ef514a379b997e0798fdcc901ee474b6d9a1', name: 'MLN', decimals: 18 },
    { addr: '0x168296bb09e24a88805cb9c33356536b980d3fc5', name: 'RHOC', decimals: 8 },
    { addr: '0x08711d3b02c8758f2fb3ab4e80228418a7f8e39c', name: 'EDG', decimals: 0 },
    { addr: '0xf7b098298f7c69fc14610bf71d5e02c60792894c', name: 'GUP', decimals: 3 },
    { addr: '0x807b9487aaf00629b674bd6d02e4917453bc5939', name: 'ETB-OLD', decimals: 12 },
    { addr: '0x4fe6ea636abe664e0268af373a10ca3621a0b95b', name: 'ETB', decimals: 12 },
    { addr: '0x607f4c5bb672230e8672085532f7e901544a7375', name: 'RLC', decimals: 9 },
    { addr: '0xcb94be6f13a1182e4a4b6140cb7bf2025d28e41b', name: 'TRST', decimals: 6 },
    { addr: '0x2e071d2966aa7d8decb1005885ba1977d6038a65', name: 'DICE', decimals: 16 },
    { addr: '0xe7775a6e9bcf904eb39da2b68c5efb4f9360e08c', name: 'TAAS', decimals: 6 },
    { addr: '0x6810e776880c02933d47db1b9fc05908e5386b96', name: 'GNO', decimals: 18 },
    { addr: '0x667088b212ce3d06a1b553a7221e1fd19000d9af', name: 'WINGS', decimals: 18 },
    { addr: '0xfa05a73ffe78ef8f1a739473e462c54bae6567d9', name: 'LUN', decimals: 18 },
    { addr: '0xaaaf91d9b90df800df4f55c205fd6989c977e73a', name: 'TKN', decimals: 8 },
    { addr: '0xcbcc0f036ed4788f63fc0fee32873d6a7487b908', name: 'HMQ', decimals: 8 },
    { addr: '0x960b236a07cf122663c4303350609a66a7b288c0', name: 'ANT', decimals: 18 },
    { addr: '0xd248b0d48e44aaf9c49aea0312be7e13a6dc1468', name: 'SGT', decimals: 1 },
    // MNE is not ERC-20 compliant (no approve and transferFrom):
    // { addr: '0x1a95b271b0535d15fa49932daba31ba612b52946', name: 'MNE', decimals: 8 },
    { addr: '0xff3519eeeea3e76f1f699ccce5e23ee0bdda41ac', name: 'BCAP', decimals: 0 },
    { addr: '0x0d8775f648430679a709e98d2b0cb6250d2887ef', name: 'BAT', decimals: 18 },
    { addr: '0xa645264c5603e96c3b0b078cdab68733794b0a71', name: 'MYST', decimals: 8 },
    { addr: '0x82665764ea0b58157e1e5e9bab32f68c76ec0cdf', name: 'VSM', decimals: 0 },
    { addr: '0x12fef5e57bf45873cd9b62e9dbd7bfb99e32d73e', name: 'CFI', decimals: 18 },
    { addr: '0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374', name: 'VERI', decimals: 18 },
    { addr: '0x40395044ac3c0c57051906da938b54bd6557f212', name: 'MGO', decimals: 8 },
    { addr: '0x8ae4bf2c33a8e667de34b54938b0ccd03eb8cc06', name: 'PTOY', decimals: 8 },
    { addr: '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c', name: 'BNT', decimals: 18 },
    { addr: '0x697beac28B09E122C4332D163985e8a73121b97F', name: 'QRL', decimals: 8 },
    { addr: '0xae616e72d3d89e847f74e8ace41ca68bbf56af79', name: 'GOOD', decimals: 6 },
    { addr: '0x744d70fdbe2ba4cf95131626614a1763df805b9e', name: 'SNT', decimals: 18 },
    { addr: '0x983f6d60db79ea8ca4eb9968c6aff8cfa04b3c63', name: 'SONM', decimals: 18 },
    { addr: '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671', name: 'NMR', decimals: 18 },
    { addr: '0x93e682107d1e9defb0b5ee701c71707a4b2e46bc', name: 'MCAP', decimals: 8 },
    { addr: '0xb97048628db6b661d4c2aa833e95dbe1a905b280', name: 'PAY', decimals: 18 },
    { addr: '0x5a84969bb663fb64f6d015dcf9f622aedc796750', name: 'ICE', decimals: 18 },
    { addr: '0xd4fa1460f537bb9085d22c7bccb5dd450ef28e3a', name: 'PPT', decimals: 8 },
    { addr: '0xbbb1bd2d741f05e144e6c4517676a15554fd4b8d', name: 'FUNOLD', decimals: 8 },
    { addr: '0x419d0d8bdd9af5e606ae2232ed285aff190e711b', name: 'FUN', decimals: 8 },
    { addr: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd', name: 'ADT', decimals: 9 },
    { addr: '0xce5c603c78d047ef43032e96b5b785324f753a4f', name: 'E4ROW', decimals: 2 },
    { addr: '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac', name: 'STORJ', decimals: 8 },
    { addr: '0xcfb98637bcae43c13323eaa1731ced2b716962fd', name: 'NET', decimals: 18 },
    { addr: '0x86fa049857e0209aa7d9e616f7eb3b3b78ecfdb0', name: 'EOS', decimals: 18 },
    { addr: '0x4470bb87d77b963a013db939be332f927f2b992e', name: 'ADX', decimals: 4 },
    { addr: '0x621d78f2ef2fd937bfca696cabaf9a779f59b3ed', name: 'DRP', decimals: 2 },
    { addr: '0x8aa33a7899fcc8ea5fbe6a608a109c3893a1b8b2', name: 'BET', decimals: 18 },
    { addr: '0x0affa06e7fbe5bc9a764c979aa66e8256a631f02', name: 'PLBT', decimals: 6 },
    { addr: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07', name: 'OMG', decimals: 18 },
    { addr: '0xb8c77482e45f1f44de1745f52c74426c631bdd52', name: 'BNB', decimals: 18 },
    { addr: '0x814964b1bceaf24e26296d031eadf134a2ca4105', name: 'NEWB', decimals: 0 },
    { addr: '0xb24754be79281553dc1adc160ddf5cd9b74361a4', name: 'XRL', decimals: 9 },
    { addr: '0x386467f1f3ddbe832448650418311a479eecfc57', name: 'MBRS', decimals: 0 },
    { addr: '0xf433089366899d83a9f26a773d59ec7ecf30355e', name: 'MTL', decimals: 8 },
    { addr: '0xc63e7b1dece63a77ed7e4aeef5efb3b05c81438d', name: 'FUCK', decimals: 4 },
    { addr: '0x5c6183d10a00cd747a6dbb5f658ad514383e9419', name: 'NXX', decimals: 8 },
    { addr: '0xd5b9a2737c9b2ff35ecb23b884eb039303bbbb61', name: 'BTH', decimals: 18 },
    { addr: '0xe3818504c1b32bf1557b16c238b2e01fd3149c17', name: 'PLR', decimals: 18 },
    { addr: '0x41e5560054824ea6b0732e656e3ad64e20e94e45', name: 'CVC', decimals: 8 },
    { addr: '0xbfa4d71a51b9e0968be4bc299f8ba6cbb2f86789', name: 'MAYY', decimals: 18 },
    { addr: '0xab130bc7ff83192656a4b3079741c296615899c0', name: 'MAYN', decimals: 18 },
    { addr: '0xe2e6d4be086c6938b53b22144855eef674281639', name: 'LNK', decimals: 18 },
    { addr: '0x2bdc0d42996017fce214b21607a515da41a9e0c5', name: 'SKIN', decimals: 6 },
    { addr: '0x8b9c35c79af5319c70dd9a3e3850f368822ed64e', name: 'DGT', decimals: 18 },
    { addr: '0xa578acc0cb7875781b7880903f4594d13cfa8b98', name: 'ECN', decimals: 2 },
    // { addr: '0xee22430595ae400a30ffba37883363fbf293e24e', name: 'TME', decimals: 18 }, // missing a transferFrom function
    { addr: '0x660b612ec57754d949ac1a09d0c2937a010dee05', name: 'BCD', decimals: 6 },
    { addr: '0x8ef59b92f21f9e5f21f5f71510d1a7f87a5420be', name: 'DEX', decimals: 2 }, // needs to verify code on Etherscan
    { addr: '0xea1f346faf023f974eb5adaf088bbcdf02d761f4', name: 'TIX', decimals: 18 },
    { addr: '0x177d39ac676ed1c67a2b268ad7f1e58826e5b0af', name: 'CDT', decimals: 18 },
    { addr: '0xfca47962d45adfdfd1ab2d972315db4ce7ccf094', name: 'IXT', decimals: 8 },
    { addr: '0xa2f4fcb0fde2dd59f7a1873e121bc5623e3164eb', name: 'AIR', decimals: 0 },
    { addr: '0x56ba2ee7890461f463f7be02aac3099f6d5811a8', name: 'CAT', decimals: 18 },
    { addr: '0x701c244b988a513c945973defa05de933b23fe1d', name: 'OAX', decimals: 18 },
    { addr: '0x08fd34559f2ed8585d3810b4d96ab8a05c9f97c5', name: 'CLRT', decimals: 18 },
    { addr: '0x68aa3f232da9bdc2343465545794ef3eea5209bd', name: 'MSP', decimals: 18 },
    { addr: '0x2a05d22db079bc40c2f77a1d1ff703a56e631cc1', name: 'BAS', decimals: 8 },
    { addr: '0xdc0c22285b61405aae01cba2530b6dd5cd328da7', name: 'KTN', decimals: 6 },
    // { addr: '0xc1e6c6c681b286fb503b36a9dd6c1dbff85e73cf', name: 'JET', decimals: 18 }, // needs to verify code on Etherscan
    { addr: '0xdd6bf56ca2ada24c683fac50e37783e55b57af9f', name: 'BNC', decimals: 12 },
    { addr: '0x0abdace70d3790235af448c88547603b945604ea', name: 'DNT', decimals: 18 },
    { addr: '0x96a65609a7b84e8842732deb08f56c3e21ac6f8a', name: 'CTR', decimals: 18 },
    { addr: '0x9e77d5a1251b6f7d456722a6eac6d2d5980bd891', name: 'BRAT', decimals: 8 },
    { addr: '0x5af2be193a6abca9c8817001f45744777db30756', name: 'BQX', decimals: 8 },
    { addr: '0x006bea43baa3f7a6f765f14f10a1a1b08334ef45', name: 'STX', decimals: 18 },
    { addr: '0x88fcfbc22c6d3dbaa25af478c578978339bde77a', name: 'FYN', decimals: 18 },
    { addr: '0x4e0603e2a27a30480e5e3a4fe548e29ef12f64be', name: 'CREDO', decimals: 18 },
    { addr: '0x202e295df742befa5e94e9123149360db9d9f2dc', name: 'NIH', decimals: 8 },
    { addr: '0x671abbe5ce652491985342e85428eb1b07bc6c64', name: 'QAU', decimals: 8 },
    { addr: '0x3597bfd533a99c9aa083587b074434e61eb0a258', name: 'DENT', decimals: 8 },
    { addr: '0xbc7de10afe530843e71dfb2e3872405191e8d14a', name: 'SHOUC', decimals: 18 },
    { addr: '0x2ca72c9699b92b47272c9716c664cad6167c80b0', name: 'GUNS', decimals: 18 },
    { addr: '0x02b9806a64cb05f02aa8dcc1c178b88159a61304', name: 'DEL', decimals: 18 },
    { addr: '0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098', name: 'SAN', decimals: 18 },
    { addr: '0xf8e386eda857484f5a12e4b5daa9984e06e73705', name: 'IND', decimals: 18 },
    { addr: '0xfb12e3cca983b9f59d90912fd17f8d745a8b2953', name: 'LUCK', decimals: 0 },
    { addr: '0x0b1724cc9fda0186911ef6a75949e9c0d3f0f2f3', name: 'RIYA', decimals: 8 },
    // { addr: '0x5ddab66da218fb05dfeda07f1afc4ea0738ee234', name: 'RARE', decimals: 8 }, // needs to verify token on web site
    { addr: '0xe41d2489571d322189246dafa5ebde1f4699f498', name: 'ZRX', decimals: 18 },
  ],
  defaultPair: { token: 'PLU', base: 'ETH' },
  pairs: [
    { token: 'PLU', base: 'ETH' },
    { token: '1ST', base: 'ETH' },
    { token: 'EDG', base: 'ETH' },
    { token: 'ARC', base: 'ETH' },
    { token: 'GNTW', base: 'ETH' },
    { token: 'GNTM', base: 'ETH' },
    { token: 'NXC', base: 'ETH' },
    { token: 'ICN', base: 'ETH' },
    { token: 'REP', base: 'ETH' },
    { token: 'MLN', base: 'ETH' },
    { token: 'SNGLS', base: 'ETH' },
    { token: 'MKR', base: 'ETH' },
    { token: 'DGD', base: 'ETH' },
    { token: 'SWT', base: 'ETH' },
    { token: 'VSL', base: 'ETH' },
    { token: 'HKG', base: 'ETH' },
    { token: 'XAUR', base: 'ETH' },
    { token: 'TIME', base: 'ETH' },
    { token: 'GUP', base: 'ETH' },
    { token: 'RLC', base: 'ETH' },
    { token: 'ETB', base: 'ETH' },
    { token: 'ETB-OLD', base: 'ETH' },
    { token: 'TRST', base: 'ETH' },
    { token: 'DICE', base: 'ETH' },
    { token: 'TAAS', base: 'ETH' },
    { token: 'GNO', base: 'ETH' },
    { token: 'WINGS', base: 'ETH' },
    { token: 'LUN', base: 'ETH' },
    { token: 'TKN', base: 'ETH' },
    { token: 'HMQ', base: 'ETH' },
    { token: 'ANT', base: 'ETH' },
    { token: 'BCAP', base: 'ETH' },
    { token: 'BAT', base: 'ETH' },
    { token: 'MYST', base: 'ETH' },
    { token: 'VSM', base: 'ETH' },
    { token: 'CFI', base: 'ETH' },
    { token: 'VERI', base: 'ETH' },
    { token: 'MGO', base: 'ETH' },
    { token: 'PTOY', base: 'ETH' },
    { token: 'BNT', base: 'ETH' },
    { token: 'QRL', base: 'ETH' },
    { token: 'GOOD', base: 'ETH' },
    { token: 'SNT', base: 'ETH' },
    { token: 'SONM', base: 'ETH' },
    { token: 'NMR', base: 'ETH' },
    { token: 'MCAP', base: 'ETH' },
    { token: 'PAY', base: 'ETH' },
    { token: 'ICE', base: 'ETH' },
    { token: 'PPT', base: 'ETH' },
    { token: 'FUNOLD', base: 'ETH' },
    { token: 'FUN', base: 'ETH' },
    { token: 'ADT', base: 'ETH' },
    { token: 'E4ROW', base: 'ETH' },
    { token: 'STORJ', base: 'ETH' },
    { token: 'NET', base: 'ETH' },
    { token: 'EOS', base: 'ETH' },
    { token: 'ADX', base: 'ETH' },
    { token: 'DRP', base: 'ETH' },
    { token: 'BET', base: 'ETH' },
    { token: 'PLBT', base: 'ETH' },
    { token: 'OMG', base: 'ETH' },
    { token: 'BNB', base: 'ETH' },
    { token: 'NEWB', base: 'ETH' },
    { token: 'XRL', base: 'ETH' },
    { token: 'MBRS', base: 'ETH' },
    { token: 'MTL', base: 'ETH' },
    { token: 'FUCK', base: 'ETH' },
    { token: 'NXX', base: 'ETH' },
    { token: 'BTH', base: 'ETH' },
    { token: 'PLR', base: 'ETH' },
    { token: 'CVC', base: 'ETH' },
    { token: 'MAYY', base: 'ETH' },
    { token: 'MAYN', base: 'ETH' },
    { token: 'LNK', base: 'ETH' },
    { token: 'SKIN', base: 'ETH' },
    { token: 'DGT', base: 'ETH' },
    { token: 'ECN', base: 'ETH' },
    // { token: 'TME', base: 'ETH' },
    { token: 'BCD', base: 'ETH' },
    { token: 'DEX', base: 'ETH' },
    { token: 'TIX', base: 'ETH' },
    { token: 'CDT', base: 'ETH' },
    { token: 'IXT', base: 'ETH' },
    { token: 'AIR', base: 'ETH' },
    { token: 'CAT', base: 'ETH' },
    { token: 'OAX', base: 'ETH' },
    { token: 'CLRT', base: 'ETH' },
    { token: 'MSP', base: 'ETH' },
    { token: 'BAS', base: 'ETH' },
    { token: 'KTN', base: 'ETH' },
    // { token: 'JET', base: 'ETH' },
    { token: 'BNC', base: 'ETH' },
    { token: 'DNT', base: 'ETH' },
    { token: 'CTR', base: 'ETH' },
    { token: 'BRAT', base: 'ETH' },
    { token: 'BQX', base: 'ETH' },
    { token: 'STX', base: 'ETH' },
    { token: 'FYN', base: 'ETH' },
    { token: 'CREDO', base: 'ETH' },
    { token: 'NIH', base: 'ETH' },
    { token: 'QAU', base: 'ETH' },
    { token: 'DENT', base: 'ETH' },
    { token: 'SHOUC', base: 'ETH' },
    { token: 'GUNS', base: 'ETH' },
    { token: 'DEL', base: 'ETH' },
    { token: 'SAN', base: 'ETH' },
    { token: 'IND', base: 'ETH' },
    { token: 'LUCK', base: 'ETH' },
    { token: 'RIYA', base: 'ETH' },
    // { token: 'RARE', base: 'ETH' },
    { token: 'ZRX', base: 'ETH' },
    { token: 'ETH', base: 'USD.DC' },
    { token: 'ETH', base: 'BTC.DC' },
  ],
};
