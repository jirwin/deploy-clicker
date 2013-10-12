var http = require('http');
var express = require('express');
var _ = require('underscore');
var io = require('socket.io');
var redis = require('redis');

var routes = require('./urls').RouteMap;
var config = require('../config');

var redisClient = redis.createClient();


/**
 * Function that pulls the CSRF token from the headers.
 * @param {Request} req The request.
 */
var getCsrfValue = function(req) {
  var token = req.headers['x-xsrf-token'];
  return token;
};



/**
 * DeployClicker webapp.
 * @constructor
 */
function DeployClicker() {
  this.app = express();
  this.server = http.createServer(this.app);
  this.io = io.listen(this.server);
  this.listening = false;
  this.configureViews();
  this.configureMiddleware();
  this.mapRoutes(routes);
  this.globalSockets();
}


/**
 * Global socket handling.
 */
DeployClicker.prototype.globalSockets = function() {
  var self = this;

  this.io.enable('browser client minification');
  this.io.enable('browser client etag');
  this.io.enable('browser client gzip');

  this.io.sockets.on('connection', function(socket) {
    redisClient.incr('dc:active', function(err, reply) {
      self.io.sockets.emit('activeUsers', {count: reply || 1});
    });

    socket.on('disconnect', function() {
      redisClient.incrby('dc:active', -1, function(err, reply) {
        self.io.sockets.emit('activeUsers', {count: reply});
      });
    });
  });
};


/**
 * Configure the express middlewares
 */
DeployClicker.prototype.configureMiddleware = function() {
  this.app.use(express.logger());
  this.app.use(express.compress());
  this.app.use(express.cookieParser());
  this.app.use(express.cookieSession({secret: config.secret}));
  this.app.use(express.bodyParser());
  this.app.use(express.csrf({value: getCsrfValue}));
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
    this.server.listen(this.port);
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
      self.app[method](route, handler.bind(null, self.io));
    });
  });
};


/** Base webapp export */
exports.DeployClicker = DeployClicker;
