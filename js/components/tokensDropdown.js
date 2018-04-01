/* This module was module number 552 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/tokensDropdown
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
    TokensDropdown = (function(_React$Component) {
        function TokensDropdown(props) {
            _classCallCheck(this, TokensDropdown);
            var _this = _possibleConstructorReturn(
                this,
                (
                    TokensDropdown.__proto__ ||
                    Object.getPrototypeOf(TokensDropdown)
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
                (_this.selectToken = props.selectToken),
                (_this.openModal = props.openModal),
                _this
            );
        }
        return (
            _inherits(TokensDropdown, React.Component),
            _createClass(TokensDropdown, [
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
                                        href:
                                            '/#!/trade/' +
                                            (token.name || token.addr) +
                                            '-' +
                                            _this2.self.selectedBase.name,
                                        onClick: function(e) {
                                            e.preventDefault();
                                            _this2.selectToken.bind(
                                                _this2.self,
                                                token.addr
                                            )();
                                            history.pushState(
                                                null,
                                                null,
                                                '/#!/trade/' +
                                                    (token.name || token.addr) +
                                                    '-' +
                                                    _this2.self.selectedBase
                                                        .name
                                            );
                                        },
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
                                    href: '#',
                                    className: 'dropdown-toggle',
                                    'data-toggle': 'dropdown',
                                    role: 'button',
                                    'aria-haspopup': 'true',
                                    'aria-expanded': 'false',
                                    style: { fontSize: '135%', color: '#036' },
                                },
                                this.state.selectedToken.name,
                                ' ',
                                React.createElement('span', {
                                    className: 'caret',
                                })
                            ),
                            React.createElement(
                                'ul',
                                { key: 'ul', className: 'dropdown-menu' },
                                tokensMap,
                                React.createElement('li', {
                                    role: 'separator',
                                    className: 'divider',
                                }),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.openModal.bind(
                                                this.self,
                                                'otherToken'
                                            ),
                                        },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'other'
                                        )
                                    )
                                )
                            ),
                        ];
                    },
                },
            ]),
            TokensDropdown
        );
    })();
            exports.default = TokensDropdown;