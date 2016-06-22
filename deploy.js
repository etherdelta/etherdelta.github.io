var config = require('./config.js');
var utility = require('./utility.js');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');
var fs = require('fs');
var Web3 = require('web3');
var BigNumber = require('bignumber.js');
var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
	{ name: 'help', alias: 'h', type: Boolean },
  { name: 'armed', type: Boolean, defaultValue: false },
	{ name: 'address', type: String }
]);
var cli_options = cli.parse()

if (cli_options.help) {
	console.log(cli.getUsage());
} else {
  var web3 = new Web3();
	web3.eth.defaultAccount = cli_options.address;
	web3.setProvider(new web3.providers.HttpProvider(config.eth_provider));

  function deploy(source_code, constructor_arguments, from_address, callback) {
    utility.readFile(source_code+'.bytecode', function(bytecode){
      utility.readFile(source_code+'.interface', function(abi){
        abi = JSON.parse(abi);
        bytecode = JSON.parse(bytecode);
        var myContract = web3.eth.contract(abi);
        utility.send(web3, myContract, undefined, 'constructor', constructor_arguments.concat([{from: from_address, data: bytecode, gas: 4712388, gasPrice: config.eth_gas_price}]), from_address, undefined, 0, function(result) {
          txHash = result[0];
          nonce = result[1];
          if (txHash) {
            var address = undefined;
            async.whilst(
              function () { return address==undefined; },
              function (callback_whilst) {
                  setTimeout(function () {
                    utility.txReceipt(web3, txHash, function(receipt) {
                      if (receipt) {
                        address = receipt.contractAddress;
                      }
                      callback_whilst(null);
                    });
                  }, 1*1000);
              },
              function (err) {
                callback(address);
              }
            );
          }
        });
      });
    });
  }

  var feeAddress = cli_options.address;
  var feeMake = new BigNumber(utility.ethToWei(0));
  var feeTake = new BigNumber(utility.ethToWei(0.003));
  deploy(config.contract_etherdelta, [feeAddress, feeMake, feeTake], cli_options.address, function(contract_etherdelta_addr){
		console.log("config.contract_etherdelta_addr = '"+contract_etherdelta_addr+"';");
  });
}
