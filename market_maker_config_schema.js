//http://jsonschema.net/#/

var schema = {
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "displayProperty": "pair",
    "properties": {
      "pair": {
        "title": "Pair",
        "description": "The pair name should match what you see on EtherDelta, for example MKR/ETH",
        "type": "string"
      },
      "theo": {
        "title": "Neutral point",
        "description": "Neutral point for the price",
        "type": "number"
      },
      "minPrice": {
        "title": "Minimum price",
        "description": "Minimum possible price (typically 0)",
        "type": "number"
      },
      "maxPrice": {
        "title": "Maximum price",
        "description": "Maximum possible price (may be 1.00 for some prediction market tokens)",
        "type": "number"
      },
      "minEdge": {
        "title": "Minimum edge",
        "description": "Minimum percent edge away from your neutral point (0.01 = 1%)",
        "type": "number"
      },
      "edgeStep": {
        "title": "Edge step",
        "description": "Percent edge to widen for additional levels (0.01 = 1%)",
        "type": "number"
      },
      "ordersPerSide": {
        "title": "Orders per side",
        "description": "Number of orders to insert on the buy side and sell side",
        "type": "integer"
      },
      "expires": {
        "title": "Expires",
        "description": "Number of blocks until your orders expire",
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
};

// var schema = {
//   "$schema": "http://json-schema.org/draft-04/schema#",
//   "type": "object",
//   "additionalProperties": false,
//   "properties": {
//     "pairs": {
//       "type": "array",
//       "items": {
//         "type": "object",
//         "displayProperty": "pair",
//         "properties": {
//           "pair": {
//             "title": "Pair",
//             "description": "The pair name should match what you see on EtherDelta, for example MKR/ETH",
//             "type": "string"
//           },
//           "theo": {
//             "title": "Neutral point",
//             "description": "Neutral point for the price",
//             "type": "number"
//           },
//           "minPrice": {
//             "title": "Minimum price",
//             "description": "Minimum possible price (typically 0)",
//             "type": "number"
//           },
//           "maxPrice": {
//             "title": "Maximum price",
//             "description": "Maximum possible price (may be 1.00 for some prediction market tokens)",
//             "type": "number"
//           },
//           "minEdge": {
//             "title": "Minimum edge",
//             "description": "Minimum percent edge away from your neutral point (0.01 = 1%)",
//             "type": "number"
//           },
//           "edgeStep": {
//             "title": "Edge step",
//             "description": "Percent edge to widen for additional levels (0.01 = 1%)",
//             "type": "number"
//           },
//           "ordersPerSide": {
//             "title": "Orders per side",
//             "description": "Number of orders to insert on the buy side and sell side",
//             "type": "integer"
//           },
//           "expires": {
//             "title": "Expires",
//             "description": "Number of blocks until your orders expire",
//             "type": "integer"
//           }
//         },
//         "additionalProperties": false,
//         "required": [
//           "pair",
//           "theo",
//           "minEdge",
//           "edgeStep",
//           "ordersPerSide",
//           "expires"
//         ]
//       }
//     },
//   },
//   "required": [
//     "pairs"
//   ]
// };

module.exports = schema;
