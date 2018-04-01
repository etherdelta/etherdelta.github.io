/* This module was module number 533 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/buyTrade
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
    Modal = require('react-modal'),
    BuyTrade = (function(_React$Component) {
        function BuyTrade(props) {
            _classCallCheck(this, BuyTrade);
            var _this = _possibleConstructorReturn(
                this,
                (BuyTrade.__proto__ || Object.getPrototypeOf(BuyTrade)).call(
                    this,
                    props
                )
            );
            return (
                (_this.state = {
                    modal: 'buyTrade',
                    showModal: !1,
                    baseAmount: '',
                    feeAmount: '',
                }),
                props.store.subscribe(function() {
                    var state = props.store.getState(),
                        order = state.forms.buyOrder,
                        buyCrossAmount = order
                            ? _this.weiToEth(
                                  Math.abs(order.availableVolume),
                                  _this.getDivisor(state.selectedToken),
                                  3
                              )
                            : 0,
                        price = order ? order.price : 0;
                    _this.setState({
                        showModal: state.modals[_this.state.modal] || !1,
                        selectedToken: state.selectedToken,
                        selectedBase: state.selectedBase,
                        blockNumber: state.blockNumber,
                        order: order,
                    }),
                        _this.refs.buyCrossAmount ||
                            _this.setState({
                                baseAmount: (buyCrossAmount * price).toFixed(3),
                                feeAmount: (
                                    buyCrossAmount *
                                    price *
                                    0.003
                                ).toFixed(3),
                            });
                }),
                (_this.closeModal = props.closeModal),
                (_this.weiToEth = props.weiToEth),
                (_this.getDivisor = props.getDivisor),
                (_this.trade = props.trade),
                (_this.self = props.self),
                (_this.changeAmount = function() {
                    var price = _this.state.order.price,
                        buyCrossAmount = _this.refs.buyCrossAmount.value;
                    _this.setState({
                        baseAmount: (buyCrossAmount * price).toFixed(3),
                        feeAmount: (buyCrossAmount * price * 0.003).toFixed(3),
                    });
                }),
                (_this.tradeClick = function() {
                    _this.closeModal.call(_this.self, _this.state.modal);
                    var amount = _this.refs.buyCrossAmount.value,
                        order = _this.state.order;
                    _this.trade.call(_this.self, 'buy', order, amount);
                }),
                _this
            );
        }
        return (
            _inherits(BuyTrade, React.Component),
            _createClass(BuyTrade, [
                {
                    key: 'render',
                    value: function() {
                        return this.state.selectedToken &&
                            this.state.selectedBase &&
                            this.state.order
                            ? React.createElement(
                                  Modal,
                                  {
                                      isOpen: this.state.showModal,
                                      className:
                                          'Modal__Bootstrap modal-dialog',
                                  },
                                  React.createElement(
                                      'div',
                                      { className: 'modal-content' },
                                      React.createElement(
                                          'div',
                                          { className: 'modal-header' },
                                          React.createElement(
                                              'button',
                                              {
                                                  type: 'button',
                                                  className: 'close',
                                                  'data-dismiss': 'modal',
                                                  'aria-label': 'Close',
                                                  onClick: this.closeModal.bind(
                                                      this.self,
                                                      this.state.modal
                                                  ),
                                              },
                                              React.createElement(
                                                  'span',
                                                  { 'aria-hidden': 'true' },
                                                  '×'
                                              )
                                          ),
                                          React.createElement(
                                              'h4',
                                              { className: 'modal-title trn' },
                                              'buy'
                                          )
                                      ),
                                      React.createElement(
                                          'div',
                                          { className: 'modal-body' },
                                          React.createElement(
                                              'form',
                                              null,
                                              React.createElement(
                                                  'div',
                                                  { className: 'form-group' },
                                                  React.createElement(
                                                      'label',
                                                      { className: 'trn' },
                                                      'order'
                                                  ),
                                                  React.createElement(
                                                      'div',
                                                      null,
                                                      this.weiToEth(
                                                          Math.abs(
                                                              this.state.order
                                                                  .availableVolume
                                                          ),
                                                          this.getDivisor(
                                                              this.state
                                                                  .selectedToken
                                                          ),
                                                          3
                                                      ),
                                                      ' ',
                                                      this.state.selectedToken
                                                          .name,
                                                      '  @ ',
                                                      this.state.order.price.toFixed(
                                                          9
                                                      ),
                                                      ' ',
                                                      this.state.selectedToken
                                                          .name,
                                                      '/',
                                                      this.state.selectedBase
                                                          .name
                                                  ),
                                                  React.createElement(
                                                      'div',
                                                      null,
                                                      'Expires in ',
                                                      this.state.order.expires -
                                                          this.state
                                                              .blockNumber,
                                                      ' ',
                                                      React.createElement(
                                                          'span',
                                                          { className: 'trn' },
                                                          'blocks'
                                                      )
                                                  )
                                              ),
                                              React.createElement(
                                                  'div',
                                                  { className: 'form-group' },
                                                  React.createElement(
                                                      'label',
                                                      null,
                                                      React.createElement(
                                                          'span',
                                                          { className: 'trn' },
                                                          'amount_to_buy'
                                                      ),
                                                      '  (',
                                                      this.state.selectedToken
                                                          .name,
                                                      ')'
                                                  ),
                                                  React.createElement('input', {
                                                      type: 'text',
                                                      className:
                                                          'form-control trn',
                                                      ref: 'buyCrossAmount',
                                                      defaultValue: this.weiToEth(
                                                          Math.abs(
                                                              this.state.order
                                                                  .availableVolume
                                                          ),
                                                          this.getDivisor(
                                                              this.state
                                                                  .selectedToken
                                                          ),
                                                          3
                                                      ),
                                                      placeholder: 'amount',
                                                      onChange: this.changeAmount.bind(
                                                          this
                                                      ),
                                                  })
                                              ),
                                              React.createElement(
                                                  'div',
                                                  { className: 'form-group' },
                                                  React.createElement(
                                                      'label',
                                                      null,
                                                      this.state.selectedBase
                                                          .name
                                                  ),
                                                  React.createElement('input', {
                                                      type: 'text',
                                                      className:
                                                          'form-control trn',
                                                      value: this.state
                                                          .baseAmount,
                                                      readOnly: !0,
                                                  })
                                              ),
                                              React.createElement(
                                                  'div',
                                                  { className: 'form-group' },
                                                  React.createElement(
                                                      'label',
                                                      null,
                                                      React.createElement(
                                                          'span',
                                                          { className: 'trn' },
                                                          'fee'
                                                      ),
                                                      '  (',
                                                      this.state.selectedBase
                                                          .name,
                                                      ')'
                                                  ),
                                                  React.createElement('input', {
                                                      type: 'text',
                                                      className:
                                                          'form-control trn',
                                                      value: this.state
                                                          .feeAmount,
                                                      readOnly: !0,
                                                  })
                                              )
                                          )
                                      ),
                                      React.createElement(
                                          'div',
                                          { className: 'modal-footer' },
                                          React.createElement(
                                              'button',
                                              {
                                                  type: 'button',
                                                  className:
                                                      'btn btn-primary trn',
                                                  onClick: this.tradeClick.bind(
                                                      this
                                                  ),
                                              },
                                              'buy'
                                          )
                                      )
                                  )
                              )
                            : React.createElement('div', null);
                    },
                },
            ]),
            BuyTrade
        );
    })();
            exports.default = BuyTrade;