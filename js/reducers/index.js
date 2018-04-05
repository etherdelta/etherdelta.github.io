/* This module was module number 558 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./reducers/index.js
*/
'use strict';
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}
var _redux = require('redux'),
    _forms2 = _interopRequireDefault(require('./forms')),
    _pages2 = _interopRequireDefault(require('./pages')),
    _settings2 = _interopRequireDefault(require('./settings')),
    _user2 = _interopRequireDefault(require('./user')),
    _modals2 = _interopRequireDefault(require('./modals')),
    _blockNumber2 = _interopRequireDefault(require('./blockNumber')),
    _selectedToken2 = _interopRequireDefault(require('./selectedToken')),
    _selectedBase2 = _interopRequireDefault(require('./selectedBase')),
    _returnTicker2 = _interopRequireDefault(require('./returnTicker')),
    _trades2 = _interopRequireDefault(require('./trades')),
    _orders2 = _interopRequireDefault(require('./orders')),
    _myFunds2 = _interopRequireDefault(require('./myFunds')),
    _myTrades2 = _interopRequireDefault(require('./myTrades')),
    _myOrders2 = _interopRequireDefault(require('./myOrders')),
    reducer = (0, _redux.combineReducers)({
        forms: _forms2.default,
        pages: _pages2.default,
        settings: _settings2.default,
        user: _user2.default,
        modals: _modals2.default,
        blockNumber: _blockNumber2.default,
        selectedToken: _selectedToken2.default,
        selectedBase: _selectedBase2.default,
        returnTicker: _returnTicker2.default,
        trades: _trades2.default,
        orders: _orders2.default,
        myFunds: _myFunds2.default,
        myTrades: _myTrades2.default,
        myOrders: _myOrders2.default,
    });
            module.exports = reducer;