function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(function() {
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
      url: '/deploy',
      success: function(data) {
        var speedObj = data['deploy_speed'],
            userCount = data['user_count'],
            success = data['success'];

        if (success) {
          $('#deploy').addClass('btn-success').removeClass('btn-danger');
        } else {
          $('#deploy').addClass('btn-danger').removeClass('btn-success');
        }

        if (userCount.magnitude < 0) {
          userCount.magnitude *= -1;
          $('#user-change').text(numberWithCommas(userCount.magnitude).toString());
          $('#action').text('Lost');
        } else {
          $('#user-change').text(numberWithCommas(userCount.magnitude).toString());
          $('#action').text('Gained');
        }

        $('#user-count').text(numberWithCommas(userCount.userCount).toString());
        $('#deploy-speed').text(speedObj.speed.toFixed(2).toString());
        $('#deploy-count').text(numberWithCommas(data['deploy_count']).toString());
      }
    });
  });
});
