/* This module was module number 555 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* main.js
*/
(function(Buffer) {
    'use strict';
    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    var _slicedToArray = (function() {
            function sliceIterator(arr, i) {
                var _arr = [],
                    _n = !0,
                    _d = !1,
                    _e = void 0;
                try {
                    for (
                        var _s, _i = arr[Symbol.iterator]();
                        !(_n = (_s = _i.next()).done) &&
                        (_arr.push(_s.value), !i || _arr.length !== i);
                        _n = !0
                    );
                } catch (err) {
                    (_d = !0), (_e = err);
                } finally {
                    try {
                        !_n && _i.return && _i.return();
                    } finally {
                        if (_d) throw _e;
                    }
                }
                return _arr;
            }
            return function(arr, i) {
                if (Array.isArray(arr)) return arr;
                if (Symbol.iterator in Object(arr))
                    return sliceIterator(arr, i);
                throw new TypeError(
                    'Invalid attempt to destructure non-iterable instance'
                );
            };
        })(),
        _connection2 = _interopRequireDefault(
            require('./components/connection')
        ),
        _balance2 = _interopRequireDefault(require('./components/balance')),
        _trades2 = _interopRequireDefault(require('./components/trades')),
        _volume2 = _interopRequireDefault(require('./components/volume')),
        _orders2 = _interopRequireDefault(require('./components/orders')),
        _languages2 = _interopRequireDefault(require('./components/languages')),
        _accounts2 = _interopRequireDefault(require('./components/accounts')),
        _buy2 = _interopRequireDefault(require('./components/buy')),
        _sell2 = _interopRequireDefault(require('./components/sell')),
        _myTrades2 = _interopRequireDefault(require('./components/myTrades')),
        _myOrders2 = _interopRequireDefault(require('./components/myOrders')),
        _myFunds2 = _interopRequireDefault(require('./components/myFunds')),
        _helpDropdown2 = _interopRequireDefault(
            require('./components/helpDropdown')
        ),
        _tokensDropdown2 = _interopRequireDefault(
            require('./components/tokensDropdown')
        ),
        _tokenGuidesDropdown2 = _interopRequireDefault(
            require('./components/tokenGuidesDropdown')
        ),
        _importAccount2 = _interopRequireDefault(
            require('./components/importAccount')
        ),
        _otherToken2 = _interopRequireDefault(
            require('./components/otherToken')
        ),
        _gasPrice2 = _interopRequireDefault(require('./components/gasPrice')),
        _tokenGuide2 = _interopRequireDefault(
            require('./components/tokenGuide')
        ),
        _screencast2 = _interopRequireDefault(
            require('./components/screencast')
        ),
        _ledger2 = _interopRequireDefault(require('./components/ledger')),
        _buyTrade2 = _interopRequireDefault(require('./components/buyTrade')),
        _sellTrade2 = _interopRequireDefault(require('./components/sellTrade')),
        _chartPrice2 = _interopRequireDefault(
            require('./components/chartPrice')
        ),
        _chartDepth2 = _interopRequireDefault(
            require('./components/chartDepth')
        ),
        React = require('react'),
        ReactDOM = require('react-dom'),
        createStore = require('redux').createStore,
        reducer = require('./reducers/index.js'),
        Web3 = require('web3'),
        sha256 = require('js-sha256').sha256,
        BigNumber = require('bignumber.js');
    require('datejs');
    var async = require('undefined' == typeof window
            ? 'async'
            : 'async/dist/async.min.js'),
        translations = require('./translations.json'),
        request = require('request'),
        utility = require('./server/utility.js'),
        io = require('socket.io-client'),
        xss = require('xss'),
        abiEtherDelta = require('./smart_contract/etherdelta.sol.json'),
        abiToken = require('./smart_contract/token.sol.json'),
        getParameterByName = function(nameIn, urlIn) {
            var url = urlIn || window.location.href,
                name = nameIn.replace(/[\[\]]/g, '\\$&'),
                results = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)').exec(
                    url
                );
            return results
                ? results[2]
                  ? decodeURIComponent(results[2].replace(/\+/g, ' '))
                  : ''
                : null;
        },
        etherDelta = new function() {
            var self = this;
            (self.store = createStore(reducer)),
                (self.state = {}),
                (self.q = async.queue(function(task, callback) {
                    task(callback);
                }, 1)),
                (self.socket = void 0),
                (self.utility = void 0),
                (self.config = void 0),
                (self.nonce = void 0),
                (self.contractEtherDelta = void 0),
                (self.contractToken = void 0),
                (self.language = 'en'),
                (self.translator = $('body').translate({
                    lang: self.language,
                    t: translations,
                })),
                (self.web3 = void 0),
                (self.minGas = 0.005),
                (self.refreshInterval = 1e4),
                (self.cacheCookies = void 0),
                (self.ledgerEth = void 0),
                (self.lastUpdatedBalances = void 0),
                window.addEventListener('load', function() {
                    self.startForkDelta();
                }),
                self.store.subscribe(function() {
                    var state = self.store.getState();
                    (self.state = state),
                        (self.accounts = state.user.accounts),
                        (self.pendingTransactions =
                            state.user.pendingTransactions),
                        (self.selectedAccount = state.user.selectedAccount),
                        (self.selectedToken = state.selectedToken),
                        (self.selectedBase = state.selectedBase),
                        (self.blockNumber = state.blockNumber),
                        (self.connection = state.settings.connection),
                        (self.ethGasPrice = state.settings.ethGasPrice),
                        (self.minGas =
                            self.ethGasPrice * self.config.gasDeposit / 1e18),
                        !self.selectedContract &&
                            state.settings.selectedContract &&
                            self.checkContractUpgrade(function() {}),
                        (self.selectedContract =
                            state.settings.selectedContract),
                        state.settings.language &&
                            state.settings.language !== self.language &&
                            self.translator &&
                            ((self.language = state.settings.language),
                            self.translatePage());
                }),
                alertify.directContractLinkWarning ||
                    alertify.dialog(
                        'directContractLinkWarning',
                        function () {
                            return {
                                build: function() {
                                    this.setHeader(
                                        '<div><i class="fa fa-exclamation-triangle fa-2x" style="color: rgb(230,162,38);"></i> Direct Contract Link Warning!</div>'
                                    );
                                },
                                setup: function() {
                                    return {
                                        buttons: [
                                            {
                                                text: 'Continue',
                                                className: 'btn-danger',
                                            }
                                        ],
                                        options: {
                                            movable: false,
                                            resizable: false,
                                            pinnable: false,
                                            maximizable: false,
                                            modal: true,
                                            closableByDimmer: false
                                        },
                                    };
                                },
                            };
                        },
                        false,
                        'alert'
                    ),
                (self.previousSelectedToken = null),
                (self.isValidToken = function (token) {
                    return token && token.hasOwnProperty('addr') && typeof token.addr === 'string';
                }),
                (self.isRegisteredToken = function (token) {
                    if (!self.isValidToken(token)) return false;
                    let registeredTokens = self.config.tokens.filter(t => self.isValidToken(t) && t.addr.toLowerCase() === token.addr.toLowerCase());
                    return registeredTokens.length > 0;
                }),
                (self.handleTokenChange = function (currentValueSelector, previousValueSelector, previousValueSetter) {
                    var previousValue = previousValueSelector();
                    var currentValue = currentValueSelector();
                    if (!self.isValidToken(currentValue)) {
                        return;
                    }
                    if (previousValue !== currentValue) {
                        console.log('Token Changed from', previousValue, 'to', currentValue, '!');
                        if (self.isRegisteredToken(currentValue)) {
                            console.log('token ', currentValue, 'is a registered token!');
                        } else {
                            console.warn('token ', currentValue, 'is NOT a registered token!');
                            alertify.directContractLinkWarning(`You are trading with a contract address. This token is not officially listed and ForkDelta has not vetted this token. Token contracts can be easily spoofed. <strong>Please verify the token contract address with a trusted source before you continue!</strong>`)
                        }
                        previousValueSetter(currentValue);
                    }
                }),
                (self.unsubscribeSelectedToken = self.store.subscribe(self.handleTokenChange.bind(null, () => self.selectedToken, () => self.previousSelectedToken, (newValue) => self.previousSelectedToken = newValue))),
                (self.loadConfig = function(callback) {
                    var configName = getParameterByName('config') || 'main',
                        url =
                            window.location.origin +
                            '/config/' +
                            configName +
                            '.json';
                    request(url, function(err, response, body) {
                        try {
                            (self.config = JSON.parse(body)),
                                (self.utility = utility(self.config)),
                                callback();
                        } catch (errCatch) {
                            throw (console.log(errCatch),
                            new Error('Could not load config'));
                        }
                    });
                }),
                (self.translatePage = function() {
                    self.translator.lang(self.language),
                        (window.title = translations.title[self.language]),
                        self.enableTooltipsAndPopovers();
                }),
                alertify.dialogError ||
                    alertify.dialog(
                        'dialogError',
                        function() {
                            return {
                                build: function() {
                                    this.setHeader(
                                        '<span class="fa fa-times-circle fa-2x" style="vertical-align: middle; color: #ff0000;"></span> Error'
                                    );
                                },
                            };
                        },
                        !0,
                        'alert'
                    ),
                alertify.dialogInfo ||
                    alertify.dialog(
                        'dialogInfo',
                        function() {
                            return {
                                build: function() {
                                    this.setHeader(
                                        '<span class="fa fa-info-circle fa-2x" style="vertical-align: middle; color: #0000ff;"></span>'
                                    );
                                },
                            };
                        },
                        !0,
                        'alert'
                    ),
                (self.dialogInfo = function(message, closable) {
                    (closable =
                        'undefined' !== typeof closable ? closable : true),
                        alertify
                            .dialogInfo(message)
                            .set({
                                closable: closable,
                                closableByDimmer: closable,
                            }),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Dialog',
                            eventAction: 'Info',
                        });
                }),
                (self.dialogError = function(message) {
                    console.log(message),
                        alertify.dialogError(message),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Dialog',
                            eventAction: 'Error',
                        });
                }),
                (self.alertSuccess = function(message) {
                    console.log(message),
                        alertify.success(message),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Alert',
                            eventAction: 'Success',
                        });
                }),
                (self.txError = function(err) {
                    console.log('Error', err),
                        self.utility.getBalance(
                            self.web3,
                            self.accounts[self.selectedAccount].addr,
                            function(errBalance, resultBalance) {
                                var balance = self.utility.weiToEth(
                                    resultBalance
                                );
                                'Ledger' ===
                                self.accounts[self.selectedAccount].kind
                                    ? (self.dialogError(
                                          'There was a problem with your Ledger transaction. Make sure you have enough ETH in your "Wallet" column to pay for the gas fee. If you already have a pending transaction (enter your address on Etherscan to find out), please wait for it to confirm, or increase your "gas price" (in the upper right dropdown) and try again.'
                                      ),
                                      ga('send', {
                                          hitType: 'event',
                                          eventCategory: 'Error',
                                          eventAction:
                                              'Ethereum - transaction error',
                                      }))
                                    : 'RPC' === self.connection.connection &&
                                      'MetaMask' !==
                                          self.accounts[self.selectedAccount]
                                              .kind
                                      ? self.accounts[self.selectedAccount].pk
                                        ? (self.dialogError(
                                              "You are using a ForkDelta account that has a private key attached, but you're connected to MetaMask. You should disable MetaMask from Chrome's Window -> Extensions menu (don't worry, this won't lose your MetaMask data), then refresh ForkDelta."
                                          ),
                                          ga('send', {
                                              hitType: 'event',
                                              eventCategory: 'Error',
                                              eventAction:
                                                  'Ethereum - transaction error',
                                          }))
                                        : (self.dialogError(
                                              'You are connected to MetaMask, but you are either using a non-MetaMask account, or you are not logged into the MetaMask account you have selected. Check this in MetaMask, then refresh and try again.'
                                          ),
                                          ga('send', {
                                              hitType: 'event',
                                              eventCategory: 'Error',
                                              eventAction:
                                                  'Ethereum - transaction error',
                                          }))
                                      : 'PublicRPC' !==
                                            self.connection.connection ||
                                        self.accounts[self.selectedAccount].pk
                                        ? 'PublicRPC' !==
                                              self.connection.connection ||
                                          self.utility.verifyPrivateKey(
                                              self.accounts[
                                                  self.selectedAccount
                                              ].addr,
                                              self.accounts[
                                                  self.selectedAccount
                                              ].pk
                                          )
                                          ? 'PublicRPC' ===
                                                self.connection.connection &&
                                            balance < 2 * self.minGas
                                            ? (self.dialogError(
                                                  "Your wallet's ETH balance (" +
                                                      balance +
                                                      ' ETH) is not enough to cover the gas cost (Ethereum network fee). ForkDelta sends ' +
                                                      self.minGas +
                                                      " ETH with each transaction. This is an overestimate and the excess will get refunded to you. It's a good idea to send more than " +
                                                      self.minGas +
                                                      ' so you can pay for not only this transaction, but also future transactions you do on ForkDelta. The gas has to come directly from your Wallet (ForkDelta has no physical way of paying gas from your deposited ETH).'
                                              ),
                                              ga('send', {
                                                  hitType: 'event',
                                                  eventCategory: 'Error',
                                                  eventAction:
                                                      'Ethereum - transaction error',
                                              }))
                                            : (self.dialogError(
                                                  'You tried to send an Ethereum transaction but there was an error. Make sure you have enough ETH in your "Wallet" column to pay for the gas fee. If you already have a pending transaction (enter your address on Etherscan to find out), please wait for it to confirm, or increase your "gas price" (in the upper right dropdown) and try again.'
                                              ),
                                              ga('send', {
                                                  hitType: 'event',
                                                  eventCategory: 'Error',
                                                  eventAction:
                                                      'Ethereum - transaction error',
                                              }))
                                          : (self.dialogError(
                                                'You are using a ForkDelta account that has an invalid private key.'
                                            ),
                                            ga('send', {
                                                hitType: 'event',
                                                eventCategory: 'Error',
                                                eventAction:
                                                    'Ethereum - transaction error',
                                            }))
                                        : (self.dialogError(
                                              'You are using a ForkDelta account that doesn\'t have a private key attached. Perhaps you created the account using MetaMask, in which case you should make sure MetaMask is enabled and logged in to this account, then refresh ForkDelta. Or, if you have the private key, you can choose "Import account" from the accounts dropdown (upper right) to re-import the account with its private key.'
                                          ),
                                          ga('send', {
                                              hitType: 'event',
                                              eventCategory: 'Error',
                                              eventAction:
                                                  'Ethereum - transaction error',
                                          }));
                            }
                        );
                }),
                (self.alertTxResult = function(err, txsIn) {
                    var txs = Array.isArray(txsIn) ? txsIn : [txsIn];
                    if (err) self.txError(err);
                    else {
                        if (1 === txs.length) {
                            var tx = txs[0];
                            tx.txHash &&
                            '0x0000000000000000000000000000000000000000000000000000000000000000' !==
                                tx.txHash
                                ? self.dialogInfo(
                                      'You just created an Ethereum transaction. Track its progress: <a href="https://etherscan.io/tx/' +
                                          tx.txHash +
                                          '" target="_blank">' +
                                          tx.txHash +
                                          '</a>.'
                                  )
                                : self.txError();
                        } else if (txs.length > 1)
                            if (
                                txs.findIndex(function(x) {
                                    return !x.txHash;
                                }) < 0
                            ) {
                                var message =
                                    'You just created Ethereum transactions. Track their progress: <br />';
                                txs.forEach(function(tx) {
                                    message +=
                                        '<a href="https://etherscan.io/tx/' +
                                        tx.txHash +
                                        '" target="_blank">' +
                                        tx.txHash +
                                        '</a><br />';
                                }),
                                    self.dialogInfo(message);
                            } else self.txError();
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Ethereum',
                            eventAction:
                                'Ethereum transactions (' + txs.length + ')',
                        });
                    }
                }),
                (self.enableTooltipsAndPopovers = function() {
                    $('[data-toggle="popover"]').popover({ trigger: 'hover' }),
                        $('[data-toggle="tooltip"]').tooltip(),
                        $('[data-toggle="tab"]').tooltip({
                            trigger: 'hover',
                            placement: 'bottom',
                            container: 'body',
                        });
                }),
                (self.createAccount = function() {
                    var newAccount = self.utility.createAccount(),
                        addr = newAccount.address,
                        pk = newAccount.privateKey;
                    self.addAccount(addr, pk),
                        self.dialogInfo(
                            'You created a new Ethereum account.<br/><b>Account Address:</b> ' +
                                addr +
                                "<br/><br/><strong><i class='fa fa-exclamation-triangle' style='color:rgb(230,162,38)' aria-hidden='true'></i> To control your account, you need the Private Key. SAVE it now!</strong><br/><b>Private Key:</b> " +
                                pk +
                                '<br/><br/>If you lose your Private Key, you cannot restore it.',
                            false
                        ),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Action',
                            eventAction: 'Create Account',
                        });
                }),
                alertify.deleteAccountWarning ||
                    alertify.dialog(
                        'deleteAccountWarning',
                        function() {
                            return {
                                build: function() {
                                    this.setHeader(
                                        '<div><i class="fa fa-exclamation-triangle fa-2x" style="color: rgb(230,162,38);"></i> Forget account?</div>'
                                    );
                                },
                                setup: function() {
                                    return {
                                        buttons: [
                                            {
                                                text: 'Yes, forget account',
                                                className: 'btn-danger',
                                            },
                                            {
                                                text: 'Cancel',
                                                className: 'btn-default',
                                                invokeOnClose: !0,
                                            },
                                        ],
                                        focus: { element: 1 },
                                        options: {
                                            movable: !1,
                                            resizable: !1,
                                            pinnable: !1,
                                            maximizable: !1,
                                        },
                                    };
                                },
                            };
                        },
                        !0,
                        'alert'
                    ),
                (self.deleteAccount = function() {
                    if (self.accounts[self.selectedAccount].pk) {
                        var addr = self.accounts[self.selectedAccount].addr,
                            pk = self.accounts[self.selectedAccount].pk;
                        alertify
                            .deleteAccountWarning(
                                'You are about to remove an Ethereum account: ' +
                                    addr +
                                    "<br /><br /><strong><i class='fa fa-exclamation-triangle' style='color:rgb(230,162,38)' aria-hidden='true'></i> To withdraw funds from this account in the future, you will need the Private Key. SAVE it now!</strong><br/><b>Private Key:</b> " +
                                    pk +
                                    '<br/><br/>If you lose the Private Key, you cannot restore it.'
                            )
                            .set({
                                onok: function(e) {
                                    0 === e.index &&
                                        (self.store.dispatch({
                                            type: 'DELETE_ACCOUNT',
                                            value: self.selectedAccount,
                                        }),
                                        (self.nonce = void 0),
                                        self.refresh(function() {}, !0),
                                        ga('send', {
                                            hitType: 'event',
                                            eventCategory: 'Action',
                                            eventAction: 'Delete Account',
                                        }));
                                },
                            }),
                            ga('send', {
                                hitType: 'event',
                                eventCategory: 'Action',
                                eventAction: 'Show private key and delete',
                            });
                    } else
                        alertify.dialogInfo(
                            'This account is not stored on ForkDelta. Nothing to forget!'
                        );
                }),
                (self.selectAccount = function(i) {
                    (self.nonce = void 0),
                        self.store.dispatch({
                            type: 'SELECT_ACCOUNT',
                            value: i,
                        }),
                        self.refresh(function() {}, !0),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Action',
                            eventAction: 'Select Account',
                        });
                }),
                (self.addAccount = function(newAddr, newPk) {
                    var addr = newAddr.toLowerCase(),
                        pk = newPk;
                    '0x' !== addr.slice(0, 2) && (addr = '0x' + addr),
                        '0x' === pk.slice(0, 2) && (pk = pk.slice(2)),
                        (addr = self.utility.toChecksumAddress(addr));
                    var verifyPrivateKey = void 0;
                    try {
                        verifyPrivateKey = self.utility.verifyPrivateKey(
                            addr,
                            pk
                        );
                    } catch (err) {
                        verifyPrivateKey = !1;
                    }
                    pk && !verifyPrivateKey
                        ? (self.dialogError('The private key is invalid.'),
                          ga('send', {
                              hitType: 'event',
                              eventCategory: 'Error',
                              eventAction: 'Add Account - invalid private key',
                          }))
                        : self.web3.isAddress(addr)
                          ? (self.store.dispatch({
                                type: 'SELECT_ACCOUNT',
                                value: self.accounts.length,
                            }),
                            self.store.dispatch({
                                type: 'ADD_ACCOUNT',
                                value: { addr: addr, pk: pk },
                            }),
                            (self.nonce = void 0),
                            self.refresh(function() {}, !0),
                            ga('send', {
                                hitType: 'event',
                                eventCategory: 'Action',
                                eventAction: 'Add Account',
                            }))
                          : (self.dialogError(
                                'The specified address is invalid.'
                            ),
                            ga('send', {
                                hitType: 'event',
                                eventCategory: 'Error',
                                eventAction: 'Add Account - invalid address',
                            }));
                }),
                (self.showPrivateKey = function() {
                    var addr = self.accounts[self.selectedAccount].addr,
                        pk = self.accounts[self.selectedAccount].pk;
                    pk
                        ? (self.dialogInfo(
                              'For account ' +
                                  addr +
                                  ', the private key is ' +
                                  pk +
                                  '.'
                          ),
                          ga('send', {
                              hitType: 'event',
                              eventCategory: 'Action',
                              eventAction: 'Show private key',
                          }))
                        : (self.dialogError(
                              'For account ' +
                                  addr +
                                  ', there is no private key available. You can still transact if you are connected to Ethereum and the account is unlocked.'
                          ),
                          ga('send', {
                              hitType: 'event',
                              eventCategory: 'Error',
                              eventAction: 'Show private key - unavailable',
                          }));
                }),
                (self.addressLink = function(address) {
                    return 'https://etherscan.io/address/' + address;
                }),
                (self.contractAddr = function(addr) {
                    self.store.dispatch({
                        type: 'UPDATE_SETTINGS',
                        value: { selectedContract: addr },
                    }),
                        self.refresh(function() {}, !0);
                }),
                (self.updateAccounts = function(callback) {
                    async.forEachOf(
                        self.accounts,
                        function(account, i, callbackEach) {
                            self.utility.getBalance(
                                self.web3,
                                account.addr,
                                function(err, balance) {
                                    self.store.dispatch({
                                        type: 'UPDATE_BALANCE',
                                        value: { i: i, balance: balance },
                                    }),
                                        callbackEach();
                                }
                            );
                        },
                        function() {
                            if (
                                self.accounts.length > 0 &&
                                self.accounts[self.selectedAccount]
                            ) {
                                var tempTokens = [
                                    self.selectedToken,
                                    self.selectedBase,
                                ];
                                async.map(
                                    tempTokens,
                                    function(token, callbackMap) {
                                        '0x0000000000000000000000000000000000000000' ===
                                        token.addr
                                            ? self.utility.call(
                                                  self.web3,
                                                  self.contractEtherDelta,
                                                  self.selectedContract,
                                                  'balanceOf',
                                                  [
                                                      token.addr,
                                                      self.accounts[
                                                          self.selectedAccount
                                                      ].addr,
                                                  ],
                                                  function(err, result) {
                                                      var balance = result;
                                                      self.utility.getBalance(
                                                          self.web3,
                                                          self.accounts[
                                                              self
                                                                  .selectedAccount
                                                          ].addr,
                                                          function(
                                                              errGetBalance,
                                                              balanceOutside
                                                          ) {
                                                              callbackMap(
                                                                  null,
                                                                  {
                                                                      token: token,
                                                                      balance: balance,
                                                                      balanceOutside: balanceOutside,
                                                                  }
                                                              );
                                                          }
                                                      );
                                                  }
                                              )
                                            : self.utility.call(
                                                  self.web3,
                                                  self.contractEtherDelta,
                                                  self.selectedContract,
                                                  'balanceOf',
                                                  [
                                                      token.addr,
                                                      self.accounts[
                                                          self.selectedAccount
                                                      ].addr,
                                                  ],
                                                  function(err, result) {
                                                      var balance = result;
                                                      self.utility.call(
                                                          self.web3,
                                                          self.contractToken,
                                                          token.addr,
                                                          'balanceOf',
                                                          [
                                                              self.accounts[
                                                                  self
                                                                      .selectedAccount
                                                              ].addr,
                                                          ],
                                                          function(
                                                              errBalanceOf,
                                                              balanceOutside
                                                          ) {
                                                              callbackMap(
                                                                  null,
                                                                  {
                                                                      token: token,
                                                                      balance: balance,
                                                                      balanceOutside: balanceOutside,
                                                                  }
                                                              );
                                                          }
                                                      );
                                                  }
                                              );
                                    },
                                    function(err, balances) {
                                        var balancesObj = {};
                                        balances.forEach(function(x) {
                                            balancesObj[x.token.addr] = x;
                                        }),
                                            self.store.dispatch({
                                                type: 'UPDATE_BALANCES',
                                                value: {
                                                    i: self.selectedAccount,
                                                    balances: balancesObj,
                                                },
                                            });
                                    }
                                );
                            } else callback();
                        }
                    );
                }),
                (self.selectLanguage = function(newLanguage) {
                    self.store.dispatch({
                        type: 'UPDATE_SETTINGS',
                        value: { language: newLanguage },
                    }),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Action',
                            eventAction: 'Select language',
                            eventLabel: newLanguage,
                        });
                }),
                (self.updatePending = function(callback) {
                    async.map(
                        self.pendingTransactions,
                        function(tx, callbackMap) {
                            self.utility.txReceipt(
                                self.web3,
                                tx.txHash,
                                function(err, result) {
                                    !err && result && result.blockNumber
                                        ? callbackMap(null, void 0)
                                        : callbackMap(null, tx);
                                }
                            );
                        },
                        function(err, results) {
                            self.store.dispatch({
                                type: 'UPDATE_PENDING',
                                value: results.filter(function(x) {
                                    return x;
                                }),
                            }),
                                callback();
                        }
                    );
                }),
                (self.isInCross = function(price, kind, bid, ask) {
                    if (price)
                        return 'buy' === kind && ask && price > 1.5 * ask
                            ? ask
                            : 'sell' === kind && bid && price < 0.5 * bid
                              ? bid
                              : void 0;
                }),
                (self.transformOrders = function(res) {
                    return (
                        res.buys.forEach(function(x) {
                            Object.assign(x, {
                                id: x.id,
                                date: new Date(x.updated),
                                price: new BigNumber(x.price),
                                amountGet: new BigNumber(x.amountGet),
                                amountGive: new BigNumber(x.amountGive),
                                deleted: x.deleted,
                                expires: Number(x.expires),
                                nonce: Number(x.nonce),
                                tokenGet: x.tokenGet,
                                tokenGive: x.tokenGive,
                                user: x.user,
                                r: x.r,
                                s: x.s,
                                v: x.v ? Number(x.v) : void 0,
                            });
                        }),
                        res.sells.forEach(function(x) {
                            Object.assign(x, {
                                id: x.id,
                                date: new Date(x.date),
                                price: new BigNumber(x.price),
                                amountGet: new BigNumber(x.amountGet),
                                amountGive: new BigNumber(x.amountGive),
                                deleted: x.deleted,
                                expires: Number(x.expires),
                                nonce: Number(x.nonce),
                                tokenGet: x.tokenGet,
                                tokenGive: x.tokenGive,
                                user: x.user,
                                r: x.r,
                                s: x.s,
                                v: x.v ? Number(x.v) : void 0,
                            });
                        }),
                        res
                    );
                }),
                (self.transformTrades = function(res) {
                    return res.map(function(x) {
                        var txLink = 'https://etherscan.io/tx/' + x.txHash;
                        return Object.assign(x, {
                            txLink: txLink,
                            txHash: x.txHash,
                            date: new Date(x.date),
                            amount: Number(x.amount),
                            amountBase: Number(x.amountBase),
                            price: Number(x.price),
                        });
                    });
                }),
                (self.transformFunds = function(res) {
                    return res.map(function(x) {
                        var txLink = 'https://etherscan.io/tx/' + x.txHash;
                        return Object.assign(x, {
                            txLink: txLink,
                            txHash: x.txHash,
                            date: new Date(x.date),
                            amount: Number(x.amount),
                            price: Number(x.price),
                        });
                    });
                }),
                (self.transformReturnTicker = function(res) {
                    return (
                        Object.keys(res).forEach(function(x) {
                            Object.assign(res[x], {
                                quoteVolume: Number(res[x].quoteVolume),
                                baseVolume: Number(res[x].baseVolume),
                                bid: Number(res[x].bid),
                                ask: Number(res[x].ask),
                                last: Number(res[x].last),
                                percentChange: Number(res[x].percentChange),
                            });
                        }),
                        res
                    );
                }),
                (self.transfer = function(addr, inputAmount, toAddr) {
                    var amount = self.utility.ethToWei(
                            inputAmount,
                            self.getDivisor(addr)
                        ),
                        token = self.getToken(addr);
                    if (amount.lte(0))
                        return (
                            self.dialogError(
                                'You must specify a valid amount to transfer.'
                            ),
                            void ga('send', {
                                hitType: 'event',
                                eventCategory: 'Error',
                                eventAction: 'Transfer - invalid amount',
                                eventLabel: token.name,
                                eventValue: inputAmount,
                            })
                        );
                    self.web3.isAddress(toAddr) &&
                    '0x0000000000000000000000000000000000000' !==
                        toAddr.slice(0, 39) &&
                    toAddr.toLowerCase() !==
                        self.accounts[self.selectedAccount].addr.toLowerCase()
                        ? toAddr.toLowerCase() ===
                          self.selectedContract.toLowerCase()
                          ? (self.dialogError(
                                'If you send funds directly to the smart contract, they will be lost. You need to use the Deposit tab to deposit.'
                            ),
                            ga('send', {
                                hitType: 'event',
                                eventCategory: 'Error',
                                eventAction: 'Transfer - invalid address',
                                eventLabel: token.name,
                                eventValue: inputAmount,
                            }))
                          : '0x0000000000000000000000000000000000000' ===
                            addr.slice(0, 39)
                            ? self.utility.getBalance(
                                  self.web3,
                                  self.accounts[self.selectedAccount].addr,
                                  function(err, balance) {
                                      amount.gt(balance) && (amount = balance),
                                          amount.lte(0)
                                              ? (self.dialogError(
                                                    'You do not have anything to transfer. Note: you can only transfer from your "Wallet." If you have Ether on deposit, please withdraw first, then transfer.'
                                                ),
                                                ga('send', {
                                                    hitType: 'event',
                                                    eventCategory: 'Error',
                                                    eventAction:
                                                        'Transfer - nothing to transfer',
                                                    eventLabel: token.name,
                                                    eventValue: inputAmount,
                                                }))
                                              : self.utility.send(
                                                    self.web3,
                                                    self.ledgerEth,
                                                    void 0,
                                                    toAddr,
                                                    void 0,
                                                    [
                                                        {
                                                            gas:
                                                                self.config
                                                                    .gasDeposit,
                                                            gasPrice:
                                                                self.ethGasPrice,
                                                            value: amount.toNumber(),
                                                        },
                                                    ],
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].addr,
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].pk,
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].kind,
                                                    self.nonce,
                                                    function(errSend, result) {
                                                        (self.nonce =
                                                            result.nonce),
                                                            self.addPending(
                                                                errSend,
                                                                {
                                                                    txHash:
                                                                        result.txHash,
                                                                }
                                                            ),
                                                            self.alertTxResult(
                                                                errSend,
                                                                result
                                                            ),
                                                            ga('send', {
                                                                hitType:
                                                                    'event',
                                                                eventCategory:
                                                                    'Action',
                                                                eventAction:
                                                                    'Transfer',
                                                                eventLabel:
                                                                    token.name,
                                                                eventValue: inputAmount,
                                                            });
                                                    }
                                                );
                                  }
                              )
                            : self.utility.call(
                                  self.web3,
                                  self.contractToken,
                                  token.addr,
                                  'balanceOf',
                                  [self.accounts[self.selectedAccount].addr],
                                  function(err, result) {
                                      amount.gt(result) && (amount = result),
                                          amount.lte(0)
                                              ? (self.dialogError(
                                                    'You do not have anything to transfer. Note: you can only transfer from your "Wallet." If you have tokens on deposit, please withdraw first, then transfer.'
                                                ),
                                                ga('send', {
                                                    hitType: 'event',
                                                    eventCategory: 'Error',
                                                    eventAction:
                                                        'Transfer - nothing to transfer',
                                                    eventLabel: token.name,
                                                    eventValue: inputAmount,
                                                }))
                                              : self.utility.send(
                                                    self.web3,
                                                    self.ledgerEth,
                                                    self.contractToken,
                                                    token.addr,
                                                    'transfer',
                                                    [
                                                        toAddr,
                                                        amount,
                                                        {
                                                            gas:
                                                                self.config
                                                                    .gasDeposit,
                                                            gasPrice:
                                                                self.ethGasPrice,
                                                            value: 0,
                                                        },
                                                    ],
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].addr,
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].pk,
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].kind,
                                                    self.nonce,
                                                    function(
                                                        errSend,
                                                        resultSend
                                                    ) {
                                                        (self.nonce =
                                                            resultSend.nonce),
                                                            self.addPending(
                                                                errSend,
                                                                {
                                                                    txHash:
                                                                        resultSend.txHash,
                                                                }
                                                            ),
                                                            self.alertTxResult(
                                                                errSend,
                                                                resultSend
                                                            ),
                                                            ga('send', {
                                                                hitType:
                                                                    'event',
                                                                eventCategory:
                                                                    'Action',
                                                                eventAction:
                                                                    'Transfer',
                                                                eventLabel:
                                                                    token.name,
                                                                eventValue: inputAmount,
                                                            });
                                                    }
                                                );
                                  }
                              )
                        : (self.dialogError('Please specify a valid address.'),
                          ga('send', {
                              hitType: 'event',
                              eventCategory: 'Error',
                              eventAction: 'Transfer - invalid address',
                              eventLabel: token.name,
                              eventValue: inputAmount,
                          }));
                }),
                (self.deposit = function(addr, inputAmount) {
                    var amount = self.utility.ethToWei(
                            inputAmount,
                            self.getDivisor(addr)
                        ),
                        token = self.getToken(addr);
                    if (amount.lte(0))
                        return (
                            self.dialogError(
                                'You must specify a valid amount to deposit.'
                            ),
                            void ga('send', {
                                hitType: 'event',
                                eventCategory: 'Error',
                                eventAction: 'Deposit - invalid amount',
                                eventLabel: token.name,
                                eventValue: inputAmount,
                            })
                        );
                    '0x0000000000000000000000000000000000000' ===
                    addr.slice(0, 39)
                        ? self.utility.getBalance(
                              self.web3,
                              self.accounts[self.selectedAccount].addr,
                              function(err, result) {
                                  var balanceLessGas = result.minus(
                                      new BigNumber(self.ethGasPrice).times(
                                          self.config.gasDeposit
                                      )
                                  );
                                  amount.gt(balanceLessGas) &&
                                      amount.lt(
                                          balanceLessGas.times(
                                              new BigNumber(1.1)
                                          )
                                      ) &&
                                      (amount = balanceLessGas),
                                      amount.lte(result)
                                          ? self.utility.send(
                                                self.web3,
                                                self.ledgerEth,
                                                self.contractEtherDelta,
                                                self.selectedContract,
                                                'deposit',
                                                [
                                                    {
                                                        gas:
                                                            self.config
                                                                .gasDeposit,
                                                        gasPrice:
                                                            self.ethGasPrice,
                                                        value: amount.toNumber(),
                                                    },
                                                ],
                                                self.accounts[
                                                    self.selectedAccount
                                                ].addr,
                                                self.accounts[
                                                    self.selectedAccount
                                                ].pk,
                                                self.accounts[
                                                    self.selectedAccount
                                                ].kind,
                                                self.nonce,
                                                function(errSend, resultSend) {
                                                    (self.nonce =
                                                        resultSend.nonce),
                                                        self.addPending(
                                                            errSend,
                                                            {
                                                                txHash:
                                                                    resultSend.txHash,
                                                            }
                                                        ),
                                                        self.alertTxResult(
                                                            errSend,
                                                            resultSend
                                                        ),
                                                        ga('send', {
                                                            hitType: 'event',
                                                            eventCategory:
                                                                'Action',
                                                            eventAction:
                                                                'Deposit',
                                                            eventLabel:
                                                                token.name,
                                                            eventValue: inputAmount,
                                                        });
                                                }
                                            )
                                          : (self.dialogError(
                                                "You can't deposit more Ether than you have."
                                            ),
                                            ga('send', {
                                                hitType: 'event',
                                                eventCategory: 'Error',
                                                eventAction:
                                                    'Deposit - not enough balance',
                                                eventLabel: token.name,
                                                eventValue: inputAmount,
                                            }));
                              }
                          )
                        : self.utility.call(
                              self.web3,
                              self.contractToken,
                              token.addr,
                              'allowance',
                              [
                                  self.accounts[self.selectedAccount].addr,
                                  self.selectedContract,
                              ],
                              function(errAllowance, resultAllowance) {
                                  resultAllowance.gt(0) &&
                                      amount.gt(resultAllowance) &&
                                      (amount = resultAllowance),
                                      self.utility.call(
                                          self.web3,
                                          self.contractToken,
                                          token.addr,
                                          'balanceOf',
                                          [
                                              self.accounts[
                                                  self.selectedAccount
                                              ].addr,
                                          ],
                                          function(
                                              errBalanceOf,
                                              resultBalanceOf
                                          ) {
                                              if (
                                                  (amount.gt(resultBalanceOf) &&
                                                      amount.lt(
                                                          resultBalanceOf.times(
                                                              new BigNumber(1.1)
                                                          )
                                                      ) &&
                                                      (amount = resultBalanceOf),
                                                  amount.lte(resultBalanceOf))
                                              ) {
                                                  var txs = [];
                                                  async.series(
                                                      [
                                                          function(
                                                              callbackSeries
                                                          ) {
                                                              resultAllowance.eq(
                                                                  0
                                                              )
                                                                  ? self.utility.send(
                                                                        self.web3,
                                                                        self.ledgerEth,
                                                                        self.contractToken,
                                                                        addr,
                                                                        'approve',
                                                                        [
                                                                            self.selectedContract,
                                                                            amount,
                                                                            {
                                                                                gas:
                                                                                    self
                                                                                        .config
                                                                                        .gasApprove,
                                                                                gasPrice:
                                                                                    self.ethGasPrice,
                                                                                value: 0,
                                                                            },
                                                                        ],
                                                                        self
                                                                            .accounts[
                                                                            self
                                                                                .selectedAccount
                                                                        ].addr,
                                                                        self
                                                                            .accounts[
                                                                            self
                                                                                .selectedAccount
                                                                        ].pk,
                                                                        self
                                                                            .accounts[
                                                                            self
                                                                                .selectedAccount
                                                                        ].kind,
                                                                        self.nonce,
                                                                        function(
                                                                            errSend,
                                                                            resultSend
                                                                        ) {
                                                                            (self.nonce =
                                                                                resultSend.nonce),
                                                                                txs.push(
                                                                                    resultSend
                                                                                ),
                                                                                callbackSeries(
                                                                                    null,
                                                                                    {
                                                                                        errSend: errSend,
                                                                                        resultSend: resultSend,
                                                                                    }
                                                                                );
                                                                        }
                                                                    )
                                                                  : callbackSeries(
                                                                        null,
                                                                        void 0
                                                                    );
                                                          },
                                                          function(
                                                              callbackSeries
                                                          ) {
                                                              self.utility.send(
                                                                  self.web3,
                                                                  self.ledgerEth,
                                                                  self.contractEtherDelta,
                                                                  self.selectedContract,
                                                                  'depositToken',
                                                                  [
                                                                      addr,
                                                                      amount,
                                                                      {
                                                                          gas:
                                                                              self
                                                                                  .config
                                                                                  .gasDeposit,
                                                                          gasPrice:
                                                                              self.ethGasPrice,
                                                                          value: 0,
                                                                      },
                                                                  ],
                                                                  self.accounts[
                                                                      self
                                                                          .selectedAccount
                                                                  ].addr,
                                                                  self.accounts[
                                                                      self
                                                                          .selectedAccount
                                                                  ].pk,
                                                                  self.accounts[
                                                                      self
                                                                          .selectedAccount
                                                                  ].kind,
                                                                  self.nonce,
                                                                  function(
                                                                      errSend,
                                                                      resultSend
                                                                  ) {
                                                                      (self.nonce =
                                                                          resultSend.nonce),
                                                                          txs.push(
                                                                              resultSend
                                                                          ),
                                                                          callbackSeries(
                                                                              null,
                                                                              {
                                                                                  errSend: errSend,
                                                                                  resultSend: resultSend,
                                                                              }
                                                                          );
                                                                  }
                                                              );
                                                          },
                                                      ],
                                                      function(err, results) {
                                                          var _results = _slicedToArray(
                                                                  results,
                                                                  2
                                                              ),
                                                              tx1 = _results[0],
                                                              tx2 = _results[1],
                                                              errSend1 = tx1
                                                                  ? tx1.errSend1
                                                                  : void 0,
                                                              errSend2 = tx2
                                                                  ? tx2.errSend1
                                                                  : void 0;
                                                          self.addPending(
                                                              errSend1 ||
                                                                  errSend2,
                                                              txs
                                                          ),
                                                              self.alertTxResult(
                                                                  errSend1 ||
                                                                      errSend2,
                                                                  txs
                                                              ),
                                                              ga('send', {
                                                                  hitType:
                                                                      'event',
                                                                  eventCategory:
                                                                      'Action',
                                                                  eventAction:
                                                                      'Deposit',
                                                                  eventLabel:
                                                                      token.name,
                                                                  eventValue: inputAmount,
                                                              });
                                                      }
                                                  );
                                              } else
                                                  self.dialogError(
                                                      "You can't deposit more tokens than you have."
                                                  ),
                                                      ga('send', {
                                                          hitType: 'event',
                                                          eventCategory:
                                                              'Error',
                                                          eventAction:
                                                              'Deposit - not enough balance',
                                                          eventLabel:
                                                              token.name,
                                                          eventValue: inputAmount,
                                                      });
                                          }
                                      );
                              }
                          );
                }),
                (self.withdraw = function(addr, amountIn) {
                    var amount = self.utility.ethToWei(
                            amountIn,
                            self.getDivisor(addr)
                        ),
                        token = self.getToken(addr);
                    if (amount.lte(0))
                        return (
                            self.dialogError(
                                'You must specify a valid amount to withdraw.'
                            ),
                            void ga('send', {
                                hitType: 'event',
                                eventCategory: 'Error',
                                eventAction: 'Withdraw - invalid amount',
                                eventLabel: token.name,
                                eventValue: amountIn,
                            })
                        );
                    self.utility.call(
                        self.web3,
                        self.contractEtherDelta,
                        self.selectedContract,
                        'balanceOf',
                        [addr, self.accounts[self.selectedAccount].addr],
                        function(err, result) {
                            var balance = result;
                            amount.gt(balance) && (amount = balance),
                                amount.lte(0)
                                    ? (self.dialogError(
                                          "You don't have anything to withdraw."
                                      ),
                                      ga('send', {
                                          hitType: 'event',
                                          eventCategory: 'Error',
                                          eventAction:
                                              'Withdraw - nothing to withdraw',
                                          eventLabel: token.name,
                                          eventValue: amountIn,
                                      }))
                                    : '0x0000000000000000000000000000000000000' ===
                                      addr.slice(0, 39)
                                      ? self.utility.send(
                                            self.web3,
                                            self.ledgerEth,
                                            self.contractEtherDelta,
                                            self.selectedContract,
                                            'withdraw',
                                            [
                                                amount,
                                                {
                                                    gas:
                                                        self.config.gasWithdraw,
                                                    gasPrice: self.ethGasPrice,
                                                    value: 0,
                                                },
                                            ],
                                            self.accounts[self.selectedAccount]
                                                .addr,
                                            self.accounts[self.selectedAccount]
                                                .pk,
                                            self.accounts[self.selectedAccount]
                                                .kind,
                                            self.nonce,
                                            function(errSend, resultSend) {
                                                (self.nonce = resultSend.nonce),
                                                    self.addPending(errSend, {
                                                        txHash:
                                                            resultSend.txHash,
                                                    }),
                                                    self.alertTxResult(
                                                        errSend,
                                                        resultSend
                                                    ),
                                                    ga('send', {
                                                        hitType: 'event',
                                                        eventCategory: 'Action',
                                                        eventAction: 'Withdraw',
                                                        eventLabel: token.name,
                                                        eventValue: amountIn,
                                                    });
                                            }
                                        )
                                      : self.utility.send(
                                            self.web3,
                                            self.ledgerEth,
                                            self.contractEtherDelta,
                                            self.selectedContract,
                                            'withdrawToken',
                                            [
                                                addr,
                                                amount,
                                                {
                                                    gas:
                                                        self.config.gasWithdraw,
                                                    gasPrice: self.ethGasPrice,
                                                    value: 0,
                                                },
                                            ],
                                            self.accounts[self.selectedAccount]
                                                .addr,
                                            self.accounts[self.selectedAccount]
                                                .pk,
                                            self.accounts[self.selectedAccount]
                                                .kind,
                                            self.nonce,
                                            function(errSend, resultSend) {
                                                (self.nonce = resultSend.nonce),
                                                    self.addPending(errSend, {
                                                        txHash:
                                                            resultSend.txHash,
                                                    }),
                                                    self.alertTxResult(
                                                        errSend,
                                                        resultSend
                                                    ),
                                                    ga('send', {
                                                        hitType: 'event',
                                                        eventCategory: 'Action',
                                                        eventAction: 'Withdraw',
                                                        eventLabel: token.name,
                                                        eventValue: amountIn,
                                                    });
                                            }
                                        );
                        }
                    );
                }),
                (self.order = function(
                    tokenAddr,
                    baseAddr,
                    direction,
                    amount,
                    price,
                    expires
                ) {
                    if ('buy' !== direction && 'sell' !== direction)
                        throw new Error('Invalid direction');
                    if (!price) throw new Error('Invalid price');
                    self.utility.blockNumber(self.web3, function(
                        err,
                        blockNumber
                    ) {
                        var orderObj = {
                            baseAddr: baseAddr,
                            tokenAddr: tokenAddr,
                            direction: direction,
                            amount: amount,
                            price: price,
                            expires: expires,
                        };
                        blockNumber >= 0 &&
                            ((orderObj.expiration =
                                Number(orderObj.expires) + blockNumber),
                            (orderObj.nonce = self.utility.getRandomInt(
                                0,
                                Math.pow(2, 32)
                            )),
                            self.publishOrder(
                                orderObj.baseAddr,
                                orderObj.tokenAddr,
                                orderObj.direction,
                                orderObj.amount,
                                orderObj.price,
                                orderObj.expiration,
                                orderObj.nonce
                            ));
                    });
                }),
                (self.publishOrder = function(
                    baseAddr,
                    tokenAddr,
                    direction,
                    amountIn,
                    priceIn,
                    expires,
                    orderNonce
                ) {
                    var tokenGet = void 0,
                        tokenGive = void 0,
                        amountGet = void 0,
                        amountGive = void 0,
                        amount = new BigNumber(amountIn),
                        price = new BigNumber(priceIn);
                    if (!self.accounts[self.selectedAccount])
                        return (
                            self.dialogError(
                                "You haven't selected an account. Make sure you have an account selected from the Accounts dropdown in the upper right."
                            ),
                            void ga('send', {
                                hitType: 'event',
                                eventCategory: 'Error',
                                eventAction: 'Order - no account selected',
                                eventLabel:
                                    self.selectedToken.name +
                                    '/' +
                                    self.selectedBase.name,
                            })
                        );
                    if ('buy' === direction) {
                        (tokenGet = tokenAddr),
                            (tokenGive = baseAddr),
                            (amountGet = self.utility.ethToWei(
                                amount,
                                self.getDivisor(tokenGet)
                            ));
                        var amountGetEth = self.utility.weiToEth(
                            amountGet,
                            self.getDivisor(tokenGet)
                        );
                        amountGive = self.utility.ethToWei(
                            amountGetEth.times(price),
                            self.getDivisor(tokenGive)
                        );
                    } else {
                        if ('sell' !== direction) return;
                        (tokenGet = baseAddr),
                            (tokenGive = tokenAddr),
                            (amountGive = self.utility.ethToWei(
                                amount,
                                self.getDivisor(tokenGive)
                            ));
                        var amountGiveEth = self.utility.weiToEth(
                            amountGive,
                            self.getDivisor(tokenGive)
                        );
                        amountGet = self.utility.ethToWei(
                            amountGiveEth.times(price),
                            self.getDivisor(tokenGet),
                            !0
                        );
                    }
                    self.utility.call(
                        self.web3,
                        self.contractEtherDelta,
                        self.selectedContract,
                        'balanceOf',
                        [tokenGive, self.accounts[self.selectedAccount].addr],
                        function(err, result) {
                            if (result.lt(new BigNumber(amountGive)))
                                self.dialogError(
                                    "You do not have enough funds to send this order. Please DEPOSIT first using the Deposit form in the upper left. Enter the amount you want to deposit and press the 'Deposit' button."
                                ),
                                    ga('send', {
                                        hitType: 'event',
                                        eventCategory: 'Error',
                                        eventAction: 'Order - not enough funds',
                                        eventLabel:
                                            self.selectedToken.name +
                                            '/' +
                                            self.selectedBase.name,
                                    });
                            else if (!self.config.ordersOnchain) {
                                var condensed = self.utility.pack(
                                        [
                                            self.selectedContract,
                                            tokenGet,
                                            amountGet,
                                            tokenGive,
                                            amountGive,
                                            expires,
                                            orderNonce,
                                        ],
                                        [160, 160, 256, 160, 256, 256, 256]
                                    ),
                                    hash = sha256(new Buffer(condensed, 'hex'));
                                self.utility.sign(
                                    self.web3,
                                    self.ledgerEth,
                                    self.accounts[self.selectedAccount].addr,
                                    self.accounts[self.selectedAccount].pk,
                                    self.accounts[self.selectedAccount].kind,
                                    hash,
                                    function(errSign, sig) {
                                        if (errSign)
                                            console.log(errSign),
                                                self.dialogError(
                                                    'Order signing failed. Make sure you have an account selected from the Accounts dropdown in the upper right.'
                                                ),
                                                ga('send', {
                                                    hitType: 'event',
                                                    eventCategory: 'Error',
                                                    eventAction:
                                                        'Order - could not sign',
                                                    eventLabel:
                                                        self.selectedToken
                                                            .name +
                                                        '/' +
                                                        self.selectedBase.name,
                                                });
                                        else {
                                            var order = {
                                                contractAddr:
                                                    self.selectedContract,
                                                tokenGet: tokenGet,
                                                amountGet: amountGet,
                                                tokenGive: tokenGive,
                                                amountGive: amountGive,
                                                expires: expires,
                                                nonce: orderNonce,
                                                v: sig.v,
                                                r: sig.r,
                                                s: sig.s,
                                                user:
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].addr,
                                            };
                                            self.socket &&
                                                (self.alertSuccess(
                                                    'You sent an order to the order book. Please wait for it to be processed.'
                                                ),
                                                self.socket.emit(
                                                    'message',
                                                    order
                                                ),
                                                self.socket.once(
                                                    'messageResult',
                                                    function(messageResult) {
                                                        console.log(
                                                            messageResult
                                                        ),
                                                            ga('send', {
                                                                hitType:
                                                                    'event',
                                                                eventCategory:
                                                                    'Action',
                                                                eventAction:
                                                                    'Order',
                                                                eventLabel:
                                                                    self
                                                                        .selectedToken
                                                                        .name +
                                                                    '/' +
                                                                    self
                                                                        .selectedBase
                                                                        .name,
                                                            });
                                                    }
                                                ));
                                        }
                                    }
                                );
                            }
                        }
                    );
                }),
                (self.cancelOrder = function(order) {
                    order.user.toLowerCase() ===
                        self.accounts[
                            self.selectedAccount
                        ].addr.toLowerCase() &&
                        self.utility.send(
                            self.web3,
                            self.ledgerEth,
                            self.contractEtherDelta,
                            self.selectedContract,
                            'cancelOrder',
                            [
                                order.tokenGet,
                                order.amountGet,
                                order.tokenGive,
                                order.amountGive,
                                order.expires,
                                order.nonce,
                                order.v,
                                order.r,
                                order.s,
                                {
                                    gas: self.config.gasTrade,
                                    gasPrice: self.ethGasPrice,
                                    value: 0,
                                },
                            ],
                            self.accounts[self.selectedAccount].addr,
                            self.accounts[self.selectedAccount].pk,
                            self.accounts[self.selectedAccount].kind,
                            self.nonce,
                            function(err, result) {
                                (self.txHash = result.txHash),
                                    (self.nonce = result.nonce),
                                    self.addPending(err, {
                                        txHash: result.txHash,
                                    }),
                                    self.alertTxResult(err, result),
                                    ga('send', {
                                        hitType: 'event',
                                        eventCategory: 'Action',
                                        eventAction: 'Cancel order',
                                        eventLabel:
                                            self.selectedToken.name +
                                            '/' +
                                            self.selectedBase.name,
                                    });
                            }
                        );
                }),
                (self.trade = function(kind, order, inputAmountIn) {
                    if (!self.accounts[self.selectedAccount])
                        return (
                            self.dialogError(
                                "You haven't selected an account. Make sure you have an account selected from the Accounts dropdown in the upper right."
                            ),
                            void ga('send', {
                                hitType: 'event',
                                eventCategory: 'Error',
                                eventAction: 'Trade - no account selected',
                                eventLabel:
                                    self.selectedToken.name +
                                    '/' +
                                    self.selectedBase.name,
                            })
                        );
                    var inputAmount = new BigNumber(inputAmountIn),
                        amount = void 0;
                    if ('sell' === kind)
                        amount = self.utility.ethToWei(
                            inputAmount,
                            self.getDivisor(order.tokenGet)
                        );
                    else {
                        if ('buy' !== kind) return;
                        amount = self.utility.ethToWei(
                            inputAmount
                                .times(order.amountGet)
                                .div(order.amountGive),
                            self.getDivisor(order.tokenGive)
                        );
                    }
                    self.utility.call(
                        self.web3,
                        self.contractEtherDelta,
                        self.selectedContract,
                        'balanceOf',
                        [
                            order.tokenGet,
                            self.accounts[self.selectedAccount].addr,
                        ],
                        function(err, result) {
                            var availableBalance = result;
                            self.utility.call(
                                self.web3,
                                self.contractEtherDelta,
                                self.selectedContract,
                                'availableVolume',
                                [
                                    order.tokenGet,
                                    order.amountGet,
                                    order.tokenGive,
                                    order.amountGive,
                                    order.expires,
                                    order.nonce,
                                    order.user,
                                    order.v,
                                    order.r,
                                    order.s,
                                ],
                                function(
                                    errAvailableVolume,
                                    resultAvailableVolume
                                ) {
                                    var availableVolume = resultAvailableVolume;
                                    amount.gt(
                                        availableBalance.divToInt(1.0031)
                                    ) &&
                                        (amount = availableBalance.divToInt(
                                            1.0031
                                        )),
                                        amount.gt(availableVolume) &&
                                            (amount = availableVolume);
                                    var v = order.v,
                                        r = order.r,
                                        s = order.s;
                                    (v && r && s) ||
                                        ((v = 0), (r = '0x0'), (s = '0x0')),
                                        self.utility.call(
                                            self.web3,
                                            self.contractEtherDelta,
                                            self.selectedContract,
                                            'testTrade',
                                            [
                                                order.tokenGet,
                                                order.amountGet,
                                                order.tokenGive,
                                                order.amountGive,
                                                order.expires,
                                                order.nonce,
                                                order.user,
                                                v,
                                                r,
                                                s,
                                                amount,
                                                self.accounts[
                                                    self.selectedAccount
                                                ].addr,
                                            ],
                                            function(
                                                errTestTrade,
                                                resultTestTrade
                                            ) {
                                                var reportedAvailableVolume = new BigNumber(
                                                    'buy' === kind
                                                        ? order.availableVolumeBase
                                                        : order.availableVolume
                                                );
                                                availableVolume.lt(
                                                    reportedAvailableVolume.div(
                                                        4
                                                    )
                                                )
                                                    ? (self.dialogError(
                                                          "You cannot trade this order because it already traded. Someone else already traded this order and the order book hasn't updated yet."
                                                      ),
                                                      ga('send', {
                                                          hitType: 'event',
                                                          eventCategory:
                                                              'Error',
                                                          eventAction:
                                                              'Trade - failed',
                                                          eventLabel:
                                                              self.selectedToken
                                                                  .name +
                                                              '/' +
                                                              self.selectedBase
                                                                  .name,
                                                          eventValue: inputAmount,
                                                      }))
                                                    : availableBalance.lte(
                                                          new BigNumber(0)
                                                      )
                                                      ? (self.dialogError(
                                                            "You cannot trade this order because you don't have enough funds. Please DEPOSIT first using the Deposit form in the upper left. Enter the amount you want to deposit and press the 'Deposit' button."
                                                        ),
                                                        ga('send', {
                                                            hitType: 'event',
                                                            eventCategory:
                                                                'Error',
                                                            eventAction:
                                                                'Trade - failed',
                                                            eventLabel:
                                                                self
                                                                    .selectedToken
                                                                    .name +
                                                                '/' +
                                                                self
                                                                    .selectedBase
                                                                    .name,
                                                            eventValue: inputAmount,
                                                        }))
                                                      : !resultTestTrade ||
                                                        amount.lte(
                                                            new BigNumber(0)
                                                        )
                                                        ? (self.dialogError(
                                                              "You cannot trade this order because it already traded. Someone else already traded this order and the order book hasn't updated yet."
                                                          ),
                                                          ga('send', {
                                                              hitType: 'event',
                                                              eventCategory:
                                                                  'Error',
                                                              eventAction:
                                                                  'Trade - failed',
                                                              eventLabel:
                                                                  self
                                                                      .selectedToken
                                                                      .name +
                                                                  '/' +
                                                                  self
                                                                      .selectedBase
                                                                      .name,
                                                              eventValue: inputAmount,
                                                          }))
                                                        : self.utility.send(
                                                              self.web3,
                                                              self.ledgerEth,
                                                              self.contractEtherDelta,
                                                              self.selectedContract,
                                                              'trade',
                                                              [
                                                                  order.tokenGet,
                                                                  order.amountGet,
                                                                  order.tokenGive,
                                                                  order.amountGive,
                                                                  order.expires,
                                                                  order.nonce,
                                                                  order.user,
                                                                  v,
                                                                  r,
                                                                  s,
                                                                  amount,
                                                                  {
                                                                      gas:
                                                                          self
                                                                              .config
                                                                              .gasTrade,
                                                                      gasPrice:
                                                                          self.ethGasPrice,
                                                                      value: 0,
                                                                  },
                                                              ],
                                                              self.accounts[
                                                                  self
                                                                      .selectedAccount
                                                              ].addr,
                                                              self.accounts[
                                                                  self
                                                                      .selectedAccount
                                                              ].pk,
                                                              self.accounts[
                                                                  self
                                                                      .selectedAccount
                                                              ].kind,
                                                              self.nonce,
                                                              function(
                                                                  errSend,
                                                                  resultSend
                                                              ) {
                                                                  (self.nonce =
                                                                      resultSend.nonce),
                                                                      self.addPending(
                                                                          errSend,
                                                                          {
                                                                              txHash:
                                                                                  resultSend.txHash,
                                                                          }
                                                                      ),
                                                                      self.alertTxResult(
                                                                          errSend,
                                                                          resultSend
                                                                      ),
                                                                      ga(
                                                                          'send',
                                                                          {
                                                                              hitType:
                                                                                  'event',
                                                                              eventCategory:
                                                                                  'Action',
                                                                              eventAction:
                                                                                  'Trade',
                                                                              eventLabel:
                                                                                  self
                                                                                      .selectedToken
                                                                                      .name +
                                                                                  '/' +
                                                                                  self
                                                                                      .selectedBase
                                                                                      .name,
                                                                              eventValue: inputAmount,
                                                                          }
                                                                      );
                                                              }
                                                          );
                                            }
                                        );
                                }
                            );
                        }
                    );
                }),
                (self.addPending = function(err, txsIn) {
                    (Array.isArray(txsIn) ? txsIn : [txsIn]).forEach(function(
                        tx
                    ) {
                        !err &&
                            tx.txHash &&
                            '0x0000000000000000000000000000000000000000000000000000000000000000' !==
                                tx.txHash &&
                            (Object.assign(tx, {
                                txLink: 'https://etherscan.io/tx/' + tx.txHash,
                            }),
                            self.store.dispatch({
                                type: 'NEW_PENDING',
                                value: tx,
                            }));
                    }),
                        self.refresh(function() {});
                }),
                (self.updateUrl = function() {
                    var tokenName = self.selectedToken.name,
                        baseName = self.selectedBase.name,
                        tokenAddr = self.selectedToken.addr,
                        baseAddr = self.selectedBase.addr;
                    0 ===
                        self.config.tokens.filter(function(x) {
                            return x.addr === tokenAddr;
                        }).length && (tokenName = self.selectedToken.addr),
                        0 ===
                            self.config.tokens.filter(function(x) {
                                return x.addr === baseAddr;
                            }).length && (baseName = self.selectedBase.addr),
                        (window.location.hash =
                            '#!/trade/' + tokenName + '-' + baseName),
                        (window.document.title =
                            'ForkDelta ' + tokenName + '/' + baseName);
                }),
                (self.getDivisor = function(tokenOrAddress) {
                    var result = 1e18,
                        token = self.getToken(tokenOrAddress);
                    return (
                        token &&
                            void 0 !== token.decimals &&
                            (result = Math.pow(10, token.decimals)),
                        new BigNumber(result)
                    );
                }),
                (self.getToken = function(addrOrToken, name, decimals) {
                    var result = void 0,
                        lowerAddrOrToken =
                            'string' == typeof addrOrToken
                                ? addrOrToken.toLowerCase()
                                : addrOrToken,
                        matchingTokens = self.config.tokens.filter(function(x) {
                            return (
                                x.addr.toLowerCase() === lowerAddrOrToken ||
                                x.name === addrOrToken
                            );
                        }),
                        expectedKeys = JSON.stringify([
                            'addr',
                            'decimals',
                            'name',
                        ]);
                    return (
                        matchingTokens.length > 0
                            ? (result = matchingTokens[0])
                            : self.selectedToken.addr &&
                              self.selectedToken.addr.toLowerCase() ===
                                  lowerAddrOrToken
                              ? (result = self.selectedToken)
                              : self.selectedBase.addr &&
                                self.selectedBase.addr.toLowerCase() ===
                                    lowerAddrOrToken
                                ? (result = self.selectedBase)
                                : addrOrToken &&
                                  addrOrToken.addr &&
                                  JSON.stringify(
                                      Object.keys(addrOrToken).sort()
                                  ) === expectedKeys
                                  ? (result = addrOrToken)
                                  : 'string' == typeof addrOrToken &&
                                    '0x' === addrOrToken.slice(0, 2) &&
                                    name &&
                                    decimals >= 0 &&
                                    (((result = JSON.parse(
                                        JSON.stringify(self.config.tokens[0])
                                    )).addr = lowerAddrOrToken),
                                    (result.name = name),
                                    (result.decimals = decimals)),
                        result
                    );
                }),
                (self.loadToken = function(addr, callback) {
                    var token = self.getToken(addr);
                    token
                        ? callback(null, token)
                        : ((token = JSON.parse(
                              JSON.stringify(self.config.tokens[0])
                          )),
                          '0x' === addr.slice(0, 2)
                              ? ((token.addr = addr.toLowerCase()),
                                self.utility.call(
                                    self.web3,
                                    self.contractToken,
                                    token.addr,
                                    'decimals',
                                    [],
                                    function(err, result) {
                                        !err && result > 0
                                            ? ((token.decimals = result.toNumber()),
                                              self.utility.call(
                                                  self.web3,
                                                  self.contractToken,
                                                  token.addr,
                                                  'name',
                                                  [],
                                                  function(
                                                      errName,
                                                      resultName
                                                  ) {
                                                      (token.name =
                                                          !errName && resultName
                                                              ? resultName.slice(
                                                                    0,
                                                                    12
                                                                )
                                                              : token.addr.slice(
                                                                    2,
                                                                    6
                                                                )),
                                                          callback(null, token);
                                                  }
                                              ))
                                            : callback(
                                                  'Token has no decimals',
                                                  void 0
                                              );
                                    }
                                ))
                              : callback(null, token));
                }),
                (self.selectToken = function(addrOrToken, name, decimals) {
                    var token = self.getToken(addrOrToken, name, decimals);
                    token &&
                        (self.refresh(
                            function() {},
                            !0,
                            token,
                            self.selectedBase
                        ),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Token',
                            eventAction: 'Select Token',
                            eventLabel: self.selectedToken.name,
                        }));
                }),
                (self.selectTokenAndBase = function(tokenAddr, baseAddr) {
                    var token = self.getToken(tokenAddr),
                        base = self.getToken(baseAddr);
                    token &&
                        base &&
                        (self.refresh(function() {}, !0, token, base),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Token',
                            eventAction: 'Select Pair',
                            eventLabel:
                                self.selectedToken.name +
                                '/' +
                                self.selectedBase.name,
                        }));
                }),
                (self.setGasPrice = function(ethGasPrice, multiplied) {
                    if (ethGasPrice) {
                        var newEthGasPrice = multiplied
                            ? Number(ethGasPrice)
                            : 1e9 * Number(ethGasPrice);
                        self.store.dispatch({
                            type: 'UPDATE_SETTINGS',
                            value: { ethGasPrice: newEthGasPrice },
                        }),
                            self.utility.createCookie(
                                'ethGasPrice',
                                JSON.stringify(newEthGasPrice),
                                999
                            );
                    }
                }),
                (self.displayScreencast = function(name) {
                    $('#screencastBody').html('');
                    var screencast = new EJS({
                        url: window.location.origin + '/help/' + name + '.ejs',
                    }).render({});
                    self.store.dispatch({
                        type: 'UPDATE_PAGE',
                        value: { screencast: screencast },
                    }),
                        self.openModal('screencast'),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Display',
                            eventAction: 'Screencast',
                            eventLabel: name,
                        });
                }),
                (self.displayTokenGuide = function(tokenIn) {
                    var token = tokenIn,
                        matchingTokens = self.config.tokens.filter(function(x) {
                            return tokenIn.addr === x.addr;
                        });
                    1 === matchingTokens.length && (token = matchingTokens[0]);
                    var tokenLink = 'https://etherscan.io/token/' + token.addr,
                        details = new EJS({
                            url:
                                window.location.origin +
                                '/tokenGuides/details.ejs',
                        }).render({ token: token, tokenLink: tokenLink }),
                        guide = '';
                    try {
                        1 === matchingTokens.length &&
                            (guide = new EJS({
                                url:
                                    window.location.origin +
                                    '/tokenGuides/' +
                                    token.name +
                                    '.ejs',
                            }).render());
                    } catch (err) {
                        console.log(err);
                    }
                    self.store.dispatch({
                        type: 'UPDATE_PAGE',
                        value: { tokenTitle: name },
                    }),
                        self.store.dispatch({
                            type: 'UPDATE_PAGE',
                            value: { tokenGuide: details + guide },
                        }),
                        self.openModal('tokenGuide'),
                        ga('send', {
                            hitType: 'event',
                            eventCategory: 'Display',
                            eventAction: 'Token Guide',
                            eventLabel: name,
                        });
                }),
                (self.checkContractUpgrade = function() {
                    self.selectedContract &&
                        self.selectedContract !==
                            self.config.contractEtherDeltaAddrs[0] &&
                        self.accounts.length >= 1 &&
                        self.dialogInfo(
                            '<p>ForkDelta has a new smart contract. It is now selected.</p><p>Please use the "Smart Contract" menu to select the old one and withdraw from it.</p><p><a href="javascript:;" class="btn btn-default" onclick="alertify.closeAll();</p>'
                        );
                }),
                (self.initData = function(initMarket, callback) {
                    async.parallel(
                        [
                            function(callbackParallel) {
                                (!initMarket &&
                                    self.state.returnTicker &&
                                    self.state.trades &&
                                    self.state.orders &&
                                    self.state.myTrades &&
                                    self.state.myFunds &&
                                    self.state.myOrders) ||
                                !self.socket ||
                                self.selectedContract !==
                                    self.config.contractEtherDeltaAddrs[0].addr
                                    ? callbackParallel()
                                    : (self.socket.emit('getMarket', {
                                          token: self.selectedToken.addr,
                                          user: self.accounts[
                                              self.selectedAccount
                                          ]
                                              ? self.accounts[
                                                    self.selectedAccount
                                                ].addr
                                              : void 0,
                                      }),
                                      self.socket.once('market', function(
                                          result
                                      ) {
                                          var returnTicker =
                                                  result.returnTicker,
                                              trades = result.trades,
                                              orders = result.orders,
                                              myTrades = result.myTrades,
                                              myOrders = result.myOrders,
                                              myFunds = result.myFunds;
                                          returnTicker &&
                                              self.store.dispatch({
                                                  type: 'UPDATE_RETURN_TICKER',
                                                  value: self.transformReturnTicker(
                                                      returnTicker
                                                  ),
                                              }),
                                              trades &&
                                                  self.store.dispatch({
                                                      type: 'UPDATE_TRADES',
                                                      value: self.transformTrades(
                                                          trades
                                                      ),
                                                  }),
                                              orders &&
                                                  self.store.dispatch({
                                                      type: 'UPDATE_ORDERS',
                                                      value: self.transformOrders(
                                                          orders
                                                      ),
                                                  }),
                                              myTrades &&
                                                  self.store.dispatch({
                                                      type: 'UPDATE_MY_TRADES',
                                                      value: self.transformTrades(
                                                          myTrades
                                                      ),
                                                  }),
                                              myOrders &&
                                                  self.store.dispatch({
                                                      type: 'UPDATE_MY_ORDERS',
                                                      value: self.transformOrders(
                                                          myOrders
                                                      ),
                                                  }),
                                              myFunds &&
                                                  self.store.dispatch({
                                                      type: 'UPDATE_MY_FUNDS',
                                                      value: self.transformFunds(
                                                          myFunds
                                                      ),
                                                  }),
                                              callbackParallel();
                                      }));
                            },
                        ],
                        function() {
                            callback();
                        }
                    );
                }),
                (self.clearData = function(callback) {
                    self.store.dispatch({ type: 'CLEAR_TRADES' }),
                        self.store.dispatch({ type: 'CLEAR_ORDERS' }),
                        self.store.dispatch({ type: 'CLEAR_MY_TRADES' }),
                        self.store.dispatch({ type: 'CLEAR_MY_FUNDS' }),
                        self.store.dispatch({ type: 'CLEAR_MY_ORDERS' }),
                        callback();
                }),
                (self.refresh = function(callback, initMarket, token, base) {
                    self.q.push(function(done) {
                        if (
                            (token &&
                                base &&
                                ((self.selectedToken = token),
                                (self.selectedBase = base),
                                self.store.dispatch({
                                    type: 'UPDATE_SELECTED_TOKEN',
                                    value: self.selectedToken,
                                }),
                                self.store.dispatch({
                                    type: 'UPDATE_SELECTED_BASE',
                                    value: self.selectedBase,
                                }),
                                self.clearData(function() {})),
                            'ETH' === self.selectedToken.name)
                        ) {
                            var temp = self.selectedBase;
                            (self.selectedBase = self.selectedToken),
                                (self.selectedToken = temp),
                                self.store.dispatch({
                                    type: 'UPDATE_SELECTED_TOKEN',
                                    value: self.selectedToken,
                                }),
                                self.store.dispatch({
                                    type: 'UPDATE_SELECTED_BASE',
                                    value: self.selectedBase,
                                }),
                                self.clearData(function() {});
                        }
                        'ETH' !== self.selectedBase.name &&
                            ((self.selectedBase = self.config.tokens[0]),
                            self.store.dispatch({
                                type: 'UPDATE_SELECTED_BASE',
                                value: self.selectedBase,
                            }),
                            self.clearData(function() {})),
                            console.log(
                                'Beginning refresh',
                                new Date(),
                                self.selectedToken.name +
                                    '/' +
                                    self.selectedBase.name
                            ),
                            self.utility.createCookie(
                                self.config.userCookie,
                                JSON.stringify({
                                    accounts: self.accounts,
                                    selectedAccount: self.selectedAccount,
                                    selectedToken: self.selectedToken,
                                    selectedBase: self.selectedBase,
                                    selectedContract: self.selectedContract,
                                }),
                                999
                            ),
                            async.series(
                                [
                                    function(callbackSeries) {
                                        initMarket &&
                                            (self.clearData(function() {}),
                                            self.updateUrl()),
                                            callbackSeries();
                                    },
                                    function(callbackSeries) {
                                        self.utility.blockNumber(
                                            self.web3,
                                            function(err, blockNumber) {
                                                self.store.dispatch({
                                                    type: 'UPDATE_BLOCKNUMBER',
                                                    value: blockNumber,
                                                }),
                                                    callbackSeries();
                                            }
                                        );
                                    },
                                    function(callbackSeries) {
                                        async.parallel(
                                            [
                                                function(callbackParallel) {
                                                    self.initData(
                                                        initMarket,
                                                        function() {
                                                            callbackParallel();
                                                        }
                                                    );
                                                },
                                                function(callbackParallel) {
                                                    (initMarket ||
                                                        !self.lastUpdatedBalances ||
                                                        new Date() -
                                                            self.lastUpdatedBalances >
                                                            6e4) &&
                                                        ((self.lastUpdatedBalances = new Date()),
                                                        self.updateAccounts(
                                                            function() {}
                                                        )),
                                                        callbackParallel();
                                                },
                                                function(callbackParallel) {
                                                    self.updatePending(
                                                        function() {
                                                            callbackParallel();
                                                        }
                                                    );
                                                },
                                            ],
                                            function() {
                                                callbackSeries();
                                            }
                                        );
                                    },
                                ],
                                function() {
                                    self.translatePage(),
                                        console.log(
                                            'Ending refresh',
                                            new Date()
                                        ),
                                        done(),
                                        callback();
                                }
                            );
                    });
                }),
                (self.refreshLoop = function() {
                    function loop() {
                        self.refresh(function() {
                            setTimeout(loop, self.refreshInterval);
                        });
                    }
                    self.refresh(function() {
                        loop();
                    }, !0);
                }),
                (self.displaySellTrade = function(order) {
                    self.store.dispatch({
                        type: 'UPDATE_FORM',
                        value: { sellOrder: order },
                    }),
                        self.store.dispatch({
                            type: 'OPEN_MODAL',
                            value: 'sellTrade',
                        });
                }),
                (self.displayBuyTrade = function(order) {
                    self.store.dispatch({
                        type: 'UPDATE_FORM',
                        value: { buyOrder: order },
                    }),
                        self.store.dispatch({
                            type: 'OPEN_MODAL',
                            value: 'buyTrade',
                        });
                }),
                (self.openModal = function(modal) {
                    self.store.dispatch({ type: 'OPEN_MODAL', value: modal });
                }),
                (self.closeModal = function(modal) {
                    self.store.dispatch({ type: 'CLOSE_MODAL', value: modal });
                }),
                (self.initDisplays = function(callback) {
                    ReactDOM.render(
                        React.createElement(_chartPrice2.default, {
                            store: self.store,
                        }),
                        document.getElementById('chartPrice')
                    ),
                        ReactDOM.render(
                            React.createElement(_chartDepth2.default, {
                                store: self.store,
                                weiToEth: function(amount, token, round) {
                                    return self.utility.weiToEth(
                                        amount,
                                        token,
                                        round
                                    );
                                },
                                getDivisor: function(token) {
                                    return self.getDivisor(token);
                                },
                            }),
                            document.getElementById('chartDepth')
                        ),
                        ReactDOM.render(
                            React.createElement(_sellTrade2.default, {
                                store: self.store,
                                self: self,
                                weiToEth: function(amount, token, round) {
                                    return self.utility.weiToEth(
                                        amount,
                                        token,
                                        round
                                    );
                                },
                                getDivisor: function(token) {
                                    return self.getDivisor(token);
                                },
                                trade: function(kind, order, inputAmountIn) {
                                    return self.trade(
                                        kind,
                                        order,
                                        inputAmountIn
                                    );
                                },
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                            }),
                            document.getElementById('sellTrade')
                        ),
                        ReactDOM.render(
                            React.createElement(_buyTrade2.default, {
                                store: self.store,
                                self: self,
                                weiToEth: function(amount, token, round) {
                                    return self.utility.weiToEth(
                                        amount,
                                        token,
                                        round
                                    );
                                },
                                getDivisor: function(token) {
                                    return self.getDivisor(token);
                                },
                                trade: function(kind, order, inputAmountIn) {
                                    return self.trade(
                                        kind,
                                        order,
                                        inputAmountIn
                                    );
                                },
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                            }),
                            document.getElementById('buyTrade')
                        ),
                        ReactDOM.render(
                            React.createElement(_screencast2.default, {
                                store: self.store,
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                            }),
                            document.getElementById('screencast')
                        ),
                        ReactDOM.render(
                            React.createElement(_ledger2.default, {
                                store: self.store,
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                            }),
                            document.getElementById('ledger')
                        ),
                        ReactDOM.render(
                            React.createElement(_tokenGuide2.default, {
                                store: self.store,
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                            }),
                            document.getElementById('tokenGuide')
                        ),
                        ReactDOM.render(
                            React.createElement(_importAccount2.default, {
                                store: self.store,
                                self: self,
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                                addAccount: function(addr, pk) {
                                    return self.addAccount(addr, pk);
                                },
                            }),
                            document.getElementById('importAccount')
                        ),
                        ReactDOM.render(
                            React.createElement(_otherToken2.default, {
                                store: self.store,
                                self: self,
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                                selectToken: function(addr, name, decimals) {
                                    return self.selectToken(
                                        addr,
                                        name,
                                        decimals
                                    );
                                },
                            }),
                            document.getElementById('otherToken')
                        ),
                        ReactDOM.render(
                            React.createElement(_gasPrice2.default, {
                                store: self.store,
                                self: self,
                                closeModal: function(modal) {
                                    return self.closeModal(modal);
                                },
                                setGasPrice: function(ethGasPrice) {
                                    return self.setGasPrice(ethGasPrice);
                                },
                            }),
                            document.getElementById('gasPrice')
                        ),
                        ReactDOM.render(
                            React.createElement(_trades2.default, {
                                store: self.store,
                            }),
                            document.getElementById('trades')
                        ),
                        ReactDOM.render(
                            React.createElement(_volume2.default, {
                                store: self.store,
                                self: self,
                                getToken: function(token) {
                                    return self.getToken(token);
                                },
                                selectTokenAndBase: function(token, base) {
                                    return self.selectTokenAndBase(token, base);
                                },
                                tokens: self.config.tokens,
                                bases: self.config.bases,
                            }),
                            document.getElementById('volume')
                        ),
                        ReactDOM.render(
                            React.createElement(_orders2.default, {
                                store: self.store,
                                weiToEth: function(amount, token, round) {
                                    return self.utility.weiToEth(
                                        amount,
                                        token,
                                        round
                                    );
                                },
                                getDivisor: function(token) {
                                    return self.getDivisor(token);
                                },
                                displayBuyTrade: function(order) {
                                    return self.displayBuyTrade(order);
                                },
                                displaySellTrade: function(order) {
                                    return self.displaySellTrade(order);
                                },
                            }),
                            document.getElementById('orders')
                        ),
                        ReactDOM.render(
                            React.createElement(_languages2.default, {
                                store: self.store,
                                self: self,
                                translator: self.translator,
                                selectLanguage: function(language) {
                                    return self.selectLanguage(language);
                                },
                                languages: Object.keys(translations.trades),
                            }),
                            document.getElementById('languages')
                        ),
                        ReactDOM.render(
                            React.createElement(_balance2.default, {
                                store: self.store,
                                self: self,
                                weiToEth: function(amount, token, round) {
                                    return self.utility.weiToEth(
                                        amount,
                                        token,
                                        round
                                    );
                                },
                                getDivisor: function(token) {
                                    return self.getDivisor(token);
                                },
                                translatePage: function() {
                                    return self.translatePage();
                                },
                                displayTokenGuide: function(token) {
                                    return self.displayTokenGuide(token);
                                },
                                deposit: function(tokenAddr, amount) {
                                    return self.deposit(tokenAddr, amount);
                                },
                                withdraw: function(tokenAddr, amount) {
                                    return self.withdraw(tokenAddr, amount);
                                },
                                transfer: function(tokenAddr, amount, toAddr) {
                                    return self.transfer(
                                        tokenAddr,
                                        amount,
                                        toAddr
                                    );
                                },
                            }),
                            document.getElementById('balance')
                        ),
                        ReactDOM.render(
                            React.createElement(_accounts2.default, {
                                store: self.store,
                                self: self,
                                weiToEth: function(amount, token, round) {
                                    return self.utility.weiToEth(
                                        amount,
                                        token,
                                        round
                                    );
                                },
                                getDivisor: function(token) {
                                    return self.getDivisor(token);
                                },
                                selectAccount: function(i) {
                                    return self.selectAccount(i);
                                },
                                createAccount: function() {
                                    return self.createAccount();
                                },
                                deleteAccount: function() {
                                    return self.deleteAccount();
                                },
                                showPrivateKey: function() {
                                    return self.showPrivateKey();
                                },
                                openModal: function(modal) {
                                    return self.openModal(modal);
                                },
                            }),
                            document.getElementById('accounts')
                        ),
                        ReactDOM.render(
                            React.createElement(_buy2.default, {
                                store: self.store,
                                self: self,
                                order: function(
                                    tokenAddr,
                                    baseAddr,
                                    direction,
                                    amount,
                                    price,
                                    expires
                                ) {
                                    return self.order(
                                        tokenAddr,
                                        baseAddr,
                                        direction,
                                        amount,
                                        price,
                                        expires
                                    );
                                },
                            }),
                            document.getElementById('buy')
                        ),
                        ReactDOM.render(
                            React.createElement(_sell2.default, {
                                store: self.store,
                                self: self,
                                order: function(
                                    tokenAddr,
                                    baseAddr,
                                    direction,
                                    amount,
                                    price,
                                    expires
                                ) {
                                    return self.order(
                                        tokenAddr,
                                        baseAddr,
                                        direction,
                                        amount,
                                        price,
                                        expires
                                    );
                                },
                            }),
                            document.getElementById('sell')
                        ),
                        ReactDOM.render(
                            React.createElement(_myTrades2.default, {
                                store: self.store,
                                translator: self.translator,
                            }),
                            document.getElementById('myTrades')
                        ),
                        ReactDOM.render(
                            React.createElement(_myOrders2.default, {
                                store: self.store,
                                self: self,
                                translator: self.translator,
                                weiToEth: function(amount, token, round) {
                                    return self.utility.weiToEth(
                                        amount,
                                        token,
                                        round
                                    );
                                },
                                getDivisor: function(token) {
                                    return self.getDivisor(token);
                                },
                                cancelOrder: function(order) {
                                    return self.cancelOrder(order);
                                },
                            }),
                            document.getElementById('myOrders')
                        ),
                        ReactDOM.render(
                            React.createElement(_myFunds2.default, {
                                store: self.store,
                                translator: self.translator,
                            }),
                            document.getElementById('myFunds')
                        ),
                        ReactDOM.render(
                            React.createElement(_connection2.default, {
                                store: self.store,
                                self: self,
                                contracts: self.config.contractEtherDeltaAddrs,
                                contractAddr: function(_contractAddr) {
                                    return self.contractAddr(_contractAddr);
                                },
                            }),
                            document.getElementById('connection')
                        ),
                        ReactDOM.render(
                            React.createElement(_helpDropdown2.default, {
                                self: self,
                                displayScreencast: function(x) {
                                    return self.displayScreencast(x);
                                },
                            }),
                            document.getElementById('helpDropdown')
                        ),
                        ReactDOM.render(
                            React.createElement(_tokensDropdown2.default, {
                                store: self.store,
                                self: self,
                                tokens: self.config.tokens
                                    .map(function(x) {
                                        return x;
                                    })
                                    .sort(function(a, b) {
                                        return a.name > b.name ? 1 : -1;
                                    }),
                                selectToken: function(token) {
                                    return self.selectToken(token);
                                },
                                openModal: function(modal) {
                                    return self.openModal(modal);
                                },
                            }),
                            document.getElementById('tokensDropdown')
                        ),
                        ReactDOM.render(
                            React.createElement(_tokenGuidesDropdown2.default, {
                                store: self.store,
                                self: self,
                                tokens: self.config.tokens
                                    .map(function(x) {
                                        return x;
                                    })
                                    .sort(function(a, b) {
                                        return a.name > b.name ? 1 : -1;
                                    }),
                                displayTokenGuide: function(token) {
                                    return self.displayTokenGuide(token);
                                },
                            }),
                            document.getElementById('tokenGuidesDropdown')
                        ),
                        self.store.dispatch({
                            type: 'UPDATE_SETTINGS',
                            value: { language: self.language },
                        }),
                        callback();
                }),
                (self.initLedger = function(callback) {
                    ledger.comm_u2f
                        .create_async()
                        .then(function(comm) {
                            var ledgerEth = new ledger.eth(comm);
                            ledgerEth
                                .getAddress_async(self.config.ledgerPath)
                                .then(function(result) {
                                    if (result && !result.errorCode) {
                                        var accountsL = [result.address].map(
                                            function(x) {
                                                return x.toLowerCase();
                                            }
                                        );
                                        accountsL.forEach(function(addr) {
                                            self.accounts
                                                .map(function(x) {
                                                    return x.addr;
                                                })
                                                .indexOf(addr) < 0 &&
                                                self.store.dispatch({
                                                    type: 'ADD_ACCOUNT',
                                                    value: { addr: addr },
                                                });
                                        }),
                                            self.accounts.forEach(function(
                                                account,
                                                i
                                            ) {
                                                accountsL.indexOf(
                                                    account.addr
                                                ) >= 0 &&
                                                    self.store.dispatch({
                                                        type: 'SET_ADDR_KIND',
                                                        value: {
                                                            i: i,
                                                            kind: 'Ledger',
                                                        },
                                                    });
                                            }),
                                            (self.ledgerEth = ledgerEth),
                                            self.updateAccounts(function() {});
                                    }
                                })
                                .fail(function(error) {
                                    console.log(error);
                                });
                        })
                        .catch(function(errCaught) {
                            console.log(errCaught);
                        }),
                        callback();
                }),
                (self.loadWeb3 = function(callback) {
                    if ('undefined' != typeof web3 && void 0 !== Web3)
                        (self.web3 = new Web3(web3.currentProvider)),
                            console.log(
                                'Connecting to MetaMask',
                                web3.currentProvider
                            ),
                            self.store.dispatch({
                                type: 'UPDATE_SETTINGS',
                                value: {
                                    connection: {
                                        connection: 'RPC',
                                        provider: self.config.ethProvider,
                                        testnet: self.config.ethTestnet,
                                    },
                                },
                            }),
                            $('#pkDiv').hide(),
                            callback();
                    else if (
                        void 0 !== Web3 &&
                        'https:' !== window.location.protocol
                    ) {
                        console.log('Connecting to Mist/Geth/Parity'),
                            (self.web3 = new Web3(
                                new Web3.providers.HttpProvider(
                                    self.config.ethProvider
                                )
                            ));
                        try {
                            var coinbase = self.web3.eth.coinbase;
                            console.log('Coinbase: ' + coinbase),
                                self.store.dispatch({
                                    type: 'UPDATE_SETTINGS',
                                    value: {
                                        connection: {
                                            connection: 'RPC',
                                            provider: self.config.ethProvider,
                                            testnet: self.config.ethTestnet,
                                        },
                                    },
                                });
                        } catch (err) {
                            self.web3.setProvider(
                                new Web3.providers.HttpProvider(
                                    self.config.ethTestnet
                                        ? 'https://api.myetherapi.com/rop'
                                        : 'https://api.myetherapi.com/eth'
                                )
                            ),
                                self.store.dispatch({
                                    type: 'UPDATE_SETTINGS',
                                    value: {
                                        connection: {
                                            connection: 'PublicRPC',
                                            provider: self.config.ethTestnet
                                                ? 'https://api.myetherapi.com/rop'
                                                : 'https://api.myetherapi.com/eth',
                                            testnet: self.config.ethTestnet,
                                        },
                                    },
                                });
                        }
                        callback();
                    } else
                        console.log('Connecting to Etherscan proxy'),
                            (self.web3 = new Web3(
                                new Web3.providers.HttpProvider(
                                    self.config.ethTestnet
                                        ? 'https://api.myetherapi.com/rop'
                                        : 'https://api.myetherapi.com/eth'
                                )
                            )),
                            self.store.dispatch({
                                type: 'UPDATE_SETTINGS',
                                value: {
                                    connection: {
                                        connection: 'PublicRPC',
                                        provider: self.config.ethTestnet
                                            ? 'https://api.myetherapi.com/rop'
                                            : 'https://api.myetherapi.com/eth',
                                        testnet: self.config.ethTestnet,
                                    },
                                },
                            }),
                            callback();
                }),
                (self.initContracts = function(callback) {
                    self.utility.loadContract(
                        self.web3,
                        abiEtherDelta,
                        self.selectedContract,
                        function(err, contractEtherDelta) {
                            (self.contractEtherDelta = contractEtherDelta),
                                self.utility.loadContract(
                                    self.web3,
                                    abiToken,
                                    '0x0000000000000000000000000000000000000000',
                                    function(errLoadContract, contractToken) {
                                        (self.contractToken = contractToken),
                                            callback();
                                    }
                                );
                        }
                    );
                }),
                (self.initNetwork = function(callback) {
                    self.web3.version.getNetwork(function(error, version) {
                        error ||
                            !version ||
                            1 === Number(version) ||
                            self.config.ethTestnet ||
                            self.dialogError(
                                'You are connected to the Ethereum testnet. Please connect to the Ethereum mainnet.'
                            );
                        var ethGasPriceCookie = self.utility.readCookie(
                            'ethGasPrice'
                        );
                        if (ethGasPriceCookie) {
                            var newEthGasPrice = JSON.parse(ethGasPriceCookie);
                            newEthGasPrice > self.config.ethGasPrice
                                ? self.setGasPrice(newEthGasPrice, !0)
                                : self.setGasPrice(self.config.ethGasPrice, !0);
                        } else self.setGasPrice(self.config.ethGasPrice, !0);
                        callback();
                    });
                }),
                (self.initAPI = function(callback) {
                    Array.isArray(self.config.socketServer) &&
                        ((self.config.socketServer =
                            self.config.socketServer[
                                Math.floor(
                                    Math.random() *
                                        self.config.socketServer.length
                                )
                            ]),
                        console.log(
                            'Selected socket server',
                            self.config.socketServer
                        ));
                    var zeroAddr = '0x0000000000000000000000000000000000000000';
                    (self.socket = io.connect(self.config.socketServer, {
                        transports: ['websocket'],
                    })),
                        self.socket.on('connect', function() {
                            console.log('socket connected');
                        }),
                        self.socket.on('funds', function(funds) {
                            if (
                                self.selectedToken &&
                                self.state.myFunds &&
                                self.accounts[self.selectedAccount]
                            ) {
                                var newFunds = self.transformFunds(
                                    funds.filter(function(x) {
                                        return (
                                            (x.tokenAddr.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() ||
                                                x.tokenAddr === zeroAddr) &&
                                            x.user.toLowerCase() ===
                                                self.accounts[
                                                    self.selectedAccount
                                                ].addr.toLowerCase()
                                        );
                                    })
                                );
                                newFunds.length > 0 &&
                                    self.store.dispatch({
                                        type: 'NEW_MY_FUNDS',
                                        value: newFunds,
                                    });
                            }
                        }),
                        self.socket.on('trades', function(trades) {
                            if (self.selectedToken && self.state.trades) {
                                var newTrades = self.transformTrades(
                                    trades.filter(function(x) {
                                        return (
                                            x.tokenAddr.toLowerCase() ===
                                            self.selectedToken.addr.toLowerCase()
                                        );
                                    })
                                );
                                newTrades.length > 0 &&
                                    self.store.dispatch({
                                        type: 'NEW_TRADES',
                                        value: newTrades,
                                    });
                            }
                            if (
                                self.selectedToken &&
                                self.state.myTrades &&
                                self.accounts[self.selectedAccount]
                            ) {
                                var newMyTrades = self.transformTrades(
                                    trades.filter(function(x) {
                                        return (
                                            x.tokenAddr.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() &&
                                            (x.buyer.toLowerCase() ===
                                                self.accounts[
                                                    self.selectedAccount
                                                ].addr.toLowerCase() ||
                                                x.seller.toLowerCase() ===
                                                    self.accounts[
                                                        self.selectedAccount
                                                    ].addr.toLowerCase())
                                        );
                                    })
                                );
                                newMyTrades.length > 0 &&
                                    self.store.dispatch({
                                        type: 'NEW_MY_TRADES',
                                        value: newMyTrades,
                                    });
                            }
                        }),
                        self.socket.on('orders', function(orders) {
                            if (self.selectedToken && self.state.orders) {
                                var newOrders = self.transformOrders({
                                    buys: orders.buys.filter(function(x) {
                                        return (
                                            (x.tokenGet.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() &&
                                                x.tokenGive === zeroAddr) ||
                                            (x.tokenGive.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() &&
                                                x.tokenGet === zeroAddr)
                                        );
                                    }),
                                    sells: orders.sells.filter(function(x) {
                                        return (
                                            (x.tokenGet.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() &&
                                                x.tokenGive === zeroAddr) ||
                                            (x.tokenGive.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() &&
                                                x.tokenGet === zeroAddr)
                                        );
                                    }),
                                });
                                (newOrders.buys.length > 0 ||
                                    newOrders.sells.length > 0) &&
                                    self.store.dispatch({
                                        type: 'NEW_ORDERS',
                                        value: newOrders,
                                    });
                            }
                            if (
                                self.selectedToken &&
                                self.state.myOrders &&
                                self.accounts[self.selectedAccount]
                            ) {
                                var newMyOrders = self.transformOrders({
                                    buys: orders.buys.filter(function(x) {
                                        return (
                                            ((x.tokenGet.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() &&
                                                x.tokenGive === zeroAddr) ||
                                                (x.tokenGive.toLowerCase() ===
                                                    self.selectedToken.addr.toLowerCase() &&
                                                    x.tokenGet === zeroAddr)) &&
                                            x.user.toLowerCase() ===
                                                self.accounts[
                                                    self.selectedAccount
                                                ].addr.toLowerCase()
                                        );
                                    }),
                                    sells: orders.sells.filter(function(x) {
                                        return (
                                            ((x.tokenGet.toLowerCase() ===
                                                self.selectedToken.addr.toLowerCase() &&
                                                x.tokenGive === zeroAddr) ||
                                                (x.tokenGive.toLowerCase() ===
                                                    self.selectedToken.addr.toLowerCase() &&
                                                    x.tokenGet === zeroAddr)) &&
                                            x.user.toLowerCase() ===
                                                self.accounts[
                                                    self.selectedAccount
                                                ].addr.toLowerCase()
                                        );
                                    }),
                                });
                                (newMyOrders.buys.length > 0 ||
                                    newMyOrders.sells.length > 0) &&
                                    self.store.dispatch({
                                        type: 'NEW_MY_ORDERS',
                                        value: newMyOrders,
                                    });
                            }
                        }),
                        self.socket.on('disconnect', function() {
                            console.log('socket disconnected');
                        }),
                        callback();
                }),
                (self.initToken = function(callback) {
                    (self.selectedToken =
                        self.config.tokens.find(function(x) {
                            return x.name === self.config.defaultPair.token;
                        }) || self.config.tokens[1]),
                        (self.selectedBase =
                            self.config.tokens.find(function(x) {
                                return x.name === self.config.defaultPair.base;
                            }) || self.config.tokens[0]);
                    var hashSplit = xss(
                            window.location.hash.substr(0, 9) === '#!/trade/'
                                ? window.location.hash.substr(9)
                                : window.location.hash.substr(0, 1) === '#'
                                  ? window.location.hash.substr(1)
                                  : ''
                        ).split('-'),
                        token = hashSplit[0],
                        base = hashSplit[1],
                        validate = function(addr) {
                            return (
                                addr.length <= 12 || self.web3.isAddress(addr)
                            );
                        };
                    async.parallel(
                        [
                            function(callbackParallel) {
                                2 === hashSplit.length && validate(token)
                                    ? self.loadToken(token, function(
                                          errLoadToken,
                                          result
                                      ) {
                                          !errLoadToken &&
                                              result &&
                                              (self.selectedToken = result),
                                              callbackParallel(null, !0);
                                      })
                                    : callbackParallel(null, !0);
                            },
                            function(callbackParallel) {
                                2 === hashSplit.length && validate(base)
                                    ? self.loadToken(base, function(
                                          errLoadToken,
                                          result
                                      ) {
                                          !errLoadToken &&
                                              result &&
                                              (self.selectedBase = result),
                                              callbackParallel(null, !0);
                                      })
                                    : callbackParallel(null, !0);
                            },
                        ],
                        function() {
                            self.store.dispatch({
                                type: 'UPDATE_SELECTED_TOKEN',
                                value: self.selectedToken,
                            }),
                                self.store.dispatch({
                                    type: 'UPDATE_SELECTED_BASE',
                                    value: self.selectedBase,
                                }),
                                callback();
                        }
                    ),
                        window.addEventListener('popstate', function(event) {
                            var hashSplit = xss(
                                    event.target.window.location.hash.substr(
                                        0,
                                        9
                                    ) === '#!/trade/'
                                        ? event.target.window.location.hash.substr(
                                              9
                                          )
                                        : event.target.window.location.hash.substr(
                                              0,
                                              1
                                          ) === '#'
                                          ? event.target.window.location.hash.substr(
                                                1
                                            )
                                          : ''
                                ).split('-'),
                                token = hashSplit[0],
                                base = hashSplit[1],
                                validate = function(addr) {
                                    return (
                                        addr.length <= 12 ||
                                        self.web3.isAddress(addr)
                                    );
                                };
                            validate(token) &&
                                validate(base) &&
                                self.selectTokenAndBase(token, base);
                        });
                }),
                (self.initAccounts = function(callback) {
                    var userCookie = self.utility.readCookie(
                        self.config.userCookie
                    );
                    if (userCookie) {
                        if (
                            ((userCookie = JSON.parse(userCookie)).language &&
                                self.store.dispatch({
                                    type: 'UPDATE_SETTINGS',
                                    value: { language: userCookie.language },
                                }),
                            userCookie.selectedContract &&
                                self.store.dispatch({
                                    type: 'UPDATE_SETTINGS',
                                    value: {
                                        selectedContract:
                                            userCookie.selectedContract,
                                    },
                                }),
                            userCookie.addrs)
                        )
                            for (var i = 0; i < userCookie.addrs.length; i += 1)
                                self.store.dispatch({
                                    type: 'ADD_ACCOUNT',
                                    value: {
                                        addr: userCookie.addrs[i],
                                        pk: userCookie.pks[i],
                                    },
                                });
                        if (userCookie.accounts)
                            for (
                                var _i = 0;
                                _i < userCookie.accounts.length;
                                _i += 1
                            )
                                self.store.dispatch({
                                    type: 'ADD_ACCOUNT',
                                    value: {
                                        addr: userCookie.accounts[_i].addr,
                                        pk: userCookie.accounts[_i].pk,
                                    },
                                });
                        self.store.dispatch({
                            type: 'SELECT_ACCOUNT',
                            value: userCookie.selectedAccount,
                        });
                    }
                    self.store.dispatch({
                        type: 'UPDATE_SETTINGS',
                        value: {
                            selectedContract:
                                self.config.contractEtherDeltaAddrs[0].addr,
                        },
                    }),
                        (self.web3.eth.defaultAccount = self.config.ethAddr),
                        self.web3.eth.getAccounts(function(e, accounts) {
                            if (!e && accounts && accounts.length > 0) {
                                var accountsL = accounts.map(function(x) {
                                    return x.toLowerCase();
                                });
                                accountsL.forEach(function(addr) {
                                    self.accounts
                                        .map(function(x) {
                                            return x.addr;
                                        })
                                        .indexOf(addr) < 0 &&
                                        self.store.dispatch({
                                            type: 'ADD_ACCOUNT',
                                            value: { addr: addr },
                                        });
                                }),
                                    self.accounts.forEach(function(account, i) {
                                        accountsL.indexOf(account.addr) >= 0 &&
                                            self.store.dispatch({
                                                type: 'SET_ADDR_KIND',
                                                value: {
                                                    i: i,
                                                    kind: 'MetaMask',
                                                },
                                            });
                                    });
                            } else
                                'RPC' === self.connection.connection &&
                                    (self.dialogError(
                                        'You are using MetaMask but you are not logged in. Please log in to MetaMask and refresh.'
                                    ),
                                    ga('send', {
                                        hitType: 'event',
                                        eventCategory: 'Error',
                                        eventAction:
                                            'Ethereum - MetaMask not logged in',
                                    }));
                        }),
                        callback();
                }),
                (self.startForkDelta = function() {
                    self.loadConfig(function() {
                        self.initDisplays(function() {
                            self.loadWeb3(function() {
                                self.initContracts(function() {
                                    self.initNetwork(function() {
                                        self.initToken(function() {
                                            self.initAccounts(function() {
                                                self.initLedger(function() {
                                                    self.initAPI(function() {
                                                        self.refreshLoop();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
        }();
    module.exports = { EtherDelta: etherDelta, utility: utility(void 0) };
            }.call(this, require('buffer').Buffer));