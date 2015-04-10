var express = require('express');
var router = express.Router();
var db = require('../lib/redis');

router.post('/', addProblem);

function addProblem(req, res, next) {
  db.addProblem(req.body.title, req.body.desc).then(function(reply) {
    res.send(reply);
  }, function(reason) {
    next(reason);
  });
}

module.exports = router;
