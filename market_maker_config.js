var config = {
  account: {
    address: '',
    privateKey: ''
  },
  pairs: [
    {
      pair: '1ST/ETH', expires: 15000,
      sellEnabled: 'onOrders/balance<0.25', sellNum: 5, sellVolume: '(balance - onOrders) / n * (0.9 + Math.random()*0.1)', sellPrice: '0.0125 + 0.0125 * i / n',
      buyEnabled: 'onOrders/balance<0.25', buyNum: 5, buyVolume: '(balance - onOrders) / n / price * (0.9 + Math.random()*0.1)', buyPrice: '0.008 - 0.004 * i / n'
    },
  ],
};

module.exports = config;
