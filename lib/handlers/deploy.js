var redis = require('redis');
var async = require('async');

var redisClient = redis.createClient(6379, '127.0.0.1', {detect_buffers: true});


var updateDeploySpeed = function(key, callback) {
  var now = Date.now(),
      startTimeKey = 'dc:' + key + ':start_time';

  async.auto({
    start: function(callback) {
      redisClient.get(startTimeKey, callback);
    },

    checkStart: ['start', function(callback, results) {
      var start = results.start;

      if (start) {
        callback(null, start);
        return;
      }

      async.series([
        redisClient.set.bind(redisClient, startTimeKey, now),
        redisClient.expire.bind(redisClient, startTimeKey, 30)
      ], function(err, results) {
        callback(null, now);
      });
    }],

    delta: ['checkStart', function(callback, results) {
      var start = results.checkStart;

      callback(null, now - start);
    }],

    deployCount: ['checkStart', function(callback, results) {
      var start = results.checkStart,
          deployCountKey = 'dc:' + key + ':' + start + ':deploy_count';

      redisClient.incr(deployCountKey, callback);
    }],

    speed: ['delta', 'deployCount', function(callback, results) {
      var delta = results.delta,
          count = results.deployCount,
          start = results.checkStart,
          speedKey = 'dc:' + key + ':speed',
          speed;

      if (delta <= 1) {
        speed = 1;
      } else {
        speed = count / delta * 1000;
      }

      redisClient.set(speedKey, speed, function(err, results) {
        callback(err, parseFloat(speed));
      });
    }]

  }, callback);
};


var determineSuccess = function(results, callback) {
  var userCount = results.userCount || 1,
      speed = results.deploySpeed.speed,
      errorRate = .5 * .5 * speed,
      chance = Math.random() * speed;

  callback(null, chance > errorRate);
};


var updateUsers = function(results, callback) {
  var success = results.determineSuccess,
      userCount = results.userCount,
      speed = results.deploySpeed.speed,
      magnitude = userCount * .01 * .4 * speed
      userCountKey = 'dc:' + results.sessionKey + ':users',
      totalUsersKey = 'dc:total_users';

  magnitude += Math.floor(Math.random() * Math.random() * 20 * .3 * speed);

  if (!success) {
    if (userCount - magnitude <= 0) {
      magnitude = userCount - 1;
    }
    magnitude *= -1;
    magnitude * .6;
  }

  magnitude = Math.floor(magnitude) || 2;

  async.parallel({
    userCount: function(callback) {
      redisClient.incrby(userCountKey, magnitude, callback);
    },

    totalCount: function(callback) {
      redisClient.incrby(totalUsersKey, magnitude, callback);
    },

    magnitude: function(callback) {
      callback(null, magnitude);
    }
  }, callback);
};


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

    deploySpeed: ['sessionKey', function(callback, results) {
      updateDeploySpeed(results.sessionKey, callback);
    }],

    deployCount: ['sessionKey', function(callback, results) {
      redisClient.incr('dc:' + results.sessionKey, callback);
    }],

    userCount: ['sessionKey', function(callback, results) {
      redisClient.get('dc:' + results.sessionKey + ':users', function(err, count) {
        callback(err, count || 1);
      });
    }],

    determineSuccess: ['deploySpeed', 'userCount', function(callback, results) {
      determineSuccess(results, callback);
    }],

    updateUserCount: ['determineSuccess', function(callback, results) {
      updateUsers(results, callback);
    }]
  }, function(err, results) {
    var obj = {};

    req.session.key = results.sessionKey;

    obj['deploy_speed'] = results.deploySpeed;
    obj['deploy_count'] = results.deployCount;
    obj['user_count'] = results.updateUserCount;
    obj['success'] = results.determineSuccess;

    res.contentType('application/json');
    res.send(JSON.stringify(obj));
  });
};


/**
 * Get a deploy.
 */
exports.get = function(req, res) {
  res.send('Got a deploy ' + req.params.id);
};
