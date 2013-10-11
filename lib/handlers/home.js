var redis = require('redis');
var async = require('async');

var redisClient = redis.createClient();


/**
 * Returns the index page.
 */
exports.index = function(req, res) {
  async.auto({
    sessionKey: function(callback) {
      if (req.session && req.session.key) {
        callback(null, req.session.key);
      } else {
        redisClient.incr('dc:sessionKey', callback);
      }
    },

    deployCount: ['sessionKey', function(callback, results) {
      var key = results.sessionKey;

      redisClient.get('dc:' + key, callback);
    }]
  }, function(err, results) {
    req.session.key = results.sessionKey;
    res.render('index', {deployCount: results.deployCount || 0, token: req.session._csrf});
  });

};
