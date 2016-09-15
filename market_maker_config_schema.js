//http://jsonschema.net/#/

var schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "additionalProperties": false,
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
            "type": "number"
          },
          "maxPrice": {
            "type": "number"
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
        "additionalProperties": false,
        "required": [
          "pair",
          "theo",
          "minEdge",
          "edgeStep",
          "ordersPerSide",
          "expires"
        ]
      }
    },
  },
  "required": [
    "pairs"
  ]
};

module.exports = schema;
