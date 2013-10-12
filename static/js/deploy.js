function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(function() {
  var socket = io.connect('http://deploy.jirwin.net:3000'),
      sessionKey = $('#sessionKey').val();

  socket.on('update:global', function(data) {
    $('#total-users').text(numberWithCommas(data.totalCount).toString());
  });

  socket.on('update:' + sessionKey, function (data) {
    $('#user-count').text(numberWithCommas(data.userCount).toString());

    if (data.magnitude < 0) {
      data.magnitude *= -1;
      $('#user-change').text(numberWithCommas(data.magnitude).toString());
      $('#action').text('Lost');
    } else {
      $('#user-change').text(numberWithCommas(data.magnitude).toString());
      $('#action').text('Gained');
    }

    if (data.success) {
      $('#deploy').addClass('btn-success').removeClass('btn-danger');
    } else {
      $('#deploy').addClass('btn-danger').removeClass('btn-success');
    }

    $('#deploy-speed').text(data.deploySpeed.speed.toFixed(2).toString());
    $('#deploy-count').text(numberWithCommas(data.deployCount).toString());
  });

  $(document).on('keypress', '#deploy', function(e) {
    if (e.which === 13) {
      e.preventDefault();
      return;
    }
  });
  $(document).on('click', '#deploy', function(e) {
    var csrf = $('#csrf').val();

    $.ajax({
      type: 'POST',
      beforeSend: function(req) {
        req.setRequestHeader('X-XSRF-TOKEN', csrf);
      },
      url: '/deploy'
    });
  });
});
