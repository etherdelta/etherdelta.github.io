var Web3 = require('web3');
var utility = require('./common/utility.js');
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
  Main.displayMarket(function(){

  });
  Main.refresh(function(){});
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
  Main.displayMarket(function(){});
  Main.refresh(function(){});
}
Main.selectAccount = function(i) {
  selectedAccount = i;
  nonce = undefined;
  Main.displayMarket(function(){});
  Main.refresh(function(){});
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
    Main.displayMarket(function(){});
    Main.refresh(function(){});
  }
}
Main.showPrivateKey = function() {
  var addr = addrs[selectedAccount];
  var pk = pks[selectedAccount];
  if (pk==undefined || pk=='') {
    Main.alertDialog('For account '+addr+', there is no private key available. You can still transact if you are connected to Geth and the account is unlocked.');
  } else {
    Main.alertDialog('For account '+addr+', the private key is '+pk+'.');
  }
}
Main.addressLink = function(address) {
  return 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+address;
}
Main.connectionTest = function() {
  if (connection) return connection;
  connection = {connection: 'Proxy', provider: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io', testnet: config.ethTestnet};
  try {
    if (web3.currentProvider) {
      web3.eth.getBalance('0x0000000000000000000000000000000000000000');
      connection = {connection: 'Geth', provider: config.ethProvider, testnet: config.ethTestnet};
    }
  } catch(err) {
    web3.setProvider(undefined);
  }
  new EJS({url: config.homeURL+'/'+'connection_description.ejs'}).update('connection', {connection: connection});
  return connection;
}
Main.loadAccounts = function(callback) {
  if (Main.connectionTest().connection=='Geth') {
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
      new EJS({url: config.homeURL+'/'+'addresses.ejs'}).update('addresses', {addresses: addresses, selectedAccount: selectedAccount});
      callback();
    }
  );
}
Main.loadEvents = function(callback) {
  // var startBlock = blockNumber-5760;
  var startBlock = 0;
  utility.blockNumber(web3, function(err, blockNumber) {
    utility.logs(web3, contractEtherDelta, config.contractEtherDeltaAddr, startBlock, 'latest', function(err, event) {
      event.txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
      eventsCache[event.transactionHash+event.logIndex] = event;
      Main.displayEvents(function(){
        Main.displayBalances(function(){
          Main.displayMyEvents(function(){
          });
        });
      });
    });
    callback();
  });
}
Main.displayMyEvents = function(callback) {
  var myEvents = [];
  var events = Object.values(eventsCache);
  events.forEach(function(event){
    if (event.event=='Trade' && event.address==config.contractEtherDeltaAddr && (event.args.get.toLowerCase()==addrs[selectedAccount].toLowerCase() || event.args.give.toLowerCase()==addrs[selectedAccount].toLowerCase())) {
      var trade;
      if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
        //sell
        trade = {amount: -event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet), buyer: event.args.get, seller: event.args.give};
      } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
        //buy
        trade = {amount: event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive), buyer: event.args.give, seller: event.args.get};
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
  //display the template
  new EJS({url: config.homeURL+'/'+'my_events.ejs'}).update('my_events', {selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, myEvents: myEvents});
  $('table').stickyTableHeaders({scrollableArea: $('.scroll-container')});
  callback();
}
Main.displayEvents = function(callback) {
  utility.blockNumber(web3, function(err, blockNumber) {
    var orders = [];
    //get orders from gitter messages
    var expectedKeys = JSON.stringify(['amountGet','amountGive','expires','nonce','r','s','tokenGet','tokenGive','user','v']);
    for(id in gitterMessagesCache) {
      var message = gitterMessagesCache[id];
      for (key in message) {
        if (typeof(message[key])=='number') message[key] = new BigNumber(message[key]);
      }
      if (typeof(message)=='object' && JSON.stringify(Object.keys(message).sort())==expectedKeys) {
        var order;
        if (message.tokenGet==selectedToken.addr && message.tokenGive==selectedBase.addr) {
          //buy
          order = {amount: message.amountGet, price: message.amountGive.div(message.amountGet), id: id, order: message};
        } else if (message.tokenGet==selectedBase.addr && message.tokenGive==selectedToken.addr) {
          //sell
          order = {amount: -message.amountGive, price: message.amountGet.div(message.amountGive), id: id, order: message};
        }
        if (order) orders.push(order);
      }
    }
    //get orders from events
    var events = Object.values(eventsCache);
    events.forEach(function(event){
      if (event.event=='Order' && event.address==config.contractEtherDeltaAddr) {
        var order;
        if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
          //buy
          order = {amount: event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
        } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
          //sell
          order = {amount: -event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
        }
        if (order) orders.push(order);
      }
    });
    //get available volumes
    async.reduce(orders, [],
      function(orders, order, callbackReduce) {
        utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'availableVolume', [order.order.tokenGet, Number(order.order.amountGet), order.order.tokenGive, Number(order.order.amountGive), Number(order.order.expires), Number(order.order.nonce), order.order.user, Number(order.order.v), order.order.r, order.order.s], function(err, result) {
          if (order.amount>=0) {
            order.availableVolume = result;
          } else {
            order.availableVolume = result.div(order.price);
          }
          if (order.availableVolume>0) {
            orders.push(order);
          }
          callbackReduce(null, orders);
        });
      },
      function(err, orders){
        //final order filtering and sorting
        var buyOrders = orders.filter(function(x){return x.amount>0});
        var sellOrders = orders.filter(function(x){return x.amount<0});
        buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
        sellOrders.sort(function(a,b){ return a.price - b.price || a.id - b.id });
        //get the trade list
        var trades = [];
        events.forEach(function(event){
          if (event.event=='Trade' && event.address==config.contractEtherDeltaAddr) {
            var trade;
            if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
              //sell
              trade = {amount: -event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.get, seller: event.args.give};
            } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
              //buy
              trade = {amount: event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.give, seller: event.args.get};
            }
            if (trade) {
              trade.txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
              trades.push(trade);
            }
          }
        });
        trades.sort(function(a,b){ return b.id - a.id });
        //display the template
        new EJS({url: config.homeURL+'/'+'market_events.ejs'}).update('market_events', {selectedToken: selectedToken, selectedBase: selectedBase, buyOrders: buyOrders, sellOrders: sellOrders, trades: trades});
        $('table').stickyTableHeaders({scrollableArea: $('.scroll-container')});
        callback();
      }
    );
  });
}
Main.loadTokensAndBases = function(callback) {
  new EJS({url: config.homeURL+'/'+'tokens.ejs'}).update('tokens', {tokens: config.tokens, selectedToken: selectedToken});
  new EJS({url: config.homeURL+'/'+'bases.ejs'}).update('bases', {tokens: config.tokens, selectedBase: selectedBase});
  callback();
}
Main.selectToken = function(addr, name) {
  selectedToken = {addr: addr, name: name};
  Main.refresh(function(){});
  Main.displayMarket(function(){});
}
Main.selectBase = function(addr, name) {
  selectedBase = {addr: addr, name: name};
  Main.refresh(function(){});
  Main.displayMarket(function(){});
}
Main.otherToken = function(addr, name) {
  if (addr.slice(0,2)!="0x") addr = '0x'+addr;
  if (!name || name=='') name = addr.slice(3,6);
  selectedToken = {addr: addr, name: name};
  Main.refresh(function(){});
  Main.displayMarket(function(){});
}
Main.otherBase = function(addr, name) {
  if (addr.slice(0,2)!="0x") addr = '0x'+addr;
  if (!name || name=='') name = addr.slice(3,6);
  selectedBase = {addr: addr, name: name};
  Main.refresh(function(){});
  Main.displayMarket(function(){});
}
Main.displayMarket = function(callback) {
  new EJS({url: config.homeURL+'/'+'market_form.ejs'}).update('market_form', {selectedToken: selectedToken, selectedBase: selectedBase});
  Main.displayBalances(function(){
    Main.displayEvents(function(){
      Main.displayMyEvents(function(){
        callback();
      });
    });
  });
}
Main.displayBalances = function(callback) {
  var zeroAddr = '0x0000000000000000000000000000000000000000';
  utility.getBalance(web3, addrs[selectedAccount], function(err, balance) {
    utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [selectedToken.addr, addrs[selectedAccount]], function(err, result) {
      var balanceToken = result;
      utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [selectedBase.addr, addrs[selectedAccount]], function(err, result) {
        var balanceBase = result;
        utility.call(web3, contractToken, selectedToken.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
          var balanceTokenOutside = selectedToken.addr==zeroAddr ? balance : result;
          utility.call(web3, contractToken, selectedBase.addr, 'balanceOf', [addrs[selectedAccount]], function(err, result) {
            var balanceBaseOutside = selectedBase.addr==zeroAddr ? balance : result;
            new EJS({url: config.homeURL+'/'+'balance.ejs'}).update('balance_token', {selected: selectedToken, balanceOutside: balanceTokenOutside, balance: balanceToken});
            new EJS({url: config.homeURL+'/'+'balance.ejs'}).update('balance_base', {selected: selectedBase, balanceOutside: balanceBaseOutside, balance: balanceBase});
            Main.enableTooltips();
            callback();
          });
        });
      });
    });
  });
}
Main.deposit = function(addr, amount) {
  amount = utility.ethToWei(amount);
  if (addr=='0x0000000000000000000000000000000000000000') {
    utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'deposit', [{gas: 150000, value: amount}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.alertTxResult(err, result);
    });
  } else {
    utility.send(web3, contractToken, addr, 'approve', [config.contractEtherDeltaAddr, amount, {gas: 150000, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.alertTxResult(err, result);
      utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'depositToken', [addr, amount, {gas: 150000, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
        txHash = result.txHash;
        nonce = result.nonce;
        Main.alertTxResult(err, result);
      });
    });
  }
}
Main.withdraw = function(addr, amount) {
  amount = utility.ethToWei(amount);
  if (addr=='0x0000000000000000000000000000000000000000') {
    utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'withdraw', [amount, {gas: 150000, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.alertTxResult(err, result);
    });
  } else {
    utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'withdrawToken', [addr, amount, {gas: 150000, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.alertTxResult(err, result);
    });
  }
}
Main.order = function(baseAddr, tokenAddr, direction, amount, price, expires) {
  utility.blockNumber(web3, function(err, blockNumber) {
    var tokenGet = undefined;
    var tokenGive = undefined;
    var amountGet = undefined;
    var amountGive = undefined;
    expires = Number(expires) + blockNumber;
    var orderNonce = utility.getRandomInt(0,Math.pow(2,32));
    if (direction=='buy') {
      tokenGet = tokenAddr;
      tokenGive = baseAddr;
      amountGet = utility.ethToWei(amount);
      amountGive = utility.ethToWei(amount * price);
    } else if (direction=='sell') {
      tokenGet = baseAddr;
      tokenGive = tokenAddr;
      amountGet = utility.ethToWei(amount * price);
      amountGive = utility.ethToWei(amount);
    } else {
      return;
    }
    var condensed = utility.pack([tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 256, 160, 256, 256, 256]);
    var hash = sha256(new Buffer(condensed,'hex'));
    utility.sign(web3, addrs[selectedAccount], hash, undefined, function(err, sig) {
      if (err) {
        Main.alertError('Could not sign order because of an error: '+err);
      } else {
        // Send order to Gitter channel:
        var order = {tokenGet: tokenGet, amountGet: amountGet, tokenGive: tokenGive, amountGive: amountGive, expires: expires, nonce: orderNonce, v: sig.v, r: sig.r, s: sig.s, user: addrs[selectedAccount]};
        utility.postGitterMessage(JSON.stringify(order), function(err, result){
          if (!err) {
            Main.alertSuccess('You sent an order to the order book!');
          } else {
            Main.alertError('You tried sending an order to the order book but there was an error.');
          }
        });
      }
    });
  });
}
Main.trade = function(order, amount) {
  amount = utility.ethToWei(amount);
  utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'testTrade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s, amount, addrs[selectedAccount]], function(err, result) {
    if (result) {
      utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'trade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s, amount, {gas: 1000000, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
        txHash = result.txHash;
        nonce = result.nonce;
        Main.alertTxResult(err, result);
      });
    } else {
      Main.alertError("You tried placing an order, but the order failed. Either the order already traded or you or the counterparty do not have enough funds.");
    }
  });
}
Main.getGitterMessages = function(callback) {
  utility.getGitterMessages(gitterMessagesCache, function(err, result){
    if (!err) {
      gitterMessagesCache = result.gitterMessages;
      if (result.newMessagesFound) {
        Main.displayEvents(function(){
        });
      }
    }
    callback();
  });
}
Main.refresh = function(callback) {
  if (!refreshing || Date.now()-lastRefresh>60*1000) {
    refreshing = true;
    Main.createCookie("EtherDelta", JSON.stringify({"addrs": addrs, "pks": pks, "selectedAccount": selectedAccount, "selectedToken" : selectedToken, "selectedBase" : selectedBase}), 999);
    Main.connectionTest();
    Main.loadAccounts(function(){
      Main.getGitterMessages(function(){
        Main.loadTokensAndBases(function(){
          $('#loading').hide();
          refreshing = false;
          lastRefresh = Date.now();
          callback();
        });
      });
    });
  }
}
Main.init = function() {
  function mainLoop() {
    Main.refresh(function(){
      setTimeout(mainLoop, 10*1000);
    });
  }
  Main.displayMarket(function(){
    Main.loadEvents(function(){
      Main.displayEvents(function(){
        Main.displayMyEvents(function(){
          mainLoop();
        });
      });
    });
  });
}

//globals
var addrs = [config.ethAddr];
var pks = [config.ethAddrPrivateKey];
var selectedAccount = 0;
var selectedToken = config.tokens[0];
var selectedBase = config.tokens[1];
var cookie = Main.readCookie("EtherDelta");
if (cookie) {
  cookie = JSON.parse(cookie);
  addrs = cookie["addrs"];
  pks = cookie["pks"];
  selectedAccount = cookie["selectedAccount"];
  selectedToken = cookie["selectedToken"];
  selectedBase = cookie["selectedBase"];
}
var connection = undefined;
var nonce = undefined;
var eventsCache = {};
var refreshing = false;
var lastRefresh = Date.now();
var price = undefined;
var priceUpdated = Date.now();
var contractEtherDelta = undefined;
var contractToken = undefined;
var gitterMessagesCache = {};
//web3
var web3 = new Web3();
web3.eth.defaultAccount = config.ethAddr;
web3.setProvider(new web3.providers.HttpProvider(config.ethProvider));

utility.loadContract(web3, config.contractEtherDelta, config.contractEtherDeltaAddr, function(err, contract){
  contractEtherDelta = contract;
  utility.loadContract(web3, config.contractToken, '0x0000000000000000000000000000000000000000', function(err, contract){
    contractToken = contract;
    Main.init();
  });
});


module.exports = {Main: Main, utility: utility};
