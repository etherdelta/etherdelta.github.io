/* This module was module number 541 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/ledger
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
    Screencast = (function(_React$Component) {
        function Screencast(props) {
            _classCallCheck(this, Screencast);
            var _this = _possibleConstructorReturn(
                this,
                (
                    Screencast.__proto__ || Object.getPrototypeOf(Screencast)
                ).call(this, props)
            );
            return (
                (_this.state = { modal: 'ledger', showModal: !1 }),
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({
                        showModal: state.modals[_this.state.modal] || !1,
                    });
                }),
                (_this.closeModal = props.closeModal),
                _this
            );
        }
        return (
            _inherits(Screencast, React.Component),
            _createClass(Screencast, [
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
                                        'Ledger'
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'modal-body' },
                                    React.createElement(
                                        'div',
                                        { className: 'ad' },
                                        React.createElement(
                                            'a',
                                            {
                                                href:
                                                    'https://www.ledgerwallet.com/r/be21?path=/products/ledger-nano-s',
                                                target: '_blank',
                                            },
                                            React.createElement('img', {
                                                src: '/images/ledger.png',
                                                className: 'ledger-img',
                                                alt:
                                                    'ForkDelta supports Ledger Nano S',
                                            })
                                        )
                                    ),
                                    React.createElement(
                                        'h3',
                                        null,
                                        'Instructions'
                                    ),
                                    React.createElement(
                                        'ol',
                                        null,
                                        React.createElement(
                                            'li',
                                            null,
                                            'Plug in your Ledger Nano S.'
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            'On the Ledger Nano S, open the Ethereum app.'
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            'On the Ledger Nano S, go to "Settings" and turn on "Browser" and "Contract" modes.'
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            'Refresh ForkDelta.'
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            'Your Ledger Nano S address will appear in the account dropdown automatically, with a green "Ledger" box next to it.'
                                        ),
                                        React.createElement(
                                            'li',
                                            null,
                                            'When you deposit, withdraw, place an order, or trade, approve the transaction using your Ledger Nano S.'
                                        )
                                    )
                                )
                            )
                        );
                    },
                },
            ]),
            Screencast
        );
    })();
            exports.default = Screencast;