var express = require('express');
var url = require('url');
var Q = require('q');
var Gitlab = require('gitlab');
var colorize = require('pygments').colorize;

var router = express.Router();
var gitlab = null;

router.get('/:privateKey/repos', initGitlab, getRepo);
router.get('/:privateKey/repos/:id/commits', initGitlab, getCommits);
router.get('/:privateKey/repos/:id/tree/:sha', initGitlab, getTree);
router.get('/:privateKey/repos/:id/blobs/:sha', initGitlab, getFile);

function initGitlab(req, res, next) {
  gitlab = Gitlab({
    url: 'http://gitlab.sdc.icbc',
    token: req.params.privateKey
  });
  next();
}

function getFile(req, res, next) {
  showFile(req.params.id, req.params.sha, req.query.filePath).then(function(file) {
    colorize(file, 'sql', 'html', function(data) {
      res.json({content: data});
    });
  }).catch(function(reason) {
    next(reason);
  });
}

function getTree(req, res, next) {
  listFiles(req.params.id, req.params.sha).then(function(tree) {
    res.json(tree);
  }).catch(function(reason) {
    next(reason);
  });
}

function getRepo(req, res, next) {
  findRepo(req.query.repoUrl)
    .then(function(project) {
      res.json(project);
    }).catch(function(reason) {
      next(reason);
    });
}

function getCommits(req, res, next) {
  listCommits(req.params.id).then(function(commits) {
    res.json(commits);
  }).catch(function(reason) {
    next(reason);
  });
}

function showFile(id, sha, filePath) {
  var defered = Q.defer();
  gitlab.projects.repository.showFile(id, {ref: sha, file_path: filePath}, function(file) {
    try {
      defered.resolve(new Buffer(file.content, "base64").toString());
    } catch(error) {
      defered.reject(error);
    }
  });
  return defered.promise;
}

function listFiles(id, sha) {
  var defered = Q.defer();
  gitlab.projects.repository.listTree(id, {ref_name: sha}, function(tree) {
    if (tree) {
      defered.resolve(tree);
    } else {
      defered.reject(new Error('tree is empty, maybe repo id or ref is wrong'));
    }
  });
  return defered.promise;
}

function listCommits(id) {
  var defered = Q.defer();
  // FIXME: only support project which commits count below 100
  gitlab.projects.listCommits({id: id, per_page: 100}, function(commits) {
    if (commits) {
      defered.resolve(commits);
    } else {
      defered.reject(new Error('commits not found, maybe repo id is wrong'));
    }
  });
  return defered.promise;
}

function findRepo(repoUrl) {
  var defered = Q.defer();
  gitlab.projects.all(function(projects) {
    var project = null;
    for (var i = 0; i < projects.length; i++) {
      if (projects[i].web_url === repoUrl) {
        project = projects[i];
      }
    }
    if (project) {
      defered.resolve(project);
    } else {
      defered.reject(new Error('project not found'));
    }
  });
  return defered.promise;
}

module.exports = router;
