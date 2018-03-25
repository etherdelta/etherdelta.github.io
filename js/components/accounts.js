/* This module was module number 530 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/accounts
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
    Accounts = (function(_React$Component) {
        function Accounts(props) {
            _classCallCheck(this, Accounts);
            var _this = _possibleConstructorReturn(
                this,
                (Accounts.__proto__ || Object.getPrototypeOf(Accounts)).call(
                    this,
                    props
                )
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({
                        accounts: state.user.accounts,
                        selectedAccount: state.user.selectedAccount,
                        connection: state.settings.connection,
                    });
                }),
                (_this.state = { accounts: [] }),
                (_this.self = props.self),
                (_this.selectAccount = props.selectAccount),
                (_this.createAccount = props.createAccount),
                (_this.showPrivateKey = props.showPrivateKey),
                (_this.deleteAccount = props.deleteAccount),
                (_this.weiToEth = props.weiToEth),
                (_this.getDivisor = props.getDivisor),
                (_this.openModal = props.openModal),
                _this
            );
        }
        return (
            _inherits(Accounts, React.Component),
            _createClass(Accounts, [
                {
                    key: 'render',
                    value: function() {
                        var _this2 = this;
                        if (!this.state.connection)
                            return React.createElement('div', null);
                        var badge = function(account) {
                                return 'MetaMask' === account.kind
                                    ? React.createElement(
                                          'span',
                                          {
                                              className:
                                                  'label ' +
                                                  ('RPC' ===
                                                  _this2.state.connection
                                                      .connection
                                                      ? 'label-success'
                                                      : 'label-warning'),
                                          },
                                          'MetaMask'
                                      )
                                    : 'Ledger' === account.kind
                                      ? React.createElement(
                                            'span',
                                            {
                                                className:
                                                    'label label-success',
                                            },
                                            'Ledger'
                                        )
                                      : account.pk
                                        ? React.createElement(
                                              'span',
                                              {
                                                  className:
                                                      'label ' +
                                                      ('PublicRPC' ===
                                                      _this2.state.connection
                                                          .connection
                                                          ? 'label-success'
                                                          : 'label-warning'),
                                              },
                                              'ForkDelta ' +
                                                  ('PublicRPC' ===
                                                  _this2.state.connection
                                                      .connection
                                                      ? 'via MyEtherAPI'
                                                      : '') +
                                                  ' (Private Key)'
                                          )
                                        : React.createElement(
                                              'span',
                                              {
                                                  className:
                                                      'label label-danger',
                                              },
                                              'ForkDelta ' +
                                                  ('PublicRPC' ===
                                                  _this2.state.connection
                                                      .connection
                                                      ? 'via MyEtherAPI'
                                                      : '') +
                                                  ' (No Private Key)'
                                          );
                            },
                            dropdown =
                                this.state.accounts.length > 0 &&
                                this.state.selectedAccount <
                                    this.state.accounts.length
                                    ? React.createElement(
                                          'a',
                                          {
                                              href: 'javascript:;',
                                              key: 'a',
                                              className: 'dropdown-toggle',
                                              'data-toggle': 'dropdown',
                                              role: 'button',
                                              'aria-haspopup': 'true',
                                              'aria-expanded': 'false',
                                          },
                                          React.createElement('i', {
                                              className: 'fa fa-user',
                                          }),
                                          ' ',
                                          this.state.accounts[
                                              this.state.selectedAccount
                                          ].addr.substring(0, 12),
                                          '... ',
                                          void 0 !==
                                          this.state.accounts[
                                              this.state.selectedAccount
                                          ].balance
                                              ? React.createElement(
                                                    'span',
                                                    { className: 'badge' },
                                                    this.weiToEth(
                                                        this.state.accounts[
                                                            this.state
                                                                .selectedAccount
                                                        ].balance,
                                                        void 0,
                                                        3
                                                    ),
                                                    ' ETH'
                                                )
                                              : void 0,
                                          ' ',
                                          badge(
                                              this.state.accounts[
                                                  this.state.selectedAccount
                                              ]
                                          ),
                                          ' ',
                                          React.createElement('span', {
                                              className: 'caret',
                                          })
                                      )
                                    : React.createElement(
                                          'a',
                                          {
                                              href: 'javascript:;',
                                              key: 'a',
                                              className: 'dropdown-toggle',
                                              'data-toggle': 'dropdown',
                                              role: 'button',
                                              'aria-haspopup': 'true',
                                              'aria-expanded': 'false',
                                          },
                                          React.createElement('i', {
                                              className: 'fa fa-user',
                                          }),
                                          ' ',
                                          React.createElement(
                                              'span',
                                              { className: 'trn' },
                                              'select_account'
                                          ),
                                          ' ',
                                          React.createElement('span', {
                                              className: 'caret',
                                          })
                                      ),
                            accountsMap = this.state.accounts.map(function(
                                account,
                                i
                            ) {
                                return React.createElement(
                                    'li',
                                    { key: i },
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: _this2.selectAccount.bind(
                                                _this2.self,
                                                i
                                            ),
                                        },
                                        account.addr,
                                        ' ',
                                        void 0 !== account.balance
                                            ? React.createElement(
                                                  'span',
                                                  { className: 'badge' },
                                                  _this2.weiToEth(
                                                      account.balance,
                                                      void 0,
                                                      3
                                                  ),
                                                  ' ETH'
                                              )
                                            : void 0,
                                        ' ',
                                        badge(account)
                                    )
                                );
                            });
                        return [
                            dropdown,
                            React.createElement(
                                'ul',
                                { className: 'dropdown-menu', key: 'ul' },
                                accountsMap,
                                this.state.accounts.length > 0
                                    ? React.createElement('li', {
                                          role: 'separator',
                                          className: 'divider',
                                      })
                                    : void 0,
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.createAccount.bind(
                                                this.self
                                            ),
                                        },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'new_account'
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
                                            onClick: this.openModal.bind(
                                                this.self,
                                                'importAccount'
                                            ),
                                        },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'import_account'
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
                                            onClick: this.openModal.bind(
                                                this.self,
                                                'ledger'
                                            ),
                                        },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'ledger'
                                        )
                                    )
                                ),
                                this.state.accounts[
                                    this.state.selectedAccount
                                ] &&
                                this.state.accounts[this.state.selectedAccount]
                                    .addr
                                    ? [
                                          React.createElement(
                                              'li',
                                              { key: '1' },
                                              React.createElement(
                                                  'a',
                                                  {
                                                      href:
                                                          'https://etherscan.io/address/' +
                                                          this.state.accounts[
                                                              this.state
                                                                  .selectedAccount
                                                          ].addr,
                                                      target: '_blank',
                                                  },
                                                  React.createElement(
                                                      'span',
                                                      { className: 'trn' },
                                                      'etherscan_address'
                                                  )
                                              )
                                          ),
                                          React.createElement(
                                              'li',
                                              { key: '2' },
                                              React.createElement(
                                                  'a',
                                                  {
                                                      href: 'javascript:;',
                                                      onClick: this.showPrivateKey.bind(
                                                          this.self
                                                      ),
                                                  },
                                                  React.createElement(
                                                      'span',
                                                      { className: 'trn' },
                                                      'export_private_key'
                                                  )
                                              )
                                          ),
                                          React.createElement(
                                              'li',
                                              { key: '3' },
                                              React.createElement(
                                                  'a',
                                                  {
                                                      href: 'javascript:;',
                                                      onClick: this.deleteAccount.bind(
                                                          this.self
                                                      ),
                                                  },
                                                  React.createElement(
                                                      'span',
                                                      { className: 'trn' },
                                                      'forget_account'
                                                  )
                                              )
                                          ),
                                      ]
                                    : void 0,
                                React.createElement(
                                    'li',
                                    null,
                                    React.createElement(
                                        'a',
                                        {
                                            href: 'javascript:;',
                                            onClick: this.openModal.bind(
                                                this.self,
                                                'gasPrice'
                                            ),
                                        },
                                        React.createElement(
                                            'span',
                                            { className: 'trn' },
                                            'gas_price'
                                        )
                                    )
                                )
                            ),
                        ];
                    },
                },
            ]),
            Accounts
        );
    })();
            exports.default = Accounts;