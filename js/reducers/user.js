/* This module was module number 570 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./user
*/
'use strict';
Object.defineProperty(exports, '__esModule', { value: !0 });
exports.default = function() {
    var state =
            arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : { accounts: [], selectedAccount: 0, pendingTransactions: [] },
        action = arguments[1];
    switch (action.type) {
        case 'ADD_ACCOUNT':
            return '0x0000000000000000000000000000000000000' ===
                action.value.addr.slice(0, 39)
                ? state
                : Object.assign(state, {
                      accounts: state.accounts.concat(
                          Object.assign(action.value, {
                              balance: 0,
                              balances: {},
                          })
                      ),
                      selectedAccount: state.accounts.length,
                  });
        case 'SET_ADDR_KIND':
            return Object.assign(state, {
                accounts: state.accounts.filter(function(x, i) {
                    return i === action.value.i
                        ? Object.assign(x, { kind: action.value.kind })
                        : x;
                }),
            });
        case 'UPDATE_BALANCE':
            return Object.assign(state, {
                accounts: state.accounts.filter(function(x, i) {
                    return i === action.value.i
                        ? Object.assign(x, { balance: action.value.balance })
                        : x;
                }),
            });
        case 'UPDATE_BALANCES':
            return Object.assign(state, {
                accounts: state.accounts.filter(function(x, i) {
                    return i === action.value.i
                        ? Object.assign(x, { balances: action.value.balances })
                        : x;
                }),
            });
        case 'SELECT_ACCOUNT':
            return Object.assign(state, {
                selectedAccount:
                    action.value < state.accounts.length
                        ? action.value
                        : state.accounts.length - 1,
            });
        case 'DELETE_ACCOUNT':
            return Object.assign(state, {
                accounts: state.accounts.filter(function(x, i) {
                    return i !== action.value;
                }),
            });
        case 'NEW_PENDING':
            return Object.assign(state, {
                pendingTransactions: state.pendingTransactions.concat(
                    action.value
                ),
            });
        case 'UPDATE_PENDING':
            return Object.assign(state, { pendingTransactions: action.value });
        default:
            return state;
    }
            };