# Smart contract overview

## Changelog

### February 9, 2017

- In response to breaking changes in the eth_sign function, signatures now require a special prefix. See [this GitHub issue](https://github.com/ethereum/go-ethereum/pull/2940) for technical details.

### October 25, 2016

- The smart contract has been upgraded to `pragma solidity ^0.4.2`.
- The only `payable` function is `deposit`.
- The smart contract has improved on-chain order functionality. Previously, the on-chain order function would have required an off-chain signature as input. This is no longer necessary. Order hashes that have been submitted on-chain are now stored in a separate mapping, and the order details are stored in the event log. This is meant to be a fallback in the event that the off-chain order system is no longer feasible.
- Because the smart contract is now an order parameter, orders are only valid on one smart contract. Previously, they were valid on multiple EtherDelta smart contracts at a time.
- An admin account has the ability to change the fee account, the admin account, or the fees.
- The fees are currently the same as before (0.3% for takers, 0.0% for makers), and the admin account is only allowed to decrease the fees.
- The smart contract allows for a market maker rebate and tiered account levels with different fee structures. These are currently not enabled.
- Previously, take fees were paid in the token being received by the taker. Now they (along with make fees and rebates) are paid in the token being given by the taker. This simplifies the fee calculus.
- The fee calculation can no longer cause rounding error. Previously, this could have introduced problems for tokens with a low number of decimals and a high value per token.

## High level overview

At a high level, EtherDelta functions just like a normal exchange. Unlike a traditional exchange, which has all of its business logic defined and executed on a private server owned by a company, EtherDelta's business logic is defined and executed in a smart contract on the public, decentralized [Ethereum](https://ethereum.org) blockchain. The EtherDelta GUI (Graphical User Interface) is designed to let you interact with the EtherDelta smart contract without having to deal with the low-level details of blockchain transactions.

The EtherDelta smart contract allows you to deposit or withdraw Ether or any [ERC-20](https://github.com/ethereum/EIPs/issues/20) Ethereum token.

Like any other exchange, EtherDelta has an order book of resting orders. A resting order consists of a price, volume, expiration time (measured in blocks), and signature. In effect, it represents a signed intent to trade. When you create a new resting order, it gets broadcast to an off-chain order book server. The primary benefit of storing resting orders off-chain is that you don't have to create an Ethereum transaction and pay gas to submit a resting order. EtherDelta does have a backup mechanism that allows orders to be submitted with on-chain transactions.

When a counterparty decides to trade your resting order, he submits a transaction to the smart contract with your signed intent to trade and the volume he wishes to trade. The smart contract checks the signature, makes sure you and the counterparty both have enough funds to cover the trade, and then executes the trade by moving funds between accounts.

## Internal security review

The smart contract source code can be found [on GitHub](https://github.com/etherdelta/etherdelta.github.io/blob/master/smart_contract/etherdelta.sol). It is also verified on Etherscan.

    pragma solidity ^0.4.2;

    contract SafeMath {
      function safeMul(uint a, uint b) internal returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
      }

      function safeSub(uint a, uint b) internal returns (uint) {
        assert(b =a && c>=b);
        return c;
      }

      function assert(bool assertion) internal {
        if (!assertion) throw;
      }
    }


The first contract, SafeMath, defines functions that can be used to do addition, subtraction, or multiplication and throw an error in the event of an unsigned integer overflow or underflow. The safeMul and safeAdd functions are used throughout the smart contract to prevent situations where arguments are so large that numbers overflow, causing unexpected and undesired behavior. The safeSub function is also used throughout the smart contract to prevent situations where a transaction would cause a user's balance to be negative.

    contract Token {
      /// @return total amount of tokens
      function totalSupply() constant returns (uint256 supply) {}

      /// @param _owner The address from which the balance will be retrieved
      /// @return The balance
      function balanceOf(address _owner) constant returns (uint256 balance) {}

      /// @notice send _value token to _to from msg.sender
      /// @param _to The address of the recipient
      /// @param _value The amount of token to be transferred
      /// @return Whether the transfer was successful or not
      function transfer(address _to, uint256 _value) returns (bool success) {}

      /// @notice send _value token to _to from _from on the condition it is approved by _from
      /// @param _from The address of the sender
      /// @param _to The address of the recipient
      /// @param _value The amount of token to be transferred
      /// @return Whether the transfer was successful or not
      function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {}

      /// @notice msg.sender approves _addr to spend _value tokens
      /// @param _spender The address of the account able to transfer the tokens
      /// @param _value The amount of wei to be approved for transfer
      /// @return Whether the approval was successful or not
      function approve(address _spender, uint256 _value) returns (bool success) {}

      /// @param _owner The address of the account owning tokens
      /// @param _spender The address of the account able to transfer the tokens
      /// @return Amount of remaining tokens allowed to spent
      function allowance(address _owner, address _spender) constant returns (uint256 remaining) {}

      event Transfer(address indexed _from, address indexed _to, uint256 _value);
      event Approval(address indexed _owner, address indexed _spender, uint256 _value);

      uint public decimals;
      string public name;
    }

    contract StandardToken is Token {
      function transfer(address _to, uint256 _value) returns (bool success) {
        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        //if (balances[msg.sender] >= _value && _value > 0) {
          balances[msg.sender] -= _value;
          balances[_to] += _value;
          Transfer(msg.sender, _to, _value);
          return true;
        } else { return false; }
      }

      function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {
        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        //if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
          balances[_to] += _value;
          balances[_from] -= _value;
          allowed[_from][msg.sender] -= _value;
          Transfer(_from, _to, _value);
          return true;
        } else { return false; }
      }

      function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
      }

      function approve(address _spender, uint256 _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
      }

      function allowance(address _owner, address _spender) constant returns (uint256 remaining) {
        return allowed[_owner][_spender];
      }

      mapping(address => uint256) balances;

      mapping (address => mapping (address => uint256)) allowed;

      uint256 public totalSupply;
    }

    contract ReserveToken is StandardToken, SafeMath {
      address public minter;
      function ReserveToken() {
        minter = msg.sender;
      }
      function create(address account, uint amount) {
        if (msg.sender != minter) throw;
        balances[account] = safeAdd(balances[account], amount);
        totalSupply = safeAdd(totalSupply, amount);
      }
      function destroy(address account, uint amount) {
        if (msg.sender != minter) throw;
        if (balances[account] < amount) throw;
        balances[account] = safeSub(balances[account], amount);
        totalSupply = safeSub(totalSupply, amount);
      }
    }


The Token interface defines the ERC-20 token standard. EtherDelta relies on the Token fuction signatures to be able to do token transfers. EtherDelta's [test framework](https://github.com/etherdelta/etherdelta.github.io/blob/master/test.js) uses the StandardToken implementation along with the ReserveToken contract to implement and trade a basic token.

    contract AccountLevels {
      //given a user, returns an account level
      //0 = regular user (pays take fee and make fee)
      //1 = market maker silver (pays take fee, no make fee, gets rebate)
      //2 = market maker gold (pays take fee, no make fee, gets entire counterparty's take fee as rebate)
      function accountLevel(address user) constant returns(uint) {}
    }

    contract AccountLevelsTest is AccountLevels {
      mapping (address => uint) public accountLevels;

      function setAccountLevel(address user, uint level) {
        accountLevels[user] = level;
      }

      function accountLevel(address user) constant returns(uint) {
        return accountLevels[user];
      }
    }


The AccountLevels interface defines a contract that can keep track of account levels for EtherDelta users. The regular level involves paying make and take fees. The market maker silver level involves paying a take fee, but no make fee, and getting a make rebate. The gold level involves paying a take fee, but no make fee, and getting a make rebate equal to the take fee paid by the counterparty. The test framework uses the AccountLevelsTest contract to test the different account levels.

    contract EtherDelta is SafeMath {
      address public admin; //the admin address
      address public feeAccount; //the account that will receive fees
      address public accountLevelsAddr; //the address of the AccountLevels contract
      uint public feeMake; //percentage times (1 ether)
      uint public feeTake; //percentage times (1 ether)
      uint public feeRebate; //percentage times (1 ether)
      mapping (address => mapping (address => uint)) public tokens; //mapping of token addresses to mapping of account balances (token=0 means Ether)
      mapping (address => mapping (bytes32 => bool)) public orders; //mapping of user accounts to mapping of order hashes to booleans (true = submitted by user, equivalent to offchain signature)
      mapping (address => mapping (bytes32 => uint)) public orderFills; //mapping of user accounts to mapping of order hashes to uints (amount of order that has been filled)


The first section of the main EtherDelta contract defines the storage variables.

- The admin variable holds the account with special administrative privileges. The admin account can change the admin account, change the accountLevelsAddr, or lower the fees. The admin account cannot raise the fees.
- The feeAccount variable holds the account to which EtherDelta trading fees are paid.
- The accountLevelsAddr variable holds the address of the contract that specifies account levels. If the accountLevelsAddr is set to the zero account, then no account levels will be in effect.
- The feeMake, feeTake, and feeRebate variables hold the fee percentages, times 1 ether. For example, since 1 ether = 10^18, 10^17 would represents 10%.
- The tokens variable is where user balances are stored. For example, if your address is 0x123 and the DAO token address is 0xbb9, then your DAO balance will be in tokens[0xbb9][0x123]. By special case, your Ether balance will be in tokens[0][0x123]. Note that all Ether amounts are in Wei, and all token amounts are in the base unit of the token (which is usually Wei, but depends on the token).
- The orders variable is used to keep track of orders that have been initiated on-chain. For example, if your address is 0x123, and you create an order with order hash 0x234, then orders[0x123][0x234] will be true.
- The orderFills variable is used to keep track of orders that have been partially or completely filled. For example, if you create a resting order (using the account 0x123) to buy 10 tokens with a hash of 0x234, and someone submits a transaction to sell you 5 tokens (taking out half of your order), then orderFills[0x123][0x234] will be changed to 5.

    event Order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user);
    event Cancel(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s);
    event Trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, address get, address give);
    event Deposit(address token, address user, uint amount, uint balance);
    event Withdraw(address token, address user, uint amount, uint balance);


The events are emitted by similarly named transactions and stored in the blockchain. The GUI uses them to display a list of trades, deposits, and withdrawals.

    function EtherDelta(address admin_, address feeAccount_, address accountLevelsAddr_, uint feeMake_, uint feeTake_, uint feeRebate_) {
      admin = admin_;
      feeAccount = feeAccount_;
      accountLevelsAddr = accountLevelsAddr_;
      feeMake = feeMake_;
      feeTake = feeTake_;
      feeRebate = feeRebate_;
    }

    function() {
      throw;
    }


The EtherDelta constructor simply initializes the admin account, fee account, account levels address, and fee percentages. The default function simply throws an error. Any Ether sent to EtherDelta without a function call will be returned to sender.

    function changeAdmin(address admin_) {
      if (msg.sender != admin) throw;
      admin = admin_;
    }

    function changeAccountLevelsAddr(address accountLevelsAddr_) {
      if (msg.sender != admin) throw;
      accountLevelsAddr = accountLevelsAddr_;
    }

    function changeFeeAccount(address feeAccount_) {
      if (msg.sender != admin) throw;
      feeAccount = feeAccount_;
    }

    function changeFeeMake(uint feeMake_) {
      if (msg.sender != admin) throw;
      if (feeMake_ > feeMake) throw;
      feeMake = feeMake_;
    }

    function changeFeeTake(uint feeTake_) {
      if (msg.sender != admin) throw;
      if (feeTake_ > feeTake || feeTake_ < feeRebate) throw;
      feeTake = feeTake_;
    }

    function changeFeeRebate(uint feeRebate_) {
      if (msg.sender != admin) throw;
      if (feeRebate_ < feeRebate || feeRebate_ > feeTake) throw;
      feeRebate = feeRebate_;
    }


The admin account has the ability to change the admin account, the account levels address, the fee account, and the fees. The fees can only be improved, meaning the make and take fees can only be lowered and the rebate can only be increased.

    function deposit() payable {
      tokens[0][msg.sender] = safeAdd(tokens[0][msg.sender], msg.value);
      Deposit(0, msg.sender, msg.value, tokens[0][msg.sender]);
    }

    function withdraw(uint amount) {
      if (msg.value>0) throw;
      if (tokens[0][msg.sender] < amount) throw;
      tokens[0][msg.sender] = safeSub(tokens[0][msg.sender], amount);
      if (!msg.sender.call.value(amount)()) throw;
      Withdraw(0, msg.sender, amount, tokens[0][msg.sender]);
    }


The vanilla deposit and withdraw functions are to be used for depositing and withdrawing Ether only. Note that the withdraw function does all state changes before sending Ether to the account owner, to avoid potential recursive or reentrant call vulnerabilities. The deposit function is the only payable function in the entire smart contract.

    function depositToken(address token, uint amount) {
      //remember to call Token(address).approve(this, amount) or this contract will not be able to do the transfer on your behalf.
      if (msg.value>0 || token==0) throw;
      if (!Token(token).transferFrom(msg.sender, this, amount)) throw;
      tokens[token][msg.sender] = safeAdd(tokens[token][msg.sender], amount);
      Deposit(token, msg.sender, amount, tokens[token][msg.sender]);
    }

    function withdrawToken(address token, uint amount) {
      if (msg.value>0 || token==0) throw;
      if (tokens[token][msg.sender] < amount) throw;
      tokens[token][msg.sender] = safeSub(tokens[token][msg.sender], amount);
      if (!Token(token).transfer(msg.sender, amount)) throw;
      Withdraw(token, msg.sender, amount, tokens[token][msg.sender]);
    }


The depositToken and withdrawToken functions are similar to their vanilla equivalents, but they are meant to handle deposits and withdrawals of ERC-20 tokens.

    function balanceOf(address token, address user) constant returns (uint) {
      return tokens[token][user];
    }


The balanceOf function is a helper function to get a user's balance for a particular token.

    function order(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce) {
      if (msg.value>0) throw;
      bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
      orders[msg.sender][hash] = true;
      Order(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, msg.sender);
    }


Resting orders are meant to be stored off-chain. In the event that the off-chain broadcasting mechanism fails, users can always store resting orders on-chain by calling the order function. This function will record the hash as signed by the sender in the orders variable and emit an event with the order parameters.

These are the parameters that define an order:

- tokenGet is the token you want to get and tokenGive is the token you want to give. For example, if you want to buy DAO with ETH, then tokenGet is the DAO address, and tokenGive is the ETH token address (0, since ETH is a special case token address).
- amountGet and amountGive represent the size and price you want to trade. For example, if you want to buy 100 DAO with 1 ETH, then amountGet would be 100 DAO, and amountGive would be 1 ETH, which implies a price of 0.01 DAO/ETH or 100 ETH/DAO. In this case, both values would be stored in Wei.
- expires is the block number the order expires in. After this block number, the order can no longer trade.
- nonce is a number you can include with your order to make it relatively unique. This way, if you want to place two otherwise identical orders, they won't have the same hash.

    function trade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s, uint amount) {
      //amount is in amountGet terms
      if (msg.value>0) throw;
      bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
      if (!(
        (orders[user][hash] || ecrecover(hash,v,r,s) == user) &&
        block.number

The trade function, along with its helper tradeBalances, represent the biggest chunk of logic. trade is the function you call when you see a resting order you like and you want to trade it. The parameters are the same as the order parameters, plus an amount, which is the amount of the order you want to trade (in amountGet terms). For example, if you see the order to buy 100 DAO with 1 ETH, and you want to sell 50 DAO for 0.5 ETH, you would use an amount of 50 DAO. The additional arguments v, r, and s hold the signature for the order hash as signed by user. These parameters can be filled with zero values if the order was submitted on-chain (since it will be marked as true in the orders variable).

The first thing the trade function does is construct an order hash. Then it checks to make sure the signature provided matches the order hash (or the order was submitted by the user on-chain), the order hasn't expired, and the trade won't overfill the remaining volume associated with the order. If all these things are true, the tradeBalances function moves funds from one account to the other, and moves funds to the fee account. Note that all fees are paid in the tokenGet token. Then the trade function updates the orderFills variable with the amount that has been filled, and emits an event.

Note that the balances of the two counterparties are never explicitly checked, because the safeSub function is used to ensure the balances don't go below zero. If the trade would result in a balance going below zero, the safeSub function would throw an error and the trade would fail. Also note that the tradeBalances function is marked as private, which means it can only be called from within the EtherDelta smart contract (specifically, from within the trade function).

    function testTrade(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s, uint amount, address sender) constant returns(bool) {
      if (!(
        tokens[tokenGet][sender] >= amount &&
        availableVolume(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, user, v, r, s) >= amount
      )) return false;
      return true;
    }

    function availableVolume(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, address user, uint8 v, bytes32 r, bytes32 s) constant returns(uint) {
      bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
      if (!(
        (orders[user][hash] || ecrecover(hash,v,r,s) == user) &&
        block.number

The testTrade, availableVolume, and amountFilled functions are helper functions. The testTrade function tests whether a trade is still available, using the availableVolume function to check how much volume is available on an order, taking into account the amount that has been filled so far and the funds available in the user's account. The amountFilled function is a helper for accessing the orderFills variable to see how much of an order has been filled already.

    function cancelOrder(address tokenGet, uint amountGet, address tokenGive, uint amountGive, uint expires, uint nonce, uint8 v, bytes32 r, bytes32 s) {
      if (msg.value>0) throw;
      bytes32 hash = sha256(this, tokenGet, amountGet, tokenGive, amountGive, expires, nonce);
      if (!(orders[msg.sender][hash] || ecrecover(hash,v,r,s) == msg.sender)) throw;
      orderFills[msg.sender][hash] = amountGet;
      Cancel(tokenGet, amountGet, tokenGive, amountGive, expires, nonce, msg.sender, v, r, s);
    }


The last function, cancelOrder, lets the owner of an order cancel it before it expires by maxing out the orderFills variable.
