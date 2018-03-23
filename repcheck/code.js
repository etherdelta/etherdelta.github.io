/* global $ */

function checker() { // eslint-disable-line
  const name = $('#name')[0].value.replace(/[^A-Za-z0-9_]/gi, '');
  const validNames = ['coinEstate', 'SOMIDAXRep1_twitter', 'SOMIDAXRep2_twitter', 'SOMIDAXRep3_twitter', 'SOMIDAXRep4_twitter', 'SOMIDAXvoBit_twitter'];
  if (validNames.map(x => x.toUpperCase()).indexOf(name.toUpperCase()) >= 0) {
    $('#result').html(`${name.toUpperCase()} is an official RYXEX representative.`);
  } else {
    $('#result').html(`${name.toUpperCase()} is NOT OFFICIAL.`);
  }
}
