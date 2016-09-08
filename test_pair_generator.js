var API = require('./api.js');

var marketMakerConfig = {
  pairs: [
    {pair: 'TRMPY/ETH', theo: 0.3, minPrice: 0, maxPrice: 1, minEdge: 0.1, edgeStep: 0.05, ordersPerSide: 5, expires: 5},
    {pair: 'MKR/ETH', theo: 3, minPrice: 0, maxPrice: null, minEdge: 0.1, edgeStep: 0.05, ordersPerSide: 5, expires: 5},
  ]

};

var pairs = marketMakerConfig.pairs;
var newPairs = API.generateImpliedPairs(pairs);
console.log(pairs.map(function(x){return x.pair}));
console.log(newPairs);
