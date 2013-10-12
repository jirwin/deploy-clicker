var handlers = require('./handlers');


/**
 * Map of the routes to respond to.
 */
var RouteMap = {
  '/': {
    get: handlers.home.index
  },

  '/deploy': {
    post: handlers.deploy.create
  },

  '/stats': {
    get: handlers.deploy.getStats
  }
};


exports.RouteMap = RouteMap;
