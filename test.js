var config = require('./config.js');
var utility = require('./utility.js');
var Web3 = require('web3');
var assert = require('assert');
var TestRPC = require('ethereumjs-testrpc');
var fs = require('fs');
var sha256 = require('js-sha256').sha256;
var async = require('async');
var BigNumber = require('bignumber.js');
var utils = require('web3/lib/utils/utils.js');
var coder = require('web3/lib/solidity/coder.js');

var logger = {
  log: function(message) {
    // console.log(message);
  }
};

describe("Test", function(done) {
  this.timeout(240*1000);
  var web3 = new Web3();
  var port = 12345;
  var server;
  var accounts;
  var mycontractEtherDelta;
  var mycontractToken1;
  var mycontractToken2;
  var contractEtherDeltaAddr;
  var contractToken1_addr;
  var contractToken2_addr;
  var unit = new BigNumber(utility.ethToWei(1.0));

  before("Initialize TestRPC server", function(done) {
    server = TestRPC.server(logger);
    server.listen(port, function() {
      config.ethProvider = "http://localhost:" + port;
      config.eth_gas_cost = 20000000000;
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
      it("Should add a token contract to the network", function(done) {
        utility.readFile(config.contractToken+'.bytecode', function(bytecode){
          utility.readFile(config.contractToken+'.interface', function(abi){
            abi = JSON.parse(abi);
            bytecode = JSON.parse(bytecode);
            myContract_backertoken = web3.eth.contract(abi);
            utility.testSend(web3, myContract_backertoken, undefined, 'constructor', [{from: accounts[0], data: bytecode}], accounts[0], undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              //You are probably getting this error because ethereumjs-testrpc's block gas limit is too small (it hasn't been upgraded to the homestead block limit). Change line 95 of node_modules/ethereumjs-testrpc/lib/blockchain.js to block.header.gasLimit = '0x47e7c4';
              var initialTransaction = result;
              assert.deepEqual(initialTransaction.length, 66);
              web3.eth.getTransactionReceipt(initialTransaction, function(err, receipt) {
                assert.equal(err, undefined);
                contract_backertoken_addr = receipt.contractAddress;
                myContract_backertoken = myContract_backertoken.at(contract_backertoken_addr);
                assert.notEqual(receipt, null, "Transaction receipt shouldn't be null");
                assert.notEqual(contract_backertoken_addr, null, "Transaction did not create a contract");
                web3.eth.getCode(contract_backertoken_addr, function(err, result) {
                  assert.equal(err, undefined);
                  assert.notEqual(result, null);
                  assert.notEqual(result, "0x0");
                  done();
                });
              });
            });
          });
        });
      });
      it("Should add a token1 contract to the network", function(done) {
        utility.readFile(config.contractToken+'.bytecode', function(bytecode){
          utility.readFile(config.contractToken+'.interface', function(abi){
            abi = JSON.parse(abi);
            bytecode = JSON.parse(bytecode);
            mycontractToken1 = web3.eth.contract(abi);
            utility.testSend(web3, mycontractToken1, undefined, 'constructor', [{from: accounts[0], data: bytecode}], accounts[0], undefined, 0, function(err, result) {
              if (err) {
                return done(err+" You are probably getting this error because ethereumjs-testrpc's block gas limit is too small (it hasn't been upgraded to the homestead block limit). Change line 95 of node_modules/ethereumjs-testrpc/lib/blockchain.js to block.header.gasLimit = '0x47e7c4';");
              }
              var initialTransaction = result;
              assert.deepEqual(initialTransaction.length, 66);
              web3.eth.getTransactionReceipt(initialTransaction, function(err, receipt) {
                assert.equal(err, undefined);
                contractToken1_addr = receipt.contractAddress;
                mycontractToken1 = mycontractToken1.at(contractToken1_addr);
                assert.notEqual(receipt, null, "Transaction receipt shouldn't be null");
                assert.notEqual(contractToken1_addr, null, "Transaction did not create a contract");
                web3.eth.getCode(contractToken1_addr, function(err, result) {
                  assert.equal(err, undefined);
                  assert.notEqual(result, null);
                  assert.notEqual(result, "0x0");
                  done();
                });
              });
            });
          });
        });
      });
      it("Should add a token2 contract to the network", function(done) {
        utility.readFile(config.contractToken+'.bytecode', function(bytecode){
          utility.readFile(config.contractToken+'.interface', function(abi){
            abi = JSON.parse(abi);
            bytecode = JSON.parse(bytecode);
            mycontractToken2 = web3.eth.contract(abi);
            utility.testSend(web3, mycontractToken2, undefined, 'constructor', [{from: accounts[0], data: bytecode}], accounts[0], undefined, 0, function(err, result) {
              if (err) {
                return done(err+" You are probably getting this error because ethereumjs-testrpc's block gas limit is too small (it hasn't been upgraded to the homestead block limit). Change line 95 of node_modules/ethereumjs-testrpc/lib/blockchain.js to block.header.gasLimit = '0x47e7c4';");
              }
              var initialTransaction = result;
              assert.deepEqual(initialTransaction.length, 66);
              web3.eth.getTransactionReceipt(initialTransaction, function(err, receipt) {
                assert.equal(err, undefined);
                contractToken2_addr = receipt.contractAddress;
                mycontractToken2 = mycontractToken2.at(contractToken2_addr);
                assert.notEqual(receipt, null, "Transaction receipt shouldn't be null");
                assert.notEqual(contractToken2_addr, null, "Transaction did not create a contract");
                web3.eth.getCode(contractToken2_addr, function(err, result) {
                  assert.equal(err, undefined);
                  assert.notEqual(result, null);
                  assert.notEqual(result, "0x0");
                  done();
                });
              });
            });
          });
        });
      });
      it("Should add the etherdelta contract to the network", function(done) {
        feeMake = new BigNumber(utility.ethToWei(0));
        feeTake = new BigNumber(utility.ethToWei(0.003));
        feeAccount = accounts[0];
        utility.readFile(config.contractEtherDelta+'.bytecode', function(bytecode){
          utility.readFile(config.contractEtherDelta+'.interface', function(abi){
            abi = JSON.parse(abi);
            bytecode = JSON.parse(bytecode);
            mycontractEtherDelta = web3.eth.contract(abi);
            utility.testSend(web3, mycontractEtherDelta, undefined, 'constructor', [feeAccount, feeMake, feeTake, {from: accounts[0], data: bytecode}], accounts[0], undefined, 0, function(err, result) {
              if (err) {
                return done(err+" You are probably getting this error because ethereumjs-testrpc's block gas limit is too small (it hasn't been upgraded to the homestead block limit). Change line 95 of node_modules/ethereumjs-testrpc/lib/blockchain.js to block.header.gasLimit = '0x47e7c4';");
              }
              var initialTransaction = result;
              assert.deepEqual(initialTransaction.length, 66);
              web3.eth.getTransactionReceipt(initialTransaction, function(err, receipt) {
                assert.equal(err, undefined);
                contractEtherDeltaAddr = receipt.contractAddress;
                mycontractEtherDelta = mycontractEtherDelta.at(contractEtherDeltaAddr);
                assert.notEqual(receipt, null, "Transaction receipt shouldn't be null");
                assert.notEqual(contractEtherDeltaAddr, null, "Transaction did not create a contract");
                web3.eth.getCode(contractEtherDeltaAddr, function(err, result) {
                  assert.equal(err, undefined);
                  assert.notEqual(result, null);
                  assert.notEqual(result, "0x0");
                  done();
                });
              });
            });
          });
        });
      });
      it("Should mint some tokens", function(done) {
        var amount = utility.ethToWei(10000);
        utility.testSend(web3, mycontractToken1, contractToken1_addr, 'setMinter', [{gas: 1000000, value: 0}], accounts[0], undefined, 0, function(err, result) {
          assert.equal(err, undefined);
          utility.testSend(web3, mycontractToken2, contractToken2_addr, 'setMinter', [{gas: 1000000, value: 0}], accounts[0], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            async.each([1,2,3,4,5],
              function(i, callback) {
                utility.testSend(web3, mycontractToken1, contractToken1_addr, 'create', [accounts[i], amount, {gas: 1000000, value: 0}], accounts[0], undefined, 0, function(err, result) {
                  assert.equal(err, undefined);
                  utility.testSend(web3, mycontractToken2, contractToken2_addr, 'create', [accounts[i], amount, {gas: 1000000, value: 0}], accounts[0], undefined, 0, function(err, result) {
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
        });
      });
      it("Should add funds to etherdelta", function(done) {
        function addEtherFunds(amount, account, callback) {
          utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'deposit', [{gas: 1000000, value: amount}], account, undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [0, account], function(err, result) {
              if (!result.equals(amount)) return done("Balance check failure");
              callback();
            });
          });
        }
        function addFunds(amount, contractToken, contractToken_addr, account, callback) {
          utility.testSend(web3, contractToken, contractToken_addr, 'approve', [contractEtherDeltaAddr, amount, {gas: 1000000, value: 0}], account, undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'depositToken', [contractToken_addr, amount, {gas: 1000000, value: 0}], account, undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken_addr, account], function(err, result) {
                if (!result.equals(amount)) return done("Balance check failure");
                callback();
              });
            });
          });
        }
        var amount = new BigNumber(utility.ethToWei(1000));
        addFunds(amount, mycontractToken1, contractToken1_addr, accounts[1], function(){
          addFunds(amount, mycontractToken1, contractToken1_addr, accounts[2], function(){
            addFunds(amount, mycontractToken2, contractToken2_addr, accounts[1], function(){
              addFunds(amount, mycontractToken2, contractToken2_addr, accounts[2], function(){
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
      it("Should do a trade", function(done) {
        /*
        before this trade, the balances are:
        token1:
          account1: 1000
          account2: 1000
        token2:
          account1: 1000
          account2: 1000
        account1 wants to get 50 token1 for 25 token2
        account2 wants to do half of that trade (half of the get)
        the balances after this trade should be:
        token1:
          account1: 1025 minus feeMake
          account2: 975
        token2:
          account1: 987.5
          account2: 1012.5 minutes feeTake
        */
        var initialBalance = new BigNumber(utility.ethToWei(1000));
        web3.eth.getBlockNumber(function(err, blockNumber) {
          if (err) callback(err);
          var tokenGet = contractToken1_addr;
          var amountGet = new BigNumber(utility.ethToWei(50));
          var tokenGive = contractToken2_addr;
          var amountGive = new BigNumber(utility.ethToWei(25));
          var expires = blockNumber+2;
          var orderNonce = 1;
          var user = accounts[1];
          var condensed = utility.pack([tokenGet, amountGet.toNumber(), tokenGive, amountGive.toNumber(), expires, orderNonce], [160, 256, 160, 256, 256, 256]);
          var hash = sha256(new Buffer(condensed,'hex'));
          var amount = amountGet.div(new BigNumber(2));
          utility.sign(web3, user, hash, undefined, function(sig) {
            utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, sig.v, sig.r, sig.s, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s, amount, {gas: 1000000, value: 0}], accounts[2], undefined, 0, function(err, result) {
                assert.equal(err, undefined);
                utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1_addr, accounts[1]], function(err, balance11) {
                  utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1_addr, accounts[2]], function(err, balance12) {
                    utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2_addr, accounts[1]], function(err, balance21) {
                      utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2_addr, accounts[2]], function(err, balance22) {
                        if (!balance11.equals(initialBalance.plus(amount.times(unit.sub(feeMake).div(unit))))) return done("Balance check failure");
                        if (!balance12.equals(initialBalance.minus(amount))) return done("Balance check failure");
                        if (!balance21.equals(initialBalance.minus(amount.times(amountGive).div(amountGet)))) return done("Balance check failure");
                        if (!balance22.equals(initialBalance.plus((amount.times(amountGive).div(amountGet)).times(unit.sub(feeTake).div(unit))))) return done("Balance check failure");
                        done();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
      it("Should do a self trade and check available volume depletion", function(done) {
        web3.eth.getBlockNumber(function(err, blockNumber) {
          if (err) callback(err);
          var tokenGet = contractToken1_addr;
          var amountGet = new BigNumber(utility.ethToWei(50));
          var tokenGive = contractToken2_addr;
          var amountGive = new BigNumber(utility.ethToWei(25));
          var expires = blockNumber+1000;
          var orderNonce = 2;
          var user = accounts[1];
          var condensed = utility.pack([tokenGet, amountGet.toNumber(), tokenGive, amountGive.toNumber(), expires, orderNonce], [160, 256, 160, 256, 256, 256]);
          var hash = sha256(new Buffer(condensed,'hex'));
          var amount = amountGet.div(new BigNumber(2));
          utility.sign(web3, user, hash, undefined, function(sig) {
            utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, sig.v, sig.r, sig.s, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s, amount, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
                assert.equal(err, undefined);
                utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'availableVolume', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s], function(err, result) {
                  assert.equal(result.equals(amountGet.minus(amount)), true);
                  done();
                });
              });
            });
          });
        });
      });
      it("Should do a token withdrawal", function(done) {
        var amount = new BigNumber(utility.ethToWei(100));
        utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1_addr, accounts[1]], function(err, result) {
          var initialBalance = result;
          utility.testCall(web3, mycontractToken1, contractToken1_addr, 'balanceOf', [accounts[1]], function(err, result) {
            var initialTokenBalance = result;
            utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'withdrawToken', [contractToken1_addr, amount, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1_addr, accounts[1]], function(err, result) {
                var finalBalance = result;
                utility.testCall(web3, mycontractToken1, contractToken1_addr, 'balanceOf', [accounts[1]], function(err, result) {
                  var finalTokenBalance = result;
                  utility.testCall(web3, mycontractToken1, contractToken1_addr, 'balanceOf', [accounts[1]], function(err, result) {
                    if (!finalBalance.equals(initialBalance.sub(amount))) return done("Balance check failure");
                    if (!finalTokenBalance.equals(initialTokenBalance.add(amount))) return done("Balance check failure");
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
        utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [0, accounts[1]], function(err, result) {
          var initialBalance = result;
          web3.eth.getBalance(contractEtherDeltaAddr, function(err, result) {
            var initialEtherBalance = result;
            utility.testSend(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'withdraw', [amount, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              utility.testCall(web3, mycontractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [0, accounts[1]], function(err, result) {
                var finalBalance = result;
                web3.eth.getBalance(contractEtherDeltaAddr, function(err, result) {
                  var finalEtherBalance = result;
                  if (!finalBalance.equals(initialBalance.sub(amount))) return done("Balance check failure");
                  if (!finalEtherBalance.equals(initialEtherBalance.sub(amount))) return done("Balance check failure");
                  done();
                });
              });
            });
          });
        });
      });
    });
});
