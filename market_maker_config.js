var config = {
  pairs: [
    {
      pair: 'TRMPN/ETH', expires: 25,
      sellNum: 5, sellVolume: '(balance - onOrders) / n', sellPrice: '0.9 + 0.025 * i',
      buyNum: 5, buyVolume: '(balance - onOrders) / n / price', buyPrice: '0.8 - 0.05 * i'
    },
  ],
};

module.exports = config;
