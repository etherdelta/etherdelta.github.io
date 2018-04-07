/* This module was module number 559 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./modals
*/
'use strict';
function _defineProperty(obj, key, value) {
    return (
        key in obj
            ? Object.defineProperty(obj, key, {
                  value: value,
                  enumerable: !0,
                  configurable: !0,
                  writable: !0,
              })
            : (obj[key] = value),
        obj
    );
}
Object.defineProperty(exports, '__esModule', { value: !0 });
exports.default = function() {
    var state =
            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        action = arguments[1];
    switch (action.type) {
        case 'OPEN_MODAL':
            return Object.assign(state, _defineProperty({}, action.value, !0));
        case 'CLOSE_MODAL':
            return Object.assign(state, _defineProperty({}, action.value, !1));
        default:
            return state;
    }
            };