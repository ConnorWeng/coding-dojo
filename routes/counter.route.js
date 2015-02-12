var express = require('express');
var router = express.Router();
var redis = require('redis');
var authentication = require('../authentication.json');
var client = redis.createClient(authentication.redis_port, authentication.redis_host, {});

client.on('error', function(err) {
  console.error(err);
});

router.get('/:name', function(req, res) {
  var countName = 'repo:'+req.params.name+':count';
  client.get(countName, function(err, reply) {
    if (reply) {
      res.send({count: reply});
    } else {
      res.send({count: 0});
    }
  });
});

router.post('/:name', function(req, res) {
  var countName = 'repo:'+req.params.name+':count';
  client.incr(countName, function(err, reply) {
    res.send({count: reply});
  });
});

module.exports = router;
