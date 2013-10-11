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
        $('#deploy-count').text(data.toString());
      }
    });
  });
});
