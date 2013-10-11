var express = require('express');
var _ = require('underscore');

var routes = require('./urls').RouteMap;
var config = require('../config');



function DeployClicker() {
  this.app = express();
  this.listening = false;
  this.configureViews();
  this.configureMiddleware();
  this.mapRoutes(routes);
}


/**
 * Configure the express middlewares
 */
DeployClicker.prototype.configureMiddleware = function() {
  this.app.use(express.logger());
  this.app.use(express.compress());
  this.app.use(express.cookieSession({secret: config.secret}));
  this.app.use(express.csrf());
  this.app.use(express.bodyParser());
  this.app.use(express.static(__dirname + '/../static'));
};


DeployClicker.prototype.configureViews = function() {
  this.app.set('views', __dirname + '/../views');
  this.app.set('view engine', 'ejs');
}


/**
 * Start listening on a port.
 * @param {Number} port The port to listen on.
 */
DeployClicker.prototype.listen = function(port) {
  port = port || config.port;

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


/**
 * Given an object containing routes, map them all.
 * The routes object looks something like:
 *    {
 *      '/hello': {
 *        get: helloGetFunction,
 *        post: helloPostFunction
 *      },
 *
 *      '/monkey': {
 *        get: getAMonkey,
 *      }
 *    }
 * @param {Object} routes An object representing routes.
 */
DeployClicker.prototype.mapRoutes = function(routes) {
  var self = this;

  _.each(routes, function(handlers, route) {
    _.each(handlers, function(handler, method) {
      method = method.toLowerCase();
      self.app[method](route, handler);
    });
  });
};


/** Base webapp export */
exports.DeployClicker = DeployClicker;
