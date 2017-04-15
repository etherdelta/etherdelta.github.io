// http://jsonschema.net/#/

const account = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'object',
  displayProperty: 'account',
  properties: {
    address: {
      title: 'Address',
      description: 'The Ethereum address',
      type: 'string',
    },
    privateKey: {
      title: 'Private key',
      description: 'The Ethereum private key)',
      type: 'string',
    },
  },
  additionalProperties: false,
  required: ['address'],
};

const pairs = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  type: 'array',
  items: {
    type: 'object',
    displayProperty: 'pair',
    properties: {
      pair: {
        title: 'Pair',
        description: 'The pair name should match what you see on EtherDelta, for example MKR/ETH',
        type: 'string',
      },
      expires: {
        title: 'Expires',
        description: 'Number of blocks until your orders expire',
        type: 'integer',
      },
      sellEnabled: {
        title: 'Sell enabled',
        description: 'Whether to enable sell orders',
        type: 'string',
      },
      sellNum: {
        title: 'Sell number',
        description: 'Number of sell orders',
        type: 'number',
      },
      sellVolume: {
        title: 'Sell volume',
        description: 'Formula for sell volume',
        type: 'string',
      },
      sellPrice: {
        title: 'Sell price',
        description: 'Formula for sell price',
        type: 'string',
      },
      buyPrice: {
        title: 'Buy price',
        description: 'Formula for buy price',
        type: 'string',
      },
      buyVolume: {
        title: 'Buy volume',
        description: 'Formula for buy volume',
        type: 'string',
      },
      buyNum: {
        title: 'Buy number',
        description: 'Number of buy orders',
        type: 'number',
      },
      buyEnabled: {
        title: 'Buy enabled',
        description: 'Whether to enable buy orders',
        type: 'string',
      },
    },
    additionalProperties: false,
    required: [
      'pair',
      'expires',
      'sellEnabled',
      'sellNum',
      'sellVolume',
      'sellPrice',
      'buyPrice',
      'buyVolume',
      'buyNum',
      'buyEnabled',
    ],
  },
};

module.exports = { account, pairs };
