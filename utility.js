var config = (typeof(global.config) == 'undefined' && typeof(config) == 'undefined') ? require('./config.js') : global.config;
var fs = require('fs');
var request = require('request');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');
var Web3 = require('web3');
var SolidityFunction = require('web3/lib/web3/function.js');
var SolidityEvent = require('web3/lib/web3/event.js');
var coder = require('web3/lib/solidity/coder.js');
var utils = require('web3/lib/utils/utils.js');
var sha3 = require('web3/lib/utils/sha3.js');
var Tx = require('ethereumjs-tx');
var keythereum = require('keythereum');
var ethUtil = require('ethereumjs-util');
var BigNumber = require('bignumber.js');

function roundToNearest(numToRound, numToRoundTo) {
  numToRoundTo = 1 / (numToRoundTo);
  return Math.round(numToRound * numToRoundTo) / numToRoundTo;
}

function weiToEth(wei) {
  return (wei/1000000000000000000).toFixed(3);
}

function ethToWei(eth) {
  return parseFloat((eth*1000000000000000000).toPrecision(10));
}

function roundTo(numToRound, numToRoundTo) {
  return numToRound.toFixed(numToRoundTo);
}

function readFile(filename, callback) {
  if (callback) {
    try {
      if (typeof(window) === 'undefined') {
        fs.readFile(filename,{ encoding: 'utf8' }, function(err, data) {
          if (callback) {
            callback(data);
          }
        });
      } else {
        request.get(config.home_url+"/"+filename, function(err, httpResponse, body){
          callback(body);
        });
      }
    } catch (err) {
      callback(undefined);
    }
  } else {
    try {
      return fs.readFileSync(filename,{ encoding: 'utf8' });
    } catch (err) {
      return undefined;
    }
  }
}

function writeFile(filename, data) {
  fs.writeFile(filename, data, function(err) {
    if(err) {
        console.error("Could not write file: %s", err);
    }
	});
}

function testCall(web3, contract, address, functionName, args, callback) {
  var options = {};
  options.data = contract[functionName].getData.apply(null, args);
  options.to = address;
  web3.eth.call(options, function(err, result) {
    if (!err) {
      var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
      var solidityFunction = new SolidityFunction(web3._eth, functionAbi, address);
      callback(err, solidityFunction.unpackOutput(result));
    } else {
      callback(err, result);
    }
  });
}

function call(web3, contract, address, functionName, args, callback) {
  function proxy(retries) {
    var web3 = new Web3();
    var data = contract[functionName].getData.apply(null, args);
    var result = undefined;
    var url = 'https://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_call&to='+address+'&data='+data;
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        try {
          result = JSON.parse(body);
          var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
          var solidityFunction = new SolidityFunction(web3._eth, functionAbi, address);
          var result = solidityFunction.unpackOutput(result['result']);
          callback(result);
        } catch (err) {
          if (retries>0) {
            setTimeout(function(){
              proxy(retries-1);
            }, 1000);
          } else {
            callback(undefined);
          }
        }
      } else {
        callback(undefined);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      var data = contract[functionName].getData.apply(null, args);
      web3.eth.call({to: address, data: data}, function(err, result){
        if (!err) {
          var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
          var solidityFunction = new SolidityFunction(web3._eth, functionAbi, address);
          try {
            var result = solidityFunction.unpackOutput(result);
            callback(result);
          } catch (err) {
            callback(undefined);
          }
        } else {
          proxy(1);
        }
      });
    } else {
      proxy(1);
    }
  } catch(err) {
    proxy(1);
  }
}

function testSend(web3, contract, address, functionName, args, fromAddress, privateKey, nonce, callback) {
  function encodeConstructorParams(abi, params) {
      return abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
      }).map(function (json) {
        return json.inputs.map(function (input) {
          return input.type;
        });
      }).map(function (types) {
        return coder.encodeParams(types, params);
      })[0] || '';
  }
  args = Array.prototype.slice.call(args).filter(function (a) {return a !== undefined; });
  var options = {};
  if (typeof(args[args.length-1])=='object' && args[args.length-1].gas!=undefined) {
    args[args.length-1].gasPrice = config.eth_gas_price;
    args[args.length-1].gasLimit = args[args.length-1].gas;
    delete args[args.length-1].gas;
  }
  if (utils.isObject(args[args.length -1])) {
    options = args.pop();
  }
  if (functionName=="constructor") {
    if (options.data.slice(0,2)!="0x") {
      options.data = '0x' + options.data;
    }
    options.data += encodeConstructorParams(contract.abi, args);
  } else {
    options.to = address;
    var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
    var inputTypes = functionAbi.inputs.map(function(x) {return x.type});
    var typeName = inputTypes.join();
    options.data = '0x' + sha3(functionName+'('+typeName+')').slice(0, 8) + coder.encodeParams(inputTypes, args);
  }
  if (options.from == undefined) options.from = fromAddress;
  web3.eth.sendTransaction(options, function(err, result) {
    callback(err, result);
  });
}

function send(web3, contract, address, functionName, args, fromAddress, privateKey, nonce, callback) {
  if (privateKey && privateKey.substring(0,2)=='0x') {
    privateKey = privateKey.substring(2,privateKey.length);
  }
  function encodeConstructorParams(abi, params) {
      return abi.filter(function (json) {
        return json.type === 'constructor' && json.inputs.length === params.length;
      }).map(function (json) {
        return json.inputs.map(function (input) {
          return input.type;
        });
      }).map(function (types) {
        return coder.encodeParams(types, params);
      })[0] || '';
  }
  args = Array.prototype.slice.call(args).filter(function (a) {return a !== undefined; });
  var options = {};
  if (typeof(args[args.length-1])=='object' && args[args.length-1].gas!=undefined) {
    args[args.length-1].gasPrice = config.eth_gas_price;
    args[args.length-1].gasLimit = args[args.length-1].gas;
    delete args[args.length-1].gas;
  }
  if (utils.isObject(args[args.length -1])) {
    options = args.pop();
  }
  getNextNonce(web3, fromAddress, function(nextNonce){
    if (nonce==undefined || nonce<nextNonce) {
      nonce = nextNonce;
    }
    // console.log("Nonce:", nonce);
    options.nonce = nonce;
    if (functionName=="constructor") {
      if (options.data.slice(0,2)!="0x") {
        options.data = '0x' + options.data;
      }
      options.data += encodeConstructorParams(contract.abi, args);
    } else {
      options.to = address;
      var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
      var inputTypes = functionAbi.inputs.map(function(x) {return x.type});
      var typeName = inputTypes.join();
      options.data = '0x' + sha3(functionName+'('+typeName+')').slice(0, 8) + coder.encodeParams(inputTypes, args);
    }
    var tx = new Tx(options);
    signTx(web3, fromAddress, tx, privateKey, function(tx){
      if (tx) {
        var serializedTx = tx.serialize().toString('hex');
        function proxy() {
          var url = 'https://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api';
          request.post({url: url, form: {module: 'proxy', action: 'eth_sendRawTransaction', hex: serializedTx}}, function(err, httpResponse, body){
            if (!err) {
              try {
                var result = JSON.parse(body);
                if (result['result']) {
                  callback([result['result'], nonce+1]);
                } else if (result['error']) {
                  console.log(result['error']['message']);
                  callback([undefined, nonce]);
                }
              } catch (err) {
                console.log('Failed to parse JSON response from proxy.');
                callback([undefined, nonce]);
              }
            } else {
              console.log(err);
              callback([undefined, nonce]);
            }
          });
        }
        if (web3.currentProvider) {
          try {
            web3.eth.sendRawTransaction(serializedTx, function (err, hash) {
              if (err) {
                console.log(err);
                callback([undefined, nonce]);
              } else {
                callback([hash, nonce+1]);
              }
            });
          } catch (err) {
            console.log('Attempting to send transaction through the proxy.');
            proxy();
          }
        } else {
          proxy();
        }
      } else {
        callback([undefined, nonce]);
        console.log('Failed to sign transaction.');
      }
    });
  });
}

function estimateGas(web3, contract, address, functionName, args, fromAddress, privateKey, nonce, callback) {
  if (privateKey && privateKey.substring(0,2)=='0x') {
    privateKey = privateKey.substring(2,privateKey.length);
  }
  args = Array.prototype.slice.call(args).filter(function (a) {return a !== undefined; });
  var options = {};
  var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
  var inputTypes = functionAbi.inputs.map(function(x) {return x.type});
  if (typeof(args[args.length-1])=='object' && args[args.length-1].gas!=undefined) {
    args[args.length-1].gasPrice = config.eth_gas_price;
    args[args.length-1].gasLimit = args[args.length-1].gas;
    delete args[args.length-1].gas;
  }
  if (args.length > inputTypes.length && utils.isObject(args[args.length -1])) {
      options = args[args.length - 1];
  }
  getNextNonce(web3, fromAddress, function(nextNonce){
    if (nonce==undefined) {
      nonce = nextNonce;
    }
    options.nonce = nonce;
    options.to = address;
    var typeName = inputTypes.join();
    options.data = '0x' + sha3(functionName+'('+typeName+')').slice(0, 8) + coder.encodeParams(inputTypes, args);
    var tx = new Tx(options);
    signTx(web3, fromAddress, tx, privateKey, function(tx){
      if (tx) {
        var serializedTx = tx.serialize().toString('hex');
        if (web3.currentProvider) {
          try {
            web3.eth.estimateGas(options, function (err, result) {
              if (err) {
                callback(undefined);
              } else {
                callback(result);
              }
            });
          } catch (err) {
            callback(undefined);
          }
        } else {
          callback(undefined);
        }
      } else {
        callback(undefined);
      }
    });
  });
}

function txReceipt(web3, txHash, callback) {
  function proxy(){
    var url = 'https://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash='+txHash;
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        result = JSON.parse(body);
        callback(result['result']);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      callback(web3.eth.getTransactionReceipt(txHash));
    } else {
      proxy();
    }
  } catch(err) {
    proxy();
  }
}

function logs(web3, contract, address, fromBlock, toBlock, callback) {
  var options = {fromBlock: fromBlock, toBlock: toBlock, address: address};
  function decodeEvent(item) {
    eventAbis = contract.abi.filter(function(eventAbi){return eventAbi.type=='event' && item.topics[0]=='0x'+sha3(eventAbi.name+'('+eventAbi.inputs.map(function(x) {return x.type}).join()+')')});
    if (eventAbis.length>0) {
      var eventAbi = eventAbis[0];
      var event = new SolidityEvent(web3, eventAbi, address);
      var result = event.decode(item);
      callback(result);
    }
  }
  function proxy(retries) {
    var url = 'https://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api?module=logs&action=getLogs&address='+address+'&fromBlock='+fromBlock+'&toBlock='+toBlock;
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        try {
          var result = JSON.parse(body);
          var items = result['result'];
          async.each(items,
            function(item, callback_foreach){
              item.blockNumber = hex_to_dec(item.blockNumber);
              item.logIndex = hex_to_dec(item.logIndex);
              item.transactionIndex = hex_to_dec(item.transactionIndex);
              decodeEvent(item);
              callback_foreach();
            },
            function(err){
              setTimeout(function(){
                proxy(retries);
              }, 30*1000);
            }
          );
        } catch (err) {
          if (retries>0) {
            setTimeout(function(){
              proxy(retries-1);
            }, 1000);
          }
        }
      }
    });
  }
  try {
    if (web3.currentProvider) {
      web3.eth.filter(options, function(error, item){
        if (!error) {
          decodeEvent(item);
        }
      });
    } else {
      proxy(1);
    }
  } catch (err) {
    proxy(1);
  }
}

function getBalance(web3, address, callback) {
  function proxy(){
    var url = 'https://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api?module=account&action=balance&address='+address+'&tag=latest';
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        result = JSON.parse(body);
        callback(result['result']);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      callback(web3.eth.getBalance(address));
    } else {
      proxy();
    }
  } catch(err) {
    proxy();
  }
}

function getNextNonce(web3, address, callback) {
  function proxy(){
    var url = 'https://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_getTransactionCount&address='+address+'&tag=latest';
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        result = JSON.parse(body);
        var nextNonce = Number(result['result']);
        callback(nextNonce);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      var nextNonce = Number(web3.eth.getTransactionCount(address));
      //Note. initial nonce is 2^20 on testnet, but getTransactionCount already starts at 2^20.
      callback(nextNonce);
    } else {
      proxy();
    }
  } catch(err) {
    proxy();
  }
}

function blockNumber(web3, callback) {
  function proxy() {
    var url = 'https://'+(config.eth_testnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_blockNumber';
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        var result = JSON.parse(body);
        callback(Number(hex_to_dec(result['result'])));
      }
    });
  }
  if (web3.currentProvider) {
    web3.eth.getBlockNumber(function(err, blockNumber){
      if (!err) {
        callback(Number(blockNumber));
      } else {
        proxy();
      }
    });
  } else {
    proxy();
  }
}

function signTx(web3, address, tx, privateKey, callback) {
  if (privateKey) {
    tx.sign(new Buffer(privateKey, 'hex'));
    callback(tx);
  } else {
    var msgHash = '0x'+tx.hash(false).toString('hex');
    web3.eth.sign(address, msgHash, function(err, sig) {
      if (!err) {
        try {
          function hex_to_uint8array(s) {
            if (s.slice(0,2)=='0x') s=s.slice(2)
            var ua = new Uint8Array(s.length);
            for (var i = 0; i < s.length; i++) {
              ua[i] = s.charCodeAt(i);
            }
            return ua;
          }
          var r = sig.slice(0, 66);
          var s = '0x' + sig.slice(66, 130);
          var v = web3.toDecimal('0x' + sig.slice(130, 132));
          if (v!=27 && v!=28) v+=27;
          sig = {r: hex_to_uint8array(r), s: hex_to_uint8array(s), v: hex_to_uint8array(v.toString(16))};
          tx.r = r;
          tx.s = s;
          tx.v = v;
          callback(tx);
        } catch (err) {
          console.log(err);
          callback(undefined);
        }
      } else {
        console.log(err);
        callback(undefined);
      }
    });
  }
}

function sign(web3, address, value, privateKey, callback) {
  if (privateKey) {
    if (privateKey.substring(0,2)=='0x') privateKey = privateKey.substring(2,privateKey.length);
    if (value.substring(0,2)=='0x') value = value.substring(2,value.length);
    try {
      var sig = ethUtil.ecsign(new Buffer(value, 'hex'), new Buffer(privateKey, 'hex'));
      var r = '0x'+sig.r.toString('hex');
      var s = '0x'+sig.s.toString('hex');
      var v = sig.v;
      var result = {r: r, s: s, v: v};
      callback(result);
    } catch (err) {
      callback(undefined);
    }
  } else {
    web3.eth.sign(address, value, function(err, sig) {
      try {
        var r = sig.slice(0, 66);
        var s = '0x' + sig.slice(66, 130);
        var v = web3.toDecimal('0x' + sig.slice(130, 132));
        if (v!=27 && v!=28) v+=27;
        callback({r: r, s: s, v: v});
      } catch (err) {
        console.log(err);
        callback(undefined);
      }
    });
  }
}

function verify(web3, address, v, r, s, value, callback) {
  address = address.toLowerCase();
  if (r.substring(0,2)=='0x') r=r.substring(2,r.length);
  if (s.substring(0,2)=='0x') s=s.substring(2,s.length);
  if (value.substring(0,2)=='0x') value=value.substring(2,value.length);
  var pubKey = ethUtil.ecrecover(new Buffer(value, 'hex'), Number(v), new Buffer(r, 'hex'), new Buffer(s, 'hex'));
  var result = address == '0x'+ethUtil.pubToAddress(new Buffer(pubKey, 'hex')).toString('hex');
  if (callback) {
    callback(result);
  } else {
    return result;
  }
}

function createAddress() {
  var dk = keythereum.create();
  var pk = dk.privateKey;
  var addr = ethUtil.privateToAddress(pk);
  addr = ethUtil.toChecksumAddress(addr.toString('hex'));
  pk = pk.toString('hex');
  return [addr, pk];
}

function verifyPrivateKey(addr, privateKey) {
  if (privateKey && privateKey.substring(0,2)!='0x') {
    privateKey = '0x'+privateKey;
  }
  return addr == ethUtil.toChecksumAddress('0x'+ethUtil.privateToAddress(privateKey).toString('hex'));
}

function toChecksumAddress(addr) {
  if (addr && addr.substring(0,2)!='0x') {
    addr = '0x'+addr;
  }
  return ethUtil.toChecksumAddress(addr);
}

function diffs(data) {
  var result = [];
  for (var i=1; i<data.length; i++) {
    result.push(data[i]-data[i-1]);
  }
  return result;
}

function rets(data, direction) {
  if (typeof(direction)=="undefined") direction=0;
  var result = [];
  for (var i=1; i<data.length; i++) {
    if (direction==0 || (direction>0 && data[i]-data[i-1]>0) || (direction<0 && data[i]-data[i-1]<0)) {
      result.push((data[i]-data[i-1])/data[i-1]);
    }
  }
  return result;
}

function mean(data){
  return data.reduce(function(sum, value){ return sum + value; }, 0) / data.length;
}

function std_zero(data){
  return Math.sqrt(mean(data.map(function(value){ return Math.pow(value, 2) })));
}

function std(data){
  var avg = mean(data);
  return Math.sqrt(mean(data.map(function(value){ return Math.pow(value - avg, 2) })));
}

function random_hex(n) {
    var text = "";
    var possible = "ABCDEF0123456789";
    for( var i=0; i < n; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function zero_pad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function dec_to_hex(decStr, length) {
  if (typeof(length)==='undefined') length = 32;
  if (decStr < 0) {
    // return convert_base((Math.pow(2, length) + decStr).toString(), 10, 16);
    return (new BigNumber(2)).pow(length).add(new BigNumber(decStr)).toString(16);
  } else {
    return convert_base(decStr.toString(), 10, 16);
  }
}

function hex_to_dec(hexStr, length) { //length implies this is a two's complement number
  if (hexStr.substring(0, 2) === '0x') hexStr = hexStr.substring(2);
  hexStr = hexStr.toLowerCase();
  if (typeof(length)==='undefined'){
    return convert_base(hexStr, 16, 10);
  } else {
    var max = Math.pow(2, length);
    var answer = convert_base(hexStr, 16, 10);
    if (answer>max/2) {
      answer -= max;
    }
    return answer;
  }
}

function pack(data, lengths) {
  packed = "";
  for (var i=0; i<lengths.length; i++) {
    if (typeof(data[i])=='string') {
      if (data[i].substring(0,2)=='0x') data[i] = data[i].substring(2);
      packed += data[i];
    } else {
      packed += zero_pad(dec_to_hex(data[i], lengths[i]), lengths[i]/4);
    }
  }
  return packed;
}

function unpack(str, lengths) {
  var data = [];
  var length = 0;
  for (var i=0; i<lengths.length; i++) {
    data[i] = parseInt(hex_to_dec(str.substr(length,lengths[i]/4), lengths[i]));
    length += lengths[i]/4;
  }
  return data;
}

function convert_base(str, fromBase, toBase) {
  var digits = parse_to_digits_array(str, fromBase);
  if (digits === null) return null;
  var outArray = [];
  var power = [1];
  for (var i = 0; i < digits.length; i++) {
    if (digits[i]) {
      outArray = add(outArray, multiply_by_number(digits[i], power, toBase), toBase);
    }
    power = multiply_by_number(fromBase, power, toBase);
  }
  var out = '';
  for (var i = outArray.length - 1; i >= 0; i--) {
    out += outArray[i].toString(toBase);
  }
  if (out=='') out = 0;
  return out;
}

function parse_to_digits_array(str, base) {
  var digits = str.split('');
  var ary = [];
  for (var i = digits.length - 1; i >= 0; i--) {
    var n = parseInt(digits[i], base);
    if (isNaN(n)) return null;
    ary.push(n);
  }
  return ary;
}

function add(x, y, base) {
  var z = [];
  var n = Math.max(x.length, y.length);
  var carry = 0;
  var i = 0;
  while (i < n || carry) {
    var xi = i < x.length ? x[i] : 0;
    var yi = i < y.length ? y[i] : 0;
    var zi = carry + xi + yi;
    z.push(zi % base);
    carry = Math.floor(zi / base);
    i++;
  }
  return z;
}

function multiply_by_number(num, x, base) {
  if (num < 0) return null;
  if (num == 0) return [];

  var result = [];
  var power = x;
  while (true) {
    if (num & 1) {
      result = add(result, power, base);
    }
    num = num >> 1;
    if (num === 0) break;
    power = add(power, power, base);
  }

  return result;
}

function math_sign(x) {
  if (x>0) {
    return 1;
  } else if (x<0) {
    return -1;
  } else if (x==1) {
    return 0;
  }
}

if (!Object.prototype.find) {
  Object.values = function(obj) {
    return Object.keys(obj).map(function(key){return obj[key]});
  };
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

if (typeof Object.assign != 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

Array.prototype.equals = function(b) {
  if (this === b) return true;
  if (this == null || b == null) return false;
  if (this.length != b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.

  for (var i = 0; i < this.length; ++i) {
    if (this[i] !== b[i]) return false;
  }
  return true;
}

exports.add = add;
exports.multiply_by_number = multiply_by_number;
exports.parse_to_digits_array = parse_to_digits_array;
exports.convert_base = convert_base;
exports.zero_pad = zero_pad;
exports.hex_to_dec = hex_to_dec;
exports.dec_to_hex = dec_to_hex;
exports.pack = pack;
exports.unpack = unpack;
exports.getRandomInt = getRandomInt;
exports.random_hex = random_hex;
exports.rets = rets;
exports.diffs = diffs;
exports.std = std;
exports.std_zero = std_zero;
exports.mean = mean;
exports.getBalance = getBalance;
exports.send = send;
exports.call = call;
exports.testSend = testSend;
exports.testCall = testCall;
exports.estimateGas = estimateGas;
exports.txReceipt = txReceipt;
exports.logs = logs;
exports.blockNumber = blockNumber;
exports.sign = sign;
exports.verify = verify;
exports.createAddress = createAddress;
exports.verifyPrivateKey = verifyPrivateKey;
exports.toChecksumAddress = toChecksumAddress;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.roundTo = roundTo;
exports.weiToEth = weiToEth;
exports.ethToWei = ethToWei;
exports.roundToNearest = roundToNearest;
exports.math_sign = math_sign;
