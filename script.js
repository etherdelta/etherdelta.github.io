/* eslint-env browser */
/* global $, main */

$(() => {
  $('body').on('click', '#accountSubmit', (e) => {
    e.preventDefault();
    $('#accountModal').modal('hide');
    main.EtherDelta.addAccount($('#accountAddr').val(), $('#accountPk').val());
  });
});
function buyChange() { // eslint-disable-line no-unused-vars
  const amount = Number($('#buyAmount').val());
  const price = Number($('#buyPrice').val());
  const total = (amount * price).toFixed(3);
  const bid = Number($('#buyBid').val());
  const ask = Number($('#buyAsk').val());
  const isInCross = main.EtherDelta.isInCross(price, 'buy', bid, ask);
  if (isInCross) {
    $('#buyInCross').html(`Your order is in cross with the best sell order in the order book (price = ${isInCross}).`);
  } else {
    $('#buyInCross').html('');
  }
  $('#buyTotal').val(total);
}
function sellChange() { // eslint-disable-line no-unused-vars
  const amount = Number($('#sellAmount').val());
  const price = Number($('#sellPrice').val());
  const total = (amount * price).toFixed(3);
  const bid = Number($('#sellBid').val());
  const ask = Number($('#sellAsk').val());
  const isInCross = main.EtherDelta.isInCross(price, 'sell', bid, ask);
  if (isInCross) {
    $('#sellInCross').html(`Your order is in cross with the best buy order in the order book (price = ${isInCross}).`);
  } else {
    $('#sellInCross').html('');
  }
  $('#sellTotal').val(total);
}
$(() => {
  $('body').on('click', '#buySubmit', (e) => {
    e.preventDefault();
    main.EtherDelta.order(
      $('#buyTokenAddr').val(),
      $('#buyBaseAddr').val(),
      'buy',
      $('#buyAmount').val(),
      $('#buyPrice').val(),
      $('#buyExpires').val());
  });
});
$(() => {
  $('body').on('click', '#sellSubmit', (e) => {
    e.preventDefault();
    main.EtherDelta.order(
      $('#sellTokenAddr').val(),
      $('#sellBaseAddr').val(),
      'sell',
      $('#sellAmount').val(),
      $('#sellPrice').val(),
      $('#sellExpires').val());
  });
});
$('#buyCrossModal').on('show.bs.modal', (e) => {
  const order = $(e.relatedTarget).data('order');
  const amount = $(e.relatedTarget).data('amount');
  const desc = $(e.relatedTarget).data('desc');
  const token = $(e.relatedTarget).data('token');
  const base = $(e.relatedTarget).data('base');
  const price = $(e.relatedTarget).data('price');
  $('#buyCrossOrder').val(JSON.stringify(order));
  $('#buyCrossAmount').val(amount);
  $('#buyCrossDesc').html(desc);
  $('.buyCrossToken').html(token);
  $('.buyCrossBase').html(base);
  $('#buyCrossBaseAmount').val((amount * price).toFixed(3));
  $('#buyCrossFee').val((amount * price * 0.003).toFixed(3));
  $('#buyCrossBaseAmount').change(() => {
    $('#buyCrossAmount').val((Number($('#buyCrossBaseAmount').val()) / price).toFixed(3));
    $('#buyCrossFee').val(($('#buyCrossBaseAmount').val() * 0.003).toFixed(3));
  });
  $('#buyCrossAmount').change(() => {
    $('#buyCrossBaseAmount').val((Number($('#buyCrossAmount').val()) * price).toFixed(3));
    $('#buyCrossFee').val(($('#buyCrossBaseAmount').val() * 0.003).toFixed(3));
  });
});
$('#sellCrossModal').on('show.bs.modal', (e) => {
  const order = $(e.relatedTarget).data('order');
  const amount = $(e.relatedTarget).data('amount');
  const desc = $(e.relatedTarget).data('desc');
  const token = $(e.relatedTarget).data('token');
  const base = $(e.relatedTarget).data('base');
  const price = $(e.relatedTarget).data('price');
  $('#sellCrossOrder').val(JSON.stringify(order));
  $('#sellCrossAmount').val(amount);
  $('#sellCrossDesc').html(desc);
  $('.sellCrossToken').html(token);
  $('.sellCrossBase').html(base);
  $('#sellCrossBaseAmount').val((amount * price).toFixed(3));
  $('#sellCrossFee').val((amount * 0.003).toFixed(3));
  $('#sellCrossBaseAmount').change(() => {
    $('#sellCrossAmount').val((Number($('#sellCrossBaseAmount').val()) / price).toFixed(3));
    $('#sellCrossFee').val(($('#sellCrossAmount').val() * 0.003).toFixed(3));
  });
  $('#sellCrossAmount').change(() => {
    $('#sellCrossBaseAmount').val((Number($('#sellCrossAmount').val()) * price).toFixed(3));
    $('#sellCrossFee').val(($('#sellCrossAmount').val() * 0.003).toFixed(3));
  });
});
$(() => {
  $('body').on('click', '#buyCrossSubmit', (e) => {
    e.preventDefault();
    $('#buyCrossModal').modal('hide');
    main.EtherDelta.trade('buy', JSON.parse($('#buyCrossOrder').val()), $('#buyCrossAmount').val());
  });
});
$(() => {
  $('body').on('click', '#sellCrossSubmit', (e) => {
    e.preventDefault();
    $('#sellCrossModal').modal('hide');
    main.EtherDelta.trade(
      'sell',
      JSON.parse($('#sellCrossOrder').val()),
      $('#sellCrossAmount').val());
  });
});
$(() => {
  $('body').on('click', '#otherTokenSubmit', (e) => {
    e.preventDefault();
    $('#otherTokenModal').modal('hide');
    main.EtherDelta.selectToken(
      $('#otherTokenAddr').val(),
      $('#otherTokenName').val(),
      $('#otherTokenDecimals').val());
  });
});
$(() => {
  $('body').on('click', '#otherBaseSubmit', (e) => {
    e.preventDefault();
    $('#otherBaseModal').modal('hide');
    main.EtherDelta.selectBase(
      $('#otherBaseAddr').val(),
      $('#otherBaseName').val(),
      $('#otherBaseDecimals').val());
  });
});
$('#gasPriceModal').on('show.bs.modal', () => {
  $('#gasPrice').val(main.EtherDelta.config.ethGasPrice / 1000000000);
});
$(() => {
  $('body').on('click', '#gasPriceSubmit', (e) => {
    e.preventDefault();
    $('#gasPriceModal').modal('hide');
    main.EtherDelta.setGasPrice(
      $('#gasPrice').val());
  });
});
function depositClick(addr) { // eslint-disable-line no-unused-vars
  main.EtherDelta.deposit(addr, $(`#depositAmount${addr}`).val());
}
function withdrawClick(addr) { // eslint-disable-line no-unused-vars
  main.EtherDelta.withdraw(addr, $(`#withdrawAmount${addr}`).val());
}
function transferClick(addr) { // eslint-disable-line no-unused-vars
  main.EtherDelta.transfer(addr, $(`#transferAmount${addr}`).val(), $(`#transferTo${addr}`).val());
}
$(() => {});
