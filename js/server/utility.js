/* This module was module number 529 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ../server/utility.js
*/
(function(Buffer) {
    'use strict';
    var _typeof =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                ? function(obj) {
                      return typeof obj;
                  }
                : function(obj) {
                      return obj &&
                          'function' == typeof Symbol &&
                          obj.constructor === Symbol &&
                          obj !== Symbol.prototype
                          ? 'symbol'
                          : typeof obj;
                  },
        fs = require('fs'),
        request = require('request'),
        async = require('undefined' == typeof window
            ? 'async'
            : 'async/dist/async.min.js'),
        Web3 = require('web3'),
        SolidityFunction = require('web3/lib/web3/function.js'),
        SolidityEvent = require('web3/lib/web3/event.js'),
        coder = require('web3/lib/solidity/coder.js'),
        utils = require('web3/lib/utils/utils.js'),
        sha3 = require('web3/lib/utils/sha3.js'),
        Tx = require('ethereumjs-tx'),
        keythereum = require('keythereum'),
        ethUtil = require('ethereumjs-util'),
        BigNumber = require('bignumber.js'),
        xss = require('xss'),
        sanitizer = require('sanitizer');
    module.exports = function(config) {
        var utility = {};
        return (
            (utility.weiToEth = function(weiIn, divisorIn, fixIn) {
                var fix = fixIn || 3,
                    wei = new BigNumber(String(weiIn)),
                    divisor = new BigNumber(divisorIn ? divisorIn : 1e18);
                return fixIn
                    ? wei
                          .div(divisor)
                          .toNumber()
                          .toFixed(fix)
                    : wei.div(divisor);
            }),
            (utility.ethToWei = function(ethIn, divisorIn, ceil) {
                var eth = new BigNumber(String(ethIn)),
                    divisor = new BigNumber(divisorIn ? divisorIn : 1e18);
                return ceil
                    ? eth.times(divisor).ceil()
                    : eth.times(divisor).floor();
            }),
            (utility.roundToNearest = function(numToRound, numToRoundToIn) {
                var numToRoundTo = 1 / numToRoundToIn;
                return Math.round(numToRound * numToRoundTo) / numToRoundTo;
            }),
            (utility.getURLCookie = function(url, callback) {
                request.get(
                    { url: url, headers: void 0, withCredentials: !0 },
                    function(err, httpResponse, body) {
                        err
                            ? callback(err, void 0)
                            : callback(void 0, xss(sanitizer.sanitize(body)));
                    }
                );
            }),
            (utility.getURL = function(url, callback, options) {
                request.get(url, options, function(err, httpResponse, body) {
                    err
                        ? callback(err, void 0, void 0)
                        : callback(void 0, xss(sanitizer.sanitize(body)));
                });
            }),
            (utility.postURL = function(url, formData, callback) {
                request.post({ url: url, form: formData }, function(
                    err,
                    httpResponse,
                    body
                ) {
                    err
                        ? callback(err, void 0)
                        : callback(void 0, xss(sanitizer.sanitize(body)));
                });
            }),
            (utility.readFile = function(filename, callback) {
                if (callback)
                    try {
                        'undefined' == typeof window
                            ? fs.readFile(
                                  filename,
                                  { encoding: 'utf8' },
                                  function(err, data) {
                                      err
                                          ? callback(err, void 0)
                                          : callback(void 0, data);
                                  }
                              )
                            : utility.getURL(
                                  window.location.origin + '/' + filename,
                                  function(err, body) {
                                      err
                                          ? callback(err, void 0)
                                          : callback(void 0, body);
                                  }
                              );
                    } catch (err) {
                        callback(err, void 0);
                    }
                else
                    try {
                        return fs.readFileSync(filename, { encoding: 'utf8' });
                    } catch (err) {
                        return;
                    }
            }),
            (utility.writeFile = function(filename, data, callback) {
                fs.writeFile(filename, data, function(err) {
                    err ? callback(err, !1) : callback(void 0, !0);
                });
            }),
            (utility.createCookie = function(name, value, days) {
                if (localStorage) localStorage.setItem(name, value);
                else {
                    var expires = void 0;
                    if (days) {
                        var date = new Date();
                        date.setTime(
                            date.getTime() + 24 * days * 60 * 60 * 1e3
                        ),
                            (expires = '; expires=' + date.toGMTString());
                    } else expires = '';
                    document.cookie = name + '=' + value + expires + '; path=/';
                }
            }),
            (utility.readCookie = function(name) {
                if (localStorage) return localStorage.getItem(name);
                for (
                    var nameEQ = name + '=',
                        ca = document.cookie.split(';'),
                        i = 0;
                    i < ca.length;
                    i += 1
                ) {
                    for (var c = ca[i]; ' ' === c.charAt(0); )
                        c = c.substring(1, c.length);
                    if (0 === c.indexOf(nameEQ))
                        return c.substring(nameEQ.length, c.length);
                }
                return null;
            }),
            (utility.eraseCookie = function(name) {
                localStorage
                    ? localStorage.removeItem(name)
                    : utility.createCookie(name, '', -1);
            }),
            (utility.getNextNonce = function(web3, address, callback) {
                function proxy() {
                    var url =
                        'https://' +
                        (config.ethTestnet ? config.ethTestnet : 'api') +
                        '.etherscan.io/api?module=proxy&action=eth_GetTransactionCount&address=' +
                        address +
                        '&tag=latest';
                    config.etherscanAPIKey &&
                        (url += '&apikey=' + config.etherscanAPIKey),
                        utility.getURL(url, function(err, body) {
                            if (err) callback(err, void 0);
                            else {
                                var result = JSON.parse(body),
                                    nextNonce = Number(result.result);
                                callback(void 0, nextNonce);
                            }
                        });
                }
                try {
                    web3.currentProvider
                        ? web3.eth.getTransactionCount(address, function(
                              err,
                              result
                          ) {
                              if (err) proxy();
                              else {
                                  var nextNonce = Number(result);
                                  callback(void 0, nextNonce);
                              }
                          })
                        : proxy();
                } catch (err) {
                    proxy();
                }
            }),
            (utility.testCall = function(
                web3,
                contract,
                address,
                functionName,
                args,
                callback
            ) {
                var options = {};
                (options.data = contract[functionName].getData.apply(
                    null,
                    args
                )),
                    (options.to = address),
                    web3.eth.call(options, function(err, result) {
                        if (err) callback(err, result);
                        else {
                            var functionAbi = contract.abi.find(function(
                                    element
                                ) {
                                    return element.name === functionName;
                                }),
                                solidityFunction = new SolidityFunction(
                                    web3.Eth,
                                    functionAbi,
                                    address
                                );
                            callback(
                                err,
                                solidityFunction.unpackOutput(result)
                            );
                        }
                    });
            }),
            (utility.call = function(
                web3In,
                contract,
                address,
                functionName,
                args,
                callback
            ) {
                function proxy(retries) {
                    var web3 = new Web3(),
                        data = contract[functionName].getData.apply(null, args),
                        url =
                            'https://' +
                            (config.ethTestnet ? config.ethTestnet : 'api') +
                            '.etherscan.io/api?module=proxy&action=eth_Call&to=' +
                            address +
                            '&data=' +
                            data;
                    config.etherscanAPIKey &&
                        (url += '&apikey=' + config.etherscanAPIKey),
                        utility.getURL(url, function(err, body) {
                            if (err) callback(err, void 0);
                            else
                                try {
                                    var result = JSON.parse(body),
                                        functionAbi = contract.abi.find(
                                            function(element) {
                                                return (
                                                    element.name ===
                                                    functionName
                                                );
                                            }
                                        ),
                                        unsafeResult = new SolidityFunction(
                                            web3.Eth,
                                            functionAbi,
                                            address
                                        ).unpackOutput(result.result),
                                        safeResult = xss(
                                            sanitizer.sanitize(unsafeResult)
                                        ),
                                        finalResult =
                                            'BigNumber' ===
                                            unsafeResult.constructor.name
                                                ? new BigNumber(safeResult)
                                                : safeResult;
                                    callback(void 0, finalResult);
                                } catch (errJson) {
                                    retries > 0
                                        ? setTimeout(function() {
                                              proxy(retries - 1);
                                          }, 1e3)
                                        : callback(err, void 0);
                                }
                        });
                }
                try {
                    if (web3In.currentProvider) {
                        var data = contract[functionName].getData.apply(
                            null,
                            args
                        );
                        web3In.eth.call({ to: address, data: data }, function(
                            err,
                            result
                        ) {
                            if (err) proxy(1);
                            else {
                                var functionAbi = contract.abi.find(function(
                                        element
                                    ) {
                                        return element.name === functionName;
                                    }),
                                    solidityFunction = new SolidityFunction(
                                        web3In.Eth,
                                        functionAbi,
                                        address
                                    );
                                try {
                                    var unsafeResult = solidityFunction.unpackOutput(
                                            result
                                        ),
                                        safeResult = xss(
                                            sanitizer.sanitize(unsafeResult)
                                        ),
                                        finalResult =
                                            'BigNumber' ===
                                                unsafeResult.constructor.name ||
                                            'Number' ===
                                                unsafeResult.constructor.name
                                                ? new BigNumber(safeResult)
                                                : safeResult;
                                    callback(void 0, finalResult);
                                } catch (errJson) {
                                    proxy(1);
                                }
                            }
                        });
                    } else proxy(1);
                } catch (err) {
                    proxy(1);
                }
            }),
            (utility.testSend = function(
                web3,
                contract,
                address,
                functionName,
                argsIn,
                fromAddress,
                privateKey,
                nonce,
                callback
            ) {
                var args = Array.prototype.slice
                        .call(argsIn)
                        .filter(function(a) {
                            return void 0 !== a;
                        }),
                    options = {};
                if (
                    ('object' === _typeof(args[args.length - 1]) &&
                        args[args.length - 1].gas &&
                        ((args[args.length - 1].gasPrice = config.ethGasPrice),
                        (args[args.length - 1].gasLimit =
                            args[args.length - 1].gas),
                        delete args[args.length - 1].gas),
                    utils.isObject(args[args.length - 1]) &&
                        (options = args.pop()),
                    'constructor' === functionName)
                )
                    '0x' !== options.data.slice(0, 2) &&
                        (options.data = '0x' + options.data),
                        (options.data += (function(abi, params) {
                            return (
                                abi
                                    .filter(function(json) {
                                        return (
                                            'constructor' === json.type &&
                                            json.inputs.length === params.length
                                        );
                                    })
                                    .map(function(json) {
                                        return json.inputs.map(function(input) {
                                            return input.type;
                                        });
                                    })
                                    .map(function(types) {
                                        return coder.encodeParams(
                                            types,
                                            params
                                        );
                                    })[0] || ''
                            );
                        })(contract.abi, args));
                else {
                    options.to = address;
                    var inputTypes = contract.abi
                            .find(function(element) {
                                return element.name === functionName;
                            })
                            .inputs.map(function(x) {
                                return x.type;
                            }),
                        typeName = inputTypes.join(),
                        data =
                            sha3(functionName + '(' + typeName + ')').slice(
                                0,
                                8
                            ) + coder.encodeParams(inputTypes, args);
                    options.data = '0x' + data;
                }
                options.from || (options.from = fromAddress),
                    web3.eth.sendTransaction(options, function(err, result) {
                        callback(err, result);
                    });
            }),
            (utility.send = function(
                web3,
                ledgerEth,
                contract,
                address,
                functionName,
                argsIn,
                fromAddress,
                privateKeyIn,
                addrKind,
                nonceIn,
                callback
            ) {
                function encodeConstructorParams(abi, params) {
                    return (
                        abi
                            .filter(function(json) {
                                return (
                                    'constructor' === json.type &&
                                    json.inputs.length === params.length
                                );
                            })
                            .map(function(json) {
                                return json.inputs.map(function(input) {
                                    return input.type;
                                });
                            })
                            .map(function(types) {
                                return coder.encodeParams(types, params);
                            })[0] || ''
                    );
                }
                var privateKey =
                        privateKeyIn && '0x' === privateKeyIn.substring(0, 2)
                            ? privateKeyIn.substring(2, privateKeyIn.length)
                            : privateKeyIn,
                    args = Array.prototype.slice
                        .call(argsIn)
                        .filter(function(a) {
                            return void 0 !== a;
                        }),
                    options = {};
                'object' === _typeof(args[args.length - 1]) &&
                    args[args.length - 1].gas &&
                    ((args[args.length - 1].gasPrice =
                        args[args.length - 1].gasPrice || config.ethGasPrice),
                    (args[args.length - 1].gasLimit =
                        args[args.length - 1].gas),
                    delete args[args.length - 1].gas),
                    utils.isObject(args[args.length - 1]) &&
                        (options = args.pop()),
                    utility.getNextNonce(web3, fromAddress, function(
                        err,
                        nextNonce
                    ) {
                        var nonce = nonceIn;
                        if (
                            ((void 0 === nonceIn || nonceIn < nextNonce) &&
                                (nonce = nextNonce),
                            (options.nonce = nonce),
                            'constructor' === functionName)
                        ) {
                            '0x' !== options.data.slice(0, 2) &&
                                (options.data = '0x' + options.data);
                            var encodedParams = encodeConstructorParams(
                                contract.abi,
                                args
                            );
                            console.log(encodedParams),
                                (options.data += encodedParams);
                        } else if (contract && functionName) {
                            options.to = address;
                            var inputTypes = contract.abi
                                    .find(function(element) {
                                        return element.name === functionName;
                                    })
                                    .inputs.map(function(x) {
                                        return x.type;
                                    }),
                                typeName = inputTypes.join();
                            options.data =
                                '0x' +
                                sha3(functionName + '(' + typeName + ')').slice(
                                    0,
                                    8
                                ) +
                                coder.encodeParams(inputTypes, args);
                        } else options.to = address;
                        try {
                            var post = function(serializedTx) {
                                var url =
                                        'https://' +
                                        (config.ethTestnet
                                            ? config.ethTestnet
                                            : 'api') +
                                        '.etherscan.io/api',
                                    formData = {
                                        module: 'proxy',
                                        action: 'eth_sendRawTransaction',
                                        hex: serializedTx,
                                    };
                                config.etherscanAPIKey &&
                                    (formData.apikey = config.etherscanAPIKey),
                                    utility.postURL(url, formData, function(
                                        errPostURL,
                                        body
                                    ) {
                                        if (errPostURL)
                                            callback(errPostURL, {
                                                txHash: void 0,
                                                nonce: nonce,
                                            });
                                        else
                                            try {
                                                var result = JSON.parse(body);
                                                result.result
                                                    ? callback(void 0, {
                                                          txHash: result.result,
                                                          nonce: nonce + 1,
                                                      })
                                                    : result.error &&
                                                      callback(
                                                          result.error.message,
                                                          {
                                                              txHash: void 0,
                                                              nonce: nonce,
                                                          }
                                                      );
                                            } catch (errTry) {
                                                callback(errTry, {
                                                    txHash: void 0,
                                                    nonce: nonce,
                                                });
                                            }
                                    });
                            };
                            if (web3.currentProvider && 'MetaMask' === addrKind)
                                (options.from = fromAddress),
                                    (options.gas = options.gasLimit),
                                    delete options.gasLimit,
                                    web3.eth.sendTransaction(options, function(
                                        errSend,
                                        hash
                                    ) {
                                        errSend
                                            ? callback(errSend, {
                                                  txHash: void 0,
                                                  nonce: nonce,
                                              })
                                            : callback(void 0, {
                                                  txHash: hash,
                                                  nonce: nonce + 1,
                                              });
                                    });
                            else if (ledgerEth && 'Ledger' === addrKind) {
                                options.chainId = config.ethChainId;
                                var tx = new Tx(options);
                                tx.v = new Buffer([config.ethChainId]);
                                var rawTx = tx.serialize().toString('hex');
                                ledgerEth
                                    .signTransaction_async(
                                        config.ledgerPath,
                                        rawTx
                                    )
                                    .then(function(result) {
                                        var optionsPlugSig = Object.assign(
                                                options,
                                                {
                                                    v: new Buffer(
                                                        result.v,
                                                        'hex'
                                                    ),
                                                    r: new Buffer(
                                                        result.r,
                                                        'hex'
                                                    ),
                                                    s: new Buffer(
                                                        result.s,
                                                        'hex'
                                                    ),
                                                    chainId: config.ethChainId,
                                                }
                                            ),
                                            serializedTx = new Tx(
                                                optionsPlugSig
                                            )
                                                .serialize()
                                                .toString('hex');
                                        post(serializedTx);
                                    })
                                    .fail(function(errFail) {
                                        console.log(errFail),
                                            callback(
                                                'Failed to sign transaction',
                                                { txHash: void 0, nonce: nonce }
                                            );
                                    });
                            } else if (privateKeyIn) {
                                var _tx = new Tx(options);
                                utility.signTx(
                                    web3,
                                    fromAddress,
                                    _tx,
                                    privateKey,
                                    function(errSignTx, txSigned) {
                                        if (errSignTx)
                                            console.log(err),
                                                callback(
                                                    'Failed to sign transaction',
                                                    {
                                                        txHash: void 0,
                                                        nonce: nonce,
                                                    }
                                                );
                                        else {
                                            var serializedTx = txSigned
                                                .serialize()
                                                .toString('hex');
                                            post(serializedTx);
                                        }
                                    }
                                );
                            } else
                                callback('Failed to sign transaction', {
                                    txHash: void 0,
                                    nonce: nonce,
                                });
                        } catch (errCatch) {
                            callback(errCatch, {
                                txHash: void 0,
                                nonce: nonce,
                            });
                        }
                    });
            }),
            (utility.txReceipt = function(web3, txHash, callback) {
                function proxy() {
                    var url =
                        'https://' +
                        (config.ethTestnet ? config.ethTestnet : 'api') +
                        '.etherscan.io/api?module=proxy&action=eth_GetTransactionReceipt&txhash=' +
                        txHash;
                    config.etherscanAPIKey &&
                        (url += '&apikey=' + config.etherscanAPIKey),
                        utility.getURL(url, function(err, body) {
                            if (err) callback(err, void 0);
                            else {
                                var result = JSON.parse(body);
                                callback(void 0, result.result);
                            }
                        });
                }
                try {
                    if (web3.currentProvider)
                        try {
                            web3.eth.getTransactionReceipt(txHash, function(
                                err,
                                result
                            ) {
                                err ? proxy() : callback(void 0, result);
                            });
                        } catch (err) {
                            proxy();
                        }
                    else proxy();
                } catch (err) {
                    proxy();
                }
            }),
            (utility.logsOnce = function(
                web3,
                contract,
                address,
                fromBlock,
                toBlock,
                callback
            ) {
                function decodeEvent(item) {
                    var eventAbis = contract.abi.filter(function(eventAbi) {
                        return (
                            'event' === eventAbi.type &&
                            item.topics[0] ===
                                '0x' +
                                    sha3(
                                        eventAbi.name +
                                            '(' +
                                            eventAbi.inputs
                                                .map(function(x) {
                                                    return x.type;
                                                })
                                                .join() +
                                            ')'
                                    )
                        );
                    });
                    if (eventAbis.length > 0) {
                        var eventAbi = eventAbis[0];
                        return new SolidityEvent(
                            web3,
                            eventAbi,
                            address
                        ).decode(item);
                    }
                }
                function proxy(retries) {
                    var url =
                        'https://' +
                        (config.ethTestnet ? config.ethTestnet : 'api') +
                        '.etherscan.io/api?module=logs&action=getLogs&address=' +
                        address +
                        '&fromBlock=' +
                        fromBlock +
                        '&toBlock=' +
                        toBlock;
                    config.etherscanAPIKey &&
                        (url += '&apikey=' + config.etherscanAPIKey),
                        utility.getURL(url, function(err, body) {
                            if (err) callback(null, []);
                            else
                                try {
                                    var items = JSON.parse(body).result;
                                    async.map(
                                        items,
                                        function(item, callbackMap) {
                                            Object.assign(item, {
                                                blockNumber: utility.hexToDec(
                                                    item.blockNumber
                                                ),
                                                logIndex: utility.hexToDec(
                                                    item.logIndex
                                                ),
                                                transactionIndex: utility.hexToDec(
                                                    item.transactionIndex
                                                ),
                                            }),
                                                callbackMap(
                                                    null,
                                                    decodeEvent(item)
                                                );
                                        },
                                        function(errMap, events) {
                                            callback(null, events);
                                        }
                                    );
                                } catch (errTry) {
                                    retries > 0
                                        ? proxy(retries - 1)
                                        : callback(null, []);
                                }
                        });
                }
                proxy(1);
            }),
            (utility.getBalance = function(web3, address, callback) {
                function proxy() {
                    var url =
                        'https://' +
                        (config.ethTestnet ? config.ethTestnet : 'api') +
                        '.etherscan.io/api?module=account&action=balance&address=' +
                        address +
                        '&tag=latest';
                    config.etherscanAPIKey &&
                        (url += '&apikey=' + config.etherscanAPIKey),
                        utility.getURL(url, function(err, body) {
                            if (err) callback(err, void 0);
                            else {
                                var result = JSON.parse(body),
                                    balance = new BigNumber(result.result);
                                callback(void 0, balance);
                            }
                        });
                }
                try {
                    web3.currentProvider
                        ? web3.eth.getBalance(address, function(err, balance) {
                              err ? proxy() : callback(void 0, balance);
                          })
                        : proxy();
                } catch (err) {
                    proxy();
                }
            }),
            (utility.blockNumber = function(web3, callback) {
                function proxy() {
                    var url =
                        'https://' +
                        (config.ethTestnet ? config.ethTestnet : 'api') +
                        '.etherscan.io/api?module=proxy&action=eth_BlockNumber';
                    config.etherscanAPIKey &&
                        (url += '&apikey=' + config.etherscanAPIKey),
                        utility.getURL(url, function(err, body) {
                            if (err) callback(err, void 0);
                            else {
                                var result = JSON.parse(body);
                                callback(
                                    void 0,
                                    Number(utility.hexToDec(result.result))
                                );
                            }
                        });
                }
                web3.currentProvider
                    ? web3.eth.getBlockNumber(function(err, result) {
                          err ? proxy() : callback(void 0, Number(result));
                      })
                    : proxy();
            }),
            (utility.signTx = function(
                web3,
                address,
                txIn,
                privateKey,
                callback
            ) {
                var tx = txIn;
                if (privateKey)
                    tx.sign(new Buffer(privateKey, 'hex')),
                        callback(void 0, tx);
                else {
                    var msgHash = '0x' + tx.hash(!1).toString('hex');
                    web3.eth.sign(address, msgHash, function(err, sigResult) {
                        if (err) callback(err, void 0);
                        else
                            try {
                                var r = sigResult.slice(0, 66),
                                    s = '0x' + sigResult.slice(66, 130),
                                    v = web3.toDecimal(
                                        '0x' + sigResult.slice(130, 132)
                                    );
                                27 !== v && 28 !== v && (v += 27),
                                    (tx.r = r),
                                    (tx.s = s),
                                    (tx.v = v),
                                    callback(void 0, tx);
                            } catch (errTry) {
                                callback(errTry, void 0);
                            }
                    });
                }
            }),
            (utility.sign = function(
                web3,
                ledgerEth,
                address,
                privateKeyIn,
                addrKind,
                msgToSignIn,
                callback
            ) {
                function prefixMessage(msgIn) {
                    var msg = msgIn;
                    return (
                        (msg = new Buffer(msg.slice(2), 'hex')),
                        (msg = Buffer.concat([
                            new Buffer(
                                'Ethereum Signed Message:\n' +
                                    msg.length.toString()
                            ),
                            msg,
                        ])),
                        (msg = web3.sha3('0x' + msg.toString('hex'), {
                            encoding: 'hex',
                        })),
                        '0x' +
                            (msg = new Buffer(msg.slice(2), 'hex')).toString(
                                'hex'
                            )
                    );
                }
                function testSig(msg, sig) {
                    return (
                        '0x' +
                            ethUtil
                                .pubToAddress(
                                    ethUtil.ecrecover(msg, sig.v, sig.r, sig.s)
                                )
                                .toString('hex') ===
                        address
                    );
                }
                var msgToSign =
                    '0x' !== msgToSignIn.substring(0, 2)
                        ? '0x' + msgToSignIn
                        : msgToSignIn;
                if (web3.currentProvider && 'MetaMask' === addrKind)
                    web3.version.getNode(function(error, node) {
                        node &&
                            (node.match('TestRPC') || node.match('MetaMask')) &&
                            (msgToSign = prefixMessage(msgToSign)),
                            web3.eth.sign(address, msgToSign, function(
                                err,
                                sigResult
                            ) {
                                if (err)
                                    callback('Failed to sign message', void 0);
                                else {
                                    var sigHash = sigResult,
                                        sig = ethUtil.fromRpcSig(sigHash),
                                        msg = void 0;
                                    if (
                                        ((msg =
                                            node &&
                                            (node.match('TestRPC') ||
                                                node.match('MetaMask'))
                                                ? new Buffer(
                                                      msgToSign.slice(2),
                                                      'hex'
                                                  )
                                                : new Buffer(
                                                      prefixMessage(
                                                          msgToSign
                                                      ).slice(2),
                                                      'hex'
                                                  )),
                                        testSig(msg, sig))
                                    ) {
                                        var r = '0x' + sig.r.toString('hex'),
                                            s = '0x' + sig.s.toString('hex'),
                                            v = sig.v;
                                        callback(void 0, { r: r, s: s, v: v });
                                    } else
                                        callback(
                                            'Failed to sign message',
                                            void 0
                                        );
                                }
                            });
                    });
                else if (ledgerEth && 'Ledger' === addrKind) {
                    var msg = new Buffer(msgToSign.slice(2), 'hex');
                    ledgerEth
                        .signPersonalMessage_async(
                            config.ledgerPath,
                            msg.toString('hex')
                        )
                        .then(function(sigResult) {
                            var sig = {
                                    r: new Buffer(sigResult.r, 'hex'),
                                    s: new Buffer(sigResult.s, 'hex'),
                                    v: sigResult.v,
                                },
                                prefixedMessage = prefixMessage(msgToSign);
                            if (
                                testSig(
                                    new Buffer(prefixedMessage.slice(2), 'hex'),
                                    sig
                                )
                            ) {
                                var r = '0x' + sig.r.toString('hex'),
                                    s = '0x' + sig.s.toString('hex'),
                                    v = sig.v;
                                callback(void 0, { r: r, s: s, v: v });
                            } else callback('Failed to sign message', void 0);
                        })
                        .fail(function(err) {
                            console.log(err),
                                callback('Failed to sign message', void 0);
                        });
                } else if (privateKeyIn) {
                    var privateKey =
                        '0x' === privateKeyIn.substring(0, 2)
                            ? privateKeyIn.substring(2, privateKeyIn.length)
                            : privateKeyIn;
                    msgToSign = prefixMessage(msgToSign);
                    try {
                        var sig = ethUtil.ecsign(
                                new Buffer(msgToSign.slice(2), 'hex'),
                                new Buffer(privateKey, 'hex')
                            ),
                            r = '0x' + sig.r.toString('hex'),
                            s = '0x' + sig.s.toString('hex'),
                            v = sig.v;
                        callback(void 0, { r: r, s: s, v: v });
                    } catch (err) {
                        callback(err, void 0);
                    }
                } else callback('Could not sign message', void 0);
            }),
            (utility.verify = function(
                web3,
                addressIn,
                v,
                rIn,
                sIn,
                valueIn,
                callback
            ) {
                var address = addressIn.toLowerCase(),
                    r = rIn,
                    s = sIn,
                    value = valueIn;
                '0x' === r.substring(0, 2) && (r = r.substring(2, r.length)),
                    '0x' === s.substring(0, 2) &&
                        (s = s.substring(2, s.length)),
                    '0x' === value.substring(0, 2) &&
                        (value = value.substring(2, value.length));
                var pubKey = ethUtil.ecrecover(
                        new Buffer(value, 'hex'),
                        Number(v),
                        new Buffer(r, 'hex'),
                        new Buffer(s, 'hex')
                    ),
                    result =
                        address ===
                        '0x' +
                            ethUtil
                                .pubToAddress(new Buffer(pubKey, 'hex'))
                                .toString('hex');
                if (!callback) return result;
                callback(void 0, result);
            }),
            (utility.createAccount = function() {
                var privateKey = keythereum.create().privateKey,
                    address = ethUtil.privateToAddress(privateKey);
                return (
                    (address = ethUtil.toChecksumAddress(
                        address.toString('hex')
                    )),
                    (privateKey = privateKey.toString('hex')),
                    { address: address, privateKey: privateKey }
                );
            }),
            (utility.verifyPrivateKey = function(addr, privateKeyIn) {
                var privateKey = privateKeyIn;
                return (
                    privateKey &&
                        '0x' !== privateKey.substring(0, 2) &&
                        (privateKey = '0x' + privateKey),
                    addr ===
                        ethUtil.toChecksumAddress(
                            '0x' +
                                ethUtil
                                    .privateToAddress(privateKey)
                                    .toString('hex')
                        )
                );
            }),
            (utility.toChecksumAddress = function(addrIn) {
                var addr = addrIn;
                return (
                    addr &&
                        '0x' !== addr.substring(0, 2) &&
                        (addr = '0x' + addr),
                    ethUtil.toChecksumAddress(addr)
                );
            }),
            (utility.loadContract = function(web3, abi, address, callback) {
                var contract = web3.eth.contract(abi);
                callback(void 0, (contract = contract.at(address)));
            }),
            (utility.deployContract = function(
                web3,
                sourceFile,
                contractName,
                constructorParams,
                address,
                callback
            ) {
                utility.readFile(sourceFile + '.bytecode', function(
                    errBytecode,
                    resultBytecode
                ) {
                    utility.readFile(sourceFile + '.interface', function(
                        errAbi,
                        resultAbi
                    ) {
                        if (resultAbi && resultBytecode) {
                            var abi = JSON.parse(resultAbi),
                                bytecode = JSON.parse(resultBytecode),
                                contract = web3.eth.contract(abi);
                            utility.send(
                                web3,
                                contract,
                                void 0,
                                'constructor',
                                constructorParams.concat([
                                    {
                                        from: address,
                                        data: bytecode,
                                        gas: 47e5,
                                        gasPrice: config.ethGasPrice,
                                    },
                                ]),
                                address,
                                void 0,
                                0,
                                function(errSend, result) {
                                    var txHash = result.txHash,
                                        contractAddr = void 0;
                                    async.whilst(
                                        function() {
                                            return void 0 === contractAddr;
                                        },
                                        function(callbackWhilst) {
                                            setTimeout(function() {
                                                utility.txReceipt(
                                                    web3,
                                                    txHash,
                                                    function(err, receipt) {
                                                        receipt &&
                                                            (contractAddr =
                                                                receipt.contractAddress),
                                                            callbackWhilst(
                                                                null
                                                            );
                                                    }
                                                );
                                            }, 1e3);
                                        },
                                        function() {
                                            callback(void 0, address);
                                        }
                                    );
                                }
                            );
                        } else
                            callback('Could not load bytecode and ABI', void 0);
                    });
                });
            }),
            (utility.zeroPad = function(num, places) {
                var zero = places - num.toString().length + 1;
                return Array(+(zero > 0 && zero)).join('0') + num;
            }),
            (utility.decToHex = function(dec, lengthIn) {
                var length = lengthIn;
                if ((length || (length = 32), dec < 0))
                    return new BigNumber(2)
                        .pow(length)
                        .add(new BigNumber(dec))
                        .toString(16);
                var result = null;
                try {
                    result = utility.convertBase(dec.toString(), 10, 16);
                } catch (err) {
                    result = null;
                }
                return result || new BigNumber(dec).toString(16);
            }),
            (utility.hexToDec = function(hexStrIn, length) {
                var hexStr = hexStrIn;
                if (
                    ('0x' === hexStr.substring(0, 2) &&
                        (hexStr = hexStr.substring(2)),
                    (hexStr = hexStr.toLowerCase()),
                    !length)
                )
                    return utility.convertBase(hexStr, 16, 10);
                var max = Math.pow(2, length),
                    answer = utility.convertBase(hexStr, 16, 10);
                return answer > max / 2 ? max : answer;
            }),
            (utility.pack = function(dataIn, lengths) {
                for (
                    var packed = '',
                        data = dataIn.map(function(x) {
                            return x;
                        }),
                        i = 0;
                    i < lengths.length;
                    i += 1
                )
                    'string' == typeof data[i] &&
                    '0x' === data[i].substring(0, 2)
                        ? ('0x' === data[i].substring(0, 2) &&
                              (data[i] = data[i].substring(2)),
                          (packed += utility.zeroPad(data[i], lengths[i] / 4)))
                        : 'number' == typeof data[i] ||
                          data[i] instanceof BigNumber ||
                          !/[a-f]/.test(data[i])
                          ? (packed += utility.zeroPad(
                                utility.decToHex(data[i], lengths[i]),
                                lengths[i] / 4
                            ))
                          : ('0x' === data[i].substring(0, 2) &&
                                (data[i] = data[i].substring(2)),
                            (packed += utility.zeroPad(
                                data[i],
                                lengths[i] / 4
                            )));
                return packed;
            }),
            (utility.unpack = function(str, lengths) {
                for (
                    var data = [], length = 0, i = 0;
                    i < lengths.length;
                    i += 1
                )
                    (data[i] = parseInt(
                        utility.hexToDec(
                            str.substr(length, lengths[i] / 4),
                            lengths[i]
                        ),
                        10
                    )),
                        (length += lengths[i] / 4);
                return data;
            }),
            (utility.convertBase = function(str, fromBase, toBase) {
                var digits = utility.parseToDigitsArray(str, fromBase);
                if (null === digits) return null;
                for (
                    var outArray = [], power = [1], i = 0;
                    i < digits.length;
                    i += 1
                )
                    digits[i] &&
                        (outArray = utility.add(
                            outArray,
                            utility.multiplyByNumber(digits[i], power, toBase),
                            toBase
                        )),
                        (power = utility.multiplyByNumber(
                            fromBase,
                            power,
                            toBase
                        ));
                for (var out = '', _i = outArray.length - 1; _i >= 0; _i -= 1)
                    out += outArray[_i].toString(toBase);
                return '' === out && (out = 0), out;
            }),
            (utility.parseToDigitsArray = function(str, base) {
                for (
                    var digits = str.split(''), ary = [], i = digits.length - 1;
                    i >= 0;
                    i -= 1
                ) {
                    var n = parseInt(digits[i], base);
                    if (isNaN(n)) return null;
                    ary.push(n);
                }
                return ary;
            }),
            (utility.add = function(x, y, base) {
                for (
                    var z = [],
                        n = Math.max(x.length, y.length),
                        carry = 0,
                        i = 0;
                    i < n || carry;

                ) {
                    var zi =
                        carry +
                        (i < x.length ? x[i] : 0) +
                        (i < y.length ? y[i] : 0);
                    z.push(zi % base),
                        (carry = Math.floor(zi / base)),
                        (i += 1);
                }
                return z;
            }),
            (utility.multiplyByNumber = function(numIn, x, base) {
                var num = numIn;
                if (num < 0) return null;
                if (0 === num) return [];
                for (var result = [], power = x; ; ) {
                    if (
                        (1 & num && (result = utility.add(result, power, base)),
                        0 === (num >>= 1))
                    )
                        break;
                    power = utility.add(power, power, base);
                }
                return result;
            }),
            (utility.getRandomInt = function(min, max) {
                return Math.floor(Math.random() * (max - min)) + min;
            }),
            Object.prototype.find ||
                (Object.values = function(obj) {
                    return Object.keys(obj).map(function(key) {
                        return obj[key];
                    });
                }),
            Array.prototype.find ||
                (Array.prototype.find = function(predicate) {
                    if (null === this)
                        throw new TypeError(
                            'Array.prototype.find called on null or undefined'
                        );
                    if ('function' != typeof predicate)
                        throw new TypeError('predicate must be a function');
                    for (
                        var list = Object(this),
                            length = list.length >>> 0,
                            thisArg = arguments[1],
                            value = void 0,
                            i = 0;
                        i < length;
                        i++
                    )
                        if (
                            ((value = list[i]),
                            predicate.call(thisArg, value, i, list))
                        )
                            return value;
                }),
            'function' != typeof Object.assign &&
                (Object.assign = function(target) {
                    if (void 0 === target || null === target)
                        throw new TypeError(
                            'Cannot convert undefined or null to object'
                        );
                    for (
                        var output = Object(target), index = 1;
                        index < arguments.length;
                        index++
                    ) {
                        var source = arguments[index];
                        if (void 0 !== source && null !== source)
                            for (var nextKey in source)
                                source.hasOwnProperty(nextKey) &&
                                    (output[nextKey] = source[nextKey]);
                    }
                    return output;
                }),
            (Array.prototype.getUnique = function() {
                for (var u = {}, a = [], i = 0, l = this.length; i < l; ++i)
                    u.hasOwnProperty(this[i]) ||
                        (a.push(this[i]), (u[this[i]] = 1));
                return a;
            }),
            (Array.prototype.max = function() {
                return Math.max.apply(null, this);
            }),
            (Array.prototype.min = function() {
                return Math.min.apply(null, this);
            }),
            (Array.prototype.equals = function(b) {
                if (this === b) return !0;
                if (null == this || null == b) return !1;
                if (this.length != b.length) return !1;
                for (var i = 0; i < this.length; ++i)
                    if (this[i] !== b[i]) return !1;
                return !0;
            }),
            (Math.sign =
                Math.sign ||
                function(x) {
                    return 0 == (x = +x) || isNaN(x) ? x : x > 0 ? 1 : -1;
                }),
            utility
        );
    };
            }.call(this, require('buffer').Buffer));