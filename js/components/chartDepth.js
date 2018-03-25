/* This module was module number 534 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/chartDepth
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
    Chart = require('react-google-charts').Chart,
    ChartDepth = (function(_React$Component) {
        function ChartDepth(props) {
            _classCallCheck(this, ChartDepth);
            var _this = _possibleConstructorReturn(
                this,
                (
                    ChartDepth.__proto__ || Object.getPrototypeOf(ChartDepth)
                ).call(this, props)
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    JSON.stringify(_this.state.orders) !==
                        JSON.stringify(state.orders) &&
                        _this.setState({
                            orders: state.orders,
                            selectedToken: state.selectedToken,
                            selectedBase: state.selectedBase,
                        });
                }),
                (_this.state = {}),
                (_this.weiToEth = _this.props.weiToEth),
                (_this.getDivisor = _this.props.getDivisor),
                _this
            );
        }
        return (
            _inherits(ChartDepth, React.Component),
            _createClass(ChartDepth, [
                {
                    key: 'render',
                    value: function() {
                        if (!this.state.orders)
                            return React.createElement('div', null);
                        var orders = this.state.orders,
                            buyOrders = orders.buys,
                            sellOrders = orders.sells.slice().reverse(),
                            depthData = [],
                            median = 0;
                        buyOrders.length > 0 &&
                            (median += buyOrders[0].price.toNumber()),
                            sellOrders.length > 0 &&
                                (median += sellOrders[
                                    sellOrders.length - 1
                                ].price.toNumber()),
                            buyOrders.length > 0 &&
                                sellOrders.length > 0 &&
                                (median /= 2);
                        for (
                            var cumul = 0, i = 0;
                            i < buyOrders.length;
                            i += 1
                        ) {
                            var price = buyOrders[i].price.toNumber();
                            (cumul += Number(
                                this.weiToEth(
                                    Math.abs(buyOrders[i].availableVolume),
                                    this.getDivisor(this.state.selectedToken)
                                )
                            )),
                                depthData.unshift([price, cumul, 0]),
                                i === buyOrders.length - 1 &&
                                    depthData.unshift([0.9 * price, cumul, 0]);
                        }
                        cumul = 0;
                        for (var _i = sellOrders.length - 1; _i >= 0; _i -= 1) {
                            var _price = sellOrders[_i].price.toNumber(),
                                _volume = Number(
                                    this.weiToEth(
                                        Math.abs(
                                            sellOrders[_i].availableVolume
                                        ),
                                        this.getDivisor(
                                            this.state.selectedToken
                                        )
                                    )
                                );
                            depthData.push([_price, 0, cumul]),
                                (cumul += _volume),
                                0 === _i &&
                                    depthData.push([1.1 * _price, 0, cumul]);
                        }
                        depthData.unshift([
                            { label: 'Price', type: 'number' },
                            { label: 'Cumulative bid size', type: 'number' },
                            { label: 'Cumulative offer size', type: 'number' },
                        ]);
                        var depthDataFiltered = depthData.slice(0, 1).concat(
                                depthData
                                    .slice(1)
                                    .map(function(x) {
                                        return [x[0], Number(x[1]), x[2]];
                                    })
                                    .filter(function(x) {
                                        return (
                                            x[0] > 0.025 * median &&
                                            x[0] < 1.75 * median
                                        );
                                    })
                            ),
                            options = {
                                chartArea: {
                                    left: 100,
                                    width: '70%',
                                    height: '70%',
                                },
                                backgroundColor: { fill: 'transparent' },
                                colors: ['#0f0', '#f00'],
                                title: '',
                                hAxis: {
                                    viewWindowMode: 'explicit',
                                    viewWindow: {
                                        min: 0.25 * median,
                                        max: 1.75 * median,
                                    },
                                    title: '',
                                    titleTextStyle: { color: '#fff' },
                                    gridlines: { color: '#fff' },
                                    textStyle: { color: '#fff' },
                                },
                                vAxis: {
                                    minValue: 0,
                                    gridlines: { color: '#fff' },
                                    textStyle: { color: '#fff' },
                                },
                                legend: 'none',
                                tooltip: { isHtml: !0 },
                            };
                        return depthDataFiltered.length <= 1
                            ? React.createElement('div', null)
                            : React.createElement(Chart, {
                                  chartType: 'SteppedAreaChart',
                                  data: depthDataFiltered,
                                  options: options,
                                  width: '100%',
                                  height: '100%',
                                  legend_toggle: !0,
                              });
                    },
                },
            ]),
            ChartDepth
        );
    })();
            exports.default = ChartDepth;