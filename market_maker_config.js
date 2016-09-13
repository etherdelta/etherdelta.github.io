var config = {
  pairs: [
    {pair: 'MKR/ETH', theo: 2.5, minPrice: 0, maxPrice: undefined, minEdge: 0.2, edgeStep: 0.05, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPY/ETH', theo: 0.30, minPrice: 0, maxPrice: 1, minEdge: 0.25, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
    {pair: 'TRMPN/ETH', theo: 0.70, minPrice: 0, maxPrice: 1, minEdge: 0.11, edgeStep: 0.075, ordersPerSide: 5, expires: 15000},
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
    {name: 'TRMPY', price: 0.30},
  ]
};

module.exports = config;
