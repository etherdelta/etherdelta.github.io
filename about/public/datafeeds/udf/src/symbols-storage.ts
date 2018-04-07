import {
	LibrarySymbolInfo,
	SearchSymbolResultItem,
} from '../../../charting_library/datafeed-api';

import {
	getErrorMessage,
	logMessage,
} from './helpers';

import { Requester } from './requester';

interface SymbolInfoMap {
	[symbol: string]: LibrarySymbolInfo | undefined;
}

interface ExchangeDataResponseOptionalValues {
	'ticker': string;

	'minmov2': number;
	'minmove2': number;

	'minmov': number;
	'minmovement': number;

	'supported-resolutions': string[];

	'force-session-rebuild': boolean;

	'has-intraday': boolean;
	'has-daily': boolean;
	'has-weekly-and-monthly': boolean;
	'has-empty-bars': boolean;
	'has-no-volume': boolean;

	'intraday-multipliers': string[];

	'volume-precision': number;
}

interface ExchangeDataResponseMandatoryValues {
	'type': string;
	'timezone': LibrarySymbolInfo['timezone'];
	'description': string;

	'exchange-listed': string;
	'exchange-traded': string;

	'session-regular': string;

	'fractional': boolean;

	'pricescale': number;
}

// Here is some black magic with types to get compile-time checks of names and types
type ValueOrArray<T> = T | T[];
type ExchangeDataResponse =
	{
		symbol: string[];
	} &
	{
		[K in keyof ExchangeDataResponseMandatoryValues]: ValueOrArray<ExchangeDataResponseMandatoryValues[K]>;
	} &
	{
		[K in keyof ExchangeDataResponseOptionalValues]?: ValueOrArray<ExchangeDataResponseOptionalValues[K]>;
	};

function extractField<Field extends keyof ExchangeDataResponseMandatoryValues>(data: ExchangeDataResponse, field: Field, arrayIndex: number): ExchangeDataResponseMandatoryValues[Field];
function extractField<Field extends keyof ExchangeDataResponseOptionalValues>(data: ExchangeDataResponse, field: Field, arrayIndex: number): ExchangeDataResponseOptionalValues[Field] | undefined;
function extractField<Field extends keyof ExchangeDataResponseMandatoryValues>(data: ExchangeDataResponse, field: Field, arrayIndex: number): (ExchangeDataResponseMandatoryValues & ExchangeDataResponseOptionalValues)[Field] | undefined {
	const value = data[field];
	return Array.isArray(value) ? value[arrayIndex] : value;
}

export class SymbolsStorage {
	private readonly _exchangesList: string[] = ['NYSE', 'FOREX', 'AMEX'];
	private readonly _symbolsInfo: SymbolInfoMap = {};
	private readonly _symbolsList: string[] = [];
	private readonly _datafeedUrl: string;
	private readonly _readyPromise: Promise<void>;
	private readonly _datafeedSupportedResolutions: string[];
	private readonly _requester: Requester;

	public constructor(datafeedUrl: string, datafeedSupportedResolutions: string[], requester: Requester) {
		this._datafeedUrl = datafeedUrl;
		this._datafeedSupportedResolutions = datafeedSupportedResolutions;
		this._requester = requester;
		this._readyPromise = this._init();
		this._readyPromise.catch((error: Error) => {
			// seems it is impossible
			console.error(`SymbolsStorage: Cannot init, error=${error.toString()}`);
		});
	}

	// BEWARE: this function does not consider symbol's exchange
	public resolveSymbol(symbolName: string): Promise<LibrarySymbolInfo> {
		return this._readyPromise.then(() => {
			const symbolInfo = this._symbolsInfo[symbolName];
			if (symbolInfo === undefined) {
				return Promise.reject('invalid symbol');
			}

			return Promise.resolve(symbolInfo);
		});
	}

	public searchSymbols(searchString: string, exchange: string, symbolType: string, maxSearchResults: number): Promise<SearchSymbolResultItem[]> {
		interface WeightedItem {
			symbolInfo: LibrarySymbolInfo;
			weight: number;
		}

		return this._readyPromise.then(() => {
			const weightedResult: WeightedItem[] = [];
			const queryIsEmpty = searchString.length === 0;

			searchString = searchString.toUpperCase();

			for (const symbolName of this._symbolsList) {
				const symbolInfo = this._symbolsInfo[symbolName];

				if (symbolInfo === undefined) {
					continue;
				}

				if (symbolType.length > 0 && symbolInfo.type !== symbolType) {
					continue;
				}

				if (exchange && exchange.length > 0 && symbolInfo.exchange !== exchange) {
					continue;
				}

				const positionInName = symbolInfo.name.toUpperCase().indexOf(searchString);
				const positionInDescription = symbolInfo.description.toUpperCase().indexOf(searchString);

				if (queryIsEmpty || positionInName >= 0 || positionInDescription >= 0) {
					const alreadyExists = weightedResult.some((item: WeightedItem) => item.symbolInfo === symbolInfo);
					if (!alreadyExists) {
						const weight = positionInName >= 0 ? positionInName : 8000 + positionInDescription;
						weightedResult.push({ symbolInfo: symbolInfo, weight: weight });
					}
				}
			}

			const result = weightedResult
				.sort((item1: WeightedItem, item2: WeightedItem) => item1.weight - item2.weight)
				.slice(0, maxSearchResults)
				.map((item: WeightedItem) => {
					const symbolInfo = item.symbolInfo;
					return {
						symbol: symbolInfo.name,
						full_name: symbolInfo.full_name,
						description: symbolInfo.description,
						exchange: symbolInfo.exchange,
						params: [],
						type: symbolInfo.type,
						ticker: symbolInfo.name,
					};
				});

			return Promise.resolve(result);
		});
	}

	private _init(): Promise<void> {
		interface BooleanMap {
			[key: string]: boolean | undefined;
		}

		const promises: Promise<void>[] = [];
		const alreadyRequestedExchanges: BooleanMap = {};

		for (const exchange of this._exchangesList) {
			if (alreadyRequestedExchanges[exchange]) {
				continue;
			}

			alreadyRequestedExchanges[exchange] = true;
			promises.push(this._requestExchangeData(exchange));
		}

		return Promise.all(promises)
			.then(() => {
				this._symbolsList.sort();
				logMessage('SymbolsStorage: All exchanges data loaded');
			});
	}

	private _requestExchangeData(exchange: string): Promise<void> {
		return new Promise((resolve: () => void, reject: (error: Error) => void) => {
			this._requester.sendRequest<ExchangeDataResponse>(this._datafeedUrl, 'symbol_info', { group: exchange })
				.then((response: ExchangeDataResponse) => {
					try {
						this._onExchangeDataReceived(exchange, response);
					} catch (error) {
						reject(error);
						return;
					}

					resolve();
				})
				.catch((reason?: string | Error) => {
					logMessage(`SymbolsStorage: Request data for exchange '${exchange}' failed, reason=${getErrorMessage(reason)}`);
					resolve();
				});
		});
	}

	private _onExchangeDataReceived(exchange: string, data: ExchangeDataResponse): void {
		let symbolIndex = 0;

		try {
			const symbolsCount = data.symbol.length;
			const tickerPresent = data.ticker !== undefined;

			for (; symbolIndex < symbolsCount; ++symbolIndex) {
				const symbolName = data.symbol[symbolIndex];
				const listedExchange = extractField(data, 'exchange-listed', symbolIndex);
				const tradedExchange = extractField(data, 'exchange-traded', symbolIndex);
				const fullName = tradedExchange + ':' + symbolName;

				const ticker = tickerPresent ? (extractField(data, 'ticker', symbolIndex) as string) : symbolName;

				const symbolInfo: LibrarySymbolInfo = {
					ticker: ticker,
					name: symbolName,
					base_name: [listedExchange + ':' + symbolName],
					full_name: fullName,
					listed_exchange: listedExchange,
					exchange: tradedExchange,
					description: extractField(data, 'description', symbolIndex),
					has_intraday: definedValueOrDefault(extractField(data, 'has-intraday', symbolIndex), false),
					has_no_volume: definedValueOrDefault(extractField(data, 'has-no-volume', symbolIndex), false),
					minmov: extractField(data, 'minmovement', symbolIndex) || extractField(data, 'minmov', symbolIndex) || 0,
					minmove2: extractField(data, 'minmove2', symbolIndex) || extractField(data, 'minmov2', symbolIndex),
					fractional: extractField(data, 'fractional', symbolIndex),
					pricescale: extractField(data, 'pricescale', symbolIndex),
					type: extractField(data, 'type', symbolIndex),
					session: extractField(data, 'session-regular', symbolIndex),
					timezone: extractField(data, 'timezone', symbolIndex),
					supported_resolutions: definedValueOrDefault(extractField(data, 'supported-resolutions', symbolIndex), this._datafeedSupportedResolutions),
					force_session_rebuild: extractField(data, 'force-session-rebuild', symbolIndex),
					has_daily: definedValueOrDefault(extractField(data, 'has-daily', symbolIndex), true),
					intraday_multipliers: definedValueOrDefault(extractField(data, 'intraday-multipliers', symbolIndex), ['1', '5', '15', '30', '60']),
					has_weekly_and_monthly: extractField(data, 'has-weekly-and-monthly', symbolIndex),
					has_empty_bars: extractField(data, 'has-empty-bars', symbolIndex),
					volume_precision: definedValueOrDefault(extractField(data, 'volume-precision', symbolIndex), 0),
				};

				this._symbolsInfo[ticker] = symbolInfo;
				this._symbolsInfo[symbolName] = symbolInfo;
				this._symbolsInfo[fullName] = symbolInfo;

				this._symbolsList.push(symbolName);
			}
		} catch (error) {
			throw new Error(`SymbolsStorage: API error when processing exchange ${exchange} symbol #${symbolIndex} (${data.symbol[symbolIndex]}): ${error.message}`);
		}
	}
}

function definedValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
	return value !== undefined ? value : defaultValue;
}
