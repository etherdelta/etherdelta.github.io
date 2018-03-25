/* This module was module number 531 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/balance
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
    Balance = (function(_React$Component) {
        function Balance(props) {
            _classCallCheck(this, Balance);
            var _this = _possibleConstructorReturn(
                this,
                (Balance.__proto__ || Object.getPrototypeOf(Balance)).call(
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
                        selectedToken: state.selectedToken,
                        selectedBase: state.selectedBase,
                    });
                }),
                (_this.state = { accounts: [] }),
                (_this.self = props.self),
                (_this.weiToEth = props.weiToEth),
                (_this.getDivisor = props.getDivisor),
                (_this.displayTokenGuide = props.displayTokenGuide),
                (_this.translatePage = props.translatePage),
                (_this.deposit = props.deposit),
                (_this.withdraw = props.withdraw),
                (_this.transfer = props.transfer),
                (_this.depositClick = function(tokenAddr) {
                    _this.deposit(
                        tokenAddr,
                        _this.refs['depositAmount' + tokenAddr].value
                    );
                }),
                (_this.withdrawClick = function(tokenAddr) {
                    _this.withdraw(
                        tokenAddr,
                        _this.refs['withdrawAmount' + tokenAddr].value
                    );
                }),
                (_this.transferClick = function(tokenAddr) {
                    _this.transfer(
                        tokenAddr,
                        _this.refs['transferAmount' + tokenAddr].value,
                        _this.refs['transferTo' + tokenAddr].value
                    );
                }),
                _this
            );
        }
        return (
            _inherits(Balance, React.Component),
            _createClass(Balance, [
                {
                    key: 'componentDidUpdate',
                    value: function() {
                        this.translatePage.call(this.self);
                    },
                },
                {
                    key: 'render',
                    value: function() {
                        var _this2 = this,
                            balanceDisplay = function(token) {
                                var balance =
                                    _this2.state.accounts[
                                        _this2.state.selectedAccount
                                    ].balances[token.addr];
                                return React.createElement(
                                    'table',
                                    {
                                        className:
                                            'table table-borderless table-balances',
                                    },
                                    React.createElement(
                                        'tbody',
                                        null,
                                        React.createElement(
                                            'tr',
                                            null,
                                            React.createElement(
                                                'td',
                                                null,
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
                                            ),
                                            React.createElement(
                                                'td',
                                                null,
                                                balance
                                                    ? React.createElement(
                                                          'span',
                                                          { className: 'ttip' },
                                                          _this2.weiToEth(
                                                              balance.balanceOutside,
                                                              _this2.getDivisor(
                                                                  balance.token
                                                              ),
                                                              3
                                                          ),
                                                          React.createElement(
                                                              'span',
                                                              {
                                                                  className:
                                                                      'text',
                                                              },
                                                              _this2.weiToEth(
                                                                  balance.balanceOutside,
                                                                  _this2.getDivisor(
                                                                      balance.token
                                                                  ),
                                                                  12
                                                              )
                                                          )
                                                      )
                                                    : React.createElement(
                                                          'span',
                                                          null,
                                                          '???'
                                                      )
                                            ),
                                            React.createElement(
                                                'td',
                                                null,
                                                balance
                                                    ? React.createElement(
                                                          'span',
                                                          { className: 'ttip' },
                                                          _this2.weiToEth(
                                                              balance.balance,
                                                              _this2.getDivisor(
                                                                  balance.token
                                                              ),
                                                              3
                                                          ),
                                                          React.createElement(
                                                              'span',
                                                              {
                                                                  className:
                                                                      'text',
                                                              },
                                                              _this2.weiToEth(
                                                                  balance.balance,
                                                                  _this2.getDivisor(
                                                                      balance.token
                                                                  ),
                                                                  12
                                                              )
                                                          )
                                                      )
                                                    : React.createElement(
                                                          'span',
                                                          null,
                                                          '???'
                                                      )
                                            )
                                        )
                                    )
                                );
                            },
                            depositForm = function(token) {
                                return React.createElement(
                                    'div',
                                    { className: 'padding-sides' },
                                    React.createElement(
                                        'table',
                                        {
                                            className:
                                                'table table-borderless table-balances',
                                        },
                                        React.createElement(
                                            'tbody',
                                            null,
                                            React.createElement(
                                                'tr',
                                                null,
                                                React.createElement(
                                                    'td',
                                                    { colSpan: '2' },
                                                    React.createElement(
                                                        'input',
                                                        {
                                                            type: 'text',
                                                            className:
                                                                'form-control input-xs trn',
                                                            style: {
                                                                width: '195px',
                                                            },
                                                            ref:
                                                                'depositAmount' +
                                                                token.addr,
                                                            placeholder:
                                                                'amount',
                                                        }
                                                    )
                                                ),
                                                React.createElement(
                                                    'td',
                                                    null,
                                                    React.createElement(
                                                        'button',
                                                        {
                                                            type: 'button',
                                                            className:
                                                                'btn btn-primary btn-xs trn',
                                                            style: {
                                                                width: '80px',
                                                            },
                                                            onClick: _this2.depositClick.bind(
                                                                _this2,
                                                                token.addr
                                                            ),
                                                            'data-toggle':
                                                                'tooltip',
                                                            'data-placement':
                                                                'bottom',
                                                            title:
                                                                'deposit_tab',
                                                        },
                                                        'deposit'
                                                    )
                                                )
                                            )
                                        )
                                    )
                                );
                            },
                            withdrawForm = function(token) {
                                return React.createElement(
                                    'div',
                                    { className: 'padding-sides' },
                                    React.createElement(
                                        'table',
                                        {
                                            className:
                                                'table table-borderless table-balances',
                                        },
                                        React.createElement(
                                            'tbody',
                                            null,
                                            React.createElement(
                                                'tr',
                                                null,
                                                React.createElement(
                                                    'td',
                                                    { colSpan: '2' },
                                                    React.createElement(
                                                        'input',
                                                        {
                                                            type: 'text',
                                                            className:
                                                                'form-control input-xs trn',
                                                            style: {
                                                                width: '195px',
                                                            },
                                                            ref:
                                                                'withdrawAmount' +
                                                                token.addr,
                                                            placeholder:
                                                                'amount',
                                                        }
                                                    )
                                                ),
                                                React.createElement(
                                                    'td',
                                                    null,
                                                    React.createElement(
                                                        'button',
                                                        {
                                                            type: 'button',
                                                            className:
                                                                'btn btn-primary btn-xs trn',
                                                            style: {
                                                                width: '80px',
                                                            },
                                                            onClick: _this2.withdrawClick.bind(
                                                                _this2,
                                                                token.addr
                                                            ),
                                                            'data-toggle':
                                                                'tooltip',
                                                            'data-placement':
                                                                'bottom',
                                                            title:
                                                                'withdraw_tab',
                                                        },
                                                        'withdraw'
                                                    )
                                                )
                                            )
                                        )
                                    )
                                );
                            },
                            transferForm = function(token) {
                                return React.createElement(
                                    'div',
                                    { className: 'padding-sides' },
                                    React.createElement(
                                        'table',
                                        {
                                            className:
                                                'table table-borderless table-balances',
                                        },
                                        React.createElement(
                                            'tbody',
                                            null,
                                            React.createElement(
                                                'tr',
                                                null,
                                                React.createElement(
                                                    'td',
                                                    null,
                                                    React.createElement(
                                                        'input',
                                                        {
                                                            type: 'text',
                                                            className:
                                                                'form-control input-xs trn',
                                                            style: {
                                                                width: '65px',
                                                            },
                                                            ref:
                                                                'transferAmount' +
                                                                token.addr,
                                                            placeholder:
                                                                'amount',
                                                        }
                                                    )
                                                ),
                                                React.createElement(
                                                    'td',
                                                    null,
                                                    React.createElement(
                                                        'input',
                                                        {
                                                            type: 'text',
                                                            className:
                                                                'form-control input-xs trn',
                                                            style: {
                                                                width: '130px',
                                                            },
                                                            ref:
                                                                'transferTo' +
                                                                token.addr,
                                                            placeholder:
                                                                'address',
                                                            defaultValue: '',
                                                        }
                                                    )
                                                ),
                                                React.createElement(
                                                    'td',
                                                    null,
                                                    React.createElement(
                                                        'button',
                                                        {
                                                            type: 'button',
                                                            className:
                                                                'btn btn-primary btn-xs trn',
                                                            style: {
                                                                width: '80px',
                                                            },
                                                            onClick: _this2.transferClick.bind(
                                                                _this2,
                                                                token.addr
                                                            ),
                                                            'data-toggle':
                                                                'tooltip',
                                                            'data-placement':
                                                                'bottom',
                                                            title:
                                                                'transfer_tab',
                                                        },
                                                        'transfer'
                                                    )
                                                )
                                            )
                                        )
                                    )
                                );
                            },
                            header = React.createElement(
                                'table',
                                {
                                    className:
                                        'table table-borderless table-balances',
                                },
                                React.createElement(
                                    'tbody',
                                    null,
                                    React.createElement(
                                        'tr',
                                        { className: 'table-header' },
                                        React.createElement(
                                            'td',
                                            { className: 'trn' },
                                            'token'
                                        ),
                                        React.createElement(
                                            'td',
                                            {
                                                className: 'trn',
                                                'data-toggle': 'tooltip',
                                                'data-placement': 'bottom',
                                                title: 'balance_wallet_tooltip',
                                            },
                                            'balance_in_your_wallet'
                                        ),
                                        React.createElement(
                                            'td',
                                            {
                                                className: 'trn',
                                                'data-toggle': 'tooltip',
                                                'data-placement': 'bottom',
                                                title:
                                                    'balance_etherdelta_tooltip',
                                            },
                                            'balance_etherdelta'
                                        )
                                    )
                                )
                            ),
                            balances =
                                this.state.accounts.length <= 0 ||
                                this.state.selectedAccount >=
                                    this.state.accounts.length
                                    ? React.createElement(
                                          'table',
                                          {
                                              className:
                                                  'table table-borderless table-balances',
                                          },
                                          React.createElement(
                                              'tbody',
                                              null,
                                              React.createElement(
                                                  'tr',
                                                  null,
                                                  React.createElement(
                                                      'td',
                                                      null,
                                                      React.createElement(
                                                          'span',
                                                          { className: 'trn' },
                                                          'please_select_account'
                                                      )
                                                  )
                                              )
                                          )
                                      )
                                    : React.createElement(
                                          'div',
                                          null,
                                          React.createElement(
                                              'div',
                                              { className: 'tab-content' },
                                              React.createElement(
                                                  'div',
                                                  {
                                                      role: 'tabpanel',
                                                      className:
                                                          'tab-pane active',
                                                      id: 'deposit',
                                                  },
                                                  header,
                                                  balanceDisplay(
                                                      this.state.selectedToken
                                                  ),
                                                  depositForm(
                                                      this.state.selectedToken
                                                  ),
                                                  balanceDisplay(
                                                      this.state.selectedBase
                                                  ),
                                                  depositForm(
                                                      this.state.selectedBase
                                                  )
                                              ),
                                              React.createElement(
                                                  'div',
                                                  {
                                                      role: 'tabpanel',
                                                      className: 'tab-pane',
                                                      id: 'withdraw',
                                                  },
                                                  header,
                                                  balanceDisplay(
                                                      this.state.selectedToken
                                                  ),
                                                  withdrawForm(
                                                      this.state.selectedToken
                                                  ),
                                                  balanceDisplay(
                                                      this.state.selectedBase
                                                  ),
                                                  withdrawForm(
                                                      this.state.selectedBase
                                                  )
                                              ),
                                              React.createElement(
                                                  'div',
                                                  {
                                                      role: 'tabpanel',
                                                      className: 'tab-pane',
                                                      id: 'transfer',
                                                  },
                                                  header,
                                                  balanceDisplay(
                                                      this.state.selectedToken
                                                  ),
                                                  transferForm(
                                                      this.state.selectedToken
                                                  ),
                                                  balanceDisplay(
                                                      this.state.selectedBase
                                                  ),
                                                  transferForm(
                                                      this.state.selectedBase
                                                  )
                                              )
                                          ),
                                          React.createElement(
                                              'div',
                                              { style: { margin: '12px' } },
                                              React.createElement(
                                                  'p',
                                                  null,
                                                  'Make sure ',
                                                  React.createElement(
                                                      'a',
                                                      {
                                                          href: 'javascript:;',
                                                          onClick: this.displayTokenGuide.bind(
                                                              this.self,
                                                              this.state
                                                                  .selectedToken
                                                          ),
                                                      },
                                                      this.state.selectedToken
                                                          .name
                                                  ),
                                                  ' is the token you actually want to trade. Multiple tokens can share the same name.'
                                              )
                                          )
                                      );
                        return React.createElement(
                            'div',
                            null,
                            React.createElement(
                                'div',
                                { className: 'row-box nav-header' },
                                React.createElement(
                                    'ul',
                                    {
                                        className: 'nav nav-tabs three columns',
                                        role: 'tablist',
                                    },
                                    React.createElement(
                                        'li',
                                        {
                                            role: 'presentation',
                                            className: 'active',
                                        },
                                        React.createElement(
                                            'a',
                                            {
                                                href: '#deposit',
                                                'aria-controls': 'deposit',
                                                role: 'tab',
                                                'data-toggle': 'tab',
                                                className: 'trn',
                                            },
                                            'deposit'
                                        )
                                    ),
                                    React.createElement(
                                        'li',
                                        { role: 'presentation' },
                                        React.createElement(
                                            'a',
                                            {
                                                href: '#withdraw',
                                                'aria-controls': 'withdraw',
                                                role: 'tab',
                                                'data-toggle': 'tab',
                                                className: 'trn',
                                            },
                                            'withdraw'
                                        )
                                    ),
                                    React.createElement(
                                        'li',
                                        { role: 'presentation' },
                                        React.createElement(
                                            'a',
                                            {
                                                href: '#transfer',
                                                'aria-controls': 'transfer',
                                                role: 'tab',
                                                'data-toggle': 'tab',
                                                className: 'trn',
                                            },
                                            'transfer'
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'row-box height4' },
                                balances
                            )
                        );
                    },
                },
            ]),
            Balance
        );
    })();
            exports.default = Balance;