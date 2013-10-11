/**
 * Create a deploy.
 */
exports.create = function(req, res) {
  res.send('Created a deploy!');
};


/**
 * Get a deploy.
 */
exports.get = function(req, res) {
  res.send('Got a deploy ' + req.params.id);
};
