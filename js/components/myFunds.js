/* This module was module number 542 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/myFunds
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
    MyFunds = (function(_React$Component) {
        function MyFunds(props) {
            _classCallCheck(this, MyFunds);
            var _this = _possibleConstructorReturn(
                this,
                (MyFunds.__proto__ || Object.getPrototypeOf(MyFunds)).call(
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
                        JSON.stringify(_this.state.myFunds) ===
                            JSON.stringify(state.myFunds)) ||
                        _this.setState({
                            myFunds: state.myFunds,
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
            _inherits(MyFunds, React.Component),
            _createClass(MyFunds, [
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
                            !this.state.myFunds ||
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
                            fundsMap = this.state.myFunds.map(function(
                                fund,
                                i
                            ) {
                                return React.createElement(
                                    'tr',
                                    { key: i },
                                    React.createElement(
                                        'td',
                                        null,
                                        fund.blockNumber,
                                        React.createElement(
                                            'a',
                                            {
                                                href: fund.txLink,
                                                target: '_blank',
                                            },
                                            fund.txHash.slice(0, 10)
                                        )
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        'Deposit' === fund.kind
                                            ? _this2.translator.get('deposit')
                                            : _this2.translator.get('withdraw')
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        fund.tokenAddr.toLowerCase() ===
                                        _this2.state.selectedToken.addr.toLowerCase()
                                            ? React.createElement(
                                                  'span',
                                                  { className: 'ttip' },
                                                  fund.amount.toFixed(3),
                                                  React.createElement(
                                                      'span',
                                                      { className: 'text' },
                                                      fund.amount.toFixed(9)
                                                  )
                                              )
                                            : void 0
                                    ),
                                    React.createElement(
                                        'td',
                                        null,
                                        fund.tokenAddr.toLowerCase() ===
                                        _this2.state.selectedBase.addr.toLowerCase()
                                            ? React.createElement(
                                                  'span',
                                                  { className: 'ttip' },
                                                  fund.amount.toFixed(3),
                                                  React.createElement(
                                                      'span',
                                                      { className: 'text' },
                                                      fund.amount.toFixed(9)
                                                  )
                                              )
                                            : void 0
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
                                        )
                                    )
                                ),
                                React.createElement(
                                    'tbody',
                                    null,
                                    pendingTransactionsMap,
                                    fundsMap,
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
            MyFunds
        );
    })();
            exports.default = MyFunds;