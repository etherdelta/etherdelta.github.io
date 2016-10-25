var config = require('./config.js');
var utility = require('./common/utility.js');
var Web3 = require('web3');
var assert = require('assert');
var TestRPC = require('ethereumjs-testrpc');
var fs = require('fs');
var sha256 = require('js-sha256').sha256;
var async = require('async');
var BigNumber = require('bignumber.js');
var solc = require('solc');

var logger = {
  log: function(message) {
    // console.log(message);
  }
};

var compiledSources = {};
function deploy(web3, sourceFile, contractName, constructorParams, address, callback) {
  utility.readFile(sourceFile, function(err, source){
    if (!compiledSources[sourceFile]) compiledSources[sourceFile] = solc.compile(source, 1);
    var compiled = compiledSources[sourceFile];
    var compiledContract = compiled.contracts[contractName];
    var abi = JSON.parse(compiledContract.interface);
    var bytecode = compiledContract.bytecode;
    var contract = web3.eth.contract(abi);
    utility.testSend(web3, contract, undefined, 'constructor', constructorParams.concat([{from: address, data: bytecode}]), address, undefined, 0, function(err, result) {
      var initialTransaction = result;
      assert.deepEqual(initialTransaction.length, 66);
      web3.eth.getTransactionReceipt(initialTransaction, function(err, receipt) {
        assert.equal(err, undefined);
        var addr = receipt.contractAddress;
        contract = contract.at(addr);
        assert.notEqual(receipt, null, "Transaction receipt shouldn't be null");
        assert.notEqual(addr, null, "Transaction did not create a contract");
        web3.eth.getCode(addr, function(err, result) {
          assert.equal(err, undefined);
          assert.notEqual(result, null);
          assert.notEqual(result, "0x0");
          callback(undefined, {contract: contract, addr: addr});
        });
      });
    });
  });
}

describe("Test", function(done) {
  this.timeout(240*1000);
  var web3 = new Web3();
  var port = 12345;
  var server;
  var accounts;
  var contractEtherDelta;
  var contractToken1;
  var contractToken2;
  var contractAccountLevels;
  var contractEtherDeltaAddr;
  var contractToken1Addr;
  var contractToken2Addr;
  var contractAccountLevelsAddr;
  var feeAccount;
  var admin;
  var unit = new BigNumber(utility.ethToWei(1.0));

  before("Initialize TestRPC server", function(done) {
    server = TestRPC.server(logger);
    server.listen(port, function() {
      config.ethProvider = "http://localhost:" + port;
      config.ethGasCost = 20000000000;
      web3.setProvider(new Web3.providers.HttpProvider("http://localhost:" + port));
      done();
    });
  });

  before("Initialize accounts", function(done) {
    web3.eth.getAccounts(function(err, accs) {
      assert.equal(err, undefined);
      accounts = accs;
      config.ethAddr = accounts[0];
      done();
    });
  });

  after("Shutdown server", function(done) {
    server.close(done);
  });

  describe("Contract scenario", function() {
    it("Should add a token1 contract to the network", function(done) {
      deploy(web3, config.contractEtherDelta, 'ReserveToken', [], accounts[0], function(err, contract) {
        contractToken1 = contract.contract;
        contractToken1Addr = contract.addr;
        done();
      });
    });
    it("Should add a token2 contract to the network", function(done) {
      deploy(web3, config.contractEtherDelta, 'ReserveToken', [], accounts[0], function(err, contract) {
        contractToken2 = contract.contract;
        contractToken2Addr = contract.addr;
        done();
      });
    });
    it("Should add an AccountLevels contract to the network", function(done) {
      deploy(web3, config.contractEtherDelta, 'AccountLevelsTest', [], accounts[0], function(err, contract) {
        contractAccountLevels = contract.contract;
        contractAccountLevelsAddr = contract.addr;
        done();
      });
    });
    it("Should add the EtherDelta contract to the network", function(done) {
      feeMake = new BigNumber(utility.ethToWei(0.0005));
      feeTake = new BigNumber(utility.ethToWei(0.003));
      feeRebate = new BigNumber(utility.ethToWei(0.002));
      admin = accounts[0];
      feeAccount = accounts[0];
      deploy(web3, config.contractEtherDelta, 'EtherDelta', [admin, feeAccount, contractAccountLevelsAddr, feeMake, feeTake, feeRebate], accounts[0], function(err, contract) {
        contractEtherDelta = contract.contract;
        contractEtherDeltaAddr = contract.addr;
        done();
      });
    });
    it("Should mint some tokens", function(done) {
      var amount = utility.ethToWei(10000);
      async.each([1,2,3,4,5],
        function(i, callback) {
          utility.testSend(web3, contractToken1, contractToken1Addr, 'create', [accounts[i], amount, {gas: 1000000, value: 0}], accounts[0], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testSend(web3, contractToken2, contractToken2Addr, 'create', [accounts[i], amount, {gas: 1000000, value: 0}], accounts[0], undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              callback(null);
            });
          });
        },
        function(err){
          done();
        }
      );
    });
    it("Should add funds to etherdelta", function(done) {
      function addEtherFunds(amount, account, callback) {
        utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'deposit', [{gas: 1000000, value: amount}], account, undefined, 0, function(err, result) {
          assert.equal(err, undefined);
          utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [0, account], function(err, result) {
            assert.equal(result.equals(amount), true);
            callback();
          });
        });
      }
      function addFunds(amount, contractToken, contractTokenAddr, account, callback) {
        utility.testSend(web3, contractToken, contractTokenAddr, 'approve', [contractEtherDeltaAddr, amount, {gas: 1000000, value: 0}], account, undefined, 0, function(err, result) {
          assert.equal(err, undefined);
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'depositToken', [contractTokenAddr, amount, {gas: 1000000, value: 0}], account, undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractTokenAddr, account], function(err, result) {
              assert.equal(result.equals(amount), true);
              callback();
            });
          });
        });
      }
      var amount = new BigNumber(utility.ethToWei(1000));
      addFunds(amount, contractToken1, contractToken1Addr, accounts[1], function(){
        addFunds(amount, contractToken1, contractToken1Addr, accounts[2], function(){
          addFunds(amount, contractToken2, contractToken2Addr, accounts[1], function(){
            addFunds(amount, contractToken2, contractToken2Addr, accounts[2], function(){
              addEtherFunds(amount, accounts[1], function(){
                addEtherFunds(amount, accounts[2], function(){
                  done();
                });
              });
            });
          });
        });
      });
    });
    it("Should do some trades initiated onchain", function(done) {
      function testTrade(expires, orderNonce, tokenGet, tokenGive, amountGet, amountGive, amount, account1, account2, accountLevel, callback) {
        web3.eth.getBlockNumber(function(err, blockNumber) {
          if (err) callback(err);
          expires += blockNumber;
          utility.testSend(web3, contractAccountLevels, contractAccountLevelsAddr, 'setAccountLevel', [account1, accountLevel, {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractAccountLevels, contractAccountLevelsAddr, 'accountLevel', [account1], function(err, level) {
              assert.equal(err, undefined);
              utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, feeAccount], function(err, initialFeeBalance1) {
                utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, feeAccount], function(err, initialFeeBalance2) {
                  utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account1], function(err, initialBalance11) {
                    utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account2], function(err, initialBalance12) {
                      utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account1], function(err, initialBalance21) {
                        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account2], function(err, initialBalance22) {
                          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
                            assert.equal(err, undefined);
                            utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0', amount, {gas: 1000000, value: 0}], account2, undefined, 0, function(err, result) {
                              assert.equal(err, undefined);
                              utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, feeAccount], function(err, feeBalance1) {
                                utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, feeAccount], function(err, feeBalance2) {
                                  utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account1], function(err, balance11) {
                                    utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account2], function(err, balance12) {
                                      utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account1], function(err, balance21) {
                                        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account2], function(err, balance22) {
                                          utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0'], function(err, availableVolume) {
                                            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'amountFilled', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0'], function(err, amountFilled) {
                                              var feeMakeXfer = amount.times(feeMake).divToInt(unit);
                                              var feeTakeXfer = amount.times(feeTake).divToInt(unit);
                                              var feeRebateXfer = 0;
                                              if (level==1) feeRebateXfer = amount.times(feeRebate).divToInt(unit);
                                              if (level==2) feeRebateXfer = feeTakeXfer;
                                              assert.equal(availableVolume.equals(amountGet.minus(amount)), true);
                                              assert.equal(amountFilled.equals(amount), true);
                                              assert.equal(initialFeeBalance1.plus(initialBalance11).plus(initialBalance12).equals(feeBalance1.plus(balance11).plus(balance12)), true);
                                              assert.equal(initialFeeBalance2.plus(initialBalance21).plus(initialBalance22).equals(feeBalance2.plus(balance21).plus(balance22)), true);
                                              assert.equal(feeBalance1.minus(initialFeeBalance1).equals(feeMakeXfer.plus(feeTakeXfer).minus(feeRebateXfer)), true);
                                              assert.equal(balance11.equals(initialBalance11.plus(amount).minus(feeMakeXfer).plus(feeRebateXfer)), true);
                                              assert.equal(balance12.equals(initialBalance12.minus(amount.plus(feeTakeXfer))), true);
                                              assert.equal(balance21.equals(initialBalance21.minus(amount.times(amountGive).divToInt(amountGet))), true);
                                              assert.equal(balance22.equals(initialBalance22.plus(amount.times(amountGive).divToInt(amountGet))), true);
                                              callback();
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }
      var trades = [
        {
          expires: 10,
          orderNonce: 1,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(utility.ethToWei(50)),
          amountGive: new BigNumber(utility.ethToWei(25)),
          amount: new BigNumber(utility.ethToWei(25)),
          account1: accounts[1],
          account2: accounts[2],
          accountLevel: 0,
        },
        {
          expires: 10,
          orderNonce: 2,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(utility.ethToWei(50)),
          amountGive: new BigNumber(utility.ethToWei(25)),
          amount: new BigNumber(utility.ethToWei(25)),
          account1: accounts[1],
          account2: accounts[2],
          accountLevel: 1,
        },
        {
          expires: 10,
          orderNonce: 3,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(50),
          amountGive: new BigNumber(25),
          amount: new BigNumber(25),
          account1: accounts[1],
          account2: accounts[2],
          accountLevel: 2,
        },
      ];
      async.eachSeries(trades,
        function(trade, callbackEach) {
          testTrade(trade.expires, trade.orderNonce, trade.tokenGet, trade.tokenGive, trade.amountGet, trade.amountGive, trade.amount, trade.account1, trade.account2, trade.accountLevel, function(){
            callbackEach(null);
          });
        },
        function(err) {
          done();
        }
      )
    });
    it("Should do some trades initiated offchain", function(done) {
      function testTrade(expires, orderNonce, tokenGet, tokenGive, amountGet, amountGive, amount, account1, account2, accountLevel, callback) {
        web3.eth.getBlockNumber(function(err, blockNumber) {
          if (err) callback(err);
          expires += blockNumber;
          var condensed = utility.pack([contractEtherDeltaAddr, tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
          var hash = sha256(new Buffer(condensed,'hex'));
          utility.testSend(web3, contractAccountLevels, contractAccountLevelsAddr, 'setAccountLevel', [account1, accountLevel, {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractAccountLevels, contractAccountLevelsAddr, 'accountLevel', [account1], function(err, level) {
              assert.equal(err, undefined);
              utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, feeAccount], function(err, initialFeeBalance1) {
                utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, feeAccount], function(err, initialFeeBalance2) {
                  utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account1], function(err, initialBalance11) {
                    utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account2], function(err, initialBalance12) {
                      utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account1], function(err, initialBalance21) {
                        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account2], function(err, initialBalance22) {
                          utility.sign(web3, account1, hash, undefined, function(err, sig) {
                            utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, sig.v, sig.r, sig.s, amount, {gas: 1000000, value: 0}], account2, undefined, 0, function(err, result) {
                              assert.equal(err, undefined);
                              utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, feeAccount], function(err, feeBalance1) {
                                utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, feeAccount], function(err, feeBalance2) {
                                  utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account1], function(err, balance11) {
                                    utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account2], function(err, balance12) {
                                      utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account1], function(err, balance21) {
                                        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account2], function(err, balance22) {
                                          utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, sig.v, sig.r, sig.s], function(err, availableVolume) {
                                            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'amountFilled', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, sig.v, sig.r, sig.s], function(err, amountFilled) {
                                              var feeMakeXfer = amount.times(feeMake).divToInt(unit);
                                              var feeTakeXfer = amount.times(feeTake).divToInt(unit);
                                              var feeRebateXfer = 0;
                                              if (level==1) feeRebateXfer = amount.times(feeRebate).divToInt(unit);
                                              if (level==2) feeRebateXfer = feeTakeXfer;
                                              assert.equal(availableVolume.equals(amountGet.minus(amount)), true);
                                              assert.equal(amountFilled.equals(amount), true);
                                              assert.equal(initialFeeBalance1.plus(initialBalance11).plus(initialBalance12).equals(feeBalance1.plus(balance11).plus(balance12)), true);
                                              assert.equal(initialFeeBalance2.plus(initialBalance21).plus(initialBalance22).equals(feeBalance2.plus(balance21).plus(balance22)), true);
                                              assert.equal(feeBalance1.minus(initialFeeBalance1).equals(feeMakeXfer.plus(feeTakeXfer).minus(feeRebateXfer)), true);
                                              assert.equal(balance11.equals(initialBalance11.plus(amount).minus(feeMakeXfer).plus(feeRebateXfer)), true);
                                              assert.equal(balance12.equals(initialBalance12.minus(amount.plus(feeTakeXfer))), true);
                                              assert.equal(balance21.equals(initialBalance21.minus(amount.times(amountGive).divToInt(amountGet))), true);
                                              assert.equal(balance22.equals(initialBalance22.plus(amount.times(amountGive).divToInt(amountGet))), true);
                                              callback();
                                            });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }
      var trades = [
        {
          expires: 10,
          orderNonce: 4,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(utility.ethToWei(50)),
          amountGive: new BigNumber(utility.ethToWei(25)),
          amount: new BigNumber(utility.ethToWei(25)),
          account1: accounts[1],
          account2: accounts[2],
          accountLevel: 0,
        },
        {
          expires: 10,
          orderNonce: 5,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(utility.ethToWei(50)),
          amountGive: new BigNumber(utility.ethToWei(25)),
          amount: new BigNumber(utility.ethToWei(25)),
          account1: accounts[1],
          account2: accounts[2],
          accountLevel: 1,
        },
        {
          expires: 10,
          orderNonce: 6,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(50),
          amountGive: new BigNumber(25),
          amount: new BigNumber(25),
          account1: accounts[1],
          account2: accounts[2],
          accountLevel: 2,
        },
      ];
      async.eachSeries(trades,
        function(trade, callbackEach) {
          testTrade(trade.expires, trade.orderNonce, trade.tokenGet, trade.tokenGive, trade.amountGet, trade.amountGive, trade.amount, trade.account1, trade.account2, trade.accountLevel, function(){
            callbackEach(null);
          });
        },
        function(err) {
          done();
        }
      )
    });
    it("Should place an order onchain, check availableVolume and amountFilled, then cancel", function(done) {
      function testCancel(expires, orderNonce, tokenGet, tokenGive, amountGet, amountGive, amount, account1, callback) {
        web3.eth.getBlockNumber(function(err, blockNumber) {
          if (err) callback(err);
          expires += blockNumber;
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0'], function(err, result) {
              assert.equal(result.equals(amountGet), true);
              utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'amountFilled', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0'], function(err, result) {
                assert.equal(result.equals(new BigNumber(0)), true);
                utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'cancelOrder', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, 0, '0x0', '0x0', {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
                  assert.equal(err, undefined);
                  utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0'], function(err, result) {
                    assert.equal(result.equals(new BigNumber(0)), true);
                    utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'amountFilled', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0'], function(err, result) {
                      assert.equal(result.equals(amountGet), true);
                      callback();
                    });
                  });
                });
              });
            });
          });
        });
      }
      var trades = [
        {
          expires: 10,
          orderNonce: 7,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(utility.ethToWei(50)),
          amountGive: new BigNumber(utility.ethToWei(25)),
          amount: new BigNumber(utility.ethToWei(25)),
          account1: accounts[1],
        },
        {
          expires: 10,
          orderNonce: 8,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(50),
          amountGive: new BigNumber(25),
          amount: new BigNumber(25),
          account1: accounts[1],
        },
      ];
      async.eachSeries(trades,
        function(trade, callbackEach) {
          testCancel(trade.expires, trade.orderNonce, trade.tokenGet, trade.tokenGive, trade.amountGet, trade.amountGive, trade.amount, trade.account1, function(){
            callbackEach(null);
          });
        },
        function(err) {
          done();
        }
      )
    });
    it("Should place an order offchain, check availableVolume and amountFilled, then cancel", function(done) {
      function testCancel(expires, orderNonce, tokenGet, tokenGive, amountGet, amountGive, amount, account1, callback) {
        web3.eth.getBlockNumber(function(err, blockNumber) {
          if (err) callback(err);
          expires += blockNumber;
          var condensed = utility.pack([contractEtherDeltaAddr, tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
          var hash = sha256(new Buffer(condensed,'hex'));
          utility.sign(web3, account1, hash, undefined, function(err, sig) {
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, sig.v, sig.r, sig.s], function(err, result) {
              assert.equal(result.equals(amountGet), true);
              utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'amountFilled', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, sig.v, sig.r, sig.s], function(err, result) {
                assert.equal(result.equals(new BigNumber(0)), true);
                utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'cancelOrder', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, sig.v, sig.r, sig.s, {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
                  assert.equal(err, undefined);
                  utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, sig.v, sig.r, sig.s], function(err, result) {
                    assert.equal(result.equals(new BigNumber(0)), true);
                    utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'amountFilled', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, sig.v, sig.r, sig.s], function(err, result) {
                      assert.equal(result.equals(amountGet), true);
                      callback();
                    });
                  });
                });
              });
            });
          });
        });
      }
      var trades = [
        {
          expires: 10,
          orderNonce: 9,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(utility.ethToWei(50)),
          amountGive: new BigNumber(utility.ethToWei(25)),
          amount: new BigNumber(utility.ethToWei(25)),
          account1: accounts[1],
        },
        {
          expires: 10,
          orderNonce: 10,
          tokenGet: contractToken1Addr,
          tokenGive: contractToken2Addr,
          amountGet: new BigNumber(50),
          amountGive: new BigNumber(25),
          amount: new BigNumber(25),
          account1: accounts[1],
        },
      ];
      async.eachSeries(trades,
        function(trade, callbackEach) {
          testCancel(trade.expires, trade.orderNonce, trade.tokenGet, trade.tokenGive, trade.amountGet, trade.amountGive, trade.amount, trade.account1, function(){
            callbackEach(null);
          });
        },
        function(err) {
          done();
        }
      )
    });
    it("Should do a trade and check available volume depletion", function(done) {
      web3.eth.getBlockNumber(function(err, blockNumber) {
        if (err) callback(err);
        var tokenGet = contractToken1Addr;
        var amountGet = new BigNumber(utility.ethToWei(50));
        var tokenGive = contractToken2Addr;
        var amountGive = new BigNumber(utility.ethToWei(25));
        var expires = blockNumber+1000;
        var orderNonce = 11;
        var user = accounts[1];
        var condensed = utility.pack([contractEtherDeltaAddr, tokenGet, amountGet.toNumber(), tokenGive, amountGive.toNumber(), expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
        var hash = sha256(new Buffer(condensed,'hex'));
        var amount = amountGet.div(new BigNumber(2));
        utility.sign(web3, user, hash, undefined, function(err, sig) {
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s, amount, {gas: 1000000, value: 0}], accounts[2], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s], function(err, result) {
              assert.equal(result.equals(amountGet.minus(amount)), true);
              done();
            });
          });
        });
      });
    });
    it("Should do a self trade and check available volume depletion", function(done) {
      web3.eth.getBlockNumber(function(err, blockNumber) {
        if (err) callback(err);
        var tokenGet = contractToken1Addr;
        var amountGet = new BigNumber(utility.ethToWei(50));
        var tokenGive = contractToken2Addr;
        var amountGive = new BigNumber(utility.ethToWei(25));
        var expires = blockNumber+1000;
        var orderNonce = 12;
        var user = accounts[1];
        var condensed = utility.pack([contractEtherDeltaAddr, tokenGet, amountGet.toNumber(), tokenGive, amountGive.toNumber(), expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
        var hash = sha256(new Buffer(condensed,'hex'));
        var amount = amountGet.div(new BigNumber(2));
        utility.sign(web3, user, hash, undefined, function(err, sig) {
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s, amount, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s], function(err, result) {
              assert.equal(result.equals(amountGet.minus(amount)), true);
              done();
            });
          });
        });
      });
    });
    it("Should attempt some trades initiated onchain that should fail", function(done) {
      function testTrade(expires, orderNonce, tokenGet, tokenGive, amountGet, amountGive, amount, account1, account2, accountLevel, callback) {
        web3.eth.getBlockNumber(function(err, blockNumber) {
          if (err) callback(err);
          expires += blockNumber;
          utility.testSend(web3, contractAccountLevels, contractAccountLevelsAddr, 'setAccountLevel', [account1, accountLevel, {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractAccountLevels, contractAccountLevelsAddr, 'accountLevel', [account1], function(err, level) {
              assert.equal(err, undefined);
              utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, {gas: 1000000, value: 0}], account1, undefined, 0, function(err, result) {
                assert.equal(err, undefined);
                utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, account1, 0, '0x0', '0x0', amount, {gas: 1000000, value: 0}], account2, undefined, 0, function(err, result) {
                  assert.equal(!err, false);
                  callback();
                });
              });
            });
          });
        });
      }
      var account1 = accounts[1];
      var account2 = accounts[2];
      utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account1], function(err, initialBalance11) {
        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, account2], function(err, initialBalance12) {
          utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account1], function(err, initialBalance21) {
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, account2], function(err, initialBalance22) {
              var trades = [
                //try to trade more than available size
                {
                  expires: 13,
                  orderNonce: 1,
                  tokenGet: contractToken1Addr,
                  tokenGive: contractToken2Addr,
                  amountGet: new BigNumber(utility.ethToWei(50)),
                  amountGive: new BigNumber(utility.ethToWei(25)),
                  amount: new BigNumber(utility.ethToWei(51)),
                  account1: account1,
                  account2: account2,
                  accountLevel: 0,
                },
                //try to trade against resting order when the maker doesn't have enough funds
                {
                  expires: 14,
                  orderNonce: 2,
                  tokenGet: contractToken1Addr,
                  tokenGive: contractToken2Addr,
                  amountGet: new BigNumber(utility.ethToWei(50)),
                  amountGive: initialBalance21.plus(new BigNumber(1)),
                  amount: new BigNumber(utility.ethToWei(50)),
                  account1: account1,
                  account2: account2,
                  accountLevel: 1,
                },
                //try to trade against resting order when the taker doesn't have enough funds
                {
                  expires: 15,
                  orderNonce: 3,
                  tokenGet: contractToken1Addr,
                  tokenGive: contractToken2Addr,
                  amountGet: initialBalance12,
                  amountGive: new BigNumber(25),
                  amount: initialBalance12.plus(new BigNumber(1)),
                  account1: account1,
                  account2: account2,
                  accountLevel: 2,
                },
              ];
              async.eachSeries(trades,
                function(trade, callbackEach) {
                  testTrade(trade.expires, trade.orderNonce, trade.tokenGet, trade.tokenGive, trade.amountGet, trade.amountGive, trade.amount, trade.account1, trade.account2, trade.accountLevel, function(){
                    callbackEach(null);
                  });
                },
                function(err) {
                  done();
                }
              );
            });
          });
        });
      });
    });
    it("Should do a token withdrawal", function(done) {
      var amount = new BigNumber(utility.ethToWei(100));
      utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, accounts[1]], function(err, result) {
        var initialBalance = result;
        utility.testCall(web3, contractToken1, contractToken1Addr, 'balanceOf', [accounts[1]], function(err, result) {
          var initialTokenBalance = result;
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'withdrawToken', [contractToken1Addr, amount, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, accounts[1]], function(err, result) {
              var finalBalance = result;
              utility.testCall(web3, contractToken1, contractToken1Addr, 'balanceOf', [accounts[1]], function(err, result) {
                var finalTokenBalance = result;
                utility.testCall(web3, contractToken1, contractToken1Addr, 'balanceOf', [accounts[1]], function(err, result) {
                  assert.equal(finalBalance.equals(initialBalance.sub(amount)), true);
                  assert.equal(finalTokenBalance.equals(initialTokenBalance.add(amount)), true);
                  done();
                });
              });
            });
          });
        });
      });
    });
    it("Should do an Ether withdrawal", function(done) {
      var amount = new BigNumber(utility.ethToWei(100));
      utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [0, accounts[1]], function(err, result) {
        var initialBalance = result;
        web3.eth.getBalance(contractEtherDeltaAddr, function(err, result) {
          var initialEtherBalance = result;
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'withdraw', [amount, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [0, accounts[1]], function(err, result) {
              var finalBalance = result;
              web3.eth.getBalance(contractEtherDeltaAddr, function(err, result) {
                var finalEtherBalance = result;
                assert.equal(finalBalance.equals(initialBalance.sub(amount)), true);
                assert.equal(finalEtherBalance.equals(initialEtherBalance.sub(amount)), true);
                done();
              });
            });
          });
        });
      });
    });
    it("Should change the account levels address and fail", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeAccountLevelsAddr', ["0x0", {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the account levels address and succeed", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeAccountLevelsAddr', ["0x0", {gas: 1000000, value: 0}], admin, undefined, 0, function(err, result) {
        assert.equal(err, undefined);
        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'accountLevelsAddr', [], function(err, result) {
          assert.equal(result=="0x0000000000000000000000000000000000000000", true);
          done();
        });
      });
    });
    it("Should change the fee account and fail", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeAccount', ["0x0", {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the fee account and succeed", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeAccount', [accounts[1], {gas: 1000000, value: 0}], admin, undefined, 0, function(err, result) {
        assert.equal(err, undefined);
        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'feeAccount', [], function(err, result) {
          assert.equal(result==accounts[1], true);
          done();
        });
      });
    });
    it("Should change the make fee and fail", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeMake', [feeMake, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the make fee and fail because the make fee can only decrease", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeMake', [feeMake.mul(2), {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the make fee and succeed", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeMake', [feeMake.div(2), {gas: 1000000, value: 0}], admin, undefined, 0, function(err, result) {
        assert.equal(err, undefined);
        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'feeMake', [], function(err, result) {
          assert.equal(result.equals(feeMake.div(2)), true);
          feeMake = result;
          done();
        });
      });
    });
    it("Should change the take fee and fail", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeTake', [feeTake, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the take fee and fail because the take fee can only decrease", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeTake', [feeTake.mul(2), {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the take fee and fail because the take fee must exceed the rebate fee", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeTake', [feeTake.minus(new BigNumber(1)), {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the take fee and succeed", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeTake', [feeRebate.plus(new BigNumber(2)), {gas: 1000000, value: 0}], admin, undefined, 0, function(err, result) {
        assert.equal(err, undefined);
        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'feeTake', [], function(err, result) {
          assert.equal(result.equals(feeRebate.plus(new BigNumber(2))), true);
          feeTake = result;
          done();
        });
      });
    });
    it("Should change the rebate fee and fail", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeRebate', [feeRebate, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the rebate fee and fail because the rebate fee can only increase", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeRebate', [feeRebate.div(2), {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the rebate fee and fail because the rebate fee must not exceed the take fee", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeRebate', [feeTake.plus(new BigNumber(1)), {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the rebate fee and succeed", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeFeeRebate', [feeTake.minus(new BigNumber(1)), {gas: 1000000, value: 0}], admin, undefined, 0, function(err, result) {
        assert.equal(err, undefined);
        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'feeRebate', [], function(err, result) {
          assert.equal(result.equals(feeTake.minus(new BigNumber(1))), true);
          feeRebate = result;
          done();
        });
      });
    });
    it("Should change the admin account and fail", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeAdmin', [accounts[1], {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
        assert.equal(!err, false);
        done();
      });
    });
    it("Should change the admin account and succeed", function(done) {
      utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'changeAdmin', [accounts[1], {gas: 1000000, value: 0}], admin, undefined, 0, function(err, result) {
        assert.equal(err, undefined);
        utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'admin', [], function(err, result) {
          assert.equal(result==accounts[1], true);
          admin = result;
          done();
        });
      });
    });
  });
});
