var crypto = require('crypto');
var querystring = require('querystring');
var express = require('express');
var url = require('url');
var Q = require('q');
var Gitlab = require('gitlab');
var colorize = require('pygments').colorize;

var encryptKey = require('../authentication.json').encrypt_key;
var router = express.Router();
var gitlab = null;

router.get('/:privateKey/repos', makeInitGitlab(false), getRepo);
router.get('/:privateKey/repos/:id/commits', makeInitGitlab(true), getCommits);
router.get('/:privateKey/repos/:id/tree/:sha', makeInitGitlab(true), getTree);
router.get('/:privateKey/repos/:id/blobs/:sha', makeInitGitlab(true), getFile);

function makeInitGitlab(isEncrypted) {
  return function(req, res, next) {
    gitlab = Gitlab({
      url: 'http://gitlab.sdc.icbc',
      token: isEncrypted ? decrypt(querystring.unescape(req.params.privateKey)) : req.params.privateKey
    });
    next();
  };
}

function getFile(req, res, next) {
  showFile(req.params.id, req.params.sha, req.query.filePath.replace(/\|/g, '/')).then(function(file) {
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
      project.encrypted_private_key = querystring.escape(encrypt(req.params.privateKey));
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

function listFiles(id, sha, path, remains, defered, files) {
  files = files || [];
  remains = remains || [];
  path = path || '';
  defered = defered || Q.defer();
  gitlab.projects.repository.listTree(id, {ref_name: sha, path: path}, function(tree) {
    for(var i = 0; i < tree.length; i++) {
      var file = tree[i];
      if (path) {
        file.name = path.replace(/\//g, '|') + '|' + file.name;
      }
      if (file.type === 'blob') {
        files.push(file);
      } else if (file.type === 'tree') {
        remains.push(file.name.replace(/\|/g, '/'));
      }
    }
    if (remains.length > 0) {
      listFiles(id, sha, remains.shift(), remains, defered, files);
    } else {
      defered.resolve(files);
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

var encrypt = router.encrypt = function(plain) {
  var cipher = crypto.createCipher('des', encryptKey);
  var encrypted = cipher.update(plain, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
};

var decrypt = router.decrypt = function(encrypted) {
  var decipher = crypto.createDecipher('des', encryptKey);
  var plain = decipher.update(encrypted, 'base64', 'utf8');
  plain += decipher.final('utf8');
  return plain;
};

module.exports = router;
