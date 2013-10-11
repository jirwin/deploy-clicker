var redis = require('redis');
var async = require('async');

var redisClient = redis.createClient();


/**
 * Create a deploy.
 */
exports.create = function(req, res) {
  async.auto({
    sessionKey: function(callback) {
      if (req.session && req.session.key) {
        callback(null, req.session.key);
      } else {
        redisClient.incr('dc:sessionKey', callback);
      }
    },

    deployCount: ['sessionKey', function(callback, results) {
      redisClient.incr('dc:' + results.sessionKey, callback);
    }]
  }, function(err, results) {
    req.session.key = results.sessionKey;

    res.send(results.deployCount.toString());
  });
};


/**
 * Get a deploy.
 */
exports.get = function(req, res) {
  res.send('Got a deploy ' + req.params.id);
};
