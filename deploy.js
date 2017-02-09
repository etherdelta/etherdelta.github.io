var Web3 = require('web3');
var solc = require('solc');
var fs = require('fs');
var ethabi = require('ethereumjs-abi');
var BigNumber = require('bignumber.js');
var commandLineArgs = require('command-line-args');
var async = require('async');

var cli = [
	{ name: 'help', alias: 'h', type: Boolean },
	{ name: 'address', type: String },
	{ name: 'admin', type: String },
	{ name: 'feeAccount', type: String },
	{ name: 'accountLevelsAddr', type: String },
	{ name: 'sendImmediately', type: Boolean, defaultValue: false},
];
var cliOptions = commandLineArgs(cli);

if (cliOptions.help) {
	console.log(cli);
} else if (cliOptions.address && cliOptions.admin && cliOptions.feeAccount && cliOptions.accountLevelsAddr) {

  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

  //Config
  var solidityFile = './smart_contract/etherdelta.sol';
  var contractName = 'EtherDelta';
	var solcVersion = 'v0.4.9+commit.364da425';
  var address = cliOptions.address;
	var admin = cliOptions.admin;
  var feeAccount = cliOptions.feeAccount;
	var accountLevelsAddr = cliOptions.accountLevelsAddr;
	var feeMake = 0;
  var feeTake = 3000000000000000;
	var feeRebate = 0;
	var gas = 2000000;
  var args = [ admin, feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate ];

	function deploy(compiledContract, args, gas, address, sendImmediately) {
    var abi = JSON.parse(compiledContract.interface);
    var bytecode = compiledContract.bytecode;

		if (args.length>0) {
			var constructTypes = abi.filter(function(x){return x.type=='constructor'})[0].inputs.map(function(x){return x.type});
	    var abiEncoded = ethabi.rawEncode(constructTypes, args);
	    console.log('ABI encoded constructor arguments: '+abiEncoded.toString('hex'));
		}

    var contract = web3.eth.contract(abi);
    if (gas && address && sendImmediately) {
			var data = '0x'+contract.new.getData.apply(null, args.concat({data: bytecode}));
      web3.eth.sendTransaction({from: address, gas: gas, data: data}, function(err, txHash){
        if(err) {
          console.log(err);
        } else {
					var contractAddress = undefined;
					async.whilst(
						function() {return !contractAddress},
						function(callback) {
							web3.eth.getTransactionReceipt(txHash, function(err, result) {
								if (result && result.contractAddress) contractAddress = result.contractAddress;
								setTimeout(function(){
									callback(null);
								}, 10*1000);
							});
						},
						function(err) {
							if (!err){
								console.log(contractAddress);
							} else {
								console.log(err);
							}
						}
					)
        }
      });
    } else {
      console.log('Contract data:', data);
    }
  }

	solc.loadRemoteVersion(solcVersion, function(err, solcV) {
		console.log("Solc version:",solcV.version());
	  fs.readFile(solidityFile, function(err, result){
	    var source = result.toString();
	    var output = solcV.compile(source, 1); // 1 activates the optimiser
			if (output.errors) console.log(output.errors);
			var args = [admin, feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate];
			var sendImmediately = cliOptions.sendImmediately;
			deploy(output.contracts[':'+contractName], args, gas, address, sendImmediately)
	  });
	});
}
