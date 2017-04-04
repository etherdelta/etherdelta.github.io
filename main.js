var Web3 = require('web3');
var utility = require('./common/utility.js');
var request = require('request');
var sha256 = require('js-sha256').sha256;
var BigNumber = require('bignumber.js');
require('datejs');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');

function Main() {
}
Main.ejs = function(url, element, data) {
  if ($('#'+element).length) {
    new EJS({url: url}).update(element, data);
    translator.lang(language);
  } else {
    console.log('Failed to render template because '+element+' does not exist.')
  }
}
Main.alertInfo = function(message) {
  console.log(message);
  alertify.message(message);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Alert',
    eventAction: 'Info'
  });
}
Main.alertDialog = function(message) {
  console.log(message);
  alertify.alert('Alert', message, function(){});
  ga('send', {
    hitType: 'event',
    eventCategory: 'Alert',
    eventAction: 'Dialog'
  });
}
Main.alertWarning = function(message) {
  console.log(message);
  alertify.warning(message);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Alert',
    eventAction: 'Warning'
  });
}
Main.alertError = function(message) {
  console.log(message);
  alertify.error(message);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Alert',
    eventAction: 'Error'
  });
}
Main.alertSuccess = function(message) {
  console.log(message);
  alertify.success(message);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Alert',
    eventAction: 'Success'
  });
}
Main.alertTxResult = function(err, txs) {
  if (!Array.isArray(txs)) txs = [txs];
  if (err) {
    Main.alertError('You tried to send an Ethereum transaction but there was an error: '+err);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Ethereum',
      eventAction: 'Ethereum transaction error'
    });
  } else {
    if (txs.length==1) {
      var tx = txs[0];
      if (tx.txHash && tx.txHash!='0x0000000000000000000000000000000000000000000000000000000000000000') {
        Main.alertDialog('You just created an Ethereum transaction. Track its progress: <a href="http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+tx.txHash+'" target="_blank">'+tx.txHash+'</a>.');
      }
    } else if (txs.length>1){
      var message = 'You just created Ethereum transactions. Track their progress: <br />';
      txs.forEach(function(tx){
        message += '<a href="http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+tx.txHash+'" target="_blank">'+tx.txHash+'</a><br />';
      });
      Main.alertDialog(message);
    }
    ga('send', {
      hitType: 'event',
      eventCategory: 'Ethereum',
      eventAction: ('Ethereum transactions ('+txs.length+')')
    });
  }
}
Main.enableTooltips = function() {
  $('[data-toggle="tooltip"]').tooltip();
}
Main.logout = function() {
  addrs = [config.ethAddr];
  pks = [config.ethAddrPrivateKey];
  selectedAccount = 0;
  nonce = undefined;
  Main.refresh(function(){}, true, true);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Logout'
  });
}
Main.createAccount = function() {
  var newAccount = utility.createAccount();
  var addr = newAccount.address;
  var pk = newAccount.privateKey;
  Main.addAccount(addr, pk);
  Main.alertDialog('You just created an Ethereum account: '+addr+'<br /><br />Please BACKUP the private key for this account: '+pk);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Create Account'
  });
}
Main.deleteAccount = function() {
  addrs.splice(selectedAccount, 1);
  pks.splice(selectedAccount, 1);
  selectedAccount = 0;
  nonce = undefined;
  Main.refresh(function(){}, true, true);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Delete Account'
  });
}
Main.selectAccount = function(i) {
  selectedAccount = i;
  nonce = undefined;
  Main.refresh(function(){}, true, true);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Select Account'
  });
}
Main.addAccount = function(addr, pk) {
  if (addr.slice(0,2)!='0x') addr = '0x'+addr;
  if (pk.slice(0,2)=='0x') pk = pk.slice(2);
  addr = utility.toChecksumAddress(addr);
  if (pk!=undefined && pk!='' && !utility.verifyPrivateKey(addr, pk)) {
    Main.alertDialog('For account '+addr+', the private key is invalid.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Add Account - invalid private key'
    });
  } else if (!web3.isAddress(addr)) {
    Main.alertDialog('The specified address, '+addr+', is invalid.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Add Account - invalid address'
    });
  } else {
    addrs.push(addr);
    pks.push(pk);
    selectedAccount = addrs.length-1;
    nonce = undefined;
    Main.refresh(function(){}, true, true);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Add Account'
    });
  }
}
Main.showPrivateKey = function() {
  var addr = addrs[selectedAccount];
  var pk = pks[selectedAccount];
  if (pk==undefined || pk=='') {
    Main.alertDialog('For account '+addr+', there is no private key available. You can still transact if you are connected to Ethereum and the account is unlocked.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Show private key - unavailable'
    });
  } else {
    Main.alertDialog('For account '+addr+', the private key is '+pk+'.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Show private key'
    });
  }
}
Main.addressLink = function(address) {
  return 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+address;
}
Main.contractAddr = function(addr) {
  config.contractEtherDeltaAddr = addr;
  Main.refresh(function(){}, true, true);
}
Main.displayAccounts = function(callback) {
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
      var addressLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+addrs[selectedAccount];
      Main.ejs(config.homeURL+'/templates/'+'addresses.ejs', 'addresses', {addresses: addresses, selectedAccount: selectedAccount, addressLink: addressLink});
      callback();
    }
  );
}
Main.displayLanguages = function(callback) {
  var languages = Object.keys(translations['trades']);
  Main.ejs(config.homeURL+'/templates/'+'languages.ejs', 'languages', {languages: languages, language: language});
  callback();
}
Main.selectLanguage = function(newLanguage) {
  language = newLanguage;
  window.title = translations.title[language];
  translator.lang(language);
  Main.displayLanguages(function(){});
  Main.refresh(function(){}, true, true);
  ga('send', {
    hitType: 'event',
    eventCategory: 'Action',
    eventAction: 'Select language',
    eventLabel: newLanguage
  });
}
Main.loadEvents = function(callback) {
  utility.blockNumber(web3, function(err, blockNumber) {
    blockTimeSnapshot = {blockNumber: blockNumber, date: new Date()};
    var startBlock = 0;
    startBlock = blockNumber-86400*7/secondsPerBlock; //Approximately 7 days
    Object.keys(eventsCache).forEach(function(id) {
      var event = eventsCache[id];
      if (event.blockNumber>startBlock && event.address==config.contractEtherDeltaAddr) {
        startBlock = event.blockNumber;
      }
      for (arg in event.args) {
        if (typeof(event.args[arg])=='string' && event.args[arg].slice(0,2)!='0x') {
          event.args[arg] = new BigNumber(event.args[arg]);
        }
      }
      if (event.blockNumber<startBlock) delete eventsCache[id]; //delete old events
    });
    utility.logsOnce(web3, contractEtherDelta, config.contractEtherDeltaAddr, startBlock, 'latest', function(err, events) {
      var newEvents = 0;
      events.forEach(function(event){
        if (!eventsCache[event.transactionHash+event.logIndex]) {
          newEvents++;
          event.txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
          eventsCache[event.transactionHash+event.logIndex] = event;
          //users with orders to update
          if (event.event=='Trade') {
            usersWithOrdersToUpdate[event.args.give] = true;
            usersWithOrdersToUpdate[event.args.get] = true;
          } else if (event.event=='Deposit' || event.event=='Withdraw' || event.event=='Cancel') {
            usersWithOrdersToUpdate[event.args.user] = true;
          }
        }
      })
      // utility.createCookie(config.eventsCacheCookie, JSON.stringify(eventsCache), 999);
      utility.createCookie(config.eventsCacheCookie, JSON.stringify({}), 999);
      callback(newEvents);
    });
  });
}
Main.displayMyTransactions = function(orders, blockNumber, callback) {
  //only look at orders for the selected token and base
  orders = orders.filter(function(x){return (x.order.tokenGet==selectedToken.addr && x.order.tokenGive==selectedBase.addr && x.amount>0) || (x.order.tokenGive==selectedToken.addr && x.order.tokenGet==selectedBase.addr && x.amount<0)});
  //only include orders by the selected user
  orders = orders.filter(function(order){return addrs[selectedAccount].toLowerCase()==order.order.user.toLowerCase()});
  //filter only orders that match the smart contract address
  orders = orders.filter(function(order){return order.order.contractAddr==config.contractEtherDeltaAddr});
  //final order filtering and sorting
  var buyOrders = orders.filter(function(x){return x.amount>0});
  var sellOrders = orders.filter(function(x){return x.amount<0});
  sellOrders.sort(function(a,b){ return b.price - a.price || b.id - a.id });
  buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
  //events
  var myEvents = [];
  var events = Object.values(eventsCache);
  events.forEach(function(event){
    try {
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
    } catch (err) {
    }
  });
  myEvents.sort(function(a,b){ return b.id - a.id });
  //pending transactions
  async.map(pendingTransactions,
    function(tx, callbackMap) {
      utility.txReceipt(web3, tx.txHash, function(err, result){
        if (!err && result && result.blockNumber) {
          callbackMap(null, undefined);
        } else {
          callbackMap(null, tx);
        }
      });
    },
    function(err, results) {
      pendingTransactions = results.filter(function(x){return x!=undefined});
      //display the template
      Main.ejs(config.homeURL+'/templates/'+'my_trades.ejs', 'my_trades', {translator: translator, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, myEvents: myEvents, pendingTransactions: pendingTransactions, blockNumber: blockNumber});
      Main.ejs(config.homeURL+'/templates/'+'my_orders.ejs', 'my_orders', {translator: translator, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, buyOrders: buyOrders, sellOrders: sellOrders, blockNumber: blockNumber});
      callback();
    }
  );
}
Main.displayVolumes = function(orders, blockNumber, callback) {
  var tokenVolumes = {};
  var pairVolumes = {};
  var timeFrames = [86400*1000*7, 86400*1000*1];
  var mainBases = ['DUSD','ETH']; //in order of priority
  var now = new Date();
  //the default pairs
  for (var i=0; i<config.pairs.length; i++) {
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
            tokenVolumes[tokenGet.name].volumes[i] += Number(amountGet);
            tokenVolumes[tokenGive.name].volumes[i] += Number(amountGive);
            pairVolumes[pair].volumes[i] += Number(volume);
            if (ethVolume) {
              tokenVolumes[tokenGet.name].ethVolumes[i] += Number(ethVolume);
              tokenVolumes[tokenGive.name].ethVolumes[i] += Number(ethVolume);
              pairVolumes[pair].ethVolumes[i] += Number(ethVolume);
            }
          }
        }
      }
    }
  });
  //get bid and ask
  Object.keys(pairVolumes).forEach(pair => {
    var pairVolume = pairVolumes[pair];
    var token = pairVolume.token;
    var base = pairVolume.base;
    //only look at orders for the selected token and base
    var ordersFiltered = orders.filter(function(x){return (x.order.tokenGet==token.addr && x.order.tokenGive==base.addr && x.amount>0) || (x.order.tokenGive==token.addr && x.order.tokenGet==base.addr && x.amount<0)});
    //remove orders below the min order limit
    ordersFiltered = ordersFiltered.filter(function(order){return Number(order.ethAvailableVolume).toFixed(3)>=minOrderSize});
    //filter only orders that match the smart contract address
    ordersFiltered = ordersFiltered.filter(function(order){return order.order.contractAddr==config.contractEtherDeltaAddr});
    //final order filtering and sorting
    var buyOrders = ordersFiltered.filter(function(x){return x.amount>0});
    var sellOrders = ordersFiltered.filter(function(x){return x.amount<0});
    sellOrders.sort(function(a,b){ return b.price - a.price || b.id - a.id });
    buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
    var bid = buyOrders.length>0 ? buyOrders[0].price : undefined;
    var ask = sellOrders.length>0 ? sellOrders[sellOrders.length-1].price : undefined;
    pairVolume.bid = bid;
    pairVolume.ask = ask;
  });
  tokenVolumes = Object.values(tokenVolumes);
  tokenVolumes.sort(function(a,b){return b.ethVolumes[0]-a.ethVolumes[0]});
  pairVolumes = Object.values(pairVolumes);
  pairVolumes.sort(function(a,b){return b.ethVolumes[0]-a.ethVolumes[0]});
  Main.ejs(config.homeURL+'/templates/'+'volume.ejs', 'volume', {tokenVolumes: tokenVolumes, pairVolumes: pairVolumes});
  callback();
}
Main.displayTradesAndChart = function(callback) {
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
  Main.ejs(config.homeURL+'/templates/'+'trades.ejs', 'trades', {selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, trades: trades});

  // //line chart
  // var now = new Date();
  // // var data = trades.filter(function(trade){return now-Main.blockTime(trade.blockNumber)<86400*1000*7}).map(function(trade){return [Main.blockTime(trade.blockNumber), trade.price.toNumber()]});
  // var data = trades.slice(0,50).map(function(trade){return [Main.blockTime(trade.blockNumber), trade.price.toNumber()]});
  // var values = data.map(function(x){return x[1]});
  // values.sort();
  // var median = 0;
  // if (values.length>0) {
  //   median = values[Math.floor(values.length/2)];
  // }
  // data = data.filter(function(x){return Math.abs((x[1]-median)/median)<3.0}); //remove outliers
  // Main.lineChart('chart_price', '', 'date', 'number', 'Time', 'Price', data);

  // candlestick chart
  function getDay(d) {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  }
  var now = new Date();
  var data = trades.map(function(trade){return [Main.blockTime(trade.blockNumber), trade.price.toNumber()]}).filter(function(x){return now-x[0]<86400*1000*7});
  var values = data.map(function(x){return x[1]});
  values.sort();
  var median = 0;
  if (values.length>0) {
    median = values[Math.floor(values.length/2)];
  }
  var days = {'All':[], 'Sun':[], 'Mon':[], 'Tue':[], 'Wed':[], 'Thu':[], 'Fri':[], 'Sat':[]};
  for (var i=data.length-1; i>=0; i--) {
    var date = data[i][0];
    var price = data[i][1];
    var day = getDay(date);
    if (day!=getDay(now) || now-date<86400*1000) {
      if (Math.abs(price-median)/median<3.0) { //remove outliers
        days[day].push(price);
        days['All'].push(price);
      }
    }
  }
  var data = [];
  var date = new Date(now.getTime() - 86400*1000*6-1);
  while(date<now) {
    var day = getDay(date);
    var points = days[day];
    if (points && points.length>0) {
      if (points[points.length-1]>points[0]) {
        data.push([day, points.min(),points[0],points[points.length-1],points.max()]);
      } else {
        data.push([day, points.max(),points[0],points[points.length-1],points.min()]);
      }
    }
    date = new Date(date.getTime()+86400*1000);
  }
  Main.candlestickChart('chart_price', '', '', '', data, days['All'].min()*0.7, days['All'].max()*1.1);

  callback();
}
Main.candlestickChart = function(elem, title, xtitle, ytitle, data, minValue, maxValue) {
  $('#'+elem).html('');
  google.charts.setOnLoadCallback(function(){
    try {
      if (data.length>0) {
        var dataTable = google.visualization.arrayToDataTable(data, true);
        var options = {
          width: $('#'+elem).parent().width(),
          height: $('#'+elem).parent().height(),
          chartArea: {left: 50, width: '90%', height: '80%'},
          backgroundColor: {fill: 'transparent'},
          colors: ['#ccc'],
          hAxis: {
            title: xtitle,
            baselineColor: '#fff',
            gridlines: {color: '#fff'},
            textStyle: {color: '#fff'}
          },
          vAxis: {
            title: ytitle,
            viewWindowMode:'explicit',
            viewWindow:{
              min: minValue,
              max: maxValue,
            },
            gridlines: {color: '#fff'},
            textStyle: {color: '#fff'}
          },
          legend: 'none',
          enableInteractivity: true,
          title: title,
          candlestick: {
            fallingColor: { strokeWidth: 0, fill: '#f00' },
            risingColor: { strokeWidth: 0, fill: '#0f0' }
          }
        };
        var chart = new google.visualization.CandlestickChart(document.getElementById(elem));
        chart.draw(dataTable, options);
      }
    } catch(err) {
      console.log(err);
    }
  });
}
Main.depthChart = function(elem, title, xtitle, ytitle, data, minX, maxX) {
  $('#'+elem).html('');
  google.charts.setOnLoadCallback(function(){
    try {
      if (data.length>1) {
        var dataTable = google.visualization.arrayToDataTable(data);

        var options = {
          width: $('#'+elem).parent().width(),
          height: $('#'+elem).parent().height(),
          chartArea: {left: 50, width: '90%', height: '80%'},
          backgroundColor: {fill: 'transparent'},
          colors: ['#0f0','#f00'],
          title: title,
          hAxis: {
            viewWindowMode:'explicit',
            viewWindow:{
              min: minX,
              max: maxX,
            },
            title: xtitle,
            titleTextStyle: {color: '#fff'},
            gridlines: {color: '#fff'},
            textStyle: {color: '#fff'},
          },
          vAxis: {
            minValue: 0,
            gridlines: {color: '#fff'},
            textStyle: {color: '#fff'}
          },
          legend: 'none',
          tooltip: {isHtml: true},
        };

        var chart = new google.visualization.SteppedAreaChart(document.getElementById(elem));
        chart.draw(dataTable, options);
      }
    } catch (err) {
      console.log(err);
    }
  });
}
Main.lineChart = function(elem, title, xtype, ytype, xtitle, ytitle, data) {
  $('#'+elem).html('');
  google.charts.setOnLoadCallback(function(){
    try {
      if (data.length>0) {
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn(xtype, 'X');
        dataTable.addColumn(ytype, ytitle);
        dataTable.addRows(data);
        var options = {
          width: $('#'+elem).parent().width(),
          height: $('#'+elem).parent().height(),
          chartArea: {left: 50, width: '90%', height: '80%'},
          hAxis: {title: xtitle},
          vAxis: {title: ytitle},
          legend: 'none',
          enableInteractivity: true,
          title: title
        };
        var chart = new google.visualization.LineChart(document.getElementById(elem));
        chart.draw(dataTable, options);
      }
    } catch(err) {
      console.log(err);
    }
  });
}
Main.getOrders = function(callback) {
  utility.getURL(config.apiServer+'/orders/'+apiServerNonce, function(err, result){
    if (!err) {
      try {
        result = JSON.parse(result);
        var blockNumber = result.blockNumber;
        var orders = undefined;
        if (Array.isArray(result.orders)) {
          orders = result.orders;
        } else {
          orders = Object.values(result.orders);
        }
        orders.forEach(function(x){
          Object.assign(x, {
            price: new BigNumber(x.price),
            // amount: new BigNumber(x.amount),
            // availableVolume: new BigNumber(x.availableVolume),
            // ethAvailableVolume: x.ethAvailableVolume,
            order: Object.assign(x.order, {
              amountGet: new BigNumber(x.order.amountGet),
              amountGive: new BigNumber(x.order.amountGive),
              expires: Number(x.order.expires),
              nonce: Number(x.order.nonce),
              tokenGet: x.order.tokenGet,
              tokenGive: x.order.tokenGive,
              user: x.order.user,
              r: x.order.r,
              s: x.order.s,
              v: Number(x.order.v),
            })
          });
        });
        callback(null, {orders: orders, blockNumber: blockNumber});
      } catch (err) {
        callback(err, undefined);
      }
    } else {
      callback(err, undefined);
    }
  });
}
Main.displayOrderbook = function(orders, blockNumber, callback) {
  //only look at orders for the selected token and base
  orders = orders.filter(function(x){return (x.order.tokenGet==selectedToken.addr && x.order.tokenGive==selectedBase.addr && x.amount>0) || (x.order.tokenGive==selectedToken.addr && x.order.tokenGet==selectedBase.addr && x.amount<0)});
  //remove orders below the min order limit
  orders = orders.filter(function(order){return Number(order.ethAvailableVolume).toFixed(3)>=minOrderSize});
  //filter only orders that match the smart contract address
  orders = orders.filter(function(order){return order.order.contractAddr==config.contractEtherDeltaAddr});
  //final order filtering and sorting
  var buyOrders = orders.filter(function(x){return x.amount>0});
  var sellOrders = orders.filter(function(x){return x.amount<0});
  sellOrders.sort(function(a,b){ return b.price - a.price || b.id - a.id });
  buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
  //get depth data
  var depthData = [];
  var median = 0;
  if (buyOrders.length>0) median += buyOrders[0].price.toNumber();
  if (sellOrders.length>0) median += sellOrders[sellOrders.length-1].price.toNumber();
  if (buyOrders.length>0 && sellOrders.length>0) median /= 2;
  var cumul = 0;
  for (var i=0; i<buyOrders.length; i++){
    var price = buyOrders[i].price.toNumber();
    var volume = Number(utility.weiToEth(Math.abs(buyOrders[i].availableVolume), Main.getDivisor(selectedToken)));
    cumul += volume;
    depthData.unshift([price, cumul, 0]);
    if (i==buyOrders.length-1) depthData.unshift([price*0.9, cumul, 0]);
  }
  cumul = 0;
  for (var i=sellOrders.length-1; i>=0; i--) {
    var price = sellOrders[i].price.toNumber();
    var volume = Number(utility.weiToEth(Math.abs(sellOrders[i].availableVolume), Main.getDivisor(selectedToken)));
    depthData.push([price, 0, cumul]);
    cumul += volume;
    if (i==0) depthData.push([price*1.1, 0, cumul]);
  }
  depthData.unshift([{label: "Price", type: 'number'}, {label: "Cumulative bid size", type: 'number'}, {label: "Cumulative offer size", type: 'number'}]);
  // // top 25 bids and offers:
  // buyOrders = buyOrders.slice(0,25);
  // sellOrders = sellOrders.slice(-25);
  Main.ejs(config.homeURL+'/templates/'+'order_book.ejs', 'order_book', {translator: translator, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, buyOrders: buyOrders, sellOrders: sellOrders, blockNumber: blockNumber});
  $('#order_book_scroll')[0].scrollTop = $('#order_book_mid').position().top-$('#order_book_scroll')[0].clientHeight/2-$('#order_book_mid')[0].clientHeight;
  Main.depthChart('chart_depth', '', '', '', depthData, median*0.25, median*1.75);
  callback();
}
Main.displayTokensAndBases = function(callback) {
  var tokens = config.tokens.map(function(x){return x});
  tokens.sort(function(a,b){return a.name>b.name ? 1 : -1});
  Main.ejs(config.homeURL+'/templates/'+'tokens_dropdown.ejs', 'tokens_dropdown', {tokens: tokens, selectedToken: selectedToken});
  Main.ejs(config.homeURL+'/templates/'+'bases_dropdown.ejs', 'bases_dropdown', {tokens: tokens, selectedBase: selectedBase});
  callback();
}
Main.displayAllBalances = function(callback) {
  var zeroAddr = '0x0000000000000000000000000000000000000000';
  //add selected token and base to config.tokens
  var tempTokens = config.tokens;
  var tempTokens = [selectedToken, selectedBase];
  // if (config.tokens.filter(function(x){return x.addr==selectedToken.addr}).length==0) {
  //   tempTokens.push(selectedToken);
  // }
  // if (config.tokens.filter(function(x){return x.addr==selectedBase.addr}).length==0) {
  //   tempTokens.push(selectedBase);
  // }
  async.map(tempTokens,
    function(token, callbackMap) {
      if (token.addr==zeroAddr) {
        utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [token.addr, addrs[selectedAccount]], function(err, result) {
          var balance = result;
          utility.getBalance(web3, addrs[selectedAccount], function(err, result) {
            var balanceOutside = result;
            var balanceObj = {token: token, balance: balance, balanceOutside: balanceOutside, tokenLink: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+addrs[selectedAccount]};
            callbackMap(null, balanceObj);
          });
        });
      } else {
        utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [token.addr, addrs[selectedAccount]], function(err, result) {
          var balance = result;
          utility.call(web3, contractToken, token.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
            var balanceOutside = result;
            var balanceObj = {token: token, balance: balance, balanceOutside: balanceOutside, tokenLink: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/token/'+token.addr};
            callbackMap(null, balanceObj);
          });
        });
      }
    },
    function(err, balances){
      Main.ejs(config.homeURL+'/templates/'+'deposit.ejs', 'deposit', {balances: balances, addr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase});
      Main.ejs(config.homeURL+'/templates/'+'withdraw.ejs', 'withdraw', {balances: balances, addr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase});
      Main.ejs(config.homeURL+'/templates/'+'transfer.ejs', 'transfer', {balances: balances, addr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase});
      callback();
    }
  );
}
Main.transfer = function(addr, inputAmount, toAddr) {
  var amount = utility.ethToWei(inputAmount, Main.getDivisor(addr));
  var token = Main.getToken(addr);
  if (amount<=0) {
    Main.alertError('You must specify a valid amount to transfer.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Transfer - invalid amount',
      eventLabel: token.name,
      eventValue: inputAmount
    });
    return;
  }
  if (!web3.isAddress(toAddr) || toAddr=='0x0000000000000000000000000000000000000000') {
    Main.alertError('Please specify a valid address.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Transfer - invalid address',
      eventLabel: token.name,
      eventValue: inputAmount
    });
  } else if (addr=='0x0000000000000000000000000000000000000000') { //plain Ether transfer
    utility.getBalance(web3, addrs[selectedAccount], function(err, balance) {
      if (amount>balance) amount = balance;
      utility.send(web3, undefined, toAddr, undefined, [{gas: token.gasDeposit, value: amount}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
        txHash = result.txHash;
        nonce = result.nonce;
        Main.addPending(err, {txHash: result.txHash});
        Main.alertTxResult(err, result);
        ga('send', {
          hitType: 'event',
          eventCategory: 'Action',
          eventAction: 'Transfer',
          eventLabel: token.name,
          eventValue: inputAmount
        });
      });
    });
  } else { //token transfer
    utility.call(web3, contractToken, token.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
      if (amount>result) amount = result;
      utility.send(web3, contractToken, token.addr, 'transfer', [toAddr, amount, {gas: token.gasDeposit, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
        txHash = result.txHash;
        nonce = result.nonce;
        Main.addPending(err, {txHash: result.txHash});
        Main.alertTxResult(err, result);
        ga('send', {
          hitType: 'event',
          eventCategory: 'Action',
          eventAction: 'Transfer',
          eventLabel: token.name,
          eventValue: inputAmount
        });
      });
    });
  }
}
Main.deposit = function(addr, inputAmount) {
  var amount = utility.ethToWei(inputAmount, Main.getDivisor(addr));
  var token = Main.getToken(addr);
  if (amount<=0) {
    Main.alertError('You must specify a valid amount to deposit.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Deposit - invalid amount',
      eventLabel: token.name,
      eventValue: inputAmount
    });
    return;
  }
  if (addr=='0x0000000000000000000000000000000000000000') {
    utility.getBalance(web3, addrs[selectedAccount], function(err, result) {
      if (amount > result && amount < result * 1.1) amount = result;
      if (amount <= result) {
        utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'deposit', [{gas: token.gasDeposit, value: amount}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          Main.addPending(err, {txHash: result.txHash});
          Main.alertTxResult(err, result);
          ga('send', {
            hitType: 'event',
            eventCategory: 'Action',
            eventAction: 'Deposit',
            eventLabel: token.name,
            eventValue: inputAmount
          });
        });
      } else {
        Main.alertError("You don't have enough balance.")
        ga('send', {
          hitType: 'event',
          eventCategory: 'Action',
          eventAction: 'Deposit - not enough balance',
          eventLabel: token.name,
          eventValue: inputAmount
        });
      }
    });
  } else {
    utility.call(web3, contractToken, token.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
      if (amount > result && amount < result * 1.1) amount = result;
      if (amount <= result) {
        utility.send(web3, contractToken, addr, 'approve', [config.contractEtherDeltaAddr, amount, {gas: token.gasApprove, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          var txs = [];
          txs.push(result);
          utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'depositToken', [addr, amount, {gas: token.gasDeposit, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
            txHash = result.txHash;
            nonce = result.nonce;
            txs.push(result);
            Main.addPending(err, txs);
            Main.alertTxResult(err, txs);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Deposit',
              eventLabel: token.name,
              eventValue: inputAmount
            });
          });
        });
      } else {
        Main.alertError("You don't have enough balance.")
        ga('send', {
          hitType: 'event',
          eventCategory: 'Action',
          eventAction: 'Deposit - not enough balance',
          eventLabel: token.name,
          eventValue: inputAmount
        });
      }
    });
  }
}
Main.withdraw = function(addr, inputAmount) {
  var amount = utility.ethToWei(inputAmount, Main.getDivisor(addr));
  var token = Main.getToken(addr);
  if (amount<=0) {
    Main.alertError('You must specify a valid amount to withdraw.');
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Withdraw - invalid amount',
      eventLabel: token.name,
      eventValue: inputAmount
    });
    return;
  }
  utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [addr, addrs[selectedAccount]], function(err, result) {
    var balance = result;
    //if you try to withdraw more than your balance, the amount will be modified so that you withdraw your exact balance:
    if (amount>balance) {
      amount = balance;
    }
    if (amount<=0) {
      Main.alertError('You don\'t have anything to withdraw.');
      ga('send', {
        hitType: 'event',
        eventCategory: 'Action',
        eventAction: 'Withdraw - nothing to withdraw',
        eventLabel: token.name,
        eventValue: inputAmount
      });
    } else {
      if (addr=='0x0000000000000000000000000000000000000000') {
        utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'withdraw', [amount, {gas: token.gasWithdraw, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          Main.addPending(err, {txHash: result.txHash});
          Main.alertTxResult(err, result);
          ga('send', {
            hitType: 'event',
            eventCategory: 'Action',
            eventAction: 'Withdraw',
            eventLabel: token.name,
            eventValue: inputAmount
          });
        });
      } else {
        utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'withdrawToken', [addr, amount, {gas: token.gasWithdraw, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          Main.addPending(err, {txHash: result.txHash});
          Main.alertTxResult(err, result);
          ga('send', {
            hitType: 'event',
            eventCategory: 'Action',
            eventAction: 'Withdraw',
            eventLabel: token.name,
            eventValue: inputAmount
          });
        });
      }
    }
  });
}
Main.order = function(direction, amount, price, expires, refresh) {
  utility.blockNumber(web3, function(err, blockNumber) {
    var order = {baseAddr: selectedBase.addr, tokenAddr: selectedToken.addr, direction: direction, amount: amount, price: price, expires: expires, refresh: refresh, nextExpiration: 0};
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
    ga('send', {
      hitType: 'event',
      eventCategory: 'Action',
      eventAction: 'Order - below minimum size',
      eventLabel: selectedToken.name+'/'+selectedBase.name
    });
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
      ga('send', {
        hitType: 'event',
        eventCategory: 'Action',
        eventAction: 'Order - not enough funds',
        eventLabel: selectedToken.name+'/'+selectedBase.name
      });
    } else {
      if (!config.ordersOnchain) { //offchain order
        // console.log([config.contractEtherDeltaAddr, tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce]);
        var condensed = utility.pack([config.contractEtherDeltaAddr, tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
        var hash = sha256(new Buffer(condensed,'hex'));
        utility.sign(web3, addrs[selectedAccount], hash, pks[selectedAccount], function(err, sig) {
          if (err) {
            Main.alertError('Could not sign order because of an error: '+err);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Order - could not sign',
              eventLabel: selectedToken.name+'/'+selectedBase.name
            });
          } else {
            // Send order to offchain book:
            var order = {contractAddr: config.contractEtherDeltaAddr, tokenGet: tokenGet, amountGet: amountGet, tokenGive: tokenGive, amountGive: amountGive, expires: expires, nonce: orderNonce, v: sig.v, r: sig.r, s: sig.s, user: addrs[selectedAccount]};
            utility.postURL(config.apiServer+'/message', {message: JSON.stringify(order)}, function(err, result){
              // console.log(result)
              if (!err) {
                Main.alertSuccess('You sent an order to the order book!');
                Main.refresh(function(){});
                ga('send', {
                  hitType: 'event',
                  eventCategory: 'Action',
                  eventAction: 'Order',
                  eventLabel: selectedToken.name+'/'+selectedBase.name
                });
              } else {
                Main.alertError('You tried sending an order to the order book but there was an error: '+err);
                ga('send', {
                  hitType: 'event',
                  eventCategory: 'Action',
                  eventAction: 'Order - error',
                  eventLabel: selectedToken.name+'/'+selectedBase.name
                });
              }
            });
          }
        });
      } else { //onchain order
        var token = Main.getToken(tokenGet);
        utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, {gas: token.gasOrder, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
          txHash = result.txHash;
          nonce = result.nonce;
          Main.addPending(err, {txHash: result.txHash});
          Main.alertTxResult(err, result);
          ga('send', {
            hitType: 'event',
            eventCategory: 'Action',
            eventAction: 'Order - onchain',
            eventLabel: selectedToken.name+'/'+selectedBase.name
          });
        });
      }
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
      ga('send', {
        hitType: 'event',
        eventCategory: 'Action',
        eventAction: 'Cancel order',
        eventLabel: selectedToken.name+'/'+selectedBase.name
      });
    });
  }
}
Main.trade = function(kind, order, inputAmount) {
  var amount;
  if (kind=='sell') {
    //if I'm selling a bid, the buyer is getting the token
    amount = utility.ethToWei(inputAmount, Main.getDivisor(order.tokenGet));
  } else if (kind=='buy') {
    //if I'm buying an offer, the seller is getting the base and giving the token, so must convert to get terms
    amount = utility.ethToWei(inputAmount * Number(order.amountGet) / Number(order.amountGive), Main.getDivisor(order.tokenGive));
  } else {
    return;
  }
  var token = Main.getToken(order.tokenGet);
  utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [order.tokenGet, addrs[selectedAccount]], function(err, result) {
    var availableBalance = result.toNumber();
    utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'availableVolume', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s], function(err, result) {
      var availableVolume = result.toNumber();
      if (amount>availableBalance/1.0031) amount = availableBalance/1.0031; //balance adjusted for fees (0.0001 to avoid rounding error)
      if (amount>availableVolume) amount = availableVolume;
      var v = Number(order.v);
      var r = order.r;
      var s = order.s;
      if (!(v && r && s)) {
        v = 0;
        r = '0x0';
        s = '0x0';
      }
      utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'testTrade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, v, r, s, amount, addrs[selectedAccount]], function(err, result) {
        if (result && amount>0) {
          utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'trade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, v, r, s, amount, {gas: token.gasTrade, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
            txHash = result.txHash;
            nonce = result.nonce;
            Main.addPending(err, {txHash: result.txHash});
            Main.alertTxResult(err, result);
            ga('send', {
              hitType: 'event',
              eventCategory: 'Action',
              eventAction: 'Trade',
              eventLabel: selectedToken.name+'/'+selectedBase.name,
              eventValue: inputAmount
            });
          });
        } else {
          Main.alertError("You cannot trade this order. Either you don't have enough funds, or this order already traded.");
          ga('send', {
            hitType: 'event',
            eventCategory: 'Action',
            eventAction: 'Trade - failed',
            eventLabel: selectedToken.name+'/'+selectedBase.name,
            eventValue: inputAmount
          });
        }
      });
    });
  });
}
Main.blockTime = function(block) {
  return new Date(blockTimeSnapshot.date.getTime()+((block - blockTimeSnapshot.blockNumber)*1000*secondsPerBlock));
}
Main.addPending = function(err, txs) {
  if (!Array.isArray(txs)) txs = [txs];
  txs.forEach(function(tx){
    if (!err && tx.txHash!='0x0000000000000000000000000000000000000000000000000000000000000000') {
      tx.txLink = 'https://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+tx.txHash;
      pendingTransactions.push(tx);
    }
  });
  Main.refresh(function(){}, true, true);
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
  if (token && token.decimals!=undefined) {
    result = Math.pow(10,token.decimals);
  }
  return new BigNumber(result);
}
Main.getToken = function(addrOrToken, name, decimals) {
  var result = undefined;
  var matchingTokens = config.tokens.filter(function(x){return x.addr==addrOrToken || x.name==addrOrToken});
  var expectedKeys = JSON.stringify(['addr','decimals','gasApprove','gasDeposit','gasOrder','gasTrade','gasWithdraw','name']);
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
    if (addr.slice(0,2)=='0x') {
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
    } else {
      callback(null, token);
    }
  }
}
Main.selectToken = function(addrOrToken, name, decimals) {
  var token = Main.getToken(addrOrToken, name, decimals);
  if (token) {
    ordersResult = {orders: [], blockNumber: 0};
    Main.loading(function(){});
    Main.refresh(function(){}, true, true, token, selectedBase);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Token',
      eventAction: 'Select Token',
      eventLabel: token.name
    });
  }
}
Main.selectBase = function(addrOrToken, name, decimals) {
  var base = Main.getToken(addrOrToken, name, decimals);
  if (base) {
    ordersResult = {orders: [], blockNumber: 0};
    Main.loading(function(){});
    Main.refresh(function(){}, true, true, selectedToken, base);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Token',
      eventAction: 'Select Base',
      eventLabel: base.name
    });
  }
}
Main.selectTokenAndBase = function(tokenAddr, baseAddr) {
  token = Main.getToken(tokenAddr);
  base = Main.getToken(baseAddr);
  if (token && base) {
    ordersResult = {orders: [], blockNumber: 0};
    Main.loading(function(){});
    Main.refresh(function(){}, true, true, token, base);
    ga('send', {
      hitType: 'event',
      eventCategory: 'Token',
      eventAction: 'Select Pair',
      eventLabel: token.name+'/'+base.name
    });
  }
}
Main.displayBuySell = function(callback) {
  Main.ejs(config.homeURL+'/templates/'+'buy.ejs', 'buy', {selectedToken: selectedToken, selectedBase: selectedBase});
  Main.ejs(config.homeURL+'/templates/'+'sell.ejs', 'sell', {selectedToken: selectedToken, selectedBase: selectedBase});
  callback();
}
Main.displayTokenGuidesDropdown = function() {
  var tokens = config.tokens.map(function(x){return x});
  tokens.sort(function(a,b){return a.name>b.name ? 1 : -1});
  Main.ejs(config.homeURL+'/templates/'+'token_guides_dropdown.ejs', 'token_guides_dropdown', {tokens: tokens});
}
Main.displayHelpDropdown = function() {
  Main.ejs(config.homeURL+'/templates/'+'help_dropdown.ejs', 'help_dropdown', {});
}
Main.displayHelp = function(name) {
  $('#help_body').html('');
  Main.ejs(config.homeURL+'/help/'+name+'.ejs', 'help_body', {});
  $('#helpModal').modal('show');
  ga('send', {
    hitType: 'event',
    eventCategory: 'Display',
    eventAction: 'Help',
    eventLabel: name
  });
}
Main.displayScreencast = function(name) {
  $('#screencast_body').html('');
  Main.ejs(config.homeURL+'/help/'+name+'.ejs', 'screencast_body', {});
  $('#screencastModal').modal('show');
  ga('send', {
    hitType: 'event',
    eventCategory: 'Display',
    eventAction: 'Screencast',
    eventLabel: name
  });
}
Main.displayTokenGuide = function(name) {
  var matchingTokens = config.tokens.filter(function(x){return name==x.name});
  if (matchingTokens.length==1) {
    var token = matchingTokens[0];
    $('#token_guide_title').html(name);
    $('#token_guide_body').html('');
    var tokenLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/token/'+token.addr;
    Main.ejs(config.homeURL+'/token_guides/details.ejs', 'token_guide_details', {token: token, tokenLink: tokenLink});
    try {
      Main.ejs(config.homeURL+'/token_guides/'+name+'.ejs', 'token_guide_body', {token: token, tokenLink: tokenLink});
    } catch (err) {
      console.log(err);
    }
    ga('send', {
      hitType: 'event',
      eventCategory: 'Display',
      eventAction: 'Token Guide',
      eventLabel: name
    });
    $('#tokenModal').modal('show');
  }
}
Main.checkContractUpgrade = function() {
  if ((!selectedContract || selectedContract!=config.contractEtherDeltaAddr) && (addrs.length>1 || (addrs.length==1 && addrs[0]!='0x0000000000000000000000000000000000000123'))) {
    Main.alertDialog('<p>EtherDelta has a new smart contract. It is now selected.</p><p>Please use the "Smart Contract" menu to select the old one and withdraw from it.</p><p><a href="javascript:;" class="btn btn-default" onclick="alertify.closeAll(); bundle.Main.displayHelp(\'smart_contract\')">Smart contract changelog</a></p>');
  }
}
Main.resetCaches = function() {
  utility.eraseCookie(config.eventsCacheCookie);
  location.reload();
  ga('send', {
    hitType: 'event',
    eventCategory: 'Other',
    eventAction: 'Reset caches'
  });
}
Main.loading = function(callback) {
  ['deposit','withdraw','buy','sell','order_book','chart_price','chart_depth','my_trades','my_orders','trades','volume'].forEach(function(div){
    Main.ejs(config.homeURL+'/templates/'+'loading.ejs', div, {});
  });
  callback();
}
Main.refresh = function(callback, forceEventRead, initMarket, token, base) {
  q.push(function(done) {
    console.log('Beginning refresh', new Date());
    selectedContract = config.contractEtherDeltaAddr;
    utility.createCookie(config.userCookie, JSON.stringify({"addrs": addrs, "pks": pks, "selectedAccount": selectedAccount, "selectedToken": selectedToken, "selectedBase": selectedBase, "selectedContract": selectedContract}), 999);
    async.series(
      [
        function(callback) {
          if (initMarket) {
            apiServerNonce = Math.random().toString().slice(2)+Math.random().toString().slice(2);
            if (token) selectedToken = token;
            if (base) selectedBase = base;
            connection = undefined;
            Main.updateUrl();
            async.parallel(
              [
                function(callback) {
                  Main.displayBuySell(function(){
                    callback(null, undefined);
                  });
                },
                function(callback) {
                  Main.displayTokensAndBases(function(){
                    callback(null, undefined);
                  });
                }
              ],
              function(err, results) {
                callback(null, undefined);
              }
            );
          } else {
            callback(null, undefined);
          }
        },
        function(callback) {
          async.parallel(
            [
              function(callback) {
                Main.loadEvents(function(newEvents){
                  callback(null, undefined);
                  if (newEvents>0 || forceEventRead) {
                    Main.displayAccounts(function(){});
                    Main.displayAllBalances(function(){});
                    Main.displayTradesAndChart(function(){});
                  }
                });
              },
              function(callback) {
                Main.getOrders(function(err, result) {
                  if (!err) {
                    ordersResult = result;
                  } else {
                    console.log('Order book has not changed since last refresh.');
                  }
                  async.parallel(
                    [
                      function(callback) {
                        Main.displayMyTransactions(ordersResult.orders, ordersResult.blockNumber, function(){
                          callback(null, undefined);
                        });
                      },
                      function(callback) {
                        Main.displayOrderbook(ordersResult.orders, ordersResult.blockNumber, function(){
                          callback(null, undefined);
                        });
                      },
                      function(callback) {
                        Main.displayVolumes(ordersResult.orders, ordersResult.blockNumber, function(){
                          callback(null, undefined);
                        });
                      }
                    ],
                    function(err, results) {
                      callback(null, undefined);
                    }
                  );
                });
              }
            ],
            function(err, results) {
              callback(null, undefined);
            }
          );
        }
      ],
      function(err, results) {
        console.log('Ending refresh')
        done();
        callback();
      }
    );
  });
}
Main.refreshLoop = function() {
  function loop() {
    Main.refresh(function(){
      setTimeout(loop, 10*1000);
    });
  }
  loop();
}
Main.init = function(callback) {
  console.log('Beginning init');
  connection = undefined;
  Main.loading(function(){});
  Main.displayTokenGuidesDropdown(function(){});
  Main.displayHelpDropdown(function(){});
  Main.displayLanguages(function(){});
  Main.checkContractUpgrade(function(){});
  Main.refresh(function(){
    callback();
  }, true, true);
}

//globals
var q = async.queue(function(task, callback) {
  task(callback);
}, 1);
var addrs;
var pks;
var selectedAccount = 0;
var selectedToken;
var selectedBase;
var cookie;
var connection = undefined;
var nonce = undefined;
var price = undefined;
var priceUpdated = Date.now();
var contractEtherDelta = undefined;
var contractToken = undefined;
var eventsCache = {};
var publishingOrders = false;
var pendingTransactions = [];
var defaultdecimals = new BigNumber(1000000000000000000);
var language = 'en';
var minOrderSize = 0.1;
var messageToSend = undefined;
var blockTimeSnapshot = {blockNumber: 3154928, date: new Date('Feb-10-2017 01:40:47')}; //default snapshot
var translator = undefined;
var secondsPerBlock = 14;
var usersWithOrdersToUpdate = {};
var apiServerNonce = undefined;
var ordersResult = {orders: [], blockNumber: 0};
var selectedContract = undefined;

function loadWeb3(callback) {
  //web3
  if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') { //metamask situation
    web3 = new Web3(web3.currentProvider);
    async.until(
      function() { return connection; },
      function(callback) {
        connection = {connection: 'RPC', provider: config.ethProvider, testnet: config.ethTestnet};
        $('#pk_div').hide();
        setTimeout(function() {
          callback(null);
        }, 500);
      },
      function (err) {
        callback();
      }
    );
  } else if (typeof Web3 !== 'undefined' && window.location.protocol != "https:") { //mist/geth/parity situation
    web3 = new Web3(new Web3.providers.HttpProvider(config.ethProvider));
    try {
      connection = {connection: 'RPC', provider: config.ethProvider, testnet: config.ethTestnet};
      web3.eth.coinbase;
      $('#pk_div').hide();
    } catch(err) {
      connection = {connection: 'Proxy', provider: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io', testnet: config.ethTestnet};
      web3.setProvider(undefined);
    }
    callback();
  } else { //etherscan proxy
    web3 = new Web3();
    connection = {connection: 'Proxy', provider: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io', testnet: config.ethTestnet};
    callback();
  }
}

loadWeb3(function() {
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
    var userCookie = utility.readCookie(config.userCookie);
    if (userCookie) {
      userCookie = JSON.parse(userCookie);
      addrs = userCookie["addrs"];
      pks = userCookie["pks"];
      selectedAccount = userCookie["selectedAccount"];
      if (userCookie["language"]) language = userCookie["language"];
      selectedContract = userCookie["selectedContract"];
    }
    //translation
    translator = $('body').translate({lang: language, t: translations});
    //events cache cookie
    // var eventsCacheCookie = utility.readCookie(config.eventsCacheCookie);
    // if (eventsCacheCookie) eventsCache = JSON.parse(eventsCacheCookie);
    //connection
    config.contractEtherDeltaAddr = config.contractEtherDeltaAddrs[0].addr;
    Main.ejs(config.homeURL+'/templates/'+'connection_description.ejs', 'connection', {connection: connection, contracts: config.contractEtherDeltaAddrs, contractAddr: config.contractEtherDeltaAddr, contractLink: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+config.contractEtherDeltaAddr});
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
    // Main.ejs(config.homeURL+'/templates/'+'twitter.ejs', 'twitter', {});
    // Main.ejs(config.homeURL+'/templates/'+'chat.ejs', 'chat', {chatServer: config.chatServer});
    //load contract
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
});

module.exports = {Main: Main, utility: utility};
