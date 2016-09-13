//http://jsonschema.net/#/

var schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "pairs": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "pair": {
            "type": "string"
          },
          "theo": {
            "type": "number"
          },
          "minPrice": {
            "type": "integer"
          },
          "maxPrice": {
            "type": "integer"
          },
          "minEdge": {
            "type": "number"
          },
          "edgeStep": {
            "type": "number"
          },
          "ordersPerSide": {
            "type": "integer"
          },
          "expires": {
            "type": "integer"
          }
        },
        "required": [
          "pair",
          "theo",
          "minPrice",
          "maxPrice",
          "minEdge",
          "edgeStep",
          "ordersPerSide",
          "expires"
        ]
      }
    },
    "tokenPrices": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string"
          },
          "price": {
            "type": "integer"
          }
        },
        "required": [
          "name",
          "price"
        ]
      }
    }
  },
  "required": [
    "pairs",
    "tokenPrices"
  ]
};

module.exports = schema;
