browserify config.js --s config | derequire > js/config.js
browserify main.js --s bundle | derequire > js/bundle.js
browserify main_static.js --s bundle | derequire > js/bundle_static.js
browserify translations.js --s translations | derequire > js/translations.js
browserify market_maker_config.js --s market_maker_config | derequire > js/market_maker_config.js
browserify market_maker_config_schema.js --s market_maker_config_schema | derequire > js/market_maker_config_schema.js
