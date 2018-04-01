/* This module was module number 553 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/trades
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
    Trades = (function(_React$Component) {
        function Trades(props) {
            _classCallCheck(this, Trades);
            var _this = _possibleConstructorReturn(
                this,
                (Trades.__proto__ || Object.getPrototypeOf(Trades)).call(
                    this,
                    props
                )
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    JSON.stringify(_this.state.trades) !==
                        JSON.stringify(state.trades) &&
                        _this.setState({
                            trades: state.trades,
                            selectedToken: state.selectedToken,
                            selectedBase: state.selectedBase,
                        });
                }),
                (_this.state = {}),
                _this
            );
        }
        return (
            _inherits(Trades, React.Component),
            _createClass(Trades, [
                {
                    key: 'render',
                    value: function() {
                        if (
                            !this.state.trades ||
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
                        var tradesMap = this.state.trades.map(function(
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
                                        'span',
                                        { className: trade.side },
                                        isNaN(trade.price)
                                            ? (0).toFixed(9)
                                            : trade.price.toFixed(9)
                                    )
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
                                    ),
                                    React.createElement(
                                        'a',
                                        {
                                            href: trade.txLink,
                                            target: '_blank',
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-external-link',
                                            'aria-hidden': 'true',
                                        })
                                    )
                                )
                            );
                        });
                        return React.createElement(
                            'div',
                            { className: 'row-box height1' },
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
                                            null,
                                            this.state.selectedToken.name,
                                            '/',
                                            this.state.selectedBase.name
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
                                    tradesMap,
                                    React.createElement(
                                        'tr',
                                        null,
                                        React.createElement(
                                            'td',
                                            { colSpan: '3', className: 'trn' },
                                            'only_7_days'
                                        )
                                    )
                                )
                            )
                        );
                    },
                },
            ]),
            Trades
        );
    })();
            exports.default = Trades;