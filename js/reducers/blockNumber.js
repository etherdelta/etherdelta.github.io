/* This module was module number 556 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./blockNumber
*/
'use strict';
Object.defineProperty(exports, '__esModule', { value: !0 });
exports.default = function() {
    var state =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 0,
        action = arguments[1];
    switch (action.type) {
        case 'UPDATE_BLOCKNUMBER':
            return action.value;
        default:
            return state;
    }
            };