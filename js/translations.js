(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.translations = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var translations = {
  'en': {
    en: 'English',
    cn: 'English',
  },
  'cn': {
    en: '中文',
    cn: '中文',
  },
  title:{
    en:'EtherDelta',
    cn:'EtherDelta'
  },
  description:{
    en:'EtherDelta is a decentralized exchange for Ethereum tokens.',
    cn:'EtherDelta是去中心化的以太坊交易平台。'
    // cn:'EtherDelta是无中心的以太坊交易平台。'
  },
  Smart_Contract:{
    en:'Smart Contract',
    cn:'智能合约'
  },
  smart_contract_overview:{
    en:'Smart contract overview',
    cn:'智能合约概貌'
  },
  select_account:{
    en:'Select an account',
    cn:'选择账号'
  },
  howto_videos:{
    en:'How-to videos',
    cn:'说明视频'
  },
  FAQ:{
    en:'FAQ',
    cn:'FAQ'
  },
  Screencast:{
    en:'Screencast',
    cn:'截屏'
  },
  cost:{
    en:'Cost',
    cn:'成本'
  },
  Notes:{
    en:'Notes',
    cn:'笔记'
  },
  depth:{
    en:'Depth',
    cn:'深度'
  },
  only_7_days:{
    en:'Note: EtherDelta will only show transactions from the last 7 days.',
    cn:'Note: EtherDelta 只会显示近7天的交易记录'
    // cn:'Note: EtherDelta will only show transactions from the last 7 days.'
  },

  announcements:{
    en:'Announcements',
    cn:'公告'
  },
  order_book:{
    en:'Order book',
    cn:'订单簿'
  },
  orders:{
    en:'Orders',
    cn:'订单'
    // cn:'订单簿'
  },
  follow_twitter:{
    en:'Follow us on Twitter',
    cn:'订阅我们的Twitter'
    // cn:'跟Twitter'
  },
  chat:{
    en:'Chat',
    cn:'聊天'
    // cn:'聊'
  },
  send:{
    en:'Send',
    cn:'发送'
  },
  volume:{
    en:'Volume',
    cn:'交易量'
    // cn:'量'
  },
  pair:{
    en:'Pair',
    cn:'交易币种'
    // cn:'名称'
  },
  produced_etherboost:{
    en:'Produced by Etherboost',
    cn:'Etherboost制作'
  },
  etherdelta_desc:{
    en:'EtherDelta &#8212; decentralized token exchange',
    cn:'EtherDelta &#8212; 去中心化交易'
    // cn:'EtherDelta &#8212; 无中心交易'
  },
  etheropt_desc:{
    en:'EtherOpt &#8212; decentralized options exchange',
    cn:'EtherOpt &#8212; 去中心化期权交易'
    // cn:'EtherOpt &#8212; 无中心期权交易'
  },
  predictiontoken_desc:{
    en:'PredictionToken &#8212; prediction market tokens',
    cn:'PredictionToken &#8212; 虚拟货币市场预测'
    // cn:'PredictionToken &#8212; 预测市场币'
  },
  ethereumdollar_desc:{
    en:'EthereumDollar &#8212; stable dollar token',
    cn:'EthereumDollar &#8212; 稳定美元币'
  },
  toggle_navigation:{
    en:'Toggle navigation',
    cn:'切换导航'
  },
  name:{
    en:'Name',
    cn:'币种'
    // cn:'币名称'
  },
  decimals:{
    en:'Decimals',
    cn:'小数位数'
  },
  go:{
    en:'Go',
    cn:'提交'
  },
  add_account:{
    en:'Add account',
    cn:'添加账号'
  },
  address:{
    en:'Address',
    cn:'地址'
  },
  private_key:{
    en:'Private key',
    cn:'密钥'
  },
  buy:{
    en:'Buy',
    cn:'买'
  },
  sell:{
    en:'Sell',
    cn:'卖'
  },
  amount_to_buy:{
    en:'Amount to buy',
    cn:'买入量'
    // cn:'买的量'
  },
  amount_to_sell:{
    en:'Amount to sell',
    cn:'卖出量'
    // cn:'卖的量'
  },
  price:{
    en:'Price',
    cn:'价格'
  },
  total:{
    en:'Total',
    cn:'总量'
  },
  order:{
    en:'Order',
    cn:'下单'
  },
  etherscan_contract:{
    en:'Etherscan contract',
    cn:'Etherscan 合约'
    // cn:'Etherscan contract'
  },
  etherscan_address:{
    en:'Etherscan address',
    cn:'Etherscan 地址'
    // cn:'Etherscan address'
  },
  Guides:{
    en:'Guides',
    cn:'指南'
  },
  help:{
    en:'Help',
    cn:'援助'
  },
  videos:{
    en:'Videos',
    cn:'视频'
  },
  number_of_blocks:{
    en:'Number of blocks',
    cn:'过期区块数量'
    // cn:'到期块数量'
  },
  expires:{
    en:'Expires',
    cn:'到期区块数量'
    // cn:'到期块数量'
  },
  balances:{
    en:'Balances',
    cn:'余额'
  },
  balance:{
    en:'Balance',
    cn:'余额'
  },
  token:{
    en:'Token',
    cn:'币种'
    // cn:'币'
  },
  tokens:{
    en:'Tokens',
    cn:'币种'
    // cn:'币'
  },
  aug032016:{
    en:'August 3, 2016',
    cn:'2016年8月3日'
  },
  aug032016_announcement:{
    en:'EtherDelta has moved to a new smart contract. Go to the bottom of the page and switch to the old one if you have a balance there you need to withdraw.',
    cn:'EtherDelta更新了智能合约。如果你要提取余额，请到本页底部转成旧的合约并进行提取。'
    // cn:'EtherDelta迁移到了新的智能合约。如果你要提取余额，请到本页底部转成旧的。'
  },
  aug302016:{
    en:'August 30, 2016',
    cn:'2016年8月3日'
  },
  aug302016_announcement:{
    en:'EtherDelta has moved to a new smart contract. Go to the bottom of the page and switch to the old one if you have a balance there you need to withdraw.',
    cn:'EtherDelta更新了智能合约。如果你要提取余额，请到本页底部转成旧的合约并进行提取。'
    // cn:'EtherDelta迁移到了新的智能合约。如果你要提取余额，请到本页底部转成旧的。'

  },
  new_account:{
    en:'New account',
    cn:'新账号'
  },
  import_account:{
    en:'Import account',
    cn:'导入账号'
  },
  export_private_key:{
    en:'Export private key',
    cn:'导出私钥'
  },
  forget_account:{
    en:'Forget account',
    cn:'忘记账号'
  },
  forget_all_accounts:{
    en:'Forget all accounts',
    cn:'忘记所有账号'
  },
  reset_cache:{
    en:'Reset cache',
    cn:'重设缓存'
  },
  deposit:{
    en:'Deposit',
    cn:'充值'
  },
  withdraw:{
    en:'Withdraw',
    cn:'提取'
  },
  transfer:{
    en:'Transfer',
    cn:'转移'
  },
  balance_in_your_wallet:{
    en:'Wallet',
    cn:'钱包'
  },
  balance_etherdelta:{
    en:'EtherDelta',
    cn:'EtherDelta'
  },
  amount:{
    en:'Amount',
    cn:'数量'
  },
  other:{
    en:'Other',
    cn:'其它币'
  },
  other_token:{
    en:'Other token',
    cn:'其它币'
  },
  other_base:{
    en:'Other base',
    cn:'其它支付币种'
    // cn:'其它币基'
  },
  connection:{
    en:'Connection',
    cn:'连接'
  },
  connect_using:{
    en:'Connect using',
    cn:'连接采用'
  },
  testnet:{
    en:'TESTNET',
    cn:'测试链'
    // cn:'TESTNET'
  },
  metamask:{
    en:'MetaMask',
    cn:'MetaMask'
  },
  mist_browser:{
    en:'Mist Browser',
    cn:'Mist Browser'
  },
  toggle_dropdown:{
    en:'Toggle dropdown',
    cn:'转换'
  },
  fees:{
    en:'Fees',
    cn:'费用'
    // cn:'收费'
  },
  connect_ethereum:{
    en:'Connect to Ethereum',
    cn:'连接以太坊'
  },
  deposit_withdraw:{
    en:'Deposit and Withdraw',
    cn:'充值和提取'
  },
  trade:{
    en:'Trade',
    cn:'交易'
  },
  transaction:{
    en:'Transaction',
    cn:'交易'
  },
  fee:{
    en:'Fee',
    cn:'费用'
    // cn:'收费'
  },
  maker:{
    en:'Maker',
    cn:'Maker'
  },
  taker:{
    en:'Taker',
    cn:'Taker'
  },
  maker_vs_taker:{
    en:'Maker vs taker',
    cn:'Maker 与 Taker'
  },
  need_help:{
    en:'Need help? Join the',
    cn:'Need help? Join the'
  },
  chat_gitter:{
    en:'Chat on Gitter',
    cn:'Chat on Gitter'
  },
  only_fee_taker:{
    en:'The only fee is a Taker fee. Deposit, withdraw, and maker transactions are all free.',
    cn:'收费仅对Taker. 充值，提现对Maker免费。'
    // cn:'只有Taker收费. 充值，提取，和Maker交易免费。'
  },
  maker_fee_desc:{
    en:'A maker order is one that rests in the order book ("resting order"). To create a maker order, fill out the "Buy" or "Sell" form. Once you click "Buy" or "Sell," you will see your order appear in the order book. These orders are always free. This is to encourage market makers to add liquidity to the order book.',
    cn:'Maker订单在订单记录中待定("resting order")。要创建一个Maker订单, 请填“买”或“卖”表格。点了“买”或“卖”的按钮以后，你就可以在下面的订单记录中看到你的订单 。这些订单都是免费的。免费是为了鼓励市场中Maker增加流动性。'
  },
  taker_fee_desc:{
    en:'A taker order is one that trades against a resting order. To create a taker order, pick an existing order from the order book, and click "Buy" or "Sell." A popup window will appear. Decide how much of the order you want to trade, and then click "Buy" or "Sell." These orders charge a fee of 0.30%.',
    cn:'Taker订单是与"resting order"交易。要创建一个Taker订单，请从订单记录中选一个已有的订单，按“买”或“卖”。接下来有一个小窗会弹出，输入你的交易数量，再按“买”或“卖”。这些交易收0.30%的费用。'
  },
  three_ways_connect:{
    en:'There are three ways you can connect to the Ethereum network.',
    cn:'连接以太坊有三种方式'
  },
  connect_metamask:{
    en:'Connect to the Ethereum network through <a href="https://metamask.io">MetaMask</a>. MetaMask is a Chrome plugin that lets you manage your Ethereum accounts and sign transactions on a case by case basis. If you are using MetaMask, your MetaMask account will automatically appear in the account dropdown.',
    cn:'通过 <a href="https://metamask.io">MetaMask</a>. MetaMask是Chrome浏览器plugin。可以用它管理你的以太坊账号，给你的交易签名。如果你用MetaMask, 你的MetaMask账号自动出现在账号下拉列表里。'
  },
  connect_mist:{
    en:'Connect to Ethereum via the Mist browser. The only downside to doing this is that you will have to unlock your account manually in order to broadcast resting orders (other transactions will work). Mist will eventually support the eth.sign() function that is needed to individually approve resting orders, but for now you will need to unlock your account manually by running <code>geth attach</code> and then <code>personal.unlockAccount("0xYOUR_ETHEREUM_ACCOUNT")</code> from the command line.',
    cn:'通过Mist浏览器。这种方式唯一的缺点是： 你要手动解锁你的账号，以便扩散“待定下单”（其它交易可以完成）。Mist最终会支持eth.sign()，需要这个函数来分个批准“待定下单”，但是现在你要通过命令行执行<code>geth attach</code> 并且 执行<code>personal.unlockAccount("0x你的以太坊账号")</code>手动解锁。'
  },
  connect_etherscan:{
    en:'Connect to Ethereum through the Etherscan API. This is the default option if you don\'t have MetaMask or Mist. You will need to create a new account by clicking "Create account" under the address dropdown. You should export the private key and write it down by clicking "Export private key" under the address dropdown. If you prefer, you can also use <a href="http://www.myetherwallet.com/" target="_blank">MyEtherWallet</a> to create a new Ethereum account, then use "Import account" to add your new address and its private key.',
    cn:'通过以太坊API。如果你没有MetaMask或Mist，这是缺省设置。你需要点击“地址”下拉列表“创建账号”创建一个新账号。你要点击“地址”下拉列表“导出私钥”，导出私钥并写下来。你也可以倾向使用<a href="http://www.myetherwallet.com/" target="_blank">MyEtherWallet</a>创建新的以太坊账号，然后用“导入账号”来添加你的新地址和私钥。'
  },
  deposit_withdraw_1:{
    en:'In the top left, you will find two dropdowns you can use to select the currency pair you want to trade. For example, select "MKR" and "ETH" to trade the "MKR/ETH" currency pair.',
    cn:'在左上角，你可以找到两个下拉列表来选择币对进行交易。例如， 选择“MKR”和“ETH”来交易“MKR/ETH”币对。'
  },
  deposit_withdraw_2:{
    en:'Under "Balances," you will see your balance for each of the two currencies you selected. This is the balance you have deposited to EtherDelta from your Ethereum account.',
    cn:'在“余额”下面，你可以看到两种币的各自的余额，这是从你的以太坊账号充值的余额。'
  },
  deposit_withdraw_3:{
    en:'To deposit, withdraw, or transfer, scroll to the bottom of the page. Find the "Balances" section.',
    cn:'要“充值”，“提取”，或“转移”，在本页的底部，找到“余额”区域。'
  },
  deposit_withdraw_4:{
    en:'To deposit, click the "Deposit" tab, pick a token, enter an amount you would like to deposit from your Ethereum account into EtherDelta, and click "Deposit."',
    cn:'充值点“充值”，选择一种币，输入从以太坊账号进入EtherDelta的充值数量，再点“充值”。'
  },
  deposit_withdraw_5:{
    en:'To withdraw, use the "Withdraw" tab.',
    cn:'提取点“提取”'
  },
  deposit_withdraw_6:{
    en:'To transfer tokens from your Ethereum address to another Ethereum address, use the "Transfer" tab.',
    cn:'要将币从你的以太坊账号转到另一个以太坊账号，点“转移”。'
  },
  deposit_withdraw_7:{
    en:'Once the Ethereum transaction has been confirmed, your balance will automatically update. If you don\'t have the necessary funds available for the deposit or withdraw transaction, then the Ethereum transaction will fail.',
    cn:'一旦以太坊交易通过验证，你的余额就会自动更新。如果币值不足，充值和提取就会失败。'
  },
  trade_1:{
    en:'In the top left, you will find two dropdowns you can use to select the currency pair you want to trade. For example, select "MKR" and "ETH" to trade the "MKR/ETH" currency pair.',
    cn:'在左上角，你可以找到两个下拉列表来选择币对进行交易。例如， 选择“MKR”和“ETH”来交易“MKR/ETH”币对。'
  },
  trade_2:{
    en:'If you want to trade a token that doesn\'t appear in the list, you can choose "Other" and fill out the form. Different tokens have different multipliers, so fill out this form carefully.',
    cn:'如果你要交易的币种不在列表中，你可以选择“其它币”和填表。不同的币种乘数不同，请小心填表。'
  },
  trade_3:{
    en:'EtherDelta supports resting orders (adding liquidity) and trading against existing resting orders (taking liquidity).',
    cn:'EtherDelta支持“待定下单”（resting order）来增加流动性，以及交易“待定下单”来减少流动性。'
  },
  trade_4:{
    en:'To create a resting order, fill out the "Buy" or "Sell" form at the top of the page. The order expires in the number of blocks you specify (1 block &#8776; 15 seconds).',
    cn:'要创建“待定下单”，在本页的开头输入“买”或“卖”。该订单会在你指定的块数到期（一块包含15秒）。'
  },
  trade_5:{
    en:'If you need to cancel your order, you can click your order in the order book and press the "Cancel" button. This will send an Ethereum transaction that will, once confirmed, cancel your order. Note that this will cost gas (Ethereum transaction fee), whereas placing a resting order and letting it expire does not cost gas.',
    cn:'要取消订单，你可以点订单记录中的订单，再点“取消”按钮。这样会寄出一个以太坊交易，经过验证后，订单会取消。注意这个要消耗gas（以太坊交易费）。但是订一个“待定下单”，让它到期不会消耗gas。'
  },
  trade_6:{
    en:'When you submit a resting order, it gets broadcast to the world. The current broadcast channel is a Gitter chat room, but EtherDelta also supports using Ethereum events as a fallback broadcast mechanism.',
    cn:'但你提交了一个“待定下单”后，它会广播到全球。现在的传播渠道是Gitter聊天室，但是EtherDelta也支持以太坊事件机制，用来保底。'
  },
  trade_7:{
    en:'The GUI scans for new orders being broadcast and displays them in the order book (offers on the left, bids on the right).',
    cn:'页面会扫描新的在广播中的订单，并在定记录中显示（报价在左，竞价在右）。'
  },
  trade_8:{
    en:'A resting order represents a cryptographically signed intent to trade. Up until your order expires or is cancelled, anyone who has seen it can trade against it, assuming both traders have enough funds in their EtherDelta accounts. The GUI filters out orders that do not have funds to back them up. Partial fills are supported.',
    cn:'“待定下单”代表加密签名过的交易意向。在你的订单过期或取消以前，看见这个订单的任何人可以与它交易（前提是双方账号中有足够的币）。页面会过滤掉币的数量不够的订单。订单也可以部分成交。'
  },
  trade_9:{
    en:'To trade against an existing resting order, click "Buy" or "Sell" next to it in the order book and type in the volume you want to trade. The GUI will do one last check that the trade can cross (the funds are there and the order hasn\'t already traded), but if someone submits a transaction right before you do, your Ethereum transaction will fail because the order already traded.',
    cn:'要和已有的“待定下单”交易，点订单记录中“待定下单”的“买”或“卖”，并输入你要交易的数量。本页会再做最后的成交检查，确定有足够的币，并且订单没有被交易掉。如果别人比你先提交，你的以太坊交易会失败，因为订单已经交易了。'
  },
  offers:{
    en:'Offers',
    cn:'报价'
  },
  bids:{
    en:'Bids',
    cn:'竞价'
  },
  bid:{
    en:'Bid',
    cn:'竞价'
  },
  offer:{
    en:'Offer',
    cn:'要价'
  },
  no_orders:{
    en:'There are no orders here.',
    cn:'这里没有显示订单。'
  },
  no_orders_reset:{
    en:'reset the cache',
    cn:'重设缓存'
  },
  order_details:{
    en:'Order details',
    cn:'下单明细'
  },
  expires_in:{
    en:'Expires in',
    cn:'到期块数'
  },
  Block:{
    en:'Block',
    cn:'块'
  },
  block:{
    en:'block',
    cn:'块'
  },
  blocks:{
    en:'blocks',
    cn:'块'
  },
  expired:{
    en:'Expired',
    cn:'Expired'
  },
  order_will_refresh:{
    en:'This order will refresh when it expires unless you press',
    cn:'这单到期会刷新，除非你按'
  },
  stop:{
    en:'Stop',
    cn:'停止'
  },
  or_refresh:{
    en:'or refresh/close the page.',
    cn:'或刷新/关闭本页。'
  },
  you_can:{
    en:'You can',
    cn:'你可以'
  },
  cancel:{
    en:'Cancel',
    cn:'取消'
  },
  cancel_blockchain:{
    en:'this order with a blockchain transaction.',
    cn:'取消这单区块链交易。'
  },
  new_order:{
    en:'New order',
    cn:'新订单'
  },
  available_volume:{
    en:'Available volume',
    cn:'量'
  },
  price_chart:{
    en:'Price chart',
    cn:'图表'
  },
  sell_order:{
    en:'Sell order',
    cn:'卖单'
  },
  buy_order:{
    en:'Buy order',
    cn:'买单'
  },
  trades:{
    en:'Trades',
    cn:'交易'
  },
  auto_refresh:{
    en:'Auto refresh',
    cn:'自动刷新'
  },
  my_transactions:{
    en:'My transactions',
    cn:'我的交易'
  },
  or:{
    en:'or',
    cn:'或'
  },
  type:{
    en:'Type',
    cn:'类型'
  },
  question_mark:{
    en:'???',
    cn:'???'
  },
  pending:{
    en:'Pending',
    cn:'待定'
  },
  daily:{
    en:'Daily',
    cn:'经常'
  },
  weekly:{
    en:'Weekly',
    cn:'每周的'
  }
};

module.exports = translations;

},{}]},{},[1])(1)
});