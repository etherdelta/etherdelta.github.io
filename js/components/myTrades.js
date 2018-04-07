/* This module was module number 544 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/myTrades
*/
'use strict';
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor))
        throw new TypeError('Cannot call a class as a function');
}
function _possibleConstructorReturn(self, call) {
    if (!self)
        throw new ReferenceError(
            "this hasn't been initialised - super() hasn't been called"
        );
    return !call || ('object' != typeof call && 'function' != typeof call)
        ? self
        : call;
}
function _inherits(subClass, superClass) {
    if ('function' != typeof superClass && null !== superClass)
        throw new TypeError(
            'Super expression must either be null or a function, not ' +
                typeof superClass
        );
    (subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: !1,
            writable: !0,
            configurable: !0,
        },
    })),
        superClass &&
            (Object.setPrototypeOf
                ? Object.setPrototypeOf(subClass, superClass)
                : (subClass.__proto__ = superClass));
}
Object.defineProperty(exports, '__esModule', { value: !0 });
var _createClass = (function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                (descriptor.enumerable = descriptor.enumerable || !1),
                    (descriptor.configurable = !0),
                    'value' in descriptor && (descriptor.writable = !0),
                    Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            return (
                protoProps &&
                    defineProperties(Constructor.prototype, protoProps),
                staticProps && defineProperties(Constructor, staticProps),
                Constructor
            );
        };
    })(),
    React = require('react'),
    MyTrades = (function(_React$Component) {
        function MyTrades(props) {
            _classCallCheck(this, MyTrades);
            var _this = _possibleConstructorReturn(
                this,
                (MyTrades.__proto__ || Object.getPrototypeOf(MyTrades)).call(
                    this,
                    props
                )
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    (_this.state.selectedAccount === state.selectedAccount &&
                        JSON.stringify(_this.state.pendingTransactions) ===
                            JSON.stringify(state.user.pendingTransactions) &&
                        JSON.stringify(_this.state.myTrades) ===
                            JSON.stringify(state.myTrades)) ||
                        _this.setState({
                            myTrades: state.myTrades,
                            selectedToken: state.selectedToken,
                            selectedBase: state.selectedBase,
                            pendingTransactions: state.user.pendingTransactions,
                            accounts: state.user.accounts,
                            selectedAccount: state.user.selectedAccount,
                        });
                }),
                (_this.state = {}),
                (_this.translator = _this.props.translator),
                _this
            );
        }
        return (
            _inherits(MyTrades, React.Component),
            _createClass(MyTrades, [
                {
                    key: 'render',
                    value: function() {
                        var _this2 = this;
                        if (
                            !this.state.accounts ||
                            this.state.selectedAccount < 0 ||
                            this.state.selectedAccount >=
                                this.state.accounts.length
                        )
                            return React.createElement('div', null);
                        if (
                            !this.state.myTrades ||
                            !this.state.selectedToken ||
                            !this.state.selectedBase
                        )
                            return React.createElement(
                                'div',
                                {
                                    style: {
                                        color: '#fff',
                                        padding: '12px',
                                        width: '100%',
                                        textAlign: 'center',
                                    },
                                },
                                React.createElement('i', {
                                    className:
                                        'fa fa-spinner fa-pulse fa-3x fa-fw',
                                }),
                                React.createElement(
                                    'span',
                                    { className: 'sr-only' },
                                    'Loading...'
                                )
                            );
                        var pendingTransactionsMap = this.state.pendingTransactions.map(
                                function(pendingTransaction, i) {
                                    return React.createElement(
                                        'tr',
                                        { key: i },
                                        React.createElement(
                                            'td',
                                            null,
                                            React.createElement(
                                                'span',
                                                { className: 'trn' },
                                                'question_mark'
                                            ),
                                            React.createElement(
                                                'a',
                                                {
                                                    href:
                                                        pendingTransaction.txLink,
                                                    target: '_blank',
                                                },
                                                React.createElement('i', {
                                                    className:
                                                        'fa fa-external-link',
                                                    'aria-hidden': 'true',
                                                })
                                            )
                                        ),
                                        React.createElement(
                                            'td',
                                            null,
                                            React.createElement(
                                                'span',
                                                { className: 'trn' },
                                                'pending'
                                            )
                                        ),
                                        React.createElement('td', null),
                                        React.createElement('td', null),
                                        React.createElement('td', null)
                                    );
                                }
                            ),
                            tradesMap = this.state.myTrades.map(function(
                                trade,
                                i
                            ) {
                                return React.createElement(
                                    'tr',
                                    { key: i },
                                    React.createElement(
                                        'td',
                                        null,
                                        React.createElement(
                                            'a',
                                            {
                                                href: trade.txLink,
                                                target: '_blank',
                                            },
                                            trade.txHash.slice(0, 10)
                                        )
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        _this2.state.accounts[
                                            _this2.state.selectedAccount
                                        ].addr.toLowerCase() ===
                                        trade.buyer.toLowerCase()
                                            ? _this2.translator.get('buy')
                                            : _this2.translator.get('sell')
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        React.createElement(
                                            'span',
                                            { className: 'ttip' },
                                            trade.amount.toFixed(3),
                                            React.createElement(
                                                'span',
                                                { className: 'text' },
                                                trade.amount.toFixed(9)
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        React.createElement(
                                            'span',
                                            { className: 'ttip' },
                                            trade.amountBase.toFixed(3),
                                            React.createElement(
                                                'span',
                                                { className: 'text' },
                                                trade.amountBase.toFixed(9)
                                            )
                                        )
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        isNaN(trade.price)
                                            ? (0).toFixed(9)
                                            : trade.price.toFixed(9)
                                    )
                                );
                            });
                        return React.createElement(
                            'div',
                            { className: 'row-box height2 scroll' },
                            React.createElement(
                                'table',
                                {
                                    className:
                                        'table table-condensed table-borderless',
                                },
                                React.createElement(
                                    'thead',
                                    null,
                                    React.createElement(
                                        'tr',
                                        { className: 'table-header' },
                                        React.createElement(
                                            'th',
                                            { className: 'trn' },
                                            'transaction'
                                        ),
                                        React.createElement(
                                            'th',
                                            { className: 'trn' },
                                            'type'
                                        ),
                                        React.createElement(
                                            'th',
                                            null,
                                            this.state.selectedToken.name
                                        ),
                                        React.createElement(
                                            'th',
                                            null,
                                            this.state.selectedBase.name
                                        ),
                                        React.createElement(
                                            'th',
                                            null,
                                            this.state.selectedToken.name,
                                            '/',
                                            this.state.selectedBase.name
                                        )
                                    )
                                ),
                                React.createElement(
                                    'tbody',
                                    null,
                                    pendingTransactionsMap,
                                    tradesMap,
                                    React.createElement(
                                        'tr',
                                        null,
                                        React.createElement(
                                            'td',
                                            { colSpan: '5', className: 'trn' },
                                            'only_7_days'
                                        )
                                    )
                                )
                            )
                        );
                    },
                },
            ]),
            MyTrades
        );
    })();
            exports.default = MyTrades;