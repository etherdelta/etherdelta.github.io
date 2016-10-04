var Web3 = require('web3');
var solc = require('solc');
var fs = require('fs');
var ethabi = require('ethereumjs-abi');
var BigNumber = require('bignumber.js');
var commandLineArgs = require('command-line-args');

var cli = [
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'address', type: String },
	{ name: 'feeAddress', type: String },
	{ name: 'sendImmediately', type: Boolean, defaultValue: false},
];
var cliOptions = commandLineArgs(cli);

if (cliOptions.help) {
	console.log(cli.getUsage());
} else if (cliOptions.address && cliOptions.feeAddress) {

  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

  //Config
  var solidityFile = './smart_contract/etherdelta.sol';
  var contractName = 'EtherDelta';
	var solcVersion = 'v0.4.2+commit.af6afb04';
  var address = cliOptions.address;
  var feeAddress = cliOptions.feeAddress;
	var feeMake = 0;
  var feeTake = 3000000000000000;
  var constructTypes = ['address', 'uint256', 'uint256'];
  var constructArguments = [ feeAddress, feeMake, feeTake ];
	var abiEncoded = ethabi.rawEncode(constructTypes, constructArguments);

	solc.loadRemoteVersion(solcVersion, function(err, solcV) {
		console.log("Solc version:",solcV.version());

	  console.log('ABI encoded constructor arguments: '+abiEncoded.toString('hex'));

	  fs.readFile(solidityFile, function(err, result){
	    var source = result.toString();
	    var output = solcV.compile(source, 1); // 1 activates the optimiser
	    var abi = JSON.parse(output.contracts[contractName].interface);
	    var bytecode = output.contracts[contractName].bytecode;

	    var contract = web3.eth.contract(abi);
			if (cliOptions.sendImmediately) {
				var contractInstance = contract.new(feeAddress, feeMake, feeTake, {from: address, gas: 4000000, data: bytecode}, function(err, myContract){
		      if(!err) {
						if (myContract.address) {
							console.log(myContract.address);
						}
		      }
		    });
			} else {
				var data = contract.new.getData(feeAddress, feeMake, feeTake, {data: bytecode});
				console.log(data);
			}
	  });
	});
}
