import { getErrorMessage, } from './helpers';
var HistoryProvider = /** @class */ (function () {
    function HistoryProvider(datafeedUrl, requester) {
        this._datafeedUrl = datafeedUrl;
        this._requester = requester;
    }
    HistoryProvider.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate) {
        var _this = this;
        var requestParams = {
            symbol: symbolInfo.ticker || '',
            resolution: resolution,
            from: rangeStartDate,
            to: rangeEndDate,
        };
        return new Promise(function (resolve, reject) {
            _this._requester.sendRequest(_this._datafeedUrl, 'history', requestParams)
                .then(function (response) {
                if (response.s !== 'ok' && response.s !== 'no_data') {
                    reject(response.errmsg);
                    return;
                }
                var bars = [];
                var meta = {
                    noData: false,
                };
                if (response.s === 'no_data') {
                    meta.noData = true;
                    meta.nextTime = response.nextTime;
                }
                else {
                    var volumePresent = response.v !== undefined;
                    var ohlPresent = response.o !== undefined;
                    for (var i = 0; i < response.t.length; ++i) {
                        var barValue = {
                            time: response.t[i] * 1000,
                            close: Number(response.c[i]),
                            open: Number(response.c[i]),
                            high: Number(response.c[i]),
                            low: Number(response.c[i]),
                        };
                        if (ohlPresent) {
                            barValue.open = Number(response.o[i]);
                            barValue.high = Number(response.h[i]);
                            barValue.low = Number(response.l[i]);
                        }
                        if (volumePresent) {
                            barValue.volume = Number(response.v[i]);
                        }
                        bars.push(barValue);
                    }
                }
                resolve({
                    bars: bars,
                    meta: meta,
                });
            })
                .catch(function (reason) {
                var reasonString = getErrorMessage(reason);
                console.warn("HistoryProvider: getBars() failed, error=" + reasonString);
                reject(reasonString);
            });
        });
    };
    return HistoryProvider;
}());
export { HistoryProvider };
