var Q = require('q');
var redis = require('redis');
var authentication = require('../authentication.json');
var client = redis.createClient(authentication.redis_port, authentication.redis_host, {});

client.on('error', function(err) {
  console.error(err);
});

var incr = Q.nbind(client.incr, client);
var hmset = Q.nbind(client.hmset, client);

exports.addProblem = function(title, desc) {
  return incr('problem:').then(function(problemId) {
    return hmset('problem:' + problemId, {
      'title': title,
      'desc': desc
    });
  });
};
