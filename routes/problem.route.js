var express = require('express');
var router = express.Router();
var db = require('../lib/redis');

router.post('/', addProblem);
router.get('/', queryProblems);

function addProblem(req, res, next) {
  db.addProblem(req.body.title, req.body.desc).then(function(reply) {
    res.send('ok');
  }, function(reason) {
    next(reason);
  });
}

function queryProblems(req, res, next) {
  db.queryProblems().then(function(reply) {
    res.send(reply);
  }, function(reason) {
    next(reason);
  });
}

module.exports = router;
