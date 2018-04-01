/* This module was module number 532 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/buy
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
    Buy = (function(_React$Component) {
        function Buy(props) {
            _classCallCheck(this, Buy);
            var _this = _possibleConstructorReturn(
                this,
                (Buy.__proto__ || Object.getPrototypeOf(Buy)).call(this, props)
            );
            return (
                alertify.buyInCrossWarning ||
                    alertify.dialog(
                        'buyInCrossWarning',
                        function() {
                            return {
                                build: function() {
                                    this.setHeader(
                                        '<div><i class="fa fa-exclamation-triangle fa-2x" style="color:rgb(230,162,38);"></i> Confirm your order</div>'
                                    );
                                },
                                setup: function() {
                                    return {
                                        buttons: [
                                            {
                                                text: 'Yes, place order',
                                                className: 'btn btn-default',
                                            },
                                            {
                                                text: 'Cancel',
                                                className: 'btn btn-default',
                                                invokeOnClose: !0,
                                                scope: 'auxiliary',
                                            },
                                        ],
                                        focus: { element: 1 },
                                        options: {
                                            movable: !1,
                                            resizable: !1,
                                            pinnable: !1,
                                            maximizable: !1,
                                        },
                                    };
                                },
                            };
                        },
                        !0,
                        'alert'
                    ),
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({
                        selectedToken: state.selectedToken,
                        selectedBase: state.selectedBase,
                        orders: state.orders,
                    });
                }),
                (_this.state = {
                    buyTotal: '',
                    buyInCross: void 0,
                    bestSellPrice: void 0,
                }),
                (_this.self = props.self),
                (_this.order = props.order),
                (_this.orderClick = function() {
                    var amount = _this.refs.buyAmount.value,
                        price = _this.refs.buyPrice.value,
                        expires = _this.refs.buyExpires.value;
                    _this.state.buyInCross
                        ? alertify
                              .buyInCrossWarning(
                                  '<p>' +
                                      'You will pay <strong>' +
                                      price +
                                      ' ' +
                                      _this.state.selectedBase.name +
                                      ' per ' +
                                      _this.state.selectedToken.name +
                                      '</strong>. ' +
                                      "This price is <strong style='color:red;'>" +
                                      (
                                          price / _this.state.bestSellPrice
                                      ).toFixed(1) +
                                      ' times higher</strong> than current best price for ' +
                                      _this.state.selectedToken.name +
                                      '.<br/><br/>' +
                                      'Do you still want to place the order?</p>'
                              )
                              .set({
                                  onok: function(e) {
                                      0 === e.index &&
                                          _this.order.call(
                                              _this.self,
                                              _this.state.selectedToken.addr,
                                              _this.state.selectedBase.addr,
                                              'buy',
                                              amount,
                                              price,
                                              expires
                                          );
                                  },
                              })
                        : _this.order.call(
                              _this.self,
                              _this.state.selectedToken.addr,
                              _this.state.selectedBase.addr,
                              'buy',
                              amount,
                              price,
                              expires
                          );
                }),
                (_this.buyChange = function() {
                    var amount = _this.refs.buyAmount.value,
                        price = _this.refs.buyPrice.value;
                    if (
                        (_this.setState({
                            buyTotal: (amount * price).toFixed(3) || '',
                        }),
                        _this.state.orders &&
                            _this.state.orders.sells &&
                            _this.state.orders.sells.length > 0)
                    ) {
                        var bestSell = _this.state.orders.sells[0].price;
                        void 0 !== price && price > 1.5 * bestSell
                            ? _this.setState({
                                  bestSellPrice: bestSell,
                                  buyInCross:
                                      'Your order is in cross with the best sell order in the order book (price = ' +
                                      bestSell +
                                      ').',
                              })
                            : _this.setState({
                                  buyInCross: void 0,
                                  bestSellPrice: void 0,
                              });
                    }
                }),
                _this
            );
        }
        return (
            _inherits(Buy, React.Component),
            _createClass(Buy, [
                {
                    key: 'render',
                    value: function() {
                        return this.state.selectedToken &&
                            this.state.selectedBase
                            ? React.createElement(
                                  'form',
                                  { className: 'form-horizontal' },
                                  React.createElement(
                                      'div',
                                      { className: 'form-group' },
                                      React.createElement(
                                          'label',
                                          {
                                              className:
                                                  'col-sm-4 control-label',
                                          },
                                          this.state.selectedToken.name
                                      ),
                                      React.createElement(
                                          'div',
                                          { className: 'col-sm-8' },
                                          React.createElement('input', {
                                              type: 'text',
                                              className: 'form-control trn',
                                              ref: 'buyAmount',
                                              onChange: this.buyChange.bind(
                                                  this
                                              ),
                                              placeholder: 'amount_to_buy',
                                          })
                                      )
                                  ),
                                  React.createElement(
                                      'div',
                                      { className: 'form-group' },
                                      React.createElement(
                                          'label',
                                          {
                                              className:
                                                  'col-sm-4 control-label ttip',
                                          },
                                          this.state.selectedToken.name,
                                          '/',
                                          this.state.selectedBase.name,
                                          React.createElement(
                                              'span',
                                              { className: 'text' },
                                              '1 ' +
                                                  this.state.selectedToken
                                                      .name +
                                                  ' = ? ' +
                                                  this.state.selectedBase.name
                                          )
                                      ),
                                      React.createElement(
                                          'div',
                                          { className: 'col-sm-8' },
                                          React.createElement('input', {
                                              type: 'text',
                                              className: 'form-control trn',
                                              ref: 'buyPrice',
                                              onChange: this.buyChange.bind(
                                                  this
                                              ),
                                              placeholder: 'price',
                                          })
                                      )
                                  ),
                                  React.createElement(
                                      'div',
                                      { className: 'form-group' },
                                      React.createElement(
                                          'label',
                                          {
                                              className:
                                                  'col-sm-4 control-label',
                                          },
                                          this.state.selectedBase.name
                                      ),
                                      React.createElement(
                                          'div',
                                          { className: 'col-sm-8' },
                                          React.createElement('input', {
                                              type: 'text',
                                              className: 'form-control trn',
                                              value: this.state.buyTotal,
                                              placeholder: 'total',
                                              readOnly: !0,
                                          })
                                      )
                                  ),
                                  React.createElement(
                                      'div',
                                      { className: 'form-group' },
                                      React.createElement(
                                          'label',
                                          {
                                              className:
                                                  'col-sm-4 control-label ttip',
                                          },
                                          React.createElement(
                                              'span',
                                              { className: 'trn' },
                                              'expires'
                                          ),
                                          React.createElement(
                                              'span',
                                              { className: 'text trn' },
                                              'expires_explanation'
                                          )
                                      ),
                                      React.createElement(
                                          'div',
                                          { className: 'col-sm-8' },
                                          React.createElement('input', {
                                              type: 'text',
                                              className: 'form-control trn',
                                              ref: 'buyExpires',
                                              placeholder: 'numberOfBlocks',
                                              defaultValue: '10000',
                                          })
                                      )
                                  ),
                                  React.createElement(
                                      'span',
                                      { className: 'warning' },
                                      this.state.buyInCross
                                  ),
                                  React.createElement(
                                      'div',
                                      { className: 'form-group' },
                                      React.createElement(
                                          'div',
                                          {
                                              className:
                                                  'col-sm-offset-4 col-sm-8',
                                          },
                                          React.createElement(
                                              'button',
                                              {
                                                  type: 'button',
                                                  style: { width: '100%' },
                                                  className:
                                                      'btn btn-success trn',
                                                  onClick: this.orderClick.bind(
                                                      this
                                                  ),
                                              },
                                              'buy'
                                          )
                                      )
                                  )
                              )
                            : React.createElement(
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
                    },
                },
            ]),
            Buy
        );
    })();
            exports.default = Buy;