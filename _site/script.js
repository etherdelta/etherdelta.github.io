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
  var total = (amount * price).toFixed(3);
  $('#buy_total').val(total);
}
function sell_change() {
  var amount = Number($('#sell_amount').val());
  var price = Number($('#sell_price').val());
  var total = (amount * price).toFixed(3);
  $('#sell_total').val(total);
}
$(function () {
  $('body').on('click', '#buy_submit', function (e) {
    e.preventDefault();
    // bundle.Main.order($('#base_addr').val(), $('#token_addr').val(), 'buy', $('#buy_amount').val(), $('#buy_price').val(), $('#buy_expires').val(), $('#buy_refresh').is(':checked'));
    bundle.Main.order($('#base_addr').val(), $('#token_addr').val(), 'buy', $('#buy_amount').val(), $('#buy_price').val(), $('#buy_expires').val(), false);
  });
});
$(function () {
  $('body').on('click', '#sell_submit', function (e) {
    e.preventDefault();
    // bundle.Main.order($('#base_addr').val(), $('#token_addr').val(), 'sell', $('#sell_amount').val(), $('#sell_price').val(), $('#sell_expires').val(), $('#sell_refresh').is(':checked'));
    bundle.Main.order($('#base_addr').val(), $('#token_addr').val(), 'sell', $('#sell_amount').val(), $('#sell_price').val(), $('#sell_expires').val(), false);
  });
});
$('#buy_cross_modal').on('show.bs.modal', function(e) {
  var order = $(e.relatedTarget).data('order');
  var amount = $(e.relatedTarget).data('amount');
  var desc = $(e.relatedTarget).data('desc');
  $('#buy_cross_order').val(JSON.stringify(order.order));
  $('#buy_cross_amount').val(amount);
  $('#buy_cross_desc').html(desc);
});
$('#sell_cross_modal').on('show.bs.modal', function(e) {
  var order = $(e.relatedTarget).data('order');
  var amount = $(e.relatedTarget).data('amount');
  var desc = $(e.relatedTarget).data('desc');
  $('#sell_cross_order').val(JSON.stringify(order.order));
  $('#sell_cross_amount').val(amount);
  $('#sell_cross_desc').html(desc);
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
function deposit_click(addr) {
  bundle.Main.deposit(addr, $('#deposit_amount_'+addr).val());
}
function withdraw_click(addr) {
  bundle.Main.withdraw(addr, $('#withdraw_amount_'+addr).val());
}
function transfer_click(addr) {
  bundle.Main.transfer(addr, $('#transfer_amount_'+addr).val(), $('#transfer_to_'+addr).val());
}
