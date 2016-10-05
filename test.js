var config = require('./config.js');
var utility = require('./common/utility.js');
var Web3 = require('web3');
var assert = require('assert');
var TestRPC = require('ethereumjs-testrpc');
var fs = require('fs');
var sha256 = require('js-sha256').sha256;
var async = require('async');
var BigNumber = require('bignumber.js');
var utils = require('web3/lib/utils/utils.js');
var coder = require('web3/lib/solidity/coder.js');
var solc = require('solc');

var logger = {
  log: function(message) {
    // console.log(message);
  }
};

function deploy(web3, sourceFile, contractName, constructorParams, address, callback) {
  utility.readFile(sourceFile+'.bytecode', function(err, bytecode){
    utility.readFile(sourceFile+'.interface', function(err, abi){
      utility.readFile(sourceFile, function(err, source){
        var compiled = solc.compile(source, 1).contracts[contractName];
        abi = JSON.parse(compiled.interface);
        bytecode = compiled.bytecode;
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
  var contractEtherDeltaAddr;
  var contractToken1Addr;
  var contractToken2Addr;
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
    it("Should add the etherdelta contract to the network", function(done) {
      feeMake = new BigNumber(utility.ethToWei(0.005));
      feeTake = new BigNumber(utility.ethToWei(0.003));
      feeAccount = accounts[0];
      deploy(web3, config.contractEtherDelta, 'EtherDelta', [feeAccount, feeMake, feeTake], accounts[0], function(err, contract) {
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
        var tokenGet = contractToken1Addr;
        var amountGet = new BigNumber(utility.ethToWei(50));
        var tokenGive = contractToken2Addr;
        var amountGive = new BigNumber(utility.ethToWei(25));
        var expires = blockNumber+2;
        var orderNonce = 1;
        var user = accounts[1];
        var condensed = utility.pack([contractEtherDeltaAddr, tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
        var hash = sha256(new Buffer(condensed,'hex'));
        var amount = amountGet.div(new BigNumber(2));
        utility.sign(web3, user, hash, undefined, function(err, sig) {
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, sig.v, sig.r, sig.s, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
            utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'trade', [tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce, user, sig.v, sig.r, sig.s, amount, {gas: 1000000, value: 0}], accounts[2], undefined, 0, function(err, result) {
              assert.equal(err, undefined);
              utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, accounts[1]], function(err, balance11) {
                utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken1Addr, accounts[2]], function(err, balance12) {
                  utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, accounts[1]], function(err, balance21) {
                    utility.testCall(web3, contractEtherDelta, contractEtherDeltaAddr, 'balanceOf', [contractToken2Addr, accounts[2]], function(err, balance22) {
                      assert.equal(balance11.equals(initialBalance.plus(amount.times(unit.sub(feeMake).div(unit)))), true);
                      assert.equal(balance12.equals(initialBalance.minus(amount)), true);
                      assert.equal(balance21.equals(initialBalance.minus(amount.times(amountGive).div(amountGet))), true);
                      assert.equal(balance22.equals(initialBalance.plus((amount.times(amountGive).div(amountGet)).times(unit.sub(feeTake).div(unit)))), true);
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
        var tokenGet = contractToken1Addr;
        var amountGet = new BigNumber(utility.ethToWei(50));
        var tokenGive = contractToken2Addr;
        var amountGive = new BigNumber(utility.ethToWei(25));
        var expires = blockNumber+1000;
        var orderNonce = 2;
        var user = accounts[1];
        var condensed = utility.pack([contractEtherDeltaAddr, tokenGet, amountGet.toNumber(), tokenGive, amountGive.toNumber(), expires, orderNonce], [160, 160, 256, 160, 256, 256, 256]);
        var hash = sha256(new Buffer(condensed,'hex'));
        var amount = amountGet.div(new BigNumber(2));
        utility.sign(web3, user, hash, undefined, function(err, sig) {
          utility.testSend(web3, contractEtherDelta, contractEtherDeltaAddr, 'order', [tokenGet, amountGet, tokenGive, amountGive, expires, sig.v, sig.r, sig.s, {gas: 1000000, value: 0}], accounts[1], undefined, 0, function(err, result) {
            assert.equal(err, undefined);
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
  });
});
