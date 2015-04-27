var express = require('express');
var router = express.Router();
var db = require('../lib/redis');

router.post('/', addProblem);
router.get('/', queryProblems);
router.get('/:id', getProblem);
router.post('/:id/solution', addSolution);
router.get('/:id/solution', querySolutions);

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

function getProblem(req, res, next) {
  db.getProblem(req.params.id).then(function(reply) {
    res.send(reply);
  }, function(reason) {
    next(reason);
  });
}

function addSolution(req, res, next) {
  db.addSolution(req.params.id, req.body.title, req.body.author, req.body.link, 0).then(function(reply) {
    res.send('ok');
  }, function(reason) {
    next(reason);
  });
}

function querySolutions(req, res, next) {
  db.querySolutions(req.params.id).then(function(reply) {
    res.send(reply);
  }, function(reason) {
    next(reason);
  });
}

module.exports = router;
