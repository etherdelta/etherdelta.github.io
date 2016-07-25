browserify browserify.js --s bundle | derequire | uglifyjs --compress --mangle > bundle.js
