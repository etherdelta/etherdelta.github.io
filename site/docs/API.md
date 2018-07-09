# EtherDelta API

EtherDelta's API allows you to query orders, trades, deposits, and withdrawals. Since EtherDelta is a smart contract, it is also possible to get trades, deposits, and withdrawals from the Ethereum API (through an Ethereum node or Etherscan API). EtherDelta's orderbook is an off-chain mechanism (a list of cryptographically signed orders) that you can only access through this API. The API allows you to see existing orders or place a new one.

## Server

EtherDelta has one API endpoint. It is a Websocket API.

 * `https://socket.etherdelta.com`

## Endpoints

### `getMarket { token (address), user (address) }`

Both arguments are optional. Emit this message and then wait for a `market` response, which will contain `{ returnTicker, orders, trades, myOrders, myTrades, myFunds }`.

#### `returnTicker`

Example:
```
{
  ETH_VERI:
   { tokenAddr: '0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374',
     quoteVolume: 1000.1,
     baseVolume: 212.3,
     last: 0.245,
     percentChange: 0.0047,
     bid: 0.243,
     ask: 0.246 },
  ...
}
```

#### `orders`, `myOrders`

If the `user` argument is present, `myOrders` will contain orders filtered by the user's address. Otherwise, it will be absent.

Example:
```
{
  sells: [
    { id: '1337b7fe3f96996904d1299fcf030501661158cb964ae6400cbda2ae107978fb_sell',
      amount: '-2000000000000000000',
      price: '0.9',
      tokenGet: '0x0000000000000000000000000000000000000000',
      amountGet: '1800000000000000000',
      tokenGive: '0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374',
      amountGive: '2000000000000000000',
      expires: '5143967',
      nonce: '893205913',
      v: 28,
      r: '0x4eb35ba40288a169e5f5dfe85a8582db762fde5d57b212afd0be6438ca186f40',
      s: '0x6fc37f071c75c562074b536a354bc79ba3a066f918243fc29813e9a4426b5fa9',
      user: '0xfb83cB20DFcf7643AbE43Ea23b77F04573eC9616',
      updated: '2017-09-16T11:56:47.006Z',
      availableVolume: '1999403702773222212.22222222222222222222',
      ethAvailableVolume: '1.999403702773222',
      availableVolumeBase: '1799463332495900000',
      ethAvailableVolumeBase: '1.7994633324959',
      amountFilled: '0' },
    ...
  ],
  buys: [
    { id: '2c002b763a9aba6d51dbf7274676f7ce957a060bd340b6230aa707fd5ca358a8_buy',
      amount: '10000000000000000000',
      price: '0.06',
      tokenGet: '0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374',
      amountGet: '10000000000000000000',
      tokenGive: '0x0000000000000000000000000000000000000000',
      amountGive: '600000000000000000',
      expires: '1003884633',
      nonce: '1928222541',
      v: 28,
      r: '0x236d8b8f87163b6dc6712cb90ac85be8eb9fd80d6d671013d8414206d33da1d9',
      s: '0x6813055d05f5300cd45a43ef5e592f78bdc9698e548f3bfb49fc355f327fc92b',
      user: '0xd270fDc1b2a369f890E9858F09E3D0769B63b526',
      updated: '2017-09-13T14:56:28.838Z',
      availableVolume: '10000000000000000000',
      ethAvailableVolume: '10',
      availableVolumeBase: '600000000000000000',
      ethAvailableVolumeBase: '0.6',
      amountFilled: '0' },
    ...
  ]
}
```

#### `trades`, `myTrades`

If the `user` argument is present, `myTrades` will contain trades filtered by the user's address. Otherwise, it will be absent.

Example:
```
[
  { txHash: '0x75f083bf7a47861dcbb86b30b359de761e57d648c48b5084af7ef3f5db887557',
    date: '2017-10-23T01:16:53.000Z',
    price: '0.219011',
    side: 'sell',
    amount: '70.2',
    amountBase: '15.3745722',
    buyer: '0xfe988cd30fa97f5422f5a4ae50eafa6271cd2417',
    seller: '0x2056c8184da1fd5a7a1cf43b567c82a999962ef4',
    tokenAddr: '0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374' },
  ...
]
```

#### `myFunds`

If the `user` argument is present, `myFunds` will contain deposits and withdrawals filtered by the user's address. Otherwise, it will be absent.

Example:
```
[
  { txHash: '0x295f173773f31c852a9c3eef252f8600620147c6aabb312276f8b0d9800cbc7a',
      date: '2017-10-17T17:36:41.000Z',
      tokenAddr: '0x0000000000000000000000000000000000000000',
      kind: 'Deposit',
      user: '0xcdb1978195f0f6694d0fc4c5770660f12aad65c3',
      amount: '0.001',
      balance: '0.005688612160935313' },
  ...
]
```

### `message (order)`

This allows you to post an order. `order` should be a JSON object with the following properties:

* `amountGive`: the amount you want to give (in wei or the base unit of the token)
* `tokenGive`: the token you want to give (use the zero address, `0x0000000000000000000000000000000000000000` for ETH)
* `amountGet`: the amount you want to get (in wei or the base unit of the token)
* `tokenGet`: the token you want to get (use the zero address, `0x0000000000000000000000000000000000000000` for ETH)
* `contractAddr`: the EtherDelta smart contract address
* `expires`: the block number when the order should expire
* `nonce`: a random number
* `user`: the address of the user placing the order
* `v`, `r`, `s`: the signature of `sha256(contractAddr, tokenGet, amountGet, tokenGive, amountGive, expires, nonce)` after being signed by the `user`

## Events

### `orders`

This will emit new orders as they are placed. Its structure will mirror that of `market.orders`, except that some orders will have a `deleted` flag. Orders with the `deleted` flag are no longer valid (cancelled or traded).

### `trades`

This will emit new trades as they happen. Its structure will mirror that of `market.trades`.

### `funds`

This will emit new deposits and withdrawals as they happen. Its structure will mirror that of `market.myFunds`.

## Ethereum API

With the exception of the off-chain orderbook, EtherDelta is entirely defined and executed by a smart contract. This API is mainly meant as a convenience so you don't have to deal with Ethereum for asking basic read-only questions like "what traded recently." Depositing, withdrawing, and trading, should all be done directly with the smart contract. For an overview of the smart contract, see the [smart contract overview](SMART_CONTRACT.md).

## Rate limit

You are limited to 12 requests per minute per IP address. Please make contact if you will need more throughput.

## Examples

EtherDelta has provided [example trading bots](https://github.com/etherdelta/bots) to illustrate working functionality.
