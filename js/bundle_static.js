(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bundle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
function Main() {
}
Main.ejs = function(url, element, data) {
  if ($('#'+element).length) {
    new EJS({url: url}).update(element, data);
    translator.lang(language);
  } else {
    console.log('Failed to render template because '+element+' does not exist.')
  }
}
Main.displayLanguages = function(callback) {
  var languages = Object.keys(translations['trades']);
  Main.ejs(config.homeURL+'/templates/'+'languages.ejs', 'languages', {languages: languages, language: language});
  callback();
}
Main.selectLanguage = function(newLanguage) {
  language = newLanguage;
  window.title = translations.title[language];
  translator.lang(language);
  Main.init(function(){});
  Main.refresh(function(){}, true);
}
Main.displayTokenGuides = function() {
  var tokens = config.tokens.map(function(x){return x});
  tokens.sort(function(a,b){return a.name>b.name ? 1 : -1});
  Main.ejs(config.homeURL+'/templates/'+'token_guides.ejs', 'token_guides', {tokens: tokens});
}
Main.displayTokenGuide = function(name) {
  var matchingTokens = config.tokens.filter(function(x){return name==x.name});
  if (matchingTokens.length==1) {
      var token = matchingTokens[0];
      $('#token_guide_title').html(name);
      $('#token_guide_body').html('');
      var tokenLink = 'http://'+(config.ethTestnet ? 'testnet.' : '')+'etherscan.io/token/'+token.addr;
      Main.ejs(config.homeURL+'/token_guides/details.ejs', 'token_guide_details', {token: token, tokenLink: tokenLink});
      try {
        Main.ejs(config.homeURL+'/token_guides/'+name+'.ejs', 'token_guide_body', {token: token, tokenLink: tokenLink});
      } catch (err) {
        console.log(err);
      }
      $('#tokenModal').modal('show');
  }
}
Main.init = function(callback) {
  translator = $('body').translate({lang: language, t: translations});
  Main.displayLanguages(function(){});
  callback();
}
var translator = undefined;
var language = 'en';
Main.init(function(){});

module.exports = {Main: Main};

},{}]},{},[1])(1)
});