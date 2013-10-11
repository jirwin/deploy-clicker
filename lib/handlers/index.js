var handlers = [
  'home',
  'deploy'
];


handlers.forEach(function(handler) {
  exports[handler] = require('./' + handler);
});
