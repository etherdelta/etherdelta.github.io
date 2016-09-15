browserify browserify.js --s bundle | derequire > js/bundle.js
browserify market_maker_config.js --s market_maker_config | derequire > js/market_maker_config.js
browserify market_maker_config_schema.js --s market_maker_config_schema | derequire > js/market_maker_config_schema.js
