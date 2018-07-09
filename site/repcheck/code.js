/* global $ */

function checker() { // eslint-disable-line
  const name = $('#name')[0].value.replace(/[^A-Za-z0-9_]/gi, '');
  const validNames = ['EtherDeltaZack_twitter', 'EtherDeltaRep1_twitter', 'EtherDeltaRep2_twitter', 'EtherDeltaRep3_twitter', 'EtherDeltaRep4_twitter', 'EtherDeltaUX_twitter'];
  if (validNames.map(x => x.toUpperCase()).indexOf(name.toUpperCase()) >= 0) {
    $('#result').html(`${name.toUpperCase()} is an official EtherDelta representative.`);
  } else {
    $('#result').html(`${name.toUpperCase()} is NOT OFFICIAL.`);
  }
}
