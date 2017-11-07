** Notice: this API is now deprecated. It will continue to run, but with less resources allocated to it. If you are building a new app, see the [new socket API](API.md). **

# EtherDelta API

EtherDelta's API allows you to query orders, trades, deposits, and withdrawals. Since EtherDelta is a smart contract, it is also possible to get trades, deposits, and withdrawals from the Ethereum API (through an Ethereum node or Etherscan API). EtherDelta's orderbook is an off-chain mechanism (a list of cryptographically signed orders) that you can only access through this API. The API allows you to see existing orders or place a new one.

## Servers

EtherDelta one API endpoint. It can be reached from either of these domains:

 * `https://api.etherdelta.com`
 * `https://cache.etherdelta.com`

## Endpoints

### GET `https://api.etherdelta.com/returnTicker`

This returns every pair that has traded in the past 24 hours.

Example output:

```
{
  "ETH_VERI": {
    "tokenAddr": "0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374",
    "quoteVolume": 10562.366,
    "baseVolume": 3622.171,
    "last": 0.354592012,
    "percentChange": 0.0762,
    "bid": 0.37,
    "ask": 0.36199
  }
}
```

### GET `https://api.etherdelta.com/trades/[TOKEN ADDRESS]/[PAGE]`

This returns the 1,000 most recent trades for a particular token. The page number starts at 0.

Example output:

```
[
  {
    "txHash": "0x9c1dd8d21bef7ea8bda90c9fecd89cdc5d2e6db473b4e406afea28b4ce03f337",
    "date": "2017-08-25T02:35:26.000Z",
    "price": "0.36199",
    "side": "buy",
    "amount": "3",
    "amountBase": "1.08597",
    "buyer": "0x8492ee5ab447655e982f30be868dd8133ca8823e",
    "seller": "0xd0e0fece8a16f36bc23e07f92f98b191624f331a"
  }
]
```

### GET `https://api.etherdelta.com/myTrades/[USER ADDRESS]/[TOKEN ADDRESS]/[PAGE]`

This returns the 1,000 most recent trades associated with a given user for a particular token. The page number starts at 0.

Example output: same structure as the `trades` endpoint.

### GET `https://api.etherdelta.com/orders/[TOKEN ADDRESS]/[PAGE]`

This returns the 1,000 best buy and sell orders for a particular token. The page number starts at 0.

Example output:

```
{
  "buys": [
    {
      "id": "2311a122e163dbaeb558d3d4a6f9d28b22ea6bbdba0b88d312e7c78a3837648f_buy",
      "amount": "8000000000000000000",
      "price": "0.291001",
      "tokenGet": "0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374",
      "amountGet": "8000000000000000000",
      "tokenGive": "0x0000000000000000000000000000000000000000",
      "amountGive": "2328008000000000000",
      "expires": "4210573",
      "nonce": "2406242974",
      "v": 28,
      "r": "0xc8e7b6bcca7a84911b8e6455d0957e8e2c0b513362a6a376d624295c50cdbb90",
      "s": "0x0de9e45bf3e61cf00616ad97abf439a91cab7edf1f8ebac69e000d3c804a8c6f",
      "user": "0xD0e0fECe8A16F36bC23E07f92f98B191624F331a",
      "updated": "2017-08-25T02:37:08.779Z",
      "availableVolume": "8000000000000000000",
      "ethAvailableVolume": "8",
      "availableVolumeBase": "2328008000000000000",
      "ethAvailableVolumeBase": "2.328008",
      "amountFilled": null
    }
  ],
  "sells": [
    {
      "id": "2d87e80349cc3c17f7feeb0f58c37797a6babcccca084617ecdf3c9f6bda02c5_sell",
      "amount": "-4000000000000000000",
      "price": "0.384999",
      "tokenGet": "0x0000000000000000000000000000000000000000",
      "amountGet": "1539996000000000000",
      "tokenGive": "0x8f3470a7388c05ee4e7af3d01d8c722b0ff52374",
      "amountGive": "4000000000000000000",
      "expires": "4210563",
      "nonce": "214456803",
      "v": 28,
      "r": "0xfd524461ba0e289e8f24e09baf0390f6f1d29705c65962fbb11140d70cb5a555",
      "s": "0x53264a9c3f32168407393e5b7db33b47b705be327dab734c9cd99381913fa878",
      "user": "0xD0e0fECe8A16F36bC23E07f92f98B191624F331a",
      "updated": "2017-08-25T02:43:06.485Z",
      "availableVolume": "4000000000000000000",
      "ethAvailableVolume": "4",
      "availableVolumeBase": "1539996000000000000",
      "ethAvailableVolumeBase": "1.539996",
      "amountFilled": null
    }
  ]
}
```

### GET `https://api.etherdelta.com/myOrders/[USER ADDRESS]/[TOKEN ADDRESS]/[PAGE]`

This returns the 1,000 best buy and sell orders associated with a given user for a particular token. The page number starts at 0.

Example output: same structure as the `orders` endpoint.

### GET `https://api.etherdelta.com/funds/[USER ADDRESS]/[TOKEN ADDRESS]/[PAGE]`

This returns the 1,000 most recent deposits and withdrawals in either the given token address or ETH for a given user. The page number starts at 0.

Example output:

```
[
  {
    "txHash": "0x23abe9a81116334bb62868826f0dc604cd0f9c05a604886c3a4735696f162882",
    "date": "2017-08-25T02:26:59.000Z",
    "tokenAddr": "0x0000000000000000000000000000000000000000",
    "kind": "Deposit",
    "user": "0x8492ee5ab447655e982f30be868dd8133ca8823e",
    "amount": "15.1",
    "balance": "15.171717267106331"
  }
]
```

### POST `https://api.etherdelta.com/message`

This allows you to post an order.

Body parameters: `message`, which should be JSON with the following parameters:

 * `amountGive`: the amount you want to give (in wei or the base unit of the token)
 * `tokenGive`: the token you want to give (use the zero address, `0x0000000000000000000000000000000000000000` for ETH)
 * `amountGet`: the amount you want to get (in wei or the base unit of the token)
 * `tokenGet`: the token you want to get (use the zero address, `0x0000000000000000000000000000000000000000` for ETH)
 * `contractAddr`: the EtherDelta smart contract address
 * `expires`: the block number when the order should expire
 * `nonce`: a random number
 * `user`: the address of the user placing the order
 * `v`, `r`, `s`: the signature of `sha256(contractAddr, tokenGet, amountGet, tokenGive, amountGive, expires, nonce)` after being signed by the `user`

#### Restrictions:

 * All orders must involve a token and ETH.
 * Minimum size: 0.001 ETH
 * Maximum orders per side (buy, sell) per address per token: 5

Returns: an indication of success or failure (and reason why).
