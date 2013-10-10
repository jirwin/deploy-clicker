var express = require('express');


function DeployClicker() {
  this.app = express();
  this.listening = false;
}

/**
 * Start listening on a port.
 * @param {Number} port The port to listen on.
 */
DeployClicker.prototype.listen = function(port) {
  if (!this.listening) {
    this.port = port;
    this.app.listen(this.port);
    this.listening = true;
  }
};


/**
 * Add a route.
 * @param {String} method The HTTP verb to attach a route to.
 * @param {String} path The path to route to.
 * @param {Function} handler The function called when the route is hit.
 */
DeployClicker.prototype.addRoute = function(method, path, handler) {
  this.app[method.toLowerCase()](path, handler);
};


/** Base webapp export */
exports.DeployClicker = DeployClicker;
