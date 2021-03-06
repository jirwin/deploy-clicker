var redis = require('redis');
var async = require('async');

var redisClient = redis.createClient();


function numberWithCommas(x) {
    return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


/**
 * Returns the index page.
 */
exports.index = function(io, req, res) {
  async.auto({
    sessionKey: function(callback) {
      if (req.session && req.session.key) {
        callback(null, req.session.key);
      } else {
        redisClient.incr('dc:sessionKey', callback);
      }
    },

    deployCount: ['sessionKey', function(callback, results) {
      redisClient.get('dc:' + results.sessionKey + ':count', callback);
    }],

    userCount: ['sessionKey', function(callback, results) {
      redisClient.get('dc:' + results.sessionKey + ':users', callback);
    }],

    totalCount: function(callback, results) {
      redisClient.get('dc:total_users', callback);
    },

    activeUsers: function(callback, results) {
      redisClient.get('dc:active', callback);
    }
  }, function(err, results) {
    req.session.key = results.sessionKey;
    res.render('index', {
      deployCount: numberWithCommas(results.deployCount || '0'),
      userCount: numberWithCommas(results.userCount || '1'),
      totalUsers: numberWithCommas(results.totalCount || '1'),
      activeUsers: numberWithCommas(results.activeUsers || '1'),
      sessionKey: results.sessionKey,
      token: req.csrfToken()
    });
  });

};
