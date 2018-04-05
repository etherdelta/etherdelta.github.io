/* This module was module number 535 in the old packed code. It was referenced in the old code using `require(<module name>)` by the following module names:
* ./components/chartPrice
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
            if (Symbol.iterator in Object(arr)) return sliceIterator(arr, i);
            throw new TypeError(
                'Invalid attempt to destructure non-iterable instance'
            );
        };
    })(),
    _createClass = (function() {
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
    stats = require('stats-lite'),
    ChartPrice = (function(_React$Component) {
        function ChartPrice(props) {
            _classCallCheck(this, ChartPrice);
            var _this = _possibleConstructorReturn(
                this,
                (
                    ChartPrice.__proto__ || Object.getPrototypeOf(ChartPrice)
                ).call(this, props)
            );
            return (
                props.store.subscribe(function() {
                    var state = props.store.getState();
                    JSON.stringify(_this.state.trades) !==
                        JSON.stringify(state.trades) &&
                        _this.setState({
                            trades: state.trades,
                            selectedToken: state.selectedToken,
                            selectedBase: state.selectedBase,
                        });
                }),
                (_this.state = {}),
                _this
            );
        }
        return (
            _inherits(ChartPrice, React.Component),
            _createClass(ChartPrice, [
                {
                    key: 'render',
                    value: function() {
                        if (!this.state.trades)
                            return React.createElement('div', null);
                        var rows = this.state.trades
                                .slice()
                                .reverse()
                                .map(function(trade) {
                                    return [trade.date, trade.price];
                                }),
                            values = rows.map(function(x) {
                                return x[1];
                            }),
                            phigh = stats.percentile(values, 0.95),
                            plow = stats.percentile(values, 0.05),
                            filteredRows = rows.filter(function(x) {
                                return x[1] >= plow && x[1] <= phigh;
                            });
                        if (0 === filteredRows.length)
                            return React.createElement('div', null);
                        var start = filteredRows[0][0];
                        start = new Date(
                            36e5 * Math.round(start.getTime() / 36e5)
                        );
                        var points = [],
                            intervals = [
                                ['DAY', 'val1', 'val2', 'val3', 'val4'],
                            ];
                        filteredRows.forEach(function(row) {
                            var _row = _slicedToArray(row, 2),
                                date = _row[0],
                                point = _row[1];
                            if (date - start > 36e5) {
                                if (points.length > 0) {
                                    var low = Math.min.apply(null, points),
                                        high = Math.max.apply(null, points),
                                        open = points[0],
                                        close = points[points.length - 1];
                                    close > open
                                        ? intervals.push([
                                              start,
                                              low,
                                              open,
                                              close,
                                              high,
                                          ])
                                        : intervals.push([
                                              start,
                                              high,
                                              open,
                                              close,
                                              low,
                                          ]);
                                }
                                (start = new Date(start.getTime() + 36e5)),
                                    (points = []);
                            }
                            points.push(point);
                        });
                        var options = {
                            chartArea: {
                                left: 100,
                                width: '70%',
                                height: '70%',
                            },
                            backgroundColor: { fill: 'transparent' },
                            colors: ['#ccc'],
                            vAxis: {
                                title: '',
                                viewWindowMode: 'explicit',
                                viewWindow: {
                                    min:
                                        0.7 *
                                        Math.min.apply(
                                            null,
                                            intervals.map(function(x) {
                                                return Math.min(x[1], x[4]);
                                            })
                                        ),
                                    max:
                                        1.3 *
                                        Math.max.apply(
                                            null,
                                            intervals.map(function(x) {
                                                return Math.max(x[1], x[4]);
                                            })
                                        ),
                                },
                                gridlines: { color: '#fff' },
                                textStyle: { color: '#fff' },
                            },
                            hAxis: {
                                title: '',
                                baselineColor: '#fff',
                                textStyle: { color: '#fff' },
                                gridlines: {
                                    color: 'none',
                                    count: -1,
                                    units: {
                                        days: { format: ['MMM dd'] },
                                        hours: { format: ['HH:mm', 'ha'] },
                                    },
                                },
                                minorGridlines: {
                                    units: {
                                        hours: { format: ['hh:mm:ss a', 'ha'] },
                                        minutes: {
                                            format: ['HH:mm a Z', ':mm'],
                                        },
                                    },
                                },
                            },
                            legend: 'none',
                            enableInteractivity: !0,
                            title: '',
                            candlestick: {
                                fallingColor: { strokeWidth: 0, fill: '#f00' },
                                risingColor: { strokeWidth: 0, fill: '#0f0' },
                            },
                        };
                        return intervals.length <= 1
                            ? React.createElement('div', null)
                            : React.createElement(Chart, {
                                  chartType: 'CandlestickChart',
                                  data: intervals,
                                  options: options,
                                  width: '100%',
                                  height: '100%',
                                  legend_toggle: !0,
                              });
                    },
                },
            ]),
            ChartPrice
        );
    })();
            exports.default = ChartPrice;