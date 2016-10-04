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
