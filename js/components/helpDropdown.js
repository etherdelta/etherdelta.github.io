/* This module was module number 538 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/helpDropdown
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
    HelpDropdown = (function(_React$Component) {
        function HelpDropdown(props) {
            _classCallCheck(this, HelpDropdown);
            var _this = _possibleConstructorReturn(
                this,
                (
                    HelpDropdown.__proto__ ||
                    Object.getPrototypeOf(HelpDropdown)
                ).call(this, props)
            );
            return (
                (_this.self = props.self),
                (_this.displayScreencast = props.displayScreencast),
                _this
            );
        }
        return (
            _inherits(HelpDropdown, React.Component),
            _createClass(HelpDropdown, [
                {
                    key: 'render',
                    value: function() {
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
                                    className: 'fa fa-book',
                                }),
                                ' ',
                                React.createElement(
                                    'span',
                                    { className: 'trn' },
                                    'help'
                                ),
                                ' ',
                                React.createElement('span', {
                                    className: 'caret',
                                })
                            ),
                            React.createElement(
                                'ul',
                                { key: 'ul', className: 'dropdown-menu' },
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href:
                                                'https://www.reddit.com/r/EtherDelta/comments/6hrxjw/etherdelta_guides_for_first_time_users/',
                                            target: '_blank',
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-question-circle',
                                            'aria-hidden': 'true',
                                        }),
                                        " Beginner's Guide"
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.displayScreencast.bind(
                                                this.self,
                                                'connectScreencast'
                                            ),
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-desktop',
                                            'aria-hidden': 'true',
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'connect_ethereum'
                                        ),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'Screencast'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.displayScreencast.bind(
                                                this.self,
                                                'depositScreencast'
                                            ),
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-desktop',
                                            'aria-hidden': 'true',
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'deposit'
                                        ),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'Screencast'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.displayScreencast.bind(
                                                this.self,
                                                'withdrawScreencast'
                                            ),
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-desktop',
                                            'aria-hidden': 'true',
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'withdraw'
                                        ),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'Screencast'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.displayScreencast.bind(
                                                this.self,
                                                'orderScreencast'
                                            ),
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-desktop',
                                            'aria-hidden': 'true',
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'order'
                                        ),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'Screencast'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.displayScreencast.bind(
                                                this.self,
                                                'cancelScreencast'
                                            ),
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-desktop',
                                            'aria-hidden': 'true',
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'cancel'
                                        ),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'Screencast'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.displayScreencast.bind(
                                                this.self,
                                                'tradeScreencast'
                                            ),
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-desktop',
                                            'aria-hidden': 'true',
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'trade'
                                        ),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'Screencast'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href:
                                                'https://www.reddit.com/r/EtherDelta/comments/6hrvwl/how_fees_work/',
                                            target: '_blank',
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-money',
                                            'aria-hidden': 'true',
                                        }),
                                        ' ',
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'fees'
                                        )
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href:
                                                'https://www.reddit.com/r/ForkDelta',
                                            target: '_blank',
                                        },
                                        React.createElement('i', {
                                            className: 'fa fa-reddit-alien',
                                            'aria-hidden': 'true',
                                        }),
                                        ' Ask the community'
                                    )
                                )
                            ),
                        ];
                    },
                },
            ]),
            HelpDropdown
        );
    })();
            exports.default = HelpDropdown;