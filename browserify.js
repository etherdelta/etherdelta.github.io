var Web3 = require('web3');
var utility = require('./utility.js');
var request = require('request');
var sha256 = require('js-sha256').sha256;
require('datejs');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');

function Main() {
}
Main.alertInfo = function(message) {
  $('#notifications').prepend($('<p>' + message + '</p>').hide().fadeIn(2000));
  console.log(message);
}
Main.alertTxHash = function(txHash) {
  if (txHash) {
    Main.alertInfo('You just created an Ethereum transaction. Track its progress here: <a href="http://'+(config.eth_testnet ? 'testnet.' : '')+'etherscan.io/tx/'+txHash+'" target="_blank">'+txHash+'</a>.');
  } else {
    Main.alertInfo('You tried to send an Ethereum transaction but there was an error. Check the Javascript console for details.');
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
  addrs = [config.eth_addr];
  pks = [config.eth_addr_pk];
  selectedAddr = 0;
  nonce = undefined;
  market_makers = {};
  browser_orders = [];
  Main.displayMarket(function(){});
  Main.refresh(function(){});
}
Main.createAddress = function() {
  var newAddress = utility.createAddress();
  var addr = newAddress[0];
  var pk = newAddress[1];
  Main.addAddress(addr, pk);
  Main.alertInfo('You just created an Ethereum address: '+addr+'.');
}
Main.deleteAddress = function() {
  addrs.splice(selectedAddr, 1);
  pks.splice(selectedAddr, 1);
  selectedAddr = 0;
  nonce = undefined;
  market_makers = {};
  browser_orders = [];
  Main.displayMarket(function(){});
  Main.refresh(function(){});
}
Main.selectAddress = function(i) {
  selectedAddr = i;
  nonce = undefined;
  market_makers = {};
  browser_orders = [];
  Main.displayMarket(function(){});
  Main.refresh(function(){});
}
Main.addAddress = function(addr, pk) {
  if (addr.slice(0,2)!='0x') addr = '0x'+addr;
  if (pk.slice(0,2)=='0x') pk = pk.slice(2);
  addr = utility.toChecksumAddress(addr);
  if (pk!=undefined && pk!='' && !utility.verifyPrivateKey(addr, pk)) {
    Main.alertInfo('For account '+addr+', the private key is invalid.');
  } else if (!web3.isAddress(addr)) {
    Main.alertInfo('The specified address, '+addr+', is invalid.');
  } else {
    addrs.push(addr);
    pks.push(pk);
    selectedAddr = addrs.length-1;
    nonce = undefined;
    market_makers = {};
    browser_orders = [];
    Main.displayMarket(function(){});
    Main.refresh(function(){});
  }
}
Main.showPrivateKey = function() {
  var addr = addrs[selectedAddr];
  var pk = pks[selectedAddr];
  if (pk==undefined || pk=='') {
    Main.alertInfo('For account '+addr+', there is no private key available. You can still transact if you are connected to Geth and the account is unlocked.');
  } else {
    Main.alertInfo('For account '+addr+', the private key is '+pk+'.');
  }
}
Main.addressLink = function(address) {
  return 'http://'+(config.eth_testnet ? 'testnet.' : '')+'etherscan.io/address/'+address;
}
Main.connectionTest = function() {
  if (connection) return connection;
  connection = {connection: 'Proxy', provider: 'http://'+(config.eth_testnet ? 'testnet.' : '')+'etherscan.io', testnet: config.eth_testnet};
  try {
    if (web3.currentProvider) {
      web3.eth.getBalance('0x0000000000000000000000000000000000000000');
      connection = {connection: 'Geth', provider: config.eth_provider, testnet: config.eth_testnet};
    }
  } catch(err) {
    web3.setProvider(undefined);
  }
  new EJS({url: config.home_url+'/'+'connection_description.ejs'}).update('connection', {connection: connection});
  return connection;
}
Main.loadAddresses = function(callback) {
  if (Main.connectionTest().connection=='Geth') {
    $('#pk_div').hide();
  }
  if (addrs.length<=0 || addrs.length!=pks.length) {
    addrs = [config.eth_addr];
    pks = [config.eth_addr_pk];
    selectedAddr = 0;
  }
  async.map(addrs,
    function(addr, callback_map) {
      utility.getBalance(web3, addr, function(balance) {
        callback_map(null, {addr: addr, balance: balance});
      });
    },
    function(err, addresses) {
      new EJS({url: config.home_url+'/'+'addresses.ejs'}).update('addresses', {addresses: addresses, selectedAddr: selectedAddr});
      callback();
    }
  );
}
Main.loadEvents = function(callback) {
  // var startBlock = blockNumber-5760;
  var startBlock = 0;
  utility.blockNumber(web3, function(blockNumber) {
    utility.logs(web3, contract_etherdelta, config.contract_etherdelta_addr, startBlock, 'latest', function(event) {
      event.tx_link = 'http://'+(config.eth_testnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
      events_cache[event.transactionHash+event.logIndex] = event;
      Main.displayEvents(function(){});
      Main.displayBalances(function(){});
    });
    callback();
  });
}
Main.displayEvents = function(callback) {
  utility.blockNumber(web3, function(blockNumber) {
    var events = Object.values(events_cache);
    //get the order book
    async.reduce(events, [],
      function(orders, event, callback_reduce) {
        if (event.event=='Order' && event.address==config.contract_etherdelta_addr) {
          var order;
          if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
            //buy
            order = {amount: event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
          } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
            //sell
            order = {amount: -event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive), id: event.blockNumber*1000+event.transactionIndex, order: event.args};
          }
          utility.call(web3, contract_etherdelta, config.contract_etherdelta_addr, 'availableVolume', [order.order.tokenGet, Number(order.order.amountGet), order.order.tokenGive, Number(order.order.amountGive), Number(order.order.expires), Number(order.order.nonce), order.order.user, Number(order.order.v), order.order.r, order.order.s], function(result) {
            order.availableVolume = result;
            if (order.availableVolume>0) {
              orders.push(order);
            }
            callback_reduce(null, orders);
          });
        } else {
          callback_reduce(null, orders);
        }
      },
      function(err, orders){
        var buy_orders = orders.filter(function(x){return x.amount>0});
        var sell_orders = orders.filter(function(x){return x.amount<0});
        buy_orders.sort(function(a,b){ return b.price - a.price || a.id - b.id });
        sell_orders.sort(function(a,b){ return a.price - b.price || a.id - b.id });
        //now get the trade list
        var trades = [];
        events.forEach(function(event){
          if (event.event=='Trade' && event.address==config.contract_etherdelta_addr) {
            var trade;
            if (event.args.tokenGet==selectedToken.addr && event.args.tokenGive==selectedBase.addr) {
              //sell
              trade = {amount: -event.args.amountGet, price: event.args.amountGive.div(event.args.amountGet), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.get, seller: event.args.give};
            } else if (event.args.tokenGet==selectedBase.addr && event.args.tokenGive==selectedToken.addr) {
              //buy
              trade = {amount: event.args.amountGive, price: event.args.amountGet.div(event.args.amountGive), id: event.blockNumber*1000+event.transactionIndex, blockNumber: event.blockNumber, buyer: event.args.give, seller: event.args.get};
            }
            trade.tx_link = 'http://'+(config.eth_testnet ? 'testnet.' : '')+'etherscan.io/tx/'+event.transactionHash;
            trades.push(trade);
          }
        });
        trades.sort(function(a,b){ return b.id - a.id });
        //display the template
        new EJS({url: config.home_url+'/'+'market_events.ejs'}).update('market_events', {selectedToken: selectedToken, selectedBase: selectedBase, buy_orders: buy_orders, sell_orders: sell_orders, trades: trades});
        $('table').stickyTableHeaders({scrollableArea: $('.scroll-container')});
        callback();
      }
    );
  });
}
Main.loadTokensAndBases = function(callback) {
  new EJS({url: config.home_url+'/'+'tokens.ejs'}).update('tokens', {tokens: config.tokens, selectedToken: selectedToken});
  new EJS({url: config.home_url+'/'+'bases.ejs'}).update('bases', {tokens: config.tokens, selectedBase: selectedBase});
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
Main.displayMarket = function(callback) {
  new EJS({url: config.home_url+'/'+'market_form.ejs'}).update('market_form', {selectedToken: selectedToken, selectedBase: selectedBase});
  Main.displayBalances(function(){
    Main.displayEvents(function(){
      callback();
    });
  });
}
Main.displayBalances = function(callback) {
  var zeroAddr = '0x0000000000000000000000000000000000000000';
  utility.getBalance(web3, addrs[selectedAddr], function(balance) {
    utility.call(web3, contract_etherdelta, config.contract_etherdelta_addr, 'balanceOf', [selectedToken.addr, addrs[selectedAddr]], function(result) {
      var balanceToken = result;
      utility.call(web3, contract_etherdelta, config.contract_etherdelta_addr, 'balanceOf', [selectedBase.addr, addrs[selectedAddr]], function(result) {
        var balanceBase = result;
        utility.call(web3, contract_token, selectedToken.addr, 'balanceOf', [addrs[selectedAddr]], function(result) {
          var balanceTokenOutside = selectedToken.addr==zeroAddr ? balance : result;
          utility.call(web3, contract_token, selectedBase.addr, 'balanceOf', [addrs[selectedAddr]], function(result) {
            var balanceBaseOutside = selectedBase.addr==zeroAddr ? balance : result;
            new EJS({url: config.home_url+'/'+'balance.ejs'}).update('balance_token', {selected: selectedToken, balanceOutside: balanceTokenOutside, balance: balanceToken});
            new EJS({url: config.home_url+'/'+'balance.ejs'}).update('balance_base', {selected: selectedBase, balanceOutside: balanceBaseOutside, balance: balanceBase});
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
    utility.send(web3, contract_etherdelta, config.contract_etherdelta_addr, 'deposit', [{gas: 150000, value: amount}], addrs[selectedAddr], pks[selectedAddr], nonce, function(result) {
      txHash = result[0];
      nonce = result[1];
      Main.alertTxHash(txHash);
    });
  } else {
    utility.send(web3, contract_token, addr, 'approve', [config.contract_etherdelta_addr, amount, {gas: 150000, value: 0}], addrs[selectedAddr], pks[selectedAddr], nonce, function(result) {
      txHash = result[0];
      nonce = result[1];
      Main.alertTxHash(txHash);
      utility.send(web3, contract_etherdelta, config.contract_etherdelta_addr, 'depositToken', [addr, amount, {gas: 150000, value: 0}], addrs[selectedAddr], pks[selectedAddr], nonce, function(result) {
        txHash = result[0];
        nonce = result[1];
        Main.alertTxHash(txHash);
      });
    });
  }
}
Main.withdraw = function(addr, amount) {
  amount = utility.ethToWei(amount);
  if (addr=='0x0000000000000000000000000000000000000000') {
    utility.send(web3, contract_etherdelta, config.contract_etherdelta_addr, 'withdraw', [amount, {gas: 150000, value: 0}], addrs[selectedAddr], pks[selectedAddr], nonce, function(result) {
      txHash = result[0];
      nonce = result[1];
      Main.alertTxHash(txHash);
    });
  } else {
    utility.send(web3, contract_etherdelta, config.contract_etherdelta_addr, 'withdrawToken', [addr, amount, {gas: 150000, value: 0}], addrs[selectedAddr], pks[selectedAddr], nonce, function(result) {
      txHash = result[0];
      nonce = result[1];
      Main.alertTxHash(txHash);
    });
  }
}
Main.order = function(base_addr, token_addr, direction, amount, price, expires) {
  utility.blockNumber(web3, function(blockNumber) {
    var tokenGet = undefined;
    var tokenGive = undefined;
    var amountGet = undefined;
    var amountGive = undefined;
    expires = Number(expires) + blockNumber;
    var orderNonce = utility.getRandomInt(0,Math.pow(2,32));
    if (direction=='buy') {
      tokenGet = token_addr;
      tokenGive = base_addr;
      amountGet = utility.ethToWei(amount);
      amountGive = utility.ethToWei(amount * price);
    } else if (direction=='sell') {
      tokenGet = base_addr;
      tokenGive = token_addr;
      amountGet = utility.ethToWei(amount * price);
      amountGive = utility.ethToWei(amount);
    } else {
      return;
    }
    var condensed = utility.pack([tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 256, 160, 256, 256, 256]);
    var hash = sha256(new Buffer(condensed,'hex'));
    utility.sign(web3, addrs[selectedAddr], hash, undefined, function(sig) {
      utility.send(web3, contract_etherdelta, config.contract_etherdelta_addr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, sig.v, sig.r, sig.s, {gas: 1000000, value: 0}], addrs[selectedAddr], pks[selectedAddr], nonce, function(result) {
        txHash = result[0];
        nonce = result[1];
        Main.alertTxHash(txHash);
      });
    });
  });
}
Main.trade = function(order, amount) {
  amount = utility.ethToWei(amount);
  utility.call(web3, contract_etherdelta, config.contract_etherdelta_addr, 'testTrade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s, amount, addrs[selectedAddr]], function(result) {
    if (result) {
      utility.send(web3, contract_etherdelta, config.contract_etherdelta_addr, 'trade', [order.tokenGet, Number(order.amountGet), order.tokenGive, Number(order.amountGive), Number(order.expires), Number(order.nonce), order.user, Number(order.v), order.r, order.s, amount, {gas: 1000000, value: 0}], addrs[selectedAddr], pks[selectedAddr], nonce, function(result) {
        txHash = result[0];
        nonce = result[1];
        Main.alertTxHash(txHash);
      });
    } else {
      Main.alertInfo("You tried placing an order, but the order failed. Either the order already traded or you or the counterparty do not have enough funds.");
    }
  });
}
Main.refresh = function(callback) {
  if (!refreshing || Date.now()-last_refresh>60*1000) {
    refreshing = true;
    Main.createCookie("user_etherdelta", JSON.stringify({"addrs": addrs, "pks": pks, "selectedAddr": selectedAddr, "selectedToken" : selectedToken, "selectedBase" : selectedBase}), 999);
    Main.connectionTest();
    Main.loadAddresses(function(){
      Main.loadTokensAndBases(function(){
        $('#loading').hide();
        refreshing = false;
        last_refresh = Date.now();
        callback();
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
        mainLoop();
      });
    });
  });
}

//globals
var addrs = [config.eth_addr];
var pks = [config.eth_addr_pk];
var selectedAddr = 0;
var selectedToken = config.tokens[0];
var selectedBase = config.tokens[1];
var cookie = Main.readCookie("user_etherdelta");
if (cookie) {
  cookie = JSON.parse(cookie);
  addrs = cookie["addrs"];
  pks = cookie["pks"];
  selectedAddr = cookie["selectedAddr"];
  selectedToken = cookie["selectedToken"];
  selectedBase = cookie["selectedBase"];
}
var connection = undefined;
var nonce = undefined;
var events_cache = {};
var refreshing = false;
var last_refresh = Date.now();
var price = undefined;
var price_updated = Date.now();
var contract_etherdelta = undefined;
var contract_token = undefined;
//web3
var web3 = new Web3();
web3.eth.defaultAccount = config.eth_addr;
web3.setProvider(new web3.providers.HttpProvider(config.eth_provider));

//get contracts
function loadContract(source_code, address, callback) {
  utility.readFile(source_code+'.bytecode', function(result){
    utility.readFile(source_code+'.interface', function(result){
      bytecode = JSON.parse(result);
      abi = JSON.parse(result);
      var contract = web3.eth.contract(abi);
      contract = contract.at(address);
      callback(contract, address);
    });
  });
}

loadContract(config.contract_etherdelta, config.contract_etherdelta_addr, function(contract, address){
  contract_etherdelta = contract;
  loadContract(config.contract_token, '0x0000000000000000000000000000000000000000', function(contract, address){
    contract_token = contract;
    Main.init();
  });
});


module.exports = {Main: Main, utility: utility};
