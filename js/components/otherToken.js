/* This module was module number 546 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/otherToken
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
    OtherToken = (function(_React$Component) {
        function OtherToken(props) {
            _classCallCheck(this, OtherToken);
            var _this = _possibleConstructorReturn(
                this,
                (
                    OtherToken.__proto__ || Object.getPrototypeOf(OtherToken)
                ).call(this, props)
            );
            return (
                (_this.state = { modal: 'otherToken', showModal: !1 }),
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({
                        showModal: state.modals[_this.state.modal] || !1,
                    });
                }),
                (_this.self = props.self),
                (_this.selectToken = props.selectToken),
                (_this.closeModal = props.closeModal),
                (_this.otherTokenClick = function() {
                    _this.selectToken.call(
                        _this.self,
                        _this.refs.otherTokenAddr.value,
                        _this.refs.otherTokenName.value,
                        _this.refs.otherTokenDecimals.value
                    ),
                        _this.closeModal.call(_this.self, _this.state.modal);
                }),
                _this
            );
        }
        return (
            _inherits(OtherToken, React.Component),
            _createClass(OtherToken, [
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
                                        'other_token'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'modal-body' },
                                    React.createElement(
                                        'p', null, 
                                        'You are trading with a contract address. This token is not officially listed and ForkDelta has not vetted this token. Token contracts can be easily spoofed. ',
                                        React.createElement(
                                            'strong', null, 'Please verify the token contract address with a trusted source.'
                                        )
                                    ),
                                    React.createElement(
                                        'form',
                                        null,
                                        React.createElement(
                                            'div',
                                            { className: 'form-group' },
                                            React.createElement(
                                                'label',
                                                { className: 'trn' },
                                                'address'
                                            ),
                                            React.createElement('input', {
                                                type: 'text',
                                                className: 'form-control',
                                                ref: 'otherTokenAddr',
                                                placeholder: '0x...',
                                            })
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'form-group' },
                                            React.createElement(
                                                'label',
                                                { className: 'trn' },
                                                'name'
                                            ),
                                            React.createElement('input', {
                                                type: 'text',
                                                className: 'form-control',
                                                ref: 'otherTokenName',
                                                placeholder: 'XYZ',
                                            })
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'form-group' },
                                            React.createElement(
                                                'label',
                                                { className: 'trn' },
                                                'decimals'
                                            ),
                                            React.createElement('input', {
                                                type: 'text',
                                                className: 'form-control',
                                                ref: 'otherTokenDecimals',
                                                defaultValue: '18',
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
                                            onClick: this.otherTokenClick.bind(
                                                this
                                            ),
                                        },
                                        'go'
                                    )
                                )
                            )
                        );
                    },
                },
            ]),
            OtherToken
        );
    })();
            exports.default = OtherToken;