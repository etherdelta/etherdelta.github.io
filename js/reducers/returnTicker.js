/* This module was module number 565 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./returnTicker
*/
'use strict';
Object.defineProperty(exports, '__esModule', { value: !0 });
exports.default = function() {
    var state =
            arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : null,
        action = arguments[1];
    switch (action.type) {
        case 'UPDATE_RETURN_TICKER':
            return action.value;
        default:
            return state;
    }
            };