/* This module was module number 545 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/orders
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
    ReactDOM = require('react-dom'),
    Orders = (function(_React$Component) {
        function Orders(props) {
            _classCallCheck(this, Orders);
            var _this = _possibleConstructorReturn(
                this,
                (Orders.__proto__ || Object.getPrototypeOf(Orders)).call(
                    this,
                    props
                )
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    state.orders || (_this.scrolledToMid = !1),
                        (_this.state.selectedAccount ===
                            state.selectedAccount &&
                            _this.state.selectedContract ===
                                state.selectedContract &&
                            JSON.stringify(_this.state.orders) ===
                                JSON.stringify(state.orders)) ||
                            _this.setState({
                                orders: state.orders,
                                accounts: state.user.accounts,
                                selectedAccount: state.user.selectedAccount,
                                selectedToken: state.selectedToken,
                                selectedBase: state.selectedBase,
                                blockNumber: state.blockNumber,
                                selectedContract:
                                    state.settings.selectedContract,
                            });
                }),
                (_this.state = {}),
                (_this.self = props.self),
                (_this.displayBuyTrade = props.displayBuyTrade),
                (_this.displaySellTrade = props.displaySellTrade),
                (_this.weiToEth = props.weiToEth),
                (_this.getDivisor = props.getDivisor),
                (_this.scrolledToMid = !1),
                _this
            );
        }
        return (
            _inherits(Orders, React.Component),
            _createClass(Orders, [
                {
                    key: 'scrollToMid',
                    value: function() {
                        var node = ReactDOM.findDOMNode(this.mid);
                        node &&
                            !this.scrolledToMid &&
                            this.state.orders &&
                            (this.state.orders.buys.length > 0 ||
                                this.state.orders.sells.length > 0) &&
                            ((this.scrolledToMid = !0),
                            (node.parentNode.parentNode.parentNode.scrollTop =
                                node.offsetTop -
                                node.parentNode.parentNode.parentNode
                                    .clientHeight /
                                    2.0));
                    },
                },
                {
                    key: 'componentDidMount',
                    value: function() {
                        this.scrollToMid();
                    },
                },
                {
                    key: 'componentDidUpdate',
                    value: function() {
                        this.scrollToMid();
                    },
                },
                {
                    key: 'render',
                    value: function() {
                        var _this2 = this;
                        if (
                            !this.state.orders ||
                            !this.state.orders.buys ||
                            !this.state.orders.sells
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
                        var noOrders =
                                0 === this.state.orders.buys.length &&
                                0 === this.state.orders.sells.length
                                    ? React.createElement(
                                          'tr',
                                          null,
                                          React.createElement(
                                              'td',
                                              { colSpan: '3' },
                                              React.createElement(
                                                  'span',
                                                  { className: 'trn' },
                                                  'no_orders'
                                              )
                                          )
                                      )
                                    : void 0,
                            buyOrders = this.state.orders.buys,
                            sellOrdersMap = this.state.orders.sells
                                .slice()
                                .reverse()
                                .map(function(order, i) {
                                    return order.expires >
                                        _this2.state.blockNumber
                                        ? React.createElement(
                                              'tr',
                                              {
                                                  className: 'clickable-row',
                                                  key: i,
                                                  onClick: _this2.displayBuyTrade.bind(
                                                      _this2.self,
                                                      order
                                                  ),
                                              },
                                              React.createElement(
                                                  'td',
                                                  {
                                                      className:
                                                          'three-columns overflow-hidden padding-left',
                                                  },
                                                  React.createElement(
                                                      'span',
                                                      {
                                                          className: 'sell',
                                                          style: {
                                                              background:
                                                                  _this2.state
                                                                      .accounts[
                                                                      _this2
                                                                          .state
                                                                          .selectedAccount
                                                                  ] &&
                                                                  _this2.state.accounts[
                                                                      _this2
                                                                          .state
                                                                          .selectedAccount
                                                                  ].addr.toLowerCase() ===
                                                                      order.user.toLowerCase()
                                                                      ? '#9ff'
                                                                      : void 0,
                                                              color:
                                                                  _this2.state
                                                                      .accounts[
                                                                      _this2
                                                                          .state
                                                                          .selectedAccount
                                                                  ] &&
                                                                  _this2.state.accounts[
                                                                      _this2
                                                                          .state
                                                                          .selectedAccount
                                                                  ].addr.toLowerCase() ===
                                                                      order.user.toLowerCase()
                                                                      ? '#000'
                                                                      : void 0,
                                                          },
                                                          'data-toggle':
                                                              'tooltip',
                                                          'data-placement':
                                                              'top',
                                                          title:
                                                              'Click here to BUY',
                                                      },
                                                      order.price
                                                          .toNumber()
                                                          .toFixed(9)
                                                  )
                                              ),
                                              React.createElement(
                                                  'td',
                                                  {
                                                      className:
                                                          'three-columns overflow-hidden',
                                                  },
                                                  React.createElement(
                                                      'span',
                                                      {
                                                          'data-toggle':
                                                              'tooltip',
                                                          'data-placement':
                                                              'top',
                                                          title:
                                                              'Click here to BUY',
                                                      },
                                                      _this2.weiToEth(
                                                          Math.abs(
                                                              order.availableVolume
                                                          ),
                                                          _this2.getDivisor(
                                                              _this2.state
                                                                  .selectedToken
                                                          ),
                                                          3
                                                      )
                                                  )
                                              ),
                                              React.createElement(
                                                  'td',
                                                  {
                                                      className:
                                                          'three-columns overflow-hidden',
                                                  },
                                                  React.createElement(
                                                      'span',
                                                      {
                                                          'data-toggle':
                                                              'tooltip',
                                                          'data-placement':
                                                              'top',
                                                          title:
                                                              'Click here to BUY',
                                                      },
                                                      _this2.weiToEth(
                                                          Math.abs(
                                                              order.availableVolumeBase
                                                          ),
                                                          _this2.getDivisor(
                                                              _this2.state
                                                                  .selectedBase
                                                          ),
                                                          3
                                                      )
                                                  )
                                              )
                                          )
                                        : void 0;
                                }),
                            buyOrdersMap = buyOrders.map(function(order, i) {
                                return order.expires > _this2.state.blockNumber
                                    ? React.createElement(
                                          'tr',
                                          {
                                              className: 'clickable-row',
                                              key: i,
                                              onClick: _this2.displaySellTrade.bind(
                                                  _this2.self,
                                                  order
                                              ),
                                          },
                                          React.createElement(
                                              'td',
                                              {
                                                  className:
                                                      'three-columns overflow-hidden padding-left',
                                              },
                                              React.createElement(
                                                  'span',
                                                  {
                                                      className: 'buy',
                                                      style: {
                                                          background:
                                                              _this2.state
                                                                  .accounts[
                                                                  _this2.state
                                                                      .selectedAccount
                                                              ] &&
                                                              _this2.state.accounts[
                                                                  _this2.state
                                                                      .selectedAccount
                                                              ].addr.toLowerCase() ===
                                                                  order.user.toLowerCase()
                                                                  ? '#9ff'
                                                                  : void 0,
                                                          color:
                                                              _this2.state
                                                                  .accounts[
                                                                  _this2.state
                                                                      .selectedAccount
                                                              ] &&
                                                              _this2.state.accounts[
                                                                  _this2.state
                                                                      .selectedAccount
                                                              ].addr.toLowerCase() ===
                                                                  order.user.toLowerCase()
                                                                  ? '#000'
                                                                  : void 0,
                                                      },
                                                      'data-toggle': 'tooltip',
                                                      'data-placement': 'top',
                                                      title:
                                                          'Click here to SELL',
                                                  },
                                                  order.price
                                                      .toNumber()
                                                      .toFixed(9)
                                              )
                                          ),
                                          React.createElement(
                                              'td',
                                              {
                                                  className:
                                                      'three-columns overflow-hidden',
                                              },
                                              React.createElement(
                                                  'span',
                                                  {
                                                      'data-toggle': 'tooltip',
                                                      'data-placement': 'top',
                                                      title:
                                                          'Click here to SELL',
                                                  },
                                                  _this2.weiToEth(
                                                      Math.abs(
                                                          order.availableVolume
                                                      ),
                                                      _this2.getDivisor(
                                                          _this2.state
                                                              .selectedToken
                                                      ),
                                                      3
                                                  )
                                              )
                                          ),
                                          React.createElement(
                                              'td',
                                              {
                                                  className:
                                                      'three-columns overflow-hidden',
                                              },
                                              React.createElement(
                                                  'span',
                                                  {
                                                      'data-toggle': 'tooltip',
                                                      'data-placement': 'top',
                                                      title:
                                                          'Click here to SELL',
                                                  },
                                                  _this2.weiToEth(
                                                      Math.abs(
                                                          order.availableVolumeBase
                                                      ),
                                                      _this2.getDivisor(
                                                          _this2.state
                                                              .selectedBase
                                                      ),
                                                      3
                                                  )
                                              )
                                          )
                                      )
                                    : void 0;
                            });
                        return React.createElement(
                            'div',
                            {
                                className: 'row-box height3 scroll',
                                id: 'orderBookScroll',
                            },
                            React.createElement(
                                'table',
                                {
                                    className:
                                        'table table-condensed table-borderless',
                                },
                                React.createElement(
                                    'tbody',
                                    null,
                                    sellOrdersMap,
                                    React.createElement(
                                        'tr',
                                        {
                                            id: 'orderBookMid',
                                            className: 'mid-header',
                                            ref: function(el) {
                                                _this2.mid = el;
                                            },
                                        },
                                        React.createElement(
                                            'th',
                                            {
                                                className:
                                                    'three-columns overflow-hidden padding-left',
                                            },
                                            React.createElement(
                                                'span',
                                                {
                                                    'data-toggle': 'tooltip',
                                                    'data-placement': 'top',
                                                    title:
                                                        '1 ' +
                                                        this.state.selectedToken
                                                            .name +
                                                        ' = ? ' +
                                                        this.state.selectedBase
                                                            .name,
                                                },
                                                this.state.selectedToken.name,
                                                '/',
                                                this.state.selectedBase.name
                                            )
                                        ),
                                        React.createElement(
                                            'th',
                                            {
                                                className:
                                                    'three-columns overflow-hidden',
                                            },
                                            this.state.selectedToken.name
                                        ),
                                        React.createElement(
                                            'th',
                                            {
                                                className:
                                                    'three-columns overflow-hidden',
                                            },
                                            this.state.selectedBase.name
                                        )
                                    ),
                                    buyOrdersMap,
                                    noOrders
                                )
                            )
                        );
                    },
                },
            ]),
            Orders
        );
    })();
            exports.default = Orders;