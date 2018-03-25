/* This module was module number 554 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/volume
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
    Volume = (function(_React$Component) {
        function Volume(props) {
            _classCallCheck(this, Volume);
            var _this = _possibleConstructorReturn(
                this,
                (Volume.__proto__ || Object.getPrototypeOf(Volume)).call(
                    this,
                    props
                )
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    _this.setState({ returnTicker: state.returnTicker });
                }),
                (_this.state = {}),
                (_this.self = props.self),
                (_this.tokens = props.tokens),
                (_this.bases = props.bases),
                (_this.getToken = props.getToken),
                (_this.selectTokenAndBase = props.selectTokenAndBase),
                _this
            );
        }
        return (
            _inherits(Volume, React.Component),
            _createClass(Volume, [
                {
                    key: 'shouldComponentUpdate',
                    value: function(nextProps, nextState) {
                        return (
                            JSON.stringify(this.state.returnTicker) !==
                            JSON.stringify(nextState.returnTicker)
                        );
                    },
                },
                {
                    key: 'render',
                    value: function() {
                        var _this2 = this;
                        if (!this.state.returnTicker)
                            return React.createElement(
                                'div',
                                {
                                    style: {
                                        color: '#fff',
                                        padding: '12px',
                                        width: '100%',
                                        textAlign: 'center',
                                    },
                                },
                                React.createElement('i', {
                                    className:
                                        'fa fa-spinner fa-pulse fa-3x fa-fw',
                                }),
                                React.createElement(
                                    'span',
                                    { className: 'sr-only' },
                                    'Loading...'
                                )
                            );
                        for (
                            var pairVolumes = [], j = 0;
                            j < this.bases.length;
                            j += 1
                        )
                            for (var i = 0; i < this.tokens.length; i += 1) {
                                var token = this.getToken(this.tokens[i]),
                                    base = this.getToken(this.bases[j]);
                                if (token && base) {
                                    var rt = Object.values(
                                            this.state.returnTicker
                                        ).find(function(t) {
                                            return t.tokenAddr === token.addr;
                                        }),
                                        pairVolume = {
                                            token: token,
                                            base: base,
                                            quoteVolume: 0,
                                            baseVolume: 0,
                                        };
                                    rt &&
                                        Object.assign(pairVolume, {
                                            quoteVolume: Math.round(
                                                rt.quoteVolume
                                            ),
                                            baseVolume: rt.baseVolume,
                                            bid: rt.bid,
                                            ask: rt.ask,
                                        }),
                                        pairVolumes.push(pairVolume);
                                }
                            }
                        return (
                            pairVolumes.sort(function(a, b) {
                                return (
                                    b.baseVolume - a.baseVolume ||
                                    (a.token.name > b.token.name ? 1 : -1)
                                );
                            }),
                            React.createElement(
                                'div',
                                null,
                                React.createElement(
                                    'div',
                                    { className: 'row-box nav-header' },
                                    React.createElement(
                                        'ul',
                                        {
                                            className:
                                                'nav nav-tabs three columns',
                                            role: 'tablist',
                                        },
                                        this.bases.map(function(base, index) {
                                            return React.createElement(
                                                'li',
                                                {
                                                    key: index,
                                                    role: 'presentation',
                                                    className:
                                                        0 === index
                                                            ? 'active'
                                                            : '',
                                                },
                                                React.createElement(
                                                    'a',
                                                    {
                                                        href:
                                                            '#volume_' +
                                                            base.name,
                                                        'aria-controls':
                                                            'volume_' +
                                                            base.name,
                                                        role: 'tab',
                                                        'data-toggle': 'tab',
                                                    },
                                                    base.name
                                                )
                                            );
                                        })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'row-box height5 scroll' },
                                    React.createElement(
                                        'div',
                                        { className: 'tab-content' },
                                        this.bases.map(function(base, index) {
                                            return React.createElement(
                                                'div',
                                                {
                                                    key: index,
                                                    role: 'tabpanel',
                                                    className:
                                                        'tab-pane' +
                                                        (0 === index
                                                            ? ' active'
                                                            : ''),
                                                    id: 'volume_' + base.name,
                                                },
                                                React.createElement(
                                                    'table',
                                                    {
                                                        className:
                                                            'table table-condensed table-borderless',
                                                    },
                                                    React.createElement(
                                                        'thead',
                                                        null,
                                                        React.createElement(
                                                            'tr',
                                                            {
                                                                className:
                                                                    'table-header',
                                                            },
                                                            React.createElement(
                                                                'th',
                                                                {
                                                                    className:
                                                                        'trn four-columns overflow-hidden',
                                                                },
                                                                'token'
                                                            ),
                                                            React.createElement(
                                                                'th',
                                                                {
                                                                    className:
                                                                        'trn four-columns overflow-hidden',
                                                                },
                                                                'daily'
                                                            ),
                                                            React.createElement(
                                                                'th',
                                                                {
                                                                    className:
                                                                        'four-columns overflow-hidden',
                                                                },
                                                                React.createElement(
                                                                    'span',
                                                                    {
                                                                        className:
                                                                            'trn',
                                                                    },
                                                                    'bid'
                                                                )
                                                            ),
                                                            React.createElement(
                                                                'th',
                                                                {
                                                                    className:
                                                                        'four-columns overflow-hidden',
                                                                },
                                                                React.createElement(
                                                                    'span',
                                                                    {
                                                                        className:
                                                                            'trn',
                                                                    },
                                                                    'offer'
                                                                )
                                                            )
                                                        )
                                                    ),
                                                    React.createElement(
                                                        'tbody',
                                                        null,
                                                        pairVolumes
                                                            .filter(function(
                                                                x
                                                            ) {
                                                                return (
                                                                    x.base
                                                                        .name ===
                                                                    base.name
                                                                );
                                                            })
                                                            .map(function(
                                                                pairVolume,
                                                                i
                                                            ) {
                                                                return React.createElement(
                                                                    'tr',
                                                                    { key: i },
                                                                    React.createElement(
                                                                        'td',
                                                                        {
                                                                            className:
                                                                                'four-columns overflow-hidden',
                                                                        },
                                                                        React.createElement(
                                                                            'a',
                                                                            {
                                                                                href:
                                                                                    '/#!/trade/' +
                                                                                    pairVolume
                                                                                        .token
                                                                                        .name +
                                                                                    '-' +
                                                                                    pairVolume
                                                                                        .base
                                                                                        .name,
                                                                                onClick: function(
                                                                                    e
                                                                                ) {
                                                                                    e.preventDefault();
                                                                                    _this2.selectTokenAndBase.bind(
                                                                                        _this2.self,
                                                                                        pairVolume
                                                                                            .token
                                                                                            .addr,
                                                                                        pairVolume
                                                                                            .base
                                                                                            .addr
                                                                                    )();
                                                                                    history.pushState(
                                                                                        null,
                                                                                        null,
                                                                                        '/#!/trade/' +
                                                                                            (pairVolume
                                                                                                .token
                                                                                                .name ||
                                                                                                pairVolume
                                                                                                    .token
                                                                                                    .addr) +
                                                                                            '-' +
                                                                                            (pairVolume
                                                                                                .base
                                                                                                .name ||
                                                                                                pairVolume
                                                                                                    .base
                                                                                                    .addr)
                                                                                    );
                                                                                },
                                                                            },
                                                                            '' +
                                                                                pairVolume
                                                                                    .token
                                                                                    .name
                                                                        )
                                                                    ),
                                                                    React.createElement(
                                                                        'td',
                                                                        {
                                                                            className:
                                                                                'four-columns overflow-hidden',
                                                                        },
                                                                        Math.round(
                                                                            pairVolume.quoteVolume
                                                                        )
                                                                    ),
                                                                    React.createElement(
                                                                        'td',
                                                                        {
                                                                            className:
                                                                                'four-columns overflow-hidden',
                                                                        },
                                                                        pairVolume.bid
                                                                            ? pairVolume.bid.toFixed(
                                                                                  9
                                                                              )
                                                                            : ''
                                                                    ),
                                                                    React.createElement(
                                                                        'td',
                                                                        {
                                                                            className:
                                                                                'four-columns overflow-hidden',
                                                                        },
                                                                        pairVolume.ask
                                                                            ? pairVolume.ask.toFixed(
                                                                                  9
                                                                              )
                                                                            : ''
                                                                    )
                                                                );
                                                            })
                                                    )
                                                )
                                            );
                                        })
                                    )
                                )
                            )
                        );
                    },
                },
            ]),
            Volume
        );
    })();
            exports.default = Volume;