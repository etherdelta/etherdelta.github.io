var config = {
  pairs: [
    {pair: 'MKR/ETH', theo: 2.5, minPrice: 0, maxPrice: undefined, minEdge: 0.2, edgeStep: 0.05, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPY/ETH', theo: 0.24, minPrice: 0, maxPrice: 1, minEdge: 0.19, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPN/ETH', theo: 0.76, minPrice: 0, maxPrice: 1, minEdge: 0.06, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    // {pair: 'ETCWY/ETH', theo: 0.075, minPrice: 0, maxPrice: 1, minEdge: 0.25, edgeStep: 0.25, ordersPerSide: 5, expires: 15000},
    // {pair: 'EPOSY/ETH', theo: 0.45, minPrice: 0, maxPrice: 1, minEdge: 0.1, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
  ],
  tokenPrices: {
    'ETH': 1.0,
    'MKR': 3.0,
    'DAO': 0.01,
    'PLU': 0.3,
    'DGD': 0,
    'EPOSY': 0.45,
    'ETCWY': 0.05,
    'TRMPY': 0.27,
  }
};

module.exports = config;
