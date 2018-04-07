/* This module was module number 536 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/connection
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
    Connection = (function(_React$Component) {
        function Connection(props) {
            _classCallCheck(this, Connection);
            var _this = _possibleConstructorReturn(
                this,
                (
                    Connection.__proto__ || Object.getPrototypeOf(Connection)
                ).call(this, props)
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({
                        connection: state.settings.connection,
                        selectedContract: state.settings.selectedContract,
                    });
                }),
                (_this.state = {}),
                (_this.self = props.self),
                (_this.contracts = props.contracts),
                (_this.contractAddr = props.contractAddr),
                _this
            );
        }
        return (
            _inherits(Connection, React.Component),
            _createClass(Connection, [
                {
                    key: 'render',
                    value: function() {
                        var _this2 = this;
                        if (!this.state.connection)
                            return React.createElement('div', null);
                        var contractsMap = this.contracts.map(function(
                            contract,
                            i
                        ) {
                            return React.createElement(
                                'li',
                                {
                                    key: i,
                                    style: {
                                        background:
                                            _this2.state.selectedContract ===
                                            contract.addr
                                                ? '#999'
                                                : '#fff',
                                    },
                                },
                                React.createElement(
                                    'a',
                                    {
                                        href: 'javascript:;',
                                        onClick: _this2.contractAddr.bind(
                                            _this2.self,
                                            contract.addr
                                        ),
                                    },
                                    contract.addr.substring(0, 12),
                                    '... (',
                                    contract.info,
                                    ')'
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
                                    className: 'fa fa-file-text',
                                }),
                                ' ',
                                React.createElement(
                                    'span',
                                    { className: 'trn' },
                                    'Smart_Contract'
                                ),
                                ' ',
                                React.createElement('span', {
                                    className: 'caret',
                                })
                            ),
                            React.createElement(
                                'ul',
                                {
                                    key: 'className',
                                    className: 'dropdown-menu',
                                },
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        { href: 'javascript:;' },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'connection'
                                        ),
                                        ': ',
                                        this.state.connection.connection,
                                        '  (',
                                        this.state.connection.provider,
                                        ')'
                                    )
                                ),
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href:
                                                'https://etherscan.io/address/' +
                                                this.state.selectedContract,
                                            target: '_blank',
                                        },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'etherscan_contract'
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
                                                'https://www.reddit.com/r/EtherDelta/comments/6kdiyl/smart_contract_overview/',
                                            target: '_blank',
                                        },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'smart_contract_overview'
                                        )
                                    )
                                ),
                                React.createElement('li', {
                                    role: 'separator',
                                    className: 'divider',
                                }),
                                contractsMap
                            ),
                        ];
                    },
                },
            ]),
            Connection
        );
    })();
            exports.default = Connection;