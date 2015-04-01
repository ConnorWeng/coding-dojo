var express = require('express');
var router = express.Router();
var db = require('../lib/redis');

router.post('/add', addSolution);

function addSolution(req, res, next) {
  db.addSolution(req.body.problemId, req.body.author, req.body.link, req.body.readTimes).then(function(reply) {
    res.send(reply);
  }, function(reason) {
    next(reason);
  });
}

module.exports = router;
