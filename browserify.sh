browserify main.js --s bundle | derequire > js/bundle.js
browserify translations.js --s translations | derequire > js/translations.js
