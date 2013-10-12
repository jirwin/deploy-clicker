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

        $('#user-count').text(userCount.userCount.toString());
        $('#deploy-speed').text(parseFloat(speedObj.speed).toFixed(2).toString());
        $('#deploy-speed-message').show();
        $('#deploy-count').text(data['deploy_count'].toString());
      }
    });
  });
});
