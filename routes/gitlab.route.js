var express = require('express');
var url = require('url');
var Q = require('q');
var Gitlab = require('gitlab');

var router = express.Router();
var gitlab = null;

router.get('/*', function(req, res, next) {
  var pathname = url.parse(req.url).pathname;
  var paths = pathname.split('/');
  var privateKey = paths[1];
  if (privateKey) {
    gitlab = Gitlab({
      url: 'http://gitlab.sdc.icbc',
      token: privateKey
    });
    // TODO: replace with regex match
    if (req.query.repoUrl) {
      getRepo.call(null, req, res, next);
    } else if (~req.url.indexOf('commits')) {
      getCommits.call(null, req, res, next, paths[3]);
    } else if (~req.url.indexOf('tree')) {
      getTree.call(null, req, res, next, paths[3], paths[5]);
    } else if (~req.url.indexOf('blobs')) {
      getFile.call(null, req, res, next, paths[3], paths[5], req.query.filePath);
    }
  } else {
    next(new Error('private key not provided'));
  }
});

function getFile(req, res, next, id, sha, filePath) {
  showFile(id, sha, filePath).then(function(file) {
    res.send(file);
  }).catch(function(reason) {
    next(reason);
  });
}

function getTree(req, res, next, id, sha) {
  listFiles(id, sha).then(function(tree) {
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

function getCommits(req, res, next, id) {
  listCommits(id).then(function(commits) {
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
    defered.resolve(tree);
  });
  return defered.promise;
}

function listCommits(id) {
  var defered = Q.defer();
  // FIXME: only support project which commits count below 100
  gitlab.projects.listCommits({id: id, per_page: 100}, function(commits) {
    defered.resolve(commits);
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
