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
    var multi = client.multi();
    var problemKey = 'problem:' + problemId;
    multi.hmset(problemKey, {
      'title': title,
      'desc': desc
    });
    multi.zadd('problems', new Date().getTime(), problemKey);
    var exec = Q.nbind(multi.exec, multi);
    return exec();
  });
};

exports.addSolution = function(problemId, author, link, readTimes) {
  return incr('solution:').then(function(solutionId) {
    var multi = client.multi();
    var solutionKey = 'solution:' + solutionId;
    multi.hmset(solutionKey, {
      'author': author,
      'link': link,
      'readTimes': readTimes
    });
    multi.zadd('solutions:' + problemId, new Date().getTime(), solutionKey);
    var exec = Q.nbind(multi.exec, multi);
    return exec();
  });
};
