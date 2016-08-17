var config = (typeof(global.config) == 'undefined' && typeof(config) == 'undefined') ? require('../config.js') : global.config;
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
var https = require('https');

function weiToEth(wei, divisor) {
  if (!divisor) divisor = 1000000000000000000;
  return (wei/divisor).toFixed(3);
}

function ethToWei(eth, divisor) {
  if (!divisor) divisor = 1000000000000000000;
  return parseFloat((eth*divisor).toPrecision(10));
}

function roundToNearest(numToRound, numToRoundTo) {
    numToRoundTo = 1 / (numToRoundTo);
    return Math.round(numToRound * numToRoundTo) / numToRoundTo;
}

function readFile(filename, callback) {
  if (callback) {
    try {
      if (typeof(window) === 'undefined') {
        fs.readFile(filename,{ encoding: 'utf8' }, function(err, data) {
          if (err) {
            callback(err, undefined);
          } else {
            callback(undefined, data);
          }
        });
      } else {
        request.get(config.homeURL+"/"+filename, function(err, httpResponse, body){
          if (err) {
            callback(err, undefined);
          } else {
            callback(undefined, body);
          }
        });
      }
    } catch (err) {
      callback(err, undefined);
    }
  } else {
    try {
      return fs.readFileSync(filename,{ encoding: 'utf8' });
    } catch (err) {
      return undefined;
    }
  }
}

function writeFile(filename, data, callback) {
  fs.writeFile(filename, data, function(err) {
    if(err) {
      callback(err, false);
    } else {
      callback(undefined, true);
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
      var solidityFunction = new SolidityFunction(web3.Eth, functionAbi, address);
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
    var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_Call&to='+address+'&data='+data;
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        try {
          result = JSON.parse(body);
          var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
          var solidityFunction = new SolidityFunction(web3.Eth, functionAbi, address);
          var result = solidityFunction.unpackOutput(result['result']);
          callback(undefined, result);
        } catch (err) {
          if (retries>0) {
            setTimeout(function(){
              proxy(retries-1);
            }, 1000);
          } else {
            callback(err, undefined);
          }
        }
      } else {
        callback(err, undefined);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      var data = contract[functionName].getData.apply(null, args);
      web3.eth.call({to: address, data: data}, function(err, result){
        if (!err) {
          var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
          var solidityFunction = new SolidityFunction(web3.Eth, functionAbi, address);
          try {
            var result = solidityFunction.unpackOutput(result);
            callback(undefined, result);
          } catch (err) {
            proxy(1);
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
    args[args.length-1].gasPrice = config.ethGasPrice;
    args[args.length-1].gasLimit = args[args.length-1].gas;
    delete args[args.length-1].gas;
  }
  if (utils.isObject(args[args.length-1])) {
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
    args[args.length-1].gasPrice = config.ethGasPrice;
    args[args.length-1].gasLimit = args[args.length-1].gas;
    delete args[args.length-1].gas;
  }
  if (utils.isObject(args[args.length-1])) {
    options = args.pop();
  }
  getNextNonce(web3, fromAddress, function(err, nextNonce){
    if (nonce==undefined || nonce<nextNonce) {
      nonce = nextNonce;
    }
    // console.log("Nonce:", nonce);
    options.nonce = nonce;
    if (functionName=="constructor") {
      if (options.data.slice(0,2)!="0x") {
        options.data = '0x' + options.data;
      }
      var encodedParams = encodeConstructorParams(contract.abi, args);
      console.log(encodedParams);
      options.data += encodedParams;
    } else {
      options.to = address;
      var functionAbi = contract.abi.find(function(element, index, array) {return element.name==functionName});
      var inputTypes = functionAbi.inputs.map(function(x) {return x.type});
      var typeName = inputTypes.join();
      options.data = '0x' + sha3(functionName+'('+typeName+')').slice(0, 8) + coder.encodeParams(inputTypes, args);
    }
    var tx = new Tx(options);
    function proxy() {
      signTx(web3, fromAddress, tx, privateKey, function(err, tx){
        if (!err) {
          var serializedTx = tx.serialize().toString('hex');
          var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api';
          request.post({url: url, form: {module: 'proxy', action: 'eth_sendRawTransaction', hex: serializedTx}}, function(err, httpResponse, body){
            if (!err) {
              try {
                var result = JSON.parse(body);
                if (result['result']) {
                  callback(undefined, {txHash: result['result'], nonce: nonce+1});
                } else if (result['error']) {
                  callback(result['error']['message'], {txHash: undefined, nonce: nonce});
                }
              } catch (err) {
                callback(err, {txHash: undefined, nonce: nonce});
              }
            } else {
              callback(err, {txHash: undefined, nonce: nonce});
            }
          });
        } else {
          console.log(err)
          callback('Failed to sign transaction', {txHash: undefined, nonce: nonce});
        }
      });
    }
    try {
      if (web3.currentProvider) {
        options.from = fromAddress;
        options.gas = options.gasLimit;
        delete options.gasLimit;
        web3.eth.sendTransaction(options, function(err, hash){
          if (!err) {
            callback(undefined, {txHash: hash, nonce: nonce+1});
          } else {
            console.log(err);
            proxy();
          }
        })
      } else {
        proxy();
      }
    } catch (err) {
      proxy();
    }
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
    args[args.length-1].gasPrice = config.ethGasPrice;
    args[args.length-1].gasLimit = args[args.length-1].gas;
    delete args[args.length-1].gas;
  }
  if (args.length > inputTypes.length && utils.isObject(args[args.length-1])) {
      options = args[args.length-1];
  }
  getNextNonce(web3, fromAddress, function(err, nextNonce){
    if (nonce==undefined) {
      nonce = nextNonce;
    }
    options.nonce = nonce;
    options.to = address;
    var typeName = inputTypes.join();
    options.data = '0x' + sha3(functionName+'('+typeName+')').slice(0, 8) + coder.encodeParams(inputTypes, args);
    var tx = new Tx(options);
    signTx(web3, fromAddress, tx, privateKey, function(err, tx){
      if (tx) {
        var serializedTx = tx.serialize().toString('hex');
        if (web3.currentProvider) {
          try {
            web3.eth.estimateGas(options, function (err, result) {
              if (err) {
                callback(err, undefined);
              } else {
                callback(undefined, result);
              }
            });
          } catch (err) {
            callback(err, undefined);
          }
        } else {
          callback('No provider set for web3', undefined);
        }
      } else {
        callback('Failed to sign transaction', undefined);
      }
    });
  });
}

function txReceipt(web3, txHash, callback) {
  function proxy(){
    var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_GetTransactionReceipt&txhash='+txHash;
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        result = JSON.parse(body);
        callback(undefined, result['result']);
      } else {
        callback(err, undefined);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      try {
        web3.eth.getTransactionReceipt(txHash, function (err, result) {
          if (err) {
            proxy();
          } else {
            callback(undefined, result);
          }
        });
      } catch (err) {
        proxy();
      }
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
      callback(undefined, result);
    }
  }
  function proxy(retries) {
    var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api?module=logs&action=getLogs&address='+address+'&fromBlock='+fromBlock+'&toBlock='+toBlock;
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        try {
          var result = JSON.parse(body);
          var items = result['result'];
          async.each(items,
            function(item, callbackForeach){
              item.blockNumber = hexToDec(item.blockNumber);
              item.logIndex = hexToDec(item.logIndex);
              item.transactionIndex = hexToDec(item.transactionIndex);
              decodeEvent(item);
              callbackForeach();
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
        } else {
          proxy(1);
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
    var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api?module=account&action=balance&address='+address+'&tag=latest';
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        result = JSON.parse(body);
        callback(undefined, result['result']);
      } else {
        callback(err, undefined);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      web3.eth.getBalance(address, function(err, balance){
        if (!err) {
          callback(undefined, balance);
        } else {
          proxy();
        }
      });
    } else {
      proxy();
    }
  } catch(err) {
    proxy();
  }
}

function getCode(web3, address, callback) {
  function proxy(){
    var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_getCode&address='+address+'&tag=latest';
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        result = JSON.parse(body);
        callback(undefined, result['result']);
      } else {
        callback(err, undefined);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      web3.eth.getCode(address, function(err, code){
        if (!err) {
          callback(undefined, code);
        } else {
          proxy();
        }
      });
    } else {
      proxy();
    }
  } catch(err) {
    proxy();
  }
}

function getNextNonce(web3, address, callback) {
  function proxy(){
    var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_GetTransactionCount&address='+address+'&tag=latest';
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        result = JSON.parse(body);
        var nextNonce = Number(result['result']);
        callback(undefined, nextNonce);
      } else {
        callback(err, undefined);
      }
    });
  }
  try {
    if (web3.currentProvider) {
      web3.eth.getTransactionCount(address, function(err, result){
        if (!err) {
          var nextNonce = Number(result);
          //Note. initial nonce is 2^20 on testnet, but getTransactionCount already starts at 2^20.
          callback(undefined, nextNonce);
        } else {
          proxy();
        }
      });
    } else {
      proxy();
    }
  } catch(err) {
    proxy();
  }
}

function blockNumber(web3, callback) {
  function proxy() {
    var url = 'https://'+(config.ethTestnet ? 'testnet' : 'api')+'.etherscan.io/api?module=proxy&action=eth_BlockNumber';
    request.get(url, function(err, httpResponse, body){
      if (!err) {
        var result = JSON.parse(body);
        callback(undefined, Number(hexToDec(result['result'])));
      } else {
        callback(err, undefined);
      }
    });
  }
  if (web3.currentProvider) {
    web3.eth.getBlockNumber(function(err, blockNumber){
      if (!err) {
        callback(undefined, Number(blockNumber));
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
    callback(undefined, tx);
  } else {
    var msgHash = '0x'+tx.hash(false).toString('hex');
    web3.eth.sign(address, msgHash, function(err, sig) {
      if (!err) {
        try {
          function hexToUint8array(s) {
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
          sig = {r: hexToUint8array(r), s: hexToUint8array(s), v: hexToUint8array(v.toString(16))};
          tx.r = r;
          tx.s = s;
          tx.v = v;
          callback(undefined, tx);
        } catch (err) {
          callback(err, undefined);
        }
      } else {
        callback(err, undefined);
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
      callback(undefined, result);
    } catch (err) {
      callback(err, undefined);
    }
  } else {
    web3.eth.sign(address, value, function(err, sig) {
      if (!err) {
        try {
          var r = sig.slice(0, 66);
          var s = '0x' + sig.slice(66, 130);
          var v = web3.toDecimal('0x' + sig.slice(130, 132));
          if (v!=27 && v!=28) v+=27;
          callback(undefined, {r: r, s: s, v: v});
        } catch (err) {
          callback(err, undefined);
        }
      } else {
        callback(err, undefined);
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
    callback(undefined, result);
  } else {
    return result;
  }
}

function createAccount() {
  var dk = keythereum.create();
  var privateKey = dk.privateKey;
  var address = ethUtil.privateToAddress(privateKey);
  address = ethUtil.toChecksumAddress(address.toString('hex'));
  privateKey = privateKey.toString('hex');
  return {address: address, privateKey: privateKey};
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

function loadContract(web3, sourceCode, address, callback) {
  readFile(sourceCode+'.bytecode', function(err, bytecode){
    readFile(sourceCode+'.interface', function(err, abi){
      abi = JSON.parse(abi);
      bytecode = JSON.parse(bytecode);
      var contract = web3.eth.contract(abi);
      contract = contract.at(address);
      callback(undefined, contract);
    });
  });
}

function deployContract(web3, sourceFile, contractName, constructorParams, address, callback) {
  readFile(sourceFile+'.bytecode', function(err, bytecode){
    readFile(sourceFile+'.interface', function(err, abi){
      readFile(sourceFile, function(err, source){
        if (abi && bytecode) {
          abi = JSON.parse(abi);
          bytecode = JSON.parse(bytecode);
        } else {
          callback('Could not load bytecode and ABI', undefined);
          // var solc = require('solc');
          // var compiled = solc.compile(source, 1).contracts[contractName];
          // abi = JSON.parse(compiled.interface);
          // bytecode = compiled.bytecode;
        }
        var contract = web3.eth.contract(abi);
        send(web3, contract, undefined, 'constructor', constructorParams.concat([{from: address, data: bytecode, gas: 4700000, gasPrice: config.ethGasPrice}]), address, undefined, 0, function(err, result) {
          var txHash = result.txHash;
          var address = undefined;
          async.whilst(
            function () { return address==undefined; },
            function (callbackWhilst) {
                setTimeout(function () {
                  txReceipt(web3, txHash, function(err, receipt) {
                    if (receipt) {
                      address = receipt.contractAddress;
                    }
                    callbackWhilst(null);
                  });
                }, 1*1000);
            },
            function (err) {
              callback(undefined, address);
            }
          );
        });
      });
    });
  });
}

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

function decToHex(dec, length) {
  if (typeof(length)==='undefined') length = 32;
  if (dec < 0) {
    // return convertBase((Math.pow(2, length) + decStr).toString(), 10, 16);
    return (new BigNumber(2)).pow(length).add(new BigNumber(dec)).toString(16);
  } else {
    var result = null;
    try {
      result = convertBase(dec.toString(), 10, 16);
    } catch (err) {
      result = null;
    }
    if (result) {
      return result;
    } else {
      return (new BigNumber(dec)).toString(16);
    }
  }
}

function hexToDec(hexStr, length) { //length implies this is a two's complement number
  if (hexStr.substring(0, 2) === '0x') hexStr = hexStr.substring(2);
  hexStr = hexStr.toLowerCase();
  if (typeof(length)==='undefined'){
    return convertBase(hexStr, 16, 10);
  } else {
    var max = Math.pow(2, length);
    var answer = convertBase(hexStr, 16, 10);
    if (answer>max/2) {
      answer = max;
    }
    return answer;
  }
}

function pack(data, lengths) {
  packed = "";
  for (var i=0; i<lengths.length; i++) {
    if (typeof(data[i])=='string' && data[i].substring(0,2)=='0x') {
      if (data[i].substring(0,2)=='0x') data[i] = data[i].substring(2);
      packed += zeroPad(data[i], lengths[i]/4);
    } else if (typeof(data[i])!='number' && /[a-f]/.test(data[i])) {
      if (data[i].substring(0,2)=='0x') data[i] = data[i].substring(2);
      packed += zeroPad(data[i], lengths[i]/4);
    } else {
      // packed += zeroPad(new BigNumber(data[i]).toString(16), lengths[i]/4);
      packed += zeroPad(decToHex(data[i], lengths[i]), lengths[i]/4);
    }
  }
  return packed;
}

function unpack(str, lengths) {
  var data = [];
  var length = 0;
  for (var i=0; i<lengths.length; i++) {
    data[i] = parseInt(hexToDec(str.substr(length,lengths[i]/4), lengths[i]));
    length += lengths[i]/4;
  }
  return data;
}

function convertBase(str, fromBase, toBase) {
  var digits = parseToDigitsArray(str, fromBase);
  if (digits === null) return null;
  var outArray = [];
  var power = [1];
  for (var i = 0; i < digits.length; i++) {
    if (digits[i]) {
      outArray = add(outArray, multiplyByNumber(digits[i], power, toBase), toBase);
    }
    power = multiplyByNumber(fromBase, power, toBase);
  }
  var out = '';
  for (var i = outArray.length-1; i >= 0; i--) {
    out += outArray[i].toString(toBase);
  }
  if (out=='') out = 0;
  return out;
}

function parseToDigitsArray(str, base) {
  var digits = str.split('');
  var ary = [];
  for (var i = digits.length-1; i >= 0; i--) {
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

function multiplyByNumber(num, x, base) {
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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function streamGitterMessages(gitterMessages, callback) {
  var heartbeat = " \n";
  var options = {
    hostname: config.gitterStream,
    port:     443,
    path:     '/v1/rooms/' + config.gitterRoomID + '/chatMessages',
    method:   'GET',
    headers:  {'Authorization': 'Bearer ' + config.gitterToken}
  };
  var req = https.request(options, function(res) {
    res.on('data', function(chunk) {
      var msg = chunk.toString();
      if (msg !== heartbeat) {
        try {
          var message = JSON.parse(msg);
          if (!gitterMessages[message.id]) {
            gitterMessages[message.id] = JSON.parse(message.text);
            callback(undefined, true);
          }
        } catch (err) {
          callback(err, false);
        }
      }
    });
  });
  req.on('error', function(err) {
    callback(err, false);
  });
  req.end();
}

function getGitterMessages(gitterMessages, callback) {
  var numMessages = undefined;
  var skip = 0;
  var messages = [];
  var pages = 20;
  var newMessagesFound = 0;
  var perPage = 100;
  async.until(
    function () { return pages <= 0; },
    function (callbackUntil) {
      pages -= 1;
      var url = config.gitterHost + '/v1/rooms/'+config.gitterRoomID+'/chatMessages?access_token='+config.gitterToken+'&limit='+perPage+'&skip='+skip;
      request.get(url, function(err, httpResponse, body){
        if (!err) {
          var data = JSON.parse(body);
          if (data && data.length>0) {
            skip += perPage;
            data.forEach(function(message){
              if (gitterMessages[message.id]) {
                pages = 0;
              } else {
                try {
                  gitterMessages[message.id] = JSON.parse(message.text);
                  newMessagesFound++;
                } catch (err) {
                }
              }
            });
          } else {
            pages = 0;
          }
        } else {
          numMessages = 0;
        }
        callbackUntil(null);
      });
    },
    function (err) {
      if (err) {
        callback(err, undefined);
      } else {
        callback(undefined, {gitterMessages: gitterMessages, newMessagesFound: newMessagesFound});
      }
    }
  );
}

function postGitterMessage(message, callback) {
  var url = config.gitterHost + '/v1/rooms/'+config.gitterRoomID+'/chatMessages?access_token='+config.gitterToken;
  request.post({url: url, form: {text: message}}, function(err, httpResponse, body){
    if (!err) {
      if (callback) callback(undefined, true);
    } else {
      if (callback) callback('Failure', false);
    }
  });
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

Math.sign = Math.sign || function(x) {
  x = +x; // convert to a number
  if (x === 0 || isNaN(x)) {
    return x;
  }
  return x > 0 ? 1 : -1;
}

exports.decToHex = decToHex;
exports.hexToDec = hexToDec;
exports.roundToNearest = roundToNearest;
exports.pack = pack;
exports.unpack = unpack;
exports.getBalance = getBalance;
exports.getCode = getCode;
exports.getNextNonce = getNextNonce;
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
exports.createAccount = createAccount;
exports.verifyPrivateKey = verifyPrivateKey;
exports.toChecksumAddress = toChecksumAddress;
exports.readFile = readFile;
exports.writeFile = writeFile;
exports.weiToEth = weiToEth;
exports.ethToWei = ethToWei;
exports.loadContract = loadContract;
exports.deployContract = deployContract;
exports.getRandomInt = getRandomInt;
exports.streamGitterMessages = streamGitterMessages;
exports.getGitterMessages = getGitterMessages;
exports.postGitterMessage = postGitterMessage;
