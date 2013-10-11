var DeployClicker = require('../lib/app').DeployClicker;


var app = new DeployClicker();

app.listen(3000);
console.log('Deploy Clicker now running on port ' + app.port);
