/* This module was module number 543 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/myOrders
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
    MyOrders = (function(_React$Component) {
        function MyOrders(props) {
            _classCallCheck(this, MyOrders);
            var _this = _possibleConstructorReturn(
                this,
                (MyOrders.__proto__ || Object.getPrototypeOf(MyOrders)).call(
                    this,
                    props
                )
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    (_this.state.selectedAccount === state.selectedAccount &&
                        JSON.stringify(_this.state.myOrders) ===
                            JSON.stringify(state.myOrders)) ||
                        _this.setState({
                            myOrders: state.myOrders,
                            selectedToken: state.selectedToken,
                            selectedBase: state.selectedBase,
                            accounts: state.user.accounts,
                            selectedAccount: state.user.selectedAccount,
                            blockNumber: state.blockNumber,
                        });
                }),
                (_this.state = {}),
                (_this.self = props.self),
                (_this.translator = props.translator),
                (_this.weiToEth = props.weiToEth),
                (_this.getDivisor = props.getDivisor),
                (_this.cancelOrder = props.cancelOrder),
                _this
            );
        }
        return (
            _inherits(MyOrders, React.Component),
            _createClass(MyOrders, [
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
                            !(
                                this.state.myOrders &&
                                this.state.myOrders.buys &&
                                this.state.myOrders.sells &&
                                this.state.selectedToken &&
                                this.state.selectedBase
                            )
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
                        var buyOrders = this.state.myOrders.buys,
                            sellOrdersMap = this.state.myOrders.sells
                                .slice()
                                .reverse()
                                .map(function(order, i) {
                                    return order.expires >
                                        _this2.state.blockNumber
                                        ? React.createElement(
                                              'tr',
                                              { key: i },
                                              React.createElement(
                                                  'td',
                                                  null,
                                                  React.createElement(
                                                      'span',
                                                      { className: 'sell' },
                                                      order.price.toFixed(9)
                                                  )
                                              ),
                                              React.createElement(
                                                  'td',
                                                  null,
                                                  React.createElement(
                                                      'span',
                                                      { className: 'ttip' },
                                                      _this2.weiToEth(
                                                          Math.abs(
                                                              order.availableVolume
                                                          ),
                                                          _this2.getDivisor(
                                                              _this2.state
                                                                  .selectedToken
                                                          ),
                                                          3
                                                      ),
                                                      React.createElement(
                                                          'span',
                                                          { className: 'text' },
                                                          _this2.weiToEth(
                                                              Math.abs(
                                                                  order.availableVolume
                                                              ),
                                                              _this2.getDivisor(
                                                                  _this2.state
                                                                      .selectedToken
                                                              ),
                                                              9
                                                          )
                                                      )
                                                  ),
                                                  '/',
                                                  React.createElement(
                                                      'span',
                                                      { className: 'ttip' },
                                                      _this2.weiToEth(
                                                          Math.abs(
                                                              order.amount
                                                          ),
                                                          _this2.getDivisor(
                                                              _this2.state
                                                                  .selectedToken
                                                          ),
                                                          3
                                                      ),
                                                      React.createElement(
                                                          'span',
                                                          { className: 'text' },
                                                          _this2.weiToEth(
                                                              Math.abs(
                                                                  order.amount
                                                              ),
                                                              _this2.getDivisor(
                                                                  _this2.state
                                                                      .selectedToken
                                                              ),
                                                              9
                                                          )
                                                      )
                                                  )
                                              ),
                                              React.createElement(
                                                  'td',
                                                  null,
                                                  order.expires -
                                                      _this2.state.blockNumber,
                                                  ' ',
                                                  order.expires -
                                                      _this2.state
                                                          .blockNumber ==
                                                  1
                                                      ? _this2.translator.get(
                                                            'block'
                                                        )
                                                      : _this2.translator.get(
                                                            'blocks'
                                                        )
                                              ),
                                              React.createElement(
                                                  'td',
                                                  null,
                                                  React.createElement(
                                                      'button',
                                                      {
                                                          type: 'button',
                                                          className:
                                                              'btn btn-primary btn-xs',
                                                          style: {
                                                              width: '50px',
                                                          },
                                                          onClick: _this2.cancelOrder.bind(
                                                              _this2.self,
                                                              order
                                                          ),
                                                      },
                                                      React.createElement(
                                                          'span',
                                                          { className: 'trn' },
                                                          'cancel'
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
                                          { key: i },
                                          React.createElement(
                                              'td',
                                              null,
                                              React.createElement(
                                                  'span',
                                                  { className: 'buy' },
                                                  order.price.toFixed(9)
                                              )
                                          ),
                                          React.createElement(
                                              'td',
                                              null,
                                              React.createElement(
                                                  'span',
                                                  { className: 'ttip' },
                                                  _this2.weiToEth(
                                                      Math.abs(
                                                          order.availableVolume
                                                      ),
                                                      _this2.getDivisor(
                                                          _this2.state
                                                              .selectedToken
                                                      ),
                                                      3
                                                  ),
                                                  React.createElement(
                                                      'span',
                                                      { className: 'text' },
                                                      _this2.weiToEth(
                                                          Math.abs(
                                                              order.availableVolume
                                                          ),
                                                          _this2.getDivisor(
                                                              _this2.state
                                                                  .selectedToken
                                                          ),
                                                          9
                                                      )
                                                  )
                                              ),
                                              '/',
                                              React.createElement(
                                                  'span',
                                                  { className: 'ttip' },
                                                  _this2.weiToEth(
                                                      Math.abs(order.amount),
                                                      _this2.getDivisor(
                                                          _this2.state
                                                              .selectedToken
                                                      ),
                                                      3
                                                  ),
                                                  React.createElement(
                                                      'span',
                                                      { className: 'text' },
                                                      _this2.weiToEth(
                                                          Math.abs(
                                                              order.amount
                                                          ),
                                                          _this2.getDivisor(
                                                              _this2.state
                                                                  .selectedToken
                                                          ),
                                                          9
                                                      )
                                                  )
                                              )
                                          ),
                                          React.createElement(
                                              'td',
                                              null,
                                              order.expires -
                                                  _this2.state.blockNumber,
                                              ' ',
                                              order.expires -
                                                  _this2.state.blockNumber ==
                                              1
                                                  ? _this2.translator.get(
                                                        'block'
                                                    )
                                                  : _this2.translator.get(
                                                        'blocks'
                                                    )
                                          ),
                                          React.createElement(
                                              'td',
                                              null,
                                              React.createElement(
                                                  'button',
                                                  {
                                                      type: 'button',
                                                      className:
                                                          'btn btn-primary btn-xs',
                                                      style: { width: '50px' },
                                                      onClick: _this2.cancelOrder.bind(
                                                          _this2.self,
                                                          order
                                                      ),
                                                  },
                                                  React.createElement(
                                                      'span',
                                                      { className: 'trn' },
                                                      'cancel'
                                                  )
                                              )
                                          )
                                      )
                                    : void 0;
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
                                            null,
                                            this.state.selectedToken.name,
                                            '/',
                                            this.state.selectedBase.name
                                        ),
                                        React.createElement(
                                            'th',
                                            { className: 'trn' },
                                            'available_volume'
                                        ),
                                        React.createElement(
                                            'th',
                                            { className: 'trn' },
                                            'expires_in'
                                        ),
                                        React.createElement(
                                            'th',
                                            { className: 'trn' },
                                            'cancel'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'tbody',
                                    null,
                                    sellOrdersMap,
                                    buyOrdersMap,
                                    0 === this.state.myOrders.buys.length &&
                                    0 === this.state.myOrders.sells.length
                                        ? React.createElement(
                                              'tr',
                                              null,
                                              React.createElement(
                                                  'td',
                                                  { colSpan: '4' },
                                                  React.createElement(
                                                      'span',
                                                      { className: 'trn' },
                                                      'no_orders'
                                                  )
                                              )
                                          )
                                        : void 0
                                )
                            )
                        );
                    },
                },
            ]),
            MyOrders
        );
    })();
            exports.default = MyOrders;