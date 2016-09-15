var Web3 = require('web3');
var utility = require('./common/utility.js');
var translations = require('./translations.js');
var request = require('request');
var sha256 = require('js-sha256').sha256;
var BigNumber = require('bignumber.js');
require('datejs');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');

function Main() {
}
Main.alertInfo = function(message) {
  console.log(message);
  alertify.message(message);
}
Main.alertDialog = function(message) {
  console.log(message);
  alertify.alert('Alert', message, function(){});
}
Main.alertWarning = function(message) {
  console.log(message);
  alertify.warning(message);
}
Main.alertError = function(message) {
  console.log(message);
  alertify.error(message);
}
Main.alertSuccess = function(message) {
  console.log(message);
  alertify.success(message);
}
Main.alertTxResult = function(err, result) {
  if (result.txHash) {
    Main.alertDialog('You just created an Ethereum transaction. Track its progress here: <a href="http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+result.txHash+'" target="_blank">'+result.txHash+'</a>.');
  } else {
    Main.alertError('You tried to send an Ethereum transaction but there was an error: '+err);
  }
}
Main.enableTooltips = function() {
  $('[data-toggle="tooltip"]').tooltip();
}
Main.createCookie = function(name,value,days) {
  if (localStorage) {
    localStorage.setItem(name, value);
  } else {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
  }
}
Main.readCookie = function(name) {
  if (localStorage) {
    return localStorage.getItem(name);
  } else {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
}
Main.eraseCookie = function(name) {
  if (localStorage) {
    localStorage.removeItem(name);
  } else {
    createCookie(name,"",-1);
  }
}
Main.logout = function() {
  addrs = [config.ethAddr];
  pks = [config.ethAddrPrivateKey];
  selectedAccount = 0;
  nonce = undefined;
  Main.initMarket(function(){});
}
Main.createAccount = function() {
  var newAccount = utility.createAccount();
  var addr = newAccount.address;
  var pk = newAccount.privateKey;
  Main.addAccount(addr, pk);
  Main.alertDialog('You just created an Ethereum account: '+addr+'.');
}
Main.deleteAccount = function() {
  addrs.splice(selectedAccount, 1);
  pks.splice(selectedAccount, 1);
  selectedAccount = 0;
  nonce = undefined;
  Main.initMarket(function(){});
}
Main.selectAccount = function(i) {
  selectedAccount = i;
  nonce = undefined;
  Main.initMarket(function(){});
}
Main.addAccount = function(addr, pk) {
  if (addr.slice(0,2)!='0x') addr = '0x'+addr;
  if (pk.slice(0,2)=='0x') pk = pk.slice(2);
  addr = utility.toChecksumAddress(addr);
  if (pk!=undefined && pk!='' && !utility.verifyPrivateKey(addr, pk)) {
    Main.alertDialog('For account '+addr+', the private key is invalid.');
  } else if (!web3.isAddress(addr)) {
    Main.alertDialog('The specified address, '+addr+', is invalid.');
  } else {
    addrs.push(addr);
    pks.push(pk);
    selectedAccount = addrs.length-1;
    nonce = undefined;
    Main.initMarket(function(){});
  }
}
Main.showPrivateKey = function() {
  var addr = addrs[selectedAccount];
  var pk = pks[selectedAccount];
  if (pk==undefined || pk=='') {
    Main.alertDialog('For account '+addr+', there is no private key available. You can still transact if you are connected to Ethereum and the account is unlocked.');
  } else {
    Main.alertDialog('For account '+addr+', the private key is '+pk+'.');
  }
}
Main.addressLink = function(address) {
  return 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+address;
}
Main.contractAddr = function(addr) {
  gitterMessagesCache = {}; //clear gitter message cache
  config.contractEtherDeltaAddr = addr;
  Main.init(function(){});
  Main.initMarket(function(){});
}
Main.connectionTest = function() {
  if (connection) return connection;
  connection = {connection: 'Proxy', provider: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io', testnet: config.ethTestnet};
  try {
    if (web3.currentProvider) {
      web3.eth.coinbase;
      connection = {connection: 'RPC', provider: config.ethProvider, testnet: config.ethTestnet};
    }
  } catch(err) {
    web3.setProvider(undefined);
  }
  new EJS({url: config.homeURL+'/templates/'+'connection_description.ejs'}).update('connection', {translation: translation, connection: connection, contracts: config.contractEtherDeltaAddrs, contractAddr: config.contractEtherDeltaAddr, contractLink: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+config.contractEtherDeltaAddr});
  return connection;
}
Main.displayAccounts = function(callback) {
  if (Main.connectionTest().connection=='RPC') {
    $('#pk_div').hide();
  }
  if (addrs.length<=0 || addrs.length!=pks.length) {
    addrs = [config.ethAddr];
    pks = [config.ethAddrPrivateKey];
    selectedAccount = 0;
  }
  async.map(addrs,
    function(addr, callbackMap) {
      utility.getBalance(web3, addr, function(err, balance) {
        callbackMap(null, {addr: addr, balance: balance});
      });
    },
    function(err, addresses) {
      new EJS({url: config.homeURL+'/templates/'+'addresses.ejs'}).update('addresses', {translation: translation, addresses: addresses, selectedAccount: selectedAccount});
      callback();
    }
  );
}
Main.displayLanguages = function(callback) {
  var languages = Object.keys(translations);
  new EJS({url: config.homeURL+'/templates/'+'languages.ejs'}).update('languages', {translation: translation, languages: languages, language: language});
  callback();
}
Main.selectLanguage = function(newLanguage) {
  language = newLanguage;
  translation = translations[language];
  Main.init(function(){});
  Main.refresh(function(){}, true);
}
Main.loadEvents = function(callback) {
  utility.blockNumber(web3, function(err, blockNumber) {
    blockTimeSnapshot = {blockNumber: blockNumber, date: new Date()};
    var startBlock = 0;
    // startBlock = blockNumber-15000;
    for (id in eventsCache) {
      var event = eventsCache[id];
      if (event.blockNumber>startBlock && event.address==config.contractEtherDeltaAddr) {
        startBlock = event.blockNumber;
      }
      for (arg in event.args) {
        if (typeof(event.args[arg])=='string' && event.args[arg].slice(0,2)!='0x') {
          event.args[arg] = new BigNumber(event.args[arg]);
        }
      }
    }
    utility.logsOnce(web3, contractEtherDelta, config.contractEtherDeltaAddr, startBlock, 'latest', function(err, events) {
      var newEvents = 0;
      events.forEach(function(event){
        if (!eventsCache[event.transactionHash+event.logIndex]) {
          newEvents++;
          event.txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
          eventsCache[event.transactionHash+event.logIndex] = event;
        }
      })
      Main.createCookie(config.eventsCacheCookie, JSON.stringify(eventsCache), 999);
      callback(newEvents);
    });
  });
}
Main.displayMyTransactions = function(callback) {
  //orders
  Main.getOrders(function(orders, blockNumber) {
    //only include orders by the selected user
    orders = orders.filter(function(order){return addrs[selectedAccount].toLowerCase()==order.order.user.toLowerCase()});
    //final order filtering and sorting
    var buyOrders = orders.filter(function(x){return x.amount>0});
    var sellOrders = orders.filter(function(x){return x.amount<0});
    sellOrders.sort(function(a,b){ return b.price - a.price || b.id - a.id });
    buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
    buyOrders = buyOrders.slice(0,25); //show 25 best orders
    sellOrders = sellOrders.slice(0,25); //show 25 best orders
    //events
    var myEvents = [];
    var events = Object.values(eventsCache);
    events.forEach(function(event){
      if (event.event=='Trade' && event.address==config.contractEtherDeltaAddr && (event.args.get.toLowerCase()==addrs[selectedAccount].toLowerCase() || event.args.give.toLowerCase()==addrs[selectedAccount].toLowerCase())) {
        var trade;
        if (event.args.amountGive.toNumber()>0 && event.args.amountGet.toNumber()>0) { //don't show trades involving 0 amounts
          if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
            //sell
            trade = {amount: -event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet).mul(Main.getDivisor(event.args.tokenGet)).div(Main.getDivisor(event.args.tokenGive)), buyer: event.args.get, seller: event.args.give};
          } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
            //buy
            trade = {amount: event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive).mul(Main.getDivisor(event.args.tokenGive)).div(Main.getDivisor(event.args.tokenGet)), buyer: event.args.give, seller: event.args.get};
          }
        }
        if (trade) {
          var txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
          myEvents.push({trade: trade, id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, txLink: txLink});
        }
      } else if (event.event=='Deposit' && event.address==config.contractEtherDeltaAddr && (event.args.token==selectedBase.addr || event.args.token==selectedToken.addr) && event.args.user.toLowerCase()==addrs[selectedAccount].toLowerCase()) {
        var txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
        var deposit = {token: event.args.token==selectedToken.addr ? selectedToken : selectedBase, amount: event.args.amount, balance: event.args.balance};
        myEvents.push({deposit: deposit, id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, txLink: txLink});
      } else if (event.event=='Withdraw' && event.address==config.contractEtherDeltaAddr && (event.args.token==selectedBase.addr || event.args.token==selectedToken.addr) && event.args.user.toLowerCase()==addrs[selectedAccount].toLowerCase()) {
        var txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
        var withdraw = {token: event.args.token==selectedToken.addr ? selectedToken : selectedBase, amount: event.args.amount, balance: event.args.balance};
        myEvents.push({withdraw: withdraw, id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, txLink: txLink});
      }
    });
    myEvents.sort(function(a,b){ return b.id - a.id });
    //pending transactions
    async.map(pendingTransactions,
      function(tx, callbackMap) {
        utility.txReceipt(web3, tx.txHash, function(err, result){
          if (result && !err) {
            callbackMap(null, undefined);
          } else {
            callbackMap(null, tx);
          }
        });
      },
      function(err, results) {
        pendingTransactions = results.filter(function(x){return x!=undefined});
        //display the template
        try {
          new EJS({url: config.homeURL+'/templates/'+'my_events.ejs'}).update('my_events', {translation: translation, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, myEvents: myEvents, pendingTransactions: pendingTransactions, buyOrders: buyOrders, sellOrders: sellOrders, blockNumber: blockNumber});
          $('table').stickyTableHeaders({scrollableArea: $('.scroll-container')});
          callback();
        } catch (err) {
          console.log(err)
        }
      }
    );
  });
}
Main.displayVolumes = function(callback) {
  var tokenVolumes = {};
  var pairVolumes = {};
  var timeFrames = [86400*1000*7, 86400*1000*1];
  var mainBases = ['DUSD','ETH']; //in order of priority
  var now = new Date();
  //the default pairs
  for (var i=1; i<config.pairs.length; i++) {
    var token = Main.getToken(config.pairs[i].token);
    var base = Main.getToken(config.pairs[i].base);
    if (token && base) {
      var pair = token.name+'/'+base.name;
      if (!pairVolumes[pair]) pairVolumes[pair] = {token: token, base: base, volumes: Array(timeFrames.length).fill(0), ethVolumes: Array(timeFrames.length).fill(0)};
    }
  }
  //get trading volume
  var events = Object.values(eventsCache);
  events.forEach(function(event){
    if (event.event=='Trade' && event.address==config.contractEtherDeltaAddr) {
      var tokenGet = Main.getToken(event.args.tokenGet);
      var tokenGive = Main.getToken(event.args.tokenGive);
      var amountGet = event.args.amountGet;
      var amountGive = event.args.amountGive;
      if (tokenGet && tokenGive) {
        if (!tokenVolumes[tokenGet.name]) tokenVolumes[tokenGet.name] = {token: tokenGet, volumes: Array(timeFrames.length).fill(0), ethVolumes: Array(timeFrames.length).fill(0)};
        if (!tokenVolumes[tokenGive.name]) tokenVolumes[tokenGive.name] = {token: tokenGive, volumes: Array(timeFrames.length).fill(0), ethVolumes: Array(timeFrames.length).fill(0)};
        var token;
        var base;
        var volume = 0;
        var ethVolume;
        mainBases.some(function(mainBase){
          if (tokenGive.name==mainBase) {
            token = tokenGet;
            base = tokenGive;
            volume = amountGet;
            return true;
          } else if (tokenGet.name==mainBase) {
            token = tokenGive;
            base = tokenGet;
            volume = amountGive;
            return true;
          }
        });
        if (!token && !base && tokenGive.name>=tokenGet.name) {
          token = tokenGive;
          base = tokenGet;
          volume = amountGive;
        } else if (!token && !base && tokenGive.name<tokenGet.name) {
          token = tokenGet;
          base = tokenGive;
          volume = amountGet;
        }
        if (tokenGive.name=='ETH') ethVolume = amountGive;
        if (tokenGet.name=='ETH') ethVolume = amountGet;
        var pair = token.name+'/'+base.name;
        if (!pairVolumes[pair]) pairVolumes[pair] = {token: token, base: base, volumes: Array(timeFrames.length).fill(0), ethVolumes: Array(timeFrames.length).fill(0)};
        for (var i=0; i<timeFrames.length; i++) {
          var timeFrame = timeFrames[i];
          if (now-Main.blockTime(event.blockNumber)<timeFrame) {
            tokenVolumes[tokenGet.name].volumes[i] += amountGet.toNumber();
            tokenVolumes[tokenGive.name].volumes[i] += amountGive.toNumber();
            pairVolumes[pair].volumes[i] += volume.toNumber();
            if (ethVolume) {
              tokenVolumes[tokenGet.name].ethVolumes[i] += ethVolume.toNumber();
              tokenVolumes[tokenGive.name].ethVolumes[i] += ethVolume.toNumber();
              pairVolumes[pair].ethVolumes[i] += ethVolume.toNumber();
            }
          }
        }
      }
    }
  });
  tokenVolumes = Object.values(tokenVolumes);
  tokenVolumes.sort(function(a,b){return b.ethVolumes[0]-a.ethVolumes[0]});
  pairVolumes = Object.values(pairVolumes);
  pairVolumes.sort(function(a,b){return b.ethVolumes[0]-a.ethVolumes[0]});
  new EJS({url: config.homeURL+'/templates/'+'volume.ejs'}).update('volume', {translation: translation, tokenVolumes: tokenVolumes, pairVolumes: pairVolumes});
  callback();
}
Main.displayTradesAndCharts = function(callback) {
  //get the trade list
  var events = Object.values(eventsCache);
  var trades = [];
  events.forEach(function(event){
    if (event.event=='Trade' && event.address==config.contractEtherDeltaAddr) {
      if (event.args.amountGive.toNumber()>0 && event.args.amountGet.toNumber()>0) { //don't show trades involving 0 amounts
        var trade;
        if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
          //sell
          trade = {amount: -event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet).mul(Main.getDivisor(event.args.tokenGet)).div(Main.getDivisor(event.args.tokenGive)), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.get, seller: event.args.give};
        } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
          //buy
          trade = {amount: event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive).mul(Main.getDivisor(event.args.tokenGive)).div(Main.getDivisor(event.args.tokenGet)), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.give, seller: event.args.get};
        }
        if (trade) {
          trade.txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
          trades.push(trade);
        }
      }
    }
  });
  trades.sort(function(a,b){ return b.id - a.id });
  new EJS({url: config.homeURL+'/templates/'+'trades.ejs'}).update('trades', {translation: translation, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, trades: trades});
  $('table').stickyTableHeaders({scrollableArea: $('.scroll-container')});

  //charts
  new EJS({url: config.homeURL+'/templates/'+'chart_price.ejs'}).update('chart_price', {translation: translation});

  //line chart
  var now = new Date();
  // var data = trades.filter(function(trade){return now-Main.blockTime(trade.blockNumber)<86400*1000*7}).map(function(trade){return [Main.blockTime(trade.blockNumber), trade.price.toNumber()]});
  var data = trades.slice(0,50).map(function(trade){return [Main.blockTime(trade.blockNumber), trade.price.toNumber()]});
  Main.lineChart('chart_price_div', '', 'date', 'number', 'Time', 'Price', data);

  //candlestick chart
  // function getDay(d) {
  //   return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  // }
  // var days = {};
  // for (var i=trades.length-1; i>=0; i--) {
  //   var trade = trades[i];
  //   var date = Main.blockTime(trade.blockNumber);
  //   if (now-date<86400*1000*7) {
  //     if (!days[getDay(date)]) days[getDay(date)] = [];
  //     days[getDay(date)].push(trade.price.toNumber());
  //   }
  // }
  // var data = [];
  // var date = new Date(now.getTime() - 86400*1000*7);
  // while(date<now) {
  //   var day = getDay(date);
  //   var points = days[day];
  //   if (points && points.length>0) {
  //     if (points[points.length-1]>points[0]) {
  //       data.push([day, points.min(),points[0],points[points.length-1],points.max()]);
  //     } else {
  //       data.push([day, points.max(),points[points.length-1],points[0],points.min()]);
  //     }
  //   }
  //   date = new Date(date.getTime()+86400*1000);
  // }
  // Main.candlestickChart('chart_price_div', '', 'Day', 'Price', data);

  callback();
}
Main.candlestickChart = function(elem, title, xtitle, ytitle, data) {
  var dataTable = google.visualization.arrayToDataTable(data, true);
  var options = {
    hAxis: {title: xtitle},
    vAxis: {title: ytitle},
    legend:'none',
    enableInteractivity: true,
    title: title,
    candlestick: {
      fallingColor: { strokeWidth: 0, fill: '#cc0000' },
      risingColor: { strokeWidth: 0, fill: '#00cc00' }
    }
  };
  var chart = new google.visualization.CandlestickChart(document.getElementById(elem));
  chart.draw(dataTable, options);
}
Main.lineChart = function(elem, title, xtype, ytype, xtitle, ytitle, data) {
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn(xtype, 'X');
  dataTable.addColumn(ytype, ytitle);
  dataTable.addRows(data);
  var options = {
    hAxis: {title: xtitle},
    vAxis: {title: ytitle},
    legend: {position: 'none'},
    enableInteractivity: true,
    title: title
  };
  var chart = new google.visualization.LineChart(document.getElementById(elem));
  chart.draw(dataTable, options);
}
Main.getOrders = function(callback) {
  utility.blockNumber(web3, function(err, blockNumber) {
    var rawOrders = [];
    //get orders from gitter messages
    var expectedKeys = JSON.stringify(['amountGet','amountGive','expires','nonce','r','s','tokenGet','tokenGive','user','v']);
    Object.keys(gitterMessagesCache).forEach(function(id) {
      var message = JSON.parse(JSON.stringify(gitterMessagesCache[id]));
      for (key in message) {
        if (typeof(message[key])=='number') message[key] = new BigNumber(message[key]);
      }
      if (typeof(message)=='object' && JSON.stringify(Object.keys(message).sort())==expectedKeys) {
        var rawOrder = message;
        rawOrder.id = id;
        rawOrders.push(rawOrder);
      }
    });
    //get orders from events
    var events = Object.values(eventsCache);
    events.forEach(function(event){
      if (event.event=='Order' && event.address==config.contractEtherDeltaAddr) {
        var rawOrder = event.args;
        rawOrder.id = event.blockNumber*1000+event.transactionIndex;
        rawOrders.push(rawOrder);
      }
    });
    //filter orders
    var orders = [];
    rawOrders.forEach(function(rawOrder){
      var order;
      if (rawOrder.tokenGet==selectedToken.addr && rawOrder.tokenGive==selectedBase.addr) {
        //buy
        order = {amount: rawOrder.amountGet, price: rawOrder.amountGive.div(rawOrder.amountGet).mul(Main.getDivisor(rawOrder.tokenGet)).div(Main.getDivisor(rawOrder.tokenGive)), id: rawOrder.id, order: rawOrder};
      } else if (rawOrder.tokenGet==selectedBase.addr && rawOrder.tokenGive==selectedToken.addr) {
        //sell
        order = {amount: -rawOrder.amountGive, price: rawOrder.amountGet.div(rawOrder.amountGive).mul(Main.getDivisor(rawOrder.tokenGive)).div(Main.getDivisor(rawOrder.tokenGet)), id: rawOrder.id, order: rawOrder};
      }
      if (order && !deadOrders[order.id]) orders.push(order);
    });
    //get available volumes
    async.reduce(orders, [],
      function(memo, order, callbackReduce) {
        if (blockNumber<Number(order.order.expires)) {
          utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'availableVolume', [order.order.tokenGet, Number(order.order.amountGet), order.order.tokenGive, Number(order.order.amountGive), Number(order.order.expires), Number(order.order.nonce), order.order.user, Number(order.order.v), order.order.r, order.order.s], function(err, result) {
            if (!err) {
              if (order.amount>=0) {
                order.availableVolume = result;
                order.ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), Main.getDivisor(selectedToken));
              } else {
                order.availableVolume = result.div(order.price).mul(Main.getDivisor(order.order.tokenGive)).div(Main.getDivisor(order.order.tokenGet));
                order.ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), Main.getDivisor(selectedToken));
              }
              memo.push(order);
              callbackReduce(null, memo);
            } else {
              callbackReduce(null, memo);
            }
          });
        } else {
          deadOrders[order.id] = true;
          callbackReduce(null, memo);
        }
      },
      function(err, orders){
        //save dead orders to storage
        Main.createCookie(config.deadOrdersCookie, JSON.stringify(deadOrders), 999);
        callback(orders, blockNumber);
      }
    );
  });
}
Main.displayOrderbook = function(callback) {
  Main.getOrders(function(orders, blockNumber) {
    //remove orders below the min order limit
    orders = orders.filter(function(order){return Number(order.ethAvailableVolume).toFixed(3)>=minOrderSize});
    //final order filtering and sorting
    var buyOrders = orders.filter(function(x){return x.amount>0});
    var sellOrders = orders.filter(function(x){return x.amount<0});
    sellOrders.sort(function(a,b){ return b.price - a.price || b.id - a.id });
    buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
    buyOrders = buyOrders.slice(0,25); //show 25 best orders
    sellOrders = sellOrders.slice(0,25); //show 25 best orders
    //display the template
    new EJS({url: config.homeURL+'/templates/'+'order_book.ejs'}).update('order_book', {translation: translation, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, buyOrders: buyOrders, sellOrders: sellOrders, blockNumber: blockNumber});
    $("[data-toggle=popover]").popover({
      html : true,
      content: function() {
        var content = $(this).attr("data-popover-content");
        return $(content).children(".popover-body").html();
      },
      title: function() {
        var title = $(this).attr("data-popover-content");
        return $(title).children(".popover-heading").html();
      }
    });
    $('#order_book_scroll')[0].scrollTop = $('#order_book_mid').position().top-$('#order_book_scroll')[0].clientHeight/2-$('#order_book_mid')[0].clientHeight;
    callback();
  });
}
Main.displayTokensAndBases = function(callback) {
  new EJS({url: config.homeURL+'/templates/'+'tokens.ejs'}).update('tokens', {translation: translation, tokens: config.tokens, selectedToken: selectedToken});
  new EJS({url: config.homeURL+'/templates/'+'bases.ejs'}).update('bases', {translation: translation, tokens: config.tokens, selectedBase: selectedBase});
  callback();
}
Main.displayAllBalances = function(callback) {
  var zeroAddr = '0x0000000000000000000000000000000000000000';
  //add selected token and base to config.tokens
  var tempTokens = config.tokens;
  if (config.tokens.filter(function(x){return x.addr==selectedToken.addr}).length==0) {
    tempTokens.push(selectedToken);
  }
  if (config.tokens.filter(function(x){return x.addr==selectedBase.addr}).length==0) {
    tempTokens.push(selectedBase);
  }
  async.map(tempTokens,
    function(token, callbackMap) {
      if (token.addr==zeroAddr) {
        utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [token.addr, addrs[selectedAccount]], function(err, result) {
          var balance = result;
          if (token.name==selectedToken.name || token.name==selectedBase.name) {
            new EJS({url: config.homeURL+'/templates/'+'balance.ejs'}).update(token.name==selectedToken.name ? 'balance_token' : 'balance_base', {translation: translation, selected: token, balance: balance});
          }
          utility.getBalance(web3, addrs[selectedAccount], function(err, result) {
            var balanceOutside = result;
            var balanceObj = {token: token, balance: balance, balanceOutside: balanceOutside, tokenLink: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+addrs[selectedAccount]};
            callbackMap(null, balanceObj);
          });
        });
      } else {
        utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [token.addr, addrs[selectedAccount]], function(err, result) {
          var balance = result;
          if (token.name==selectedToken.name || token.name==selectedBase.name) {
            new EJS({url: config.homeURL+'/templates/'+'balance.ejs'}).update(token.name==selectedToken.name ? 'balance_token' : 'balance_base', {translation: translation, selected: token, balance: balance});
          }
          utility.call(web3, contractToken, token.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
            var balanceOutside = result;
            var balanceObj = {token: token, balance: balance, balanceOutside: balanceOutside, tokenLink: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/token/'+token.addr};
            callbackMap(null, balanceObj);
          });
        });
      }
    },
    function(err, balances){
      new EJS({url: config.homeURL+'/templates/'+'balances.ejs'}).update('balances', {translation: translation, balances: balances, addr: addrs[selectedAccount]});
      callback();
    }
  );
}
Main.transfer = function(addr, amount, toAddr) {
  amount = utility.ethToWei(amount, Main.getDivisor(addr));
  var token = Main.getToken(addr);
  if (amount<=0) {
    Main.alertError('You must specify a valid amount to transfer.');
    return;
  }
  if (!web3.isAddress(toAddr) || toAddr=='0x0000000000000000000000000000000000000000') {
    Main.alertError('Please specify a valid address.');
  } else if (addr=='0x0000000000000000000000000000000000000000') {
    Main.alertError('Please use your wallet software to transfer plain Ether.');
  } else {
    utility.call(web3, contractToken, token.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
      if (amount>result) amount = result;
      utility.send(web3, contractToken, token.addr, 'transfer', [toAddr, amount, {gas: token.gasDeposit, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
        txHash = result.txHash;
        nonce = result.nonce;
        Main.addPending(err, {txHash: result.txHash});
        Main.alertTxResult(err, result);
      });
    });
  }
}
Main.deposit = function(addr, amount) {
  amount = utility.ethToWei(amount, Main.getDivisor(addr));
  var token = Main.getToken(addr);
  if (amount<=0) {
    Main.alertError('You must specify a valid amount to deposit.');
    return;
  }
  if (addr=='0x0000000000000000000000000000000000000000') {
    utility.getBalance(web3, addr, function(err, result) {
      if (amount > result && amount < result * 1.1) amount = result;
      if (amount <= result) {
        utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'deposit', [{gas: token.gasDeposit, value: amount}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          Main.addPending(err, {txHash: result.txHash});
          Main.alertTxResult(err, result);
        });
      } else {
        Main.alertError("You don't have enough balance.")
      }
    });
  } else {
    utility.call(web3, contractToken, token.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
      if (amount > result && amount < result * 1.1) amount = result;
      if (amount <= result) {
        utility.send(web3, contractToken, addr, 'approve', [config.contractEtherDeltaAddr, amount, {gas: token.gasApprove, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          Main.addPending(err, {txHash: result.txHash});
          Main.alertTxResult(err, result);
          utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'depositToken', [addr, amount, {gas: token.gasDeposit, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
            txHash = result.txHash;
            nonce = result.nonce;
            Main.addPending(err, {txHash: result.txHash});
            Main.alertTxResult(err, result);
          });
        });
      } else {
        Main.alertError("You don't have enough balance.")
      }
    });
  }
}
Main.withdraw = function(addr, amount) {
  amount = utility.ethToWei(amount, Main.getDivisor(addr));
  var token = Main.getToken(addr);
  if (amount<=0) {
    Main.alertError('You must specify a valid amount to withdraw.');
    return;
  }
  utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [addr, addrs[selectedAccount]], function(err, result) {
    var balance = result;
    //if you try to withdraw more than your balance, the amount will be modified so that you withdraw your exact balance:
    if (amount>balance) {
      amount = balance;
    }
    if (addr=='0x0000000000000000000000000000000000000000') {
      utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'withdraw', [amount, {gas: token.gasWithdraw, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
        txHash = result.txHash;
        nonce = result.nonce;
        Main.addPending(err, {txHash: result.txHash});
        Main.alertTxResult(err, result);
      });
    } else {
      utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'withdrawToken', [addr, amount, {gas: token.gasWithdraw, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
        txHash = result.txHash;
        nonce = result.nonce;
        Main.addPending(err, {txHash: result.txHash});
        Main.alertTxResult(err, result);
      });
    }
  });
}
Main.order = function(baseAddr, tokenAddr, direction, amount, price, expires, refresh) {
  utility.blockNumber(web3, function(err, blockNumber) {
    var order = {baseAddr: baseAddr, tokenAddr: tokenAddr, direction: direction, amount: amount, price: price, expires: expires, refresh: refresh, nextExpiration: 0};
    if (blockNumber>=order.nextExpiration) {
      if (order.nextExpiration==0) {
        order.nextExpiration = Number(order.expires) + blockNumber;
        order.nonce = utility.getRandomInt(0,Math.pow(2,32));
        Main.publishOrder(order.baseAddr, order.tokenAddr, order.direction, order.amount, order.price, order.nextExpiration, order.nonce);
      } else {
        order = undefined;
      }
    }
  });
}
Main.publishOrder = function(baseAddr, tokenAddr, direction, amount, price, expires, orderNonce) {
  var tokenGet = undefined;
  var tokenGive = undefined;
  var amountGet = undefined;
  var amountGive = undefined;
  if (amount<minOrderSize) {
    Main.alertError('The minimum order size is '+minOrderSize+'.');
    return;
  }
  if (direction=='buy') {
    tokenGet = tokenAddr;
    tokenGive = baseAddr;
    amountGet = utility.ethToWei(amount, Main.getDivisor(tokenGet));
    amountGive = utility.ethToWei(amount * price, Main.getDivisor(tokenGive));
  } else if (direction=='sell') {
    tokenGet = baseAddr;
    tokenGive = tokenAddr;
    amountGet = utility.ethToWei(amount * price, Main.getDivisor(tokenGet));
    amountGive = utility.ethToWei(amount, Main.getDivisor(tokenGive));
  } else {
    return;
  }
  utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [tokenGive, addrs[selectedAccount]], function(err, result) {
    var balance = result;
    if (balance.lt(new BigNumber(amountGive))) {
      Main.alertError('You do not have enough funds to send this order.');
    } else {
      var condensed = utility.pack([tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 256, 160, 256, 256, 256]);
      var hash = sha256(new Buffer(condensed,'hex'));
      utility.sign(web3, addrs[selectedAccount], hash, pks[selectedAccount], function(err, sig) {
        if (err) {
          Main.alertError('Could not sign order because of an error: '+err);
        } else {
          // Send order to Gitter channel:
          var order = {tokenGet: tokenGet, amountGet: amountGet, tokenGive: tokenGive, amountGive: amountGive, expires: expires, nonce: orderNonce, v: sig.v, r: sig.r, s: sig.s, user: addrs[selectedAccount]};
          utility.postGitterMessage(JSON.stringify(order), function(err, result){
            if (!err) {
              Main.alertSuccess('You sent an order to the order book!');
              Main.refresh(function(){});
            } else {
              Main.alertError('You tried sending an order to the order book but there was an error.');
            }
          });
        }
      });
    }
  });
}
Main.cancelOrder = function(order) {
  order = JSON.parse(decodeURIComponent(order));
  var token = Main.getToken(order.tokenGet);
  if (order.user.toLowerCase()==addrs[selectedAccount].toLowerCase()) {
    utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'cancelOrder', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), Number(order.v), order.r, order.s, {gas: token.gasTrade, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.addPending(err, {txHash: result.txHash});
      Main.alertTxResult(err, result);
    });
  }
}
Main.trade = function(kind, order, amount) {
  if (kind=='sell') {
    //if I'm selling a bid, the buyer is getting the token
    amount = utility.ethToWei(amount, Main.getDivisor(order.tokenGet));
  } else if (kind=='buy') {
    //if I'm buying an offer, the seller is getting the base and giving the token, so must convert to get terms
    amount = utility.ethToWei(amount * Number(order.amountGet) / Number(order.amountGive), Main.getDivisor(order.tokenGive));
  } else {
    return;
  }
  var token = Main.getToken(order.tokenGet);
  utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [order.tokenGet, addrs[selectedAccount]], function(err, result) {
    var availableBalance = result;
    utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'availableVolume', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s], function(err, result) {
      var availableVolume = result;
      if (amount>availableBalance) amount = availableBalance;
      if (amount>availableVolume) amount = availableVolume;
      utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'testTrade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s, amount, addrs[selectedAccount]], function(err, result) {
        if (result && amount>0) {
          utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'trade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s, amount, {gas: token.gasTrade, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
            txHash = result.txHash;
            nonce = result.nonce;
            Main.addPending(err, {txHash: result.txHash});
            Main.alertTxResult(err, result);
          });
        } else {
          Main.alertError("You tried placing an order, but the order failed. Either the order already traded or you or the counterparty do not have enough funds.");
        }
      });
    });
  });
}
Main.getGitterMessages = function(callback) {
  console.log('Getting Gitter');
  utility.getGitterMessages(gitterMessagesCache, function(err, result){
    if (!err) {
      gitterMessagesCache = result.gitterMessages;
      Main.createCookie(config.gitterCacheCookie, JSON.stringify(gitterMessagesCache), 999);
      console.log('Done getting Gitter');
    }
    callback();
  });
}
Main.displayContent = function(callback) {
  window.title = translation.title;
  new EJS({url: config.homeURL+'/templates/'+'family.ejs'}).update('family', {translation: translation});
  new EJS({url: config.homeURL+'/templates/'+'guides.ejs'}).update('guides', {translation: translation});
  new EJS({url: config.homeURL+'/templates/'+'announcements.ejs'}).update('announcements', {translation: translation});
  new EJS({url: config.homeURL+'/templates/'+'videos.ejs'}).update('videos', {translation: translation});
  $('.description_label').html(translation.description);
  $('.toggle_navigation_label').html(translation.toggle_navigation);
  $('.add_account_label').html(translation.add_account);
  $('.address_label').html(translation.address);
  $('.private_key_label').html(translation.private_key);
  $('.cancel_label').html(translation.cancel);
  $('.buy_label').html(translation.buy);
  $('.sell_label').html(translation.sell);
  $('.order_label').html(translation.order);
  $('.amount_label').html(translation.amount);
  $('.other_token_label').html(translation.other_token);
  $('.other_base_label').html(translation.other_base);
  $('.name_label').html(translation.name);
  $('.decimals_label').html(translation.disivor);
  $('.go_label').html(translation.go);
  // $('.chat_label').html(translation.chat);
  $('.send_label').html(translation.send);
  callback();
}
Main.blockTime = function(block) {
  return new Date(blockTimeSnapshot.date.getTime()+((block - blockTimeSnapshot.blockNumber)*1000*14));
}
Main.addPending = function(err, tx) {
  if (!err) {
    tx.txLink = 'https://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+tx.txHash;
    pendingTransactions.push(tx);
    Main.displayMyTransactions(function(){});
  }
}
Main.updateUrl = function() {
  var tokenName = selectedToken.name;
  var baseName = selectedBase.name;
  if (config.tokens.filter(function(x){return x.name==tokenName}).length==0) tokenName = selectedToken.addr;
  if (config.tokens.filter(function(x){return x.name==baseName}).length==0) baseName = selectedBase.addr;
  window.location.hash = '#'+tokenName+'-'+baseName;
}
Main.getDivisor = function(tokenOrAddress) {
  var result = 1000000000000000000;
  var token = Main.getToken(tokenOrAddress);
  if (token && token.decimals) {
    result = Math.pow(10,token.decimals);
  }
  return new BigNumber(result);
}
Main.getToken = function(addrOrToken, name, decimals) {
  var result = undefined;
  var matchingTokens = config.tokens.filter(function(x){return x.addr==addrOrToken || x.name==addrOrToken});
  var expectedKeys = JSON.stringify(['addr','decimals','gasApprove','gasDeposit','gasTrade','gasWithdraw','name']);
  if (matchingTokens.length>0) {
    result = matchingTokens[0];
  } else if (selectedToken.addr==addrOrToken) {
    result = selectedToken;
  } else if (selectedBase.addr==addrOrToken) {
    result = selectedBase;
  } else if (addrOrToken.addr && JSON.stringify(Object.keys(addrOrToken).sort())==expectedKeys) {
    result = addrOrToken;
  } else if (addrOrToken.slice(0,2)=='0x' && name!='' && decimals>=0) {
    result = JSON.parse(JSON.stringify(config.tokens[0]));
    result.addr = addrOrToken;
    result.name = name;
    result.decimals = decimals;
  }
  return result;
}
Main.loadToken = function(addr, callback) {
  var token = Main.getToken(addr);
  if (token) {
    callback(null, token);
  } else {
    token = JSON.parse(JSON.stringify(config.tokens[0]));
    token.addr = addr;
    utility.call(web3, contractToken, token.addr, 'decimals', [], function(err, result) {
      if (!err && result>=0) token.decimals = result.toNumber();
      utility.call(web3, contractToken, token.addr, 'name', [], function(err, result) {
        if (!err && result && result!='') {
          token.name = result;
        } else {
          token.name = token.addr.slice(2,6);
        }
        callback(null, token);
      });
    });
  }
}
Main.selectToken = function(addrOrToken, name, decimals) {
  var token = Main.getToken(addrOrToken, name, decimals);
  if (token) {
    selectedToken = token;
    Main.initMarket(function(){});
    Main.updateUrl();
  }
}
Main.selectBase = function(addrOrToken, name, decimals) {
  var token = Main.getToken(addrOrToken, name, decimals);
  if (token) {
    selectedBase = token;
    Main.initMarket(function(){});
    Main.updateUrl();
  }
}
Main.selectTokenAndBase = function(tokenAddr, baseAddr) {
  token = Main.getToken(tokenAddr);
  base = Main.getToken(baseAddr);
  if (token && base) {
    selectedToken = token;
    selectedBase = base;
    Main.initMarket(function(){});
    Main.updateUrl();
  }
}
Main.resetCaches = function() {
  Main.eraseCookie(config.eventsCacheCookie);
  Main.eraseCookie(config.gitterCacheCookie);
  Main.eraseCookie(config.deadOrdersCookie);
  location.reload();
}
Main.refresh = function(callback, force) {
  if (!lastRefresh || Date.now()-lastRefresh>15*1000 || force) {
    console.log('Refreshing');
    if (!lastRefresh) force = true;
    lastRefresh = Date.now();
    Main.createCookie(config.userCookie, JSON.stringify({"addrs": addrs, "pks": pks, "selectedAccount": selectedAccount, "selectedToken" : selectedToken, "selectedBase" : selectedBase}), 999);
    Main.connectionTest();
    Main.updateUrl();
    Main.loadEvents(function(newEvents){
      if (newEvents>0 || force) {
        Main.displayAccounts(function(){});
        Main.displayAllBalances(function(){});
        Main.displayMyTransactions(function(){});
        Main.displayTradesAndCharts(function(){});
        Main.displayVolumes(function(){});
      }
    });
    Main.getGitterMessages(function(){
      Main.displayOrderbook(function(){});
      $('#loading').hide();
    });
  }
  callback();
}
Main.refreshLoop = function() {
  function loop() {
    Main.refresh(function(){
      setTimeout(loop, 10*1000);
    });
  }
  loop();
}
Main.displayBuySell = function(callback) {
  new EJS({url: config.homeURL+'/templates/'+'buy.ejs'}).update('buy', {translation: translation, selectedToken: selectedToken, selectedBase: selectedBase});
  new EJS({url: config.homeURL+'/templates/'+'sell.ejs'}).update('sell', {translation: translation, selectedToken: selectedToken, selectedBase: selectedBase});
  callback();
}
Main.initMarket = function(callback) {
  Main.displayBuySell(function(){});
  Main.displayTokensAndBases(function(){});
  Main.refresh(function(){}, true);
  callback();
}
Main.init = function(callback) {
  console.log('Beginning init');
  connection = undefined;
  Main.createCookie(config.userCookie, JSON.stringify({"addrs": addrs, "pks": pks, "selectedAccount": selectedAccount, "selectedToken" : selectedToken, "selectedBase" : selectedBase}), 999);
  Main.connectionTest();
  Main.displayLanguages(function(){});
  Main.displayContent(function(){});
  Main.displayBuySell(function(){});
  Main.displayTokensAndBases(function(){});
  callback();
}

//globals
var addrs;
var pks;
var selectedAccount = 0;
var selectedToken;
var selectedBase;
var cookie;
var connection = undefined;
var nonce = undefined;
var eventsCache = {};
var lastRefresh = undefined;
var price = undefined;
var priceUpdated = Date.now();
var contractEtherDelta = undefined;
var contractToken = undefined;
var gitterMessagesCache = {};
var deadOrders = {};
var publishingOrders = false;
var pendingTransactions = [];
var defaultdecimals = new BigNumber(1000000000000000000);
var loadedEvents = false;
var loadedBalances = false;
var translation;
var language = 'English';
var minOrderSize = 0.1;
var oauth = undefined;
var messageToSend = undefined;
var blockTimeSnapshot = undefined;
//web3
if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else if (typeof Web3 !== 'undefined') {
  web3 = new Web3(new Web3.providers.HttpProvider(config.ethProvider));
} else if(typeof web3 == 'undefined' && typeof Web3 == 'undefined') {
}

web3.version.getNetwork(function(error, version){
  //check mainnet vs testnet
  if (version in configs) config = configs[version];
  //default selected token and base
  selectedToken = config.tokens[config.defaultToken];
  selectedBase = config.tokens[config.defaultBase];
  //default addr, pk
  addrs = [config.ethAddr];
  pks = [config.ethAddrPrivateKey];
  //get cookie
  var userCookie = Main.readCookie(config.userCookie);
  if (userCookie) {
    userCookie = JSON.parse(userCookie);
    addrs = userCookie["addrs"];
    pks = userCookie["pks"];
    selectedAccount = userCookie["selectedAccount"];
    if (userCookie["language"]) language = userCookie["language"];
    // selectedToken = userCookie["selectedToken"];
    // selectedBase = userCookie["selectedBase"];
  }
  //translation
  translation = translations[language];
  //gitter messages cache cookie
  var gitterCookie = Main.readCookie(config.gitterCacheCookie);
  if (gitterCookie) {
    gitterMessagesCache = JSON.parse(gitterCookie);
  }
  //events cache cookie
  var eventsCacheCookie = Main.readCookie(config.eventsCacheCookie);
  if (eventsCacheCookie) eventsCache = JSON.parse(eventsCacheCookie);
  //dead orders cookie
  var deadOrdersCookie = Main.readCookie(config.deadOrdersCookie);
  if (deadOrdersCookie) {
    deadOrders = JSON.parse(deadOrdersCookie);
  }
  //get accounts
  web3.eth.defaultAccount = config.ethAddr;
  web3.eth.getAccounts(function(e,accounts){
    if (!e) {
      accounts.forEach(function(addr){
        if(addrs.indexOf(addr)<0) {
          addrs.push(addr);
          pks.push(undefined);
        }
      });
    }
  });
  //load Twitter and chat (not in init because we only want to load these scripts once)
  new EJS({url: config.homeURL+'/templates/'+'twitter.ejs'}).update('twitter', {translation: translation});
  // new EJS({url: config.homeURL+'/templates/'+'chat.ejs'}).update('chat', {translation: translation, chatServer: config.chatServer});
  //load contract
  config.contractEtherDeltaAddr = config.contractEtherDeltaAddrs[0].addr;
  utility.loadContract(web3, config.contractEtherDelta, config.contractEtherDeltaAddr, function(err, contract){
    contractEtherDelta = contract;
    utility.loadContract(web3, config.contractToken, '0x0000000000000000000000000000000000000000', function(err, contract){
      contractToken = contract;
      //select token and base
      var hash = window.location.hash.substr(1);
      var hashSplit = hash.split('-');
      //get token and base from hash
      async.parallel(
        [
          function(callback) {
            if (hashSplit.length==2) {
              Main.loadToken(hashSplit[0], function(err, result){
                if (!err && result) selectedToken = result;
                callback(null, true);
              });
            } else {
              callback(null, true);
            }
          },
          function(callback) {
            if (hashSplit.length==2) {
              Main.loadToken(hashSplit[1], function(err, result){
                if (!err && result) selectedBase = result;
                callback(null, true);
              });
            } else {
              callback(null, true);
            }
          }
        ],
        function(err, results) {
          //init
          Main.init(function(){
            Main.refreshLoop();
          });
        }
      );
    });
  });
});

module.exports = {Main: Main, utility: utility};
