var config = require('./config.js');
var utility = require('./common/utility.js');
var async = (typeof(window) === 'undefined') ? require('async') : require('async/dist/async.min.js');
var fs = require('fs');
var Web3 = require('web3');
var BigNumber = require('bignumber.js');
var commandLineArgs = require('command-line-args');

var cli = commandLineArgs([
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'address', type: String }
]);
var cliOptions = cli.parse()

if (cliOptions.help) {
	console.log(cli.getUsage());
} else {
  var web3 = new Web3();
	web3.eth.defaultAccount = cliOptions.address;
	web3.setProvider(new web3.providers.HttpProvider(config.ethProvider));

  var feeAddress = cliOptions.address;
  var feeMake = new BigNumber(utility.ethToWei(0));
  var feeTake = new BigNumber(utility.ethToWei(0.003));
	utility.deployContract(web3, config.contractEtherDelta, 'EtherDelta', [feeAddress, feeMake, feeTake], cliOptions.address, function(err, contractEtherDeltaAddr){
		console.log("config.contractEtherDeltaAddr = '"+contractEtherDeltaAddr+"';");
  });
}
