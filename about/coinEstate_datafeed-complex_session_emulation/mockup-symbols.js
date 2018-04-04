/* global exports */

"use strict";

exports.symbols = [
	{
		name: "M-COMPLEX",
		symbolInfoPatch: {
			session: "0900-1630|1000-1400,1600-1900:2|1300-1700:3",
			has_no_volume: true
		},
		tradingSessions:  {
			tradesOnWeekends: false,

			'default': [{
				start: 9 * 60,
				end: 16 * 60 + 30
			}
			],

			//	Monday
			2:  [{
				start: 10 * 60,
				end: 14 * 60
			}, {
				start: 16 * 60,
				end: 19 * 60
			}
			],

			//	Tuesday
			3: [{
				start: 13 * 60,
				end: 17 * 60
			}
			]
		}
	}, {
		name: "M-24X7",
		symbolInfoPatch: {
			session: "24x7",
			timezone: "Europe/Moscow",
			supported_resolutions: ["1", "15", "60", "D", "W", "3W", "M", "6M"],
			intraday_multipliers: ["1", "15", "60"],
			has_empty_bars: false,
			description: "Europe/Moscow 24x7"
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 0,
				end: 24 * 60
			}
			],
		}
	}, {
		name: "M-0930-1900",
		symbolInfoPatch: {
			session: "0930-1900",
			timezone: "Europe/Moscow",
			supported_resolutions: ["1", "2", "5", "10", "15", "30", "60"],
			intraday_multipliers: ["1", "15", "60"],
			has_empty_bars: true,
			description: "Europe/Moscow 0930-1900"
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 9 * 60 + 30 - 3 * 60,
				end: 19 * 60 - 3 * 60
			}
			],
		}
	}, {
		name: "M-1100-1700",
		symbolInfoPatch: {
			session: "1100-1700",
			timezone: "America/Argentina/Buenos_Aires",
			supported_resolutions: ["1", "15", "60", "D"],
			intraday_multipliers: ["1", "15", "60"],
			has_empty_bars: false,
			description: "Buenos Aires 0930-1900"
		},
		tradingSessions:  {
			tradesOnWeekends: false,
			'default': [{
				start: 11*60 + 3 * 60,
				end: 17 * 60 + 3 * 60
			}
			],
		}
	}, {
		name: "M-2200-2200",
		symbolInfoPatch: {
			session: "2200-2200",
			timezone: "UTC",
			supported_resolutions: ["1", "15", "60", "1440"],
			intraday_multipliers: ["1", "15", "60", "1440"],
			has_empty_bars: true,
			description: "UTC 2200-2200"
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 0,
				end: 24 * 60
			}
			],
		}
	}, {
		name: "M-NY24",
		symbolInfoPatch: {
			session: "24x7",
			timezone: "America/New_York",
			supported_resolutions: ["1", "15", "60", "D", "1D"],
			intraday_multipliers: ["1", "15", "60"],
			has_empty_bars: false,
			description: "NY 24x7",
			has_daily: true,
			has_dwm: true,
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 0,
				end: 24 * 60
			}
			],
		}
	}, {
		name: "M-ASIA-KOLKATA",
		symbolInfoPatch: {
			session: '0900-1600',
			timezone: 'Asia/Kolkata',
			supported_resolutions: ["15"],
			intraday_multipliers: ["15"],
			force_session_rebuild: false,
			has_empty_bars: false,
			has_fractional_volume: false,
			has_weekly_and_monthly: false,
			minmov: 0.05,
			minmove2: 0,
			pointvalue: 1,
			pricescale: 100,
			type: "Cash",
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 9 * 60 - (5 * 60 + 30),
				end: 16 * 60 - (5 * 60 + 30)
			}
			],
		}
	}, {
		name: "M-EXPIRED",
		symbolInfoPatch: {
			session: "24x7",
			timezone: "Europe/Moscow",
			supported_resolutions: ["1", "15", "60"],
			intraday_multipliers: ["1", "15", "60"],
			description: "Europe/Moscow 24x7 expired @ 1 July 2014",
			expired: true,
			expiration_date: new Date("1 July 2014").valueOf() / 1000
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 0,
				end: 24 * 60
			}
			],
		}
	},{
		name: "M-WITH-FIRST-DAY",
		symbolInfoPatch: {
			session: "0930-1230;1",
			timezone: "UTC",
			supported_resolutions: ["1", "15", "60"],
			intraday_multipliers: ["1", "15", "60"],
			description: "UTC 0930-1230;1"
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 9 * 60 + 30,
				end: 12 * 60 + 30
			}
			],
		}
	},{
		name: "M-SUBMINUTE",
		symbolInfoPatch: {
			session: "24x7",
			timezone: "UTC",
			supported_resolutions: ["1S", "5S", "30S", "1", "30", "D"],
			intraday_multipliers: ["1"],
			seconds_multipliers: ["1"],
			description: "24x7",
			has_seconds: true
		},
		tradingSessions:  {
			tradesOnWeekends: true,
			'default': [{
				start: 0,
				end: 1440
			}
			],
		}
	},
];