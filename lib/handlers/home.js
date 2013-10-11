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
      console.dir(results);
      var key = results.sessionKey;

      req.session.key = key;
      redisClient.get('dc:' + key, callback);
    }]
  }, function(err, results) {
    res.render('index', {deployCount: results.deployCount});
  });

};
