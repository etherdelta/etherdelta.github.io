/* This module was module number 537 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/gasPrice
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
    GasPrice = (function(_React$Component) {
        function GasPrice(props) {
            _classCallCheck(this, GasPrice);
            var _this = _possibleConstructorReturn(
                this,
                (GasPrice.__proto__ || Object.getPrototypeOf(GasPrice)).call(
                    this,
                    props
                )
            );
            return (
                (_this.state = { modal: 'gasPrice', showModal: !1 }),
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({
                        showModal: state.modals[_this.state.modal] || !1,
                        ethGasPrice: state.settings.ethGasPrice,
                    });
                }),
                (_this.self = props.self),
                (_this.setGasPrice = props.setGasPrice),
                (_this.closeModal = props.closeModal),
                (_this.setGasPriceClick = function() {
                    _this.setGasPrice.call(
                        _this.self,
                        _this.refs.gasPrice.value
                    ),
                        _this.closeModal.call(_this.self, _this.state.modal);
                }),
                _this
            );
        }
        return (
            _inherits(GasPrice, React.Component),
            _createClass(GasPrice, [
                {
                    key: 'render',
                    value: function() {
                        return React.createElement(
                            Modal,
                            {
                                isOpen: this.state.showModal,
                                className: 'Modal__Bootstrap modal-dialog',
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
                                        'gas_price'
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
                                                'gas_price_gwei'
                                            ),
                                            React.createElement('input', {
                                                type: 'text',
                                                className: 'form-control',
                                                ref: 'gasPrice',
                                                defaultValue:
                                                    this.state.ethGasPrice /
                                                    1e9,
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
                                            className: 'btn btn-default trn',
                                            onClick: this.closeModal.bind(
                                                this.self,
                                                this.state.modal
                                            ),
                                        },
                                        'cancel'
                                    ),
                                    React.createElement(
                                        'button',
                                        {
                                            type: 'button',
                                            className: 'btn btn-primary trn',
                                            id: 'accountSubmit',
                                            onClick: this.setGasPriceClick.bind(
                                                this
                                            ),
                                        },
                                        'set_gas_price'
                                    )
                                )
                            )
                        );
                    },
                },
            ]),
            GasPrice
        );
    })();
            exports.default = GasPrice;