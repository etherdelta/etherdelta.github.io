/* This module was module number 561 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./myOrders
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
        case 'CLEAR_MY_ORDERS':
            return null;
        case 'UPDATE_MY_ORDERS':
            var newState = action.value;
            return {
                sells: newState.sells.sort(function(a, b) {
                    return a.price - b.price || a.amountGet - b.amountGet;
                }),
                buys: newState.buys.sort(function(a, b) {
                    return b.price - a.price || b.amountGet - a.amountGet;
                }),
            };
        case 'NEW_MY_ORDERS':
            var _newState = state || { buys: [], sells: [] };
            return (
                action.value.buys.forEach(function(x) {
                    x.deleted
                        ? (_newState.buys = _newState.buys.filter(function(y) {
                              return y.id !== x.id;
                          }))
                        : _newState.buys.find(function(y) {
                              return y.id === x.id;
                          })
                          ? (_newState.buys = _newState.buys.map(function(y) {
                                return y.id === x.id ? x : y;
                            }))
                          : _newState.buys.push(x);
                }),
                action.value.sells.forEach(function(x) {
                    x.deleted
                        ? (_newState.sells = _newState.sells.filter(function(
                              y
                          ) {
                              return y.id !== x.id;
                          }))
                        : _newState.sells.find(function(y) {
                              return y.id === x.id;
                          })
                          ? (_newState.sells = _newState.sells.map(function(y) {
                                return y.id === x.id ? x : y;
                            }))
                          : _newState.sells.push(x);
                }),
                {
                    sells: _newState.sells.sort(function(a, b) {
                        return a.price - b.price || a.amountGet - b.amountGet;
                    }),
                    buys: _newState.buys.sort(function(a, b) {
                        return b.price - a.price || b.amountGet - a.amountGet;
                    }),
                }
            );
        default:
            return state;
    }
            };