var DeployClicker = require('../lib/app').DeployClicker;


var app = new DeployClicker();

app.addRoute('get', '/hello', function(req, res) {
  var body = 'Hello Test';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});

app.listen(3000);
