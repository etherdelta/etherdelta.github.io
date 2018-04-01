/* This module was module number 551 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/tokenGuidesDropdown
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
    TokenGuidesDropdown = (function(_React$Component) {
        function TokenGuidesDropdown(props) {
            _classCallCheck(this, TokenGuidesDropdown);
            var _this = _possibleConstructorReturn(
                this,
                (
                    TokenGuidesDropdown.__proto__ ||
                    Object.getPrototypeOf(TokenGuidesDropdown)
                ).call(this, props)
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({ selectedToken: state.selectedToken });
                }),
                (_this.state = {}),
                (_this.self = props.self),
                (_this.tokens = props.tokens),
                (_this.displayTokenGuide = props.displayTokenGuide),
                _this
            );
        }
        return (
            _inherits(TokenGuidesDropdown, React.Component),
            _createClass(TokenGuidesDropdown, [
                {
                    key: 'render',
                    value: function() {
                        var _this2 = this;
                        if (!this.state.selectedToken)
                            return React.createElement('div', null);
                        var tokensMap = this.tokens.map(function(token, i) {
                            return React.createElement(
                                'li',
                                { key: i },
                                React.createElement(
                                    'a',
                                    {
                                        href: 'javascript:;',
                                        onClick: _this2.displayTokenGuide.bind(
                                            _this2.self,
                                            token
                                        ),
                                    },
                                    token.name
                                )
                            );
                        });
                        return [
                            React.createElement(
                                'a',
                                {
                                    key: 'a',
                                    href: 'javascript:;',
                                    className: 'dropdown-toggle',
                                    'data-toggle': 'dropdown',
                                    role: 'button',
                                    'aria-haspopup': 'true',
                                    'aria-expanded': 'false',
                                },
                                React.createElement('i', {
                                    className: 'fa fa-info-circle',
                                }),
                                ' ',
                                React.createElement(
                                    'span',
                                    { className: 'trn' },
                                    'tokens'
                                ),
                                ' ',
                                React.createElement('span', {
                                    className: 'caret',
                                })
                            ),
                            React.createElement(
                                'ul',
                                { key: 'ul', className: 'dropdown-menu' },
                                tokensMap
                            ),
                        ];
                    },
                },
            ]),
            TokenGuidesDropdown
        );
    })();
            exports.default = TokenGuidesDropdown;