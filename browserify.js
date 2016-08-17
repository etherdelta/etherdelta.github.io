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
}
Main.selectAccount = function(i) {
  selectedAccount = i;
  nonce = undefined;
  Main.displayMarket(function(){});
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
Main.contractAddr = function(addr) {
  gitterMessagesCache = {}; //clear gitter message cache
  config.contractEtherDeltaAddr = addr;
  Main.init(function(){});
}
Main.connectionTest = function() {
  if (connection) return connection;
  connection = {connection: 'Proxy', provider: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io', testnet: config.ethTestnet};
  try {
    if (web3.currentProvider) {
      web3.eth.coinbase;
      connection = {connection: 'Geth', provider: config.ethProvider, testnet: config.ethTestnet};
    }
  } catch(err) {
    web3.setProvider(undefined);
  }
  new EJS({url: config.homeURL+'/'+'connection_description.ejs'}).update('connection', {translation: translation, connection: connection, contracts: config.contractEtherDeltaAddrs, contractAddr: config.contractEtherDeltaAddr, contractLink: 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/address/'+config.contractEtherDeltaAddr});
  return connection;
}
Main.displayAccounts = function(callback) {
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
      new EJS({url: config.homeURL+'/'+'addresses.ejs'}).update('addresses', {translation: translation, addresses: addresses, selectedAccount: selectedAccount});
      callback();
    }
  );
}
Main.displayLanguages = function(callback) {
  var languages = Object.keys(translations);
  new EJS({url: config.homeURL+'/'+'languages.ejs'}).update('languages', {translation: translation, languages: languages, language: language});
  callback();
}
Main.selectLanguage = function(newLanguage) {
  language = newLanguage;
  translation = translations[language];
  Main.init(function(){});
}
Main.loadEvents = function(callback) {
  utility.blockNumber(web3, function(err, blockNumber) {
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
    utility.logs(web3, contractEtherDelta, config.contractEtherDeltaAddr, startBlock, 'latest', function(err, event) {
      event.txLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
      eventsCache[event.transactionHash+event.logIndex] = event;
      Main.createCookie(config.eventsCacheCookie, JSON.stringify(eventsCache), 999);
      Main.refresh(function(){
      }, true);
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
      new EJS({url: config.homeURL+'/'+'my_events.ejs'}).update('my_events', {translation: translation, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, myEvents: myEvents, pendingTransactions: pendingTransactions});
      $('table').stickyTableHeaders({scrollableArea: $('.scroll-container')});
      callback();
    }
  );
}
Main.displayEvents = function(callback) {
  utility.blockNumber(web3, function(err, blockNumber) {
    var orders = [];
    //get orders from gitter messages
    var expectedKeys = JSON.stringify(['amountGet','amountGive','expires','nonce','r','s','tokenGet','tokenGive','user','v']);
    Object.keys(gitterMessagesCache).forEach(function(id) {
      var message = JSON.parse(JSON.stringify(gitterMessagesCache[id]));
      for (key in message) {
        if (typeof(message[key])=='number') message[key] = new BigNumber(message[key]);
      }
      if (typeof(message)=='object' && JSON.stringify(Object.keys(message).sort())==expectedKeys) {
        var order;
        if (message.tokenGet==selectedToken.addr && message.tokenGive==selectedBase.addr) {
          //buy
          order = {amount: message.amountGet, price: message.amountGive.div(message.amountGet).mul(Main.getDivisor(message.tokenGet)).div(Main.getDivisor(message.tokenGive)), id: id, order: message};
        } else if (message.tokenGet==selectedBase.addr && message.tokenGive==selectedToken.addr) {
          //sell
          order = {amount: -message.amountGive, price: message.amountGet.div(message.amountGive).mul(Main.getDivisor(message.tokenGive)).div(Main.getDivisor(message.tokenGet)), id: id, order: message};
        }
        if (order && !deadOrders[order.id]) orders.push(order);
      }
    });
    //get orders from events
    var events = Object.values(eventsCache);
    events.forEach(function(event){
      if (event.event=='Order' && event.address==config.contractEtherDeltaAddr) {
        var order;
        if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
          //buy
          order = {amount: event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet).mul(Main.getDivisor(event.args.tokenGet)).div(Main.getDivisor(event.args.tokenGive)), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
        } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
          //sell
          order = {amount: -event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive).mul(Main.getDivisor(event.args.tokenGive)).div(Main.getDivisor(event.args.tokenGet)), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
        }
        if (order && !deadOrders[order.id]) orders.push(order);
      }
    });
    //get available volumes
    // console.log(orders.filter(function(order){return blockNumber<Number(order.order.expires)}).length);
    async.reduce(orders, [],
      function(memo, order, callbackReduce) {
        if (blockNumber<Number(order.order.expires)) {
          utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'availableVolume', [order.order.tokenGet, Number(order.order.amountGet), order.order.tokenGive, Number(order.order.amountGive), Number(order.order.expires), Number(order.order.nonce), order.order.user, Number(order.order.v), order.order.r, order.order.s], function(err, result) {
            if (!err) {
              var ethAvailableVolume = 0;
              if (order.amount>=0) {
                order.availableVolume = result;
                ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), Main.getDivisor(selectedToken));
              } else {
                order.availableVolume = result.div(order.price).mul(Main.getDivisor(order.order.tokenGive)).div(Main.getDivisor(order.order.tokenGet));
                ethAvailableVolume = utility.weiToEth(Math.abs(order.availableVolume), Main.getDivisor(selectedToken));
              }
              if (Number(ethAvailableVolume).toFixed(3)>=minOrderSize) { //min order size
                memo.push(order);
              } else {
                deadOrders[order.id] = true;
              }
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
      function(err, ordersReduced){
        //save dead orders to storage
        Main.createCookie(config.deadOrdersCookie, JSON.stringify(deadOrders), 999);
        //attach working orders if they exist
        for (var i=0; i<ordersReduced.length; i++) {
          var order = ordersReduced[i];
          var matchingWorkingOrders = workingOrders.filter(function(workingOrder){if (workingOrder.nonce == order.order.nonce && order.order.user.toLowerCase()==addrs[selectedAccount].toLowerCase()) return true;});
          if (matchingWorkingOrders.length==1) {
            order.workingOrder = matchingWorkingOrders[0];
          }
        }
        //final order filtering and sorting
        var buyOrders = ordersReduced.filter(function(x){return x.amount>0});
        var sellOrders = ordersReduced.filter(function(x){return x.amount<0});
        buyOrders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
        sellOrders.sort(function(a,b){ return a.price - b.price || a.id - b.id });
        buyOrders = buyOrders.slice(0,20); //show 20 best orders
        sellOrders = sellOrders.slice(0,20); //show 20 best orders
        //get the trade list
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
        //display the template
        new EJS({url: config.homeURL+'/'+'market_events.ejs'}).update('market_events', {translation: translation, selectedAddr: addrs[selectedAccount], selectedToken: selectedToken, selectedBase: selectedBase, buyOrders: buyOrders, sellOrders: sellOrders, trades: trades, blockNumber: blockNumber});
        $('table').stickyTableHeaders({scrollableArea: $('.scroll-container')});
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
        callback();
      }
    );
  });
}
Main.loadTokensAndBases = function(callback) {
  new EJS({url: config.homeURL+'/'+'tokens.ejs'}).update('tokens', {translation: translation, tokens: config.tokens, selectedToken: selectedToken});
  new EJS({url: config.homeURL+'/'+'bases.ejs'}).update('bases', {translation: translation, tokens: config.tokens, selectedBase: selectedBase});
  new EJS({url: config.homeURL+'/'+'pairs.ejs'}).update('pairs', {translation: translation, tokens: config.tokens, pairs: config.pairs});
  callback();
}
Main.selectToken = function(addr, name, divisor) {
  divisor = Number(divisor);
  selectedToken = {addr: addr, name: name, divisor: divisor};
  Main.displayMarket(function(){});
}
Main.selectBase = function(addr, name, divisor) {
  divisor = Number(divisor);
  selectedBase = {addr: addr, name: name, divisor: divisor};
  Main.displayMarket(function(){});
}
Main.selectTokenAndBase = function(addrToken, nameToken, divisorToken, addrBase, nameBase, divisorBase) {
  selectedToken = {addr: addrToken, name: nameToken, divisor: Number(divisorToken)};
  selectedBase = {addr: addrBase, name: nameBase, divisor: Number(divisorBase)};
  Main.displayMarket(function(){});
}
Main.otherToken = function(addr, name, divisor) {
  if (addr.slice(0,2)!="0x") addr = '0x'+addr;
  if (!name || name=='') name = addr.slice(2,6);
  divisor = Number(divisor);
  selectedToken = {addr: addr, name: name, divisor: divisor, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000};
  Main.displayMarket(function(){});
}
Main.otherBase = function(addr, name, divisor) {
  if (addr.slice(0,2)!="0x") addr = '0x'+addr;
  if (!name || name=='') name = addr.slice(2,6);
  divisor = Number(divisor);
  selectedBase = {addr: addr, name: name, divisor: divisor, gasApprove: 150000, gasDeposit: 150000, gasWithdraw: 150000, gasTrade: 1000000};
  Main.displayMarket(function(){});
}
Main.displayMarket = function(callback) {
  new EJS({url: config.homeURL+'/'+'market_form.ejs'}).update('market_form', {translation: translation, selectedToken: selectedToken, selectedBase: selectedBase});
  Main.loadTokensAndBases(function(){
    Main.refresh(function(){
      callback();
    }, true);
  });
}
Main.displayAllBalances = function(callback) {
  var zeroAddr = '0x0000000000000000000000000000000000000000';
  async.map(config.tokens,
    function(token, callbackMap) {
      if (token.addr==zeroAddr) {
        utility.call(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'balanceOf', [token.addr, addrs[selectedAccount]], function(err, result) {
          var balance = result;
          if (token.name==selectedToken.name || token.name==selectedBase.name) {
            new EJS({url: config.homeURL+'/'+'balance.ejs'}).update(token.name==selectedToken.name ? 'balance_token' : 'balance_base', {translation: translation, selected: token, balance: balance});
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
            new EJS({url: config.homeURL+'/'+'balance.ejs'}).update(token.name==selectedToken.name ? 'balance_token' : 'balance_base', {translation: translation, selected: token, balance: balance});
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
      new EJS({url: config.homeURL+'/'+'balances.ejs'}).update('balances', {translation: translation, balances: balances, addr: addrs[selectedAccount]});
      callback();
    }
  );
}
Main.getToken = function(address) {
  var result = undefined;
  var matchingTokens = config.tokens.filter(function(x){return x.addr==address});
  if (matchingTokens.length>0) {
    result = matchingTokens[0];
  } else {
    if (selectedToken.addr==token) {
      result = selectedToken;
    } else if (selectedBase.addr==token) {
      result = selectedBase;
    }
  }
  return result;
}
Main.getDivisor = function(tokenOrAddress) {
  var result = 1000000000000000000;
  if (typeof(tokenOrAddress)=='object' && tokenOrAddress.divisor) {
    result = tokenOrAddress.divisor;
  } else {
    var matchingTokens = config.tokens.filter(function(x){return x.addr==tokenOrAddress});
    if (matchingTokens.length>0) {
      result = matchingTokens[0].divisor;
    } else {
      if (selectedToken.addr==tokenOrAddress) {
        result = selectedToken.divisor;
      } else if (selectedBase.addr==tokenOrAddress) {
        result = selectedBase.divisor;
      }
    }
  }
  return new BigNumber(result);
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
    utility.send(web3, contractToken, token.addr, 'transfer', [toAddr, amount, {gas: token.gasDeposit, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.addPending(err, {txHash: result.txHash});
      Main.alertTxResult(err, result);
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
    utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'deposit', [{gas: token.gasDeposit, value: amount}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.addPending(err, {txHash: result.txHash});
      Main.alertTxResult(err, result);
    });
  } else {
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
    workingOrders.push(order);
    Main.publishOrders(function(){});
  });
}
Main.publishOrders = function(callback) {
  if (!publishingOrders) {
    publishingOrders = true;
    utility.blockNumber(web3, function(err, blockNumber) {
      async.eachSeries(workingOrders,
        function(order, callbackEach) {
          if (blockNumber>=order.nextExpiration) {
            if (order.nextExpiration==0 || order.refresh) {
              order.nextExpiration = Number(order.expires) + blockNumber;
              order.nonce = utility.getRandomInt(0,Math.pow(2,32));
              Main.publishOrder(order.baseAddr, order.tokenAddr, order.direction, order.amount, order.price, order.nextExpiration, order.nonce);
            } else {
              order = undefined;
            }
          }
          callbackEach();
        },
        function(err) {
          workingOrders = workingOrders.filter(function(x){return x}); //filter out cleared orders
          publishingOrders = false;
          callback();
        }
      );
    });
  }
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
    utility.send(web3, contractEtherDelta, config.contractEtherDeltaAddr, 'cancelOrder', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s, {gas: token.gasTrade, value: 0}], addrs[selectedAccount], pks[selectedAccount], nonce, function(err, result) {
      txHash = result.txHash;
      nonce = result.nonce;
      Main.addPending(err, {txHash: result.txHash});
      Main.alertTxResult(err, result);
    });
  }
}
Main.cancelOrderRefresh = function(orderNonce) {
  var len = workingOrders.length;
  workingOrders = workingOrders.filter(function(order){
    order.nonce==orderNonce ? false : true;
  });
  if (workingOrders.length<len) {
    Main.displayEvents(function(){});
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
        if (result) {
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
  utility.getGitterMessages(gitterMessagesCache, function(err, result){
    if (!err) {
      gitterMessagesCache = result.gitterMessages;
      Main.createCookie(config.gitterCacheCookie, JSON.stringify(gitterMessagesCache), 999);
      if (result.newMessagesFound>0) {
        Main.displayEvents(function(){});
      }
    }
    callback();
  });
}
Main.displayContent = function(callback) {
  window.title = translation.title;
  $('#description').html(translation.description);
  $('#toggle_navigation').html(translation.toggle_navigation);
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
  $('.divisor_label').html(translation.disivor);
  $('.go_label').html(translation.go);
  new EJS({url: config.homeURL+'/'+'family.ejs'}).update('family', {translation: translation});
  new EJS({url: config.homeURL+'/'+'guides.ejs'}).update('guides', {translation: translation});
  callback();
}
Main.addPending = function(err, tx) {
  if (!err) {
    tx.txLink = 'https://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/tx/'+tx.txHash;
    pendingTransactions.push(tx);
    Main.displayMyEvents(function(){});
  }
}
Main.updateUrl = function() {
  window.location.hash = '#'+selectedToken.name+'-'+selectedBase.name;
}
Main.resetCaches = function() {
  Main.eraseCookie(config.eventsCacheCookie);
  Main.eraseCookie(config.gitterCacheCookie);
  Main.eraseCookie(config.deadOrdersCookie);
  location.reload();
}
Main.refresh = function(callback, updateData) {
  if (refreshing<=0 || Date.now()-lastRefresh>60*1000) {
    refreshing = 2;
    Main.createCookie(config.userCookie, JSON.stringify({"addrs": addrs, "pks": pks, "selectedAccount": selectedAccount, "selectedToken" : selectedToken, "selectedBase" : selectedBase}), 999);
    Main.connectionTest();
    Main.updateUrl();
    Main.publishOrders(function(){
      refreshing--;
    });
    if (updateData) {
      Main.displayAccounts(function(){
        Main.displayAllBalances(function(){
          Main.displayMyEvents(function(){
            loadedBalances = true;
            if (loadedBalances && loadedEvents) $('#loading').hide();
          });
        });
      });
    }
    Main.getGitterMessages(function(){
      Main.displayEvents(function(){
        loadedEvents = true;
        if (loadedBalances && loadedEvents) $('#loading').hide();
        refreshing--;
        lastRefresh = Date.now();
        callback();
      });
    });
  }
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
  connection = undefined;
  Main.createCookie(config.userCookie, JSON.stringify({"addrs": addrs, "pks": pks, "selectedAccount": selectedAccount, "selectedToken" : selectedToken, "selectedBase" : selectedBase}), 999);
  Main.connectionTest();
  Main.displayContent(function(){
    Main.displayLanguages(function(){
      Main.loadEvents(function(){
        Main.displayAccounts(function(){
          Main.displayMarket(function(){
            callback();
          });
        });
      });
    });
  });
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
var refreshing = 0;
var lastRefresh = Date.now();
var price = undefined;
var priceUpdated = Date.now();
var contractEtherDelta = undefined;
var contractToken = undefined;
var gitterMessagesCache = {};
var deadOrders = {};
var workingOrders = [];
var publishingOrders = false;
var pendingTransactions = [];
var defaultDivisor = new BigNumber(1000000000000000000);
var loadedEvents = false;
var loadedBalances = false;
var translation;
var language = 'English';
var minOrderSize = 0.1;
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
  //select token and base
  var hash = window.location.hash.substr(1);
  if (hash && hash.length>0) {
    var hashes = hash.split("-");
    if (hashes.length==2) {
      var matchesToken = config.tokens.filter(function(x){return x.name==hashes[0]});
      var matchesBase = config.tokens.filter(function(x){return x.name==hashes[1]});
      if (matchesToken.length>0 && matchesBase.length>0) {
        selectedToken = matchesToken[0];
        selectedBase = matchesBase[0];
      }
    }
  }
  //load contract
  config.contractEtherDeltaAddr = config.contractEtherDeltaAddrs[0].addr;
  utility.loadContract(web3, config.contractEtherDelta, config.contractEtherDeltaAddr, function(err, contract){
    contractEtherDelta = contract;
    utility.loadContract(web3, config.contractToken, '0x0000000000000000000000000000000000000000', function(err, contract){
      contractToken = contract;
      Main.init(function(){
        Main.refreshLoop();
      });
    });
  });
});

module.exports = {Main: Main, utility: utility};
