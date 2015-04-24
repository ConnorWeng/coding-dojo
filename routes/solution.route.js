var express = require('express');
var router = express.Router();
var db = require('../lib/redis');

router.post('/', addSolution);

function addSolution(req, res, next) {
  db.addSolution(req.body.problemId, req.body.title, req.body.author, req.body.link, 0).then(function(reply) {
    res.send('ok');
  }, function(reason) {
    next(reason);
  });
}

module.exports = router;
