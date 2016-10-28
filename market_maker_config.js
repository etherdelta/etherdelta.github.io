var config = {
  pairs: [
    {
      pair: 'TRMPN/ETH', expires: 25,
      sellNum: 15, sellVolume: '(balance - onOrders) / n * (0.9 + Math.random()*0.1)', sellPrice: '0.9 + 0.099 * i / n',
      buyNum: 15, buyVolume: '(balance - onOrders) / n / price * (0.9 + Math.random()*0.1)', buyPrice: '0.75 - 0.35 * i / n'
    },
  ],
};

module.exports = config;
