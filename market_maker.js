const commandLineArgs = require('command-line-args');
const async = require('async');
const API = require('./api.js');
const marketMakerConfig = require('./market_maker_config.js');

const cli = [
  { name: 'help', alias: 'h', type: Boolean },
  { name: 'armed', type: Boolean, defaultValue: false },
];
const cliOptions = commandLineArgs(cli);

if (cliOptions.help) {
  console.log(cli);
} else {
  API.init(() => {
    API.logs(() => {
      const pairs = marketMakerConfig.pairs;
      API.getEtherDeltaTokenBalances(marketMakerConfig.account.address, (errBalances, balances) => {
        API.getOrdersRemote((err, result) => {
          if (!err) {
            async.eachSeries(
              pairs,
              (pair, callbackEach) => {
                let selectedToken;
                let selectedBase;
                const pairSplit = pair.pair ? pair.pair.split('/') : [];
                if (pairSplit.length === 2) {
                  selectedToken = API.getToken(pairSplit[0]);
                  selectedBase = API.getToken(pairSplit[1]);
                }
                let buyOrders = result.orders.filter(x => x.amount > 0);
                let sellOrders = result.orders.filter(x => x.amount < 0);
                sellOrders.sort((a, b) => a.price - b.price || b.id - a.id);
                buyOrders.sort((a, b) => b.price - a.price || a.id - b.id);
                buyOrders = buyOrders.filter(x => (
                    x.order.tokenGet === selectedToken.addr &&
                    x.order.tokenGive === selectedBase.addr));
                sellOrders = sellOrders.filter(x => (
                    x.order.tokenGive === selectedToken.addr &&
                    x.order.tokenGet === selectedBase.addr));
                const myBuyOrders = buyOrders.filter(x =>
                  x.order.user.toLowerCase() === marketMakerConfig.account.address.toLowerCase());
                const mySellOrders = sellOrders.filter(x =>
                  x.order.user.toLowerCase() === marketMakerConfig.account.address.toLowerCase());
                const myBuySize = myBuyOrders
                  .map(x => (
                      x.availableVolume *
                      x.price.toNumber() *
                      (API.getDivisor(selectedBase) /
                      API.getDivisor(selectedToken))
                    ))
                  .reduce((a, b) => a + b, 0);
                const mySellSize = mySellOrders
                  .map(x => Number(x.availableVolume))
                  .reduce((a, b) => a + b, 0);
                if (!balances[selectedToken.name]) {
                  Object.assign(balances, { [selectedToken.name]: 0 });
                }
                if (!balances[selectedBase.name]) {
                  Object.assign(balances, { [selectedBase.name]: 0 });
                }
                console.log(`${selectedToken.name}/${selectedBase.name}`);
                console.log('----------------------');
                console.log(
                  'Lowest offer',
                  sellOrders.length > 0
                    ? API.formatOrder(sellOrders[0], selectedToken, selectedBase)
                    : 'None');
                console.log(
                  'Highest bid',
                  buyOrders.length > 0
                    ? API.formatOrder(buyOrders[0], selectedToken, selectedBase)
                    : 'None');
                console.log(
                  'Balance',
                  API.utility.weiToEth(balances[selectedToken.name], API.getDivisor(selectedToken)),
                  selectedToken.name);
                console.log(
                  'Balance',
                  API.utility.weiToEth(balances[selectedBase.name], API.getDivisor(selectedBase)),
                  selectedBase.name);
                console.log(
                  'On buy orders',
                  API.utility.weiToEth(myBuySize, API.getDivisor(selectedBase)),
                  selectedBase.name);
                console.log(
                  'On sell orders',
                  API.utility.weiToEth(mySellSize, API.getDivisor(selectedToken)),
                  selectedToken.name);

                const orders = [];

                let n = pair.buyNum;
                let balance = balances[selectedBase.name]; // eslint-disable-line no-unused-vars
                let onOrders = myBuySize; // eslint-disable-line no-unused-vars
                let enabled = eval(pair.buyEnabled); // eslint-disable-line no-eval
                if (enabled) {
                  for (let i = 0; i < n; i += 1) {
                    const price = eval(pair.buyPrice); // eslint-disable-line no-eval
                    const volume = eval(pair.buyVolume); // eslint-disable-line no-eval
                    if (Math.abs(volume) > 0) {
                      orders.push({ price, volume });
                    }
                  }
                }
                n = pair.sellNum;
                balance = balances[selectedToken.name];
                onOrders = mySellSize;
                enabled = eval(pair.sellEnabled); // eslint-disable-line no-eval
                if (enabled) {
                  for (let i = 0; i < n; i += 1) {
                    const price = eval(pair.sellPrice); // eslint-disable-line no-eval
                    const volume = eval(pair.sellVolume); // eslint-disable-line no-eval
                    if (Math.abs(volume) > 0) {
                      orders.push({ price, volume: -volume });
                    }
                  }
                }

                API.publishOrders(
                  orders,
                  marketMakerConfig.account.address,
                  marketMakerConfig.account.privateKey,
                  pair.expires,
                  selectedToken,
                  selectedBase,
                  cliOptions.armed,
                  () => {
                    callbackEach(null);
                  });
              },
              () => {
                console.log('Done');
              });
          }
        });
      });
    });
  });
}
