var request = require('request');

var gitterHost = 'https://gitter.im';
var clientId = '44215f8a0d8ebad80ca99d16f6cc0d860959389d';
var clientSecret = '80bea00809f19d201e53fb9280b2294179706a53';
var redirectURI = 'https://etherdelta.github.io/gitter.html';

var url = gitterHost + '/login/oauth/authorize?client_id='+clientId+'&response_type=code&redirect_uri='+redirectURI;
console.log(url);
