/* This module was module number 550 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/tokenGuide
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
                (_this.state = { modal: 'tokenGuide', showModal: !1 }),
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({
                        showModal: state.modals[_this.state.modal] || !1,
                        tokenGuide: state.pages.tokenGuide,
                        tokenTitle: state.pages.tokenTitle,
                    });
                }),
                (_this.closeModal = props.closeModal),
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
                                        { className: 'modal-title' },
                                        this.state.tokenTitle
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'modal-body' },
                                    React.createElement('span', {
                                        dangerouslySetInnerHTML: {
                                            __html: this.state.tokenGuide,
                                        },
                                    })
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