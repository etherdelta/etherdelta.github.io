$(function () {
  $('body').on('click', '#address_submit', function (e) {
    e.preventDefault();
    $('#address_modal').modal('hide');
    bundle.Main.addAccount($('#address_addr').val(), $('#address_pk').val());
  });
});
$(function() {
  $('#clear-log').click(function(){
    $('#notifications').empty();
  });
});
function buy_change() {
  var amount = Number($('#buy_amount').val());
  var price = Number($('#buy_price').val());
  var total = amount * price;
  $('#buy_total').val(total);
}
function sell_change() {
  var amount = Number($('#sell_amount').val());
  var price = Number($('#sell_price').val());
  var total = amount * price;
  $('#sell_total').val(total);
}
$(function () {
  $('body').on('click', '#buy_submit', function (e) {
    e.preventDefault();
    bundle.Main.order($('#base_addr').val(), $('#token_addr').val(), 'buy', $('#buy_amount').val(), $('#buy_price').val(), $('#buy_expires').val(), $('#buy_refresh').is(':checked'));
  });
});
$(function () {
  $('body').on('click', '#sell_submit', function (e) {
    e.preventDefault();
    bundle.Main.order($('#base_addr').val(), $('#token_addr').val(), 'sell', $('#sell_amount').val(), $('#sell_price').val(), $('#sell_expires').val(), $('#sell_refresh').is(':checked'));
  });
});
$(function () {
  $('body').on('click', '#deposit_token_submit', function (e) {
    e.preventDefault();
    bundle.Main.deposit($('#token_addr').val(), $('#token_amount').val());
  });
});
$(function () {
  $('body').on('click', '#deposit_base_submit', function (e) {
    e.preventDefault();
    bundle.Main.deposit($('#base_addr').val(), $('#base_amount').val());
  });
});
$(function () {
  $('body').on('click', '#withdraw_token_submit', function (e) {
    e.preventDefault();
    bundle.Main.withdraw($('#token_addr').val(), $('#token_amount').val());
  });
});
$(function () {
  $('body').on('click', '#withdraw_base_submit', function (e) {
    e.preventDefault();
    bundle.Main.withdraw($('#base_addr').val(), $('#base_amount').val());
  });
});
$('#buy_cross_modal').on('show.bs.modal', function(e) {
  var order = $(e.relatedTarget).data('order');
  console.log(order);
  $('#buy_cross_order').val(JSON.stringify(order.order));
  $('#buy_cross_desc').html('Sell order: '+bundle.utility.weiToEth(Math.abs(Number(order.availableVolume)), bundle.Main.getDivisor(order.order.tokenGet))+' @ '+Number(order.price).toFixed(5));
  $('#buy_cross_amount').val(bundle.utility.weiToEth(Math.abs(Number(order.availableVolume)), bundle.Main.getDivisor(order.order.tokenGet)));
});
$('#sell_cross_modal').on('show.bs.modal', function(e) {
  var order = $(e.relatedTarget).data('order');
  $('#sell_cross_order').val(JSON.stringify(order.order));
  $('#sell_cross_desc').html('Buy order: '+bundle.utility.weiToEth(Math.abs(Number(order.availableVolume)), bundle.Main.getDivisor(order.order.tokenGet))+' @ '+Number(order.price).toFixed(5));
  $('#sell_cross_amount').val(bundle.utility.weiToEth(Math.abs(Number(order.availableVolume)), bundle.Main.getDivisor(order.order.tokenGet)));
});
$(function () {
  $('body').on('click', '#buy_cross_submit', function (e) {
    e.preventDefault();
    $('#buy_cross_modal').modal('hide');
    bundle.Main.trade('buy', JSON.parse($('#buy_cross_order').val()), $('#buy_cross_amount').val());
  });
});
$(function () {
  $('body').on('click', '#sell_cross_submit', function (e) {
    e.preventDefault();
    $('#sell_cross_modal').modal('hide');
    bundle.Main.trade('sell', JSON.parse($('#sell_cross_order').val()), $('#sell_cross_amount').val());
  });
});
$(function () {
  $('body').on('click', '#other_token_submit', function (e) {
    e.preventDefault();
    $('#other_token_modal').modal('hide');
    bundle.Main.otherToken($('#other_token_addr').val(), $('#other_token_name').val(), $('#other_token_divisor').val());
  });
});
$(function () {
  $('body').on('click', '#other_base_submit', function (e) {
    e.preventDefault();
    $('#other_base_modal').modal('hide');
    bundle.Main.otherBase($('#other_base_addr').val(), $('#other_base_name').val(), $('#other_base_divisor').val());
  });
});
