$(function() {
  $(document).on('click', '#deploy', function(e) {
    var csrf = $('#csrf').val();

    $.post('/deploy', {'_csrf': csrf})
      .done(function(data) {
        $('#deploy-count').text(data.toString());
      })
  });
});
