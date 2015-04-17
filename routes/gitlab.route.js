var crypto = require('crypto');
var querystring = require('querystring');
var express = require('express');
var url = require('url');
var Q = require('q');
var Gitlab = require('gitlab');
var colorize = require('pygments').colorize;

var gitlabUrl = require('../authentication.json').gitlab_url;
var encryptKey = require('../authentication.json').encrypt_key;
var router = express.Router();
var gitlab = null;

router.get('/:privateKey/repos', makeInitGitlab(false), getRepo);
router.get('/:privateKey/repos/:id/commits', makeInitGitlab(true), getCommits);
router.get('/:privateKey/repos/:id/tree/:sha', makeInitGitlab(true), getTree);
router.get('/:privateKey/repos/:id/blobs/:sha', makeInitGitlab(true), getFile);
router.get('/:privateKey/repos/:id/commits/:sha', makeInitGitlab(true), getFileWithDiff);

function makeInitGitlab(isEncrypted) {
  return function(req, res, next) {
    gitlab = Gitlab({
      url: gitlabUrl,
      token: isEncrypted ? decrypt(querystring.unescape(req.params.privateKey)) : req.params.privateKey
    });
    next();
  };
}

function getFileWithDiff(req, res, next) {
  diffCommit(req.params.id, req.params.sha).then(function(diffs) {
    for (var i in diffs) {
      var d = diffs[i];
      if (d.diff) {
        var path = d.new_path.replace(/\//g, '|');
        if (path === req.query.filePath) {
          var diffParts = parseDiff(d.diff);
          showFile(req.params.id, req.params.sha, path.replace(/\|/g, '/')).then(function(file) {
            var fileLines = file.split('\n');
            var resultLines = [];
            var k = 0;
            for(var j = 0; j < diffParts.length; j++) {
              var dp = diffParts[j];
              var diffLines = dp.content.split('\n');
              for(; k < dp.newStart - 1; k++) {
                resultLines.push(fileLines[k]);
              }
              for(var l = 0; l < diffLines.length; l++) {
                resultLines.push(diffLines[l]);
              }
              k = dp.newStart + dp.newLength - 1;
              if (j === diffParts.length - 1) {
                for(var m = dp.newStart + dp.newLength - 1; m < fileLines.length; m++) {
                  resultLines.push(fileLines[m]);
                }
              }
            }
            var type = 'sql';
            if (~req.query.filePath.indexOf('.java')) {
              type = 'java';
            }
            colorize(resultLines.join('\n'), type, 'html', function(data) {
              res.json({content: addClassToDiffLines(data)});
            });
          });
        }
      }
    }
  }).catch(function(reason) {
    next(reason);
  });
}
router.getFileWithDiff = getFileWithDiff;

function getFile(req, res, next) {
  showFile(req.params.id, req.params.sha, req.query.filePath.replace(/\|/g, '/')).then(function(file) {
    var type = 'sql';
    if (~req.query.filePath.indexOf('.java')) {
      type = 'java';
    }
    colorize(file, type, 'html', function(data) {
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

var showFile = function(id, sha, filePath) {
  var defered = Q.defer();
  gitlab.projects.repository.showFile(id, {ref: sha, file_path: filePath}, function(file) {
    try {
      defered.resolve(new Buffer(file.content, "base64").toString());
    } catch(error) {
      defered.reject(error);
    }
  });
  return defered.promise;
};

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

var diffCommit = function(id, sha) {
  var defered = Q.defer();
  gitlab.projects.repository.diffCommit(id, sha, function(commit) {
    if (commit) {
      defered.resolve(commit);
    } else {
      defered.reject(new Error('commit not found'));
    }
  });
  return defered.promise;
};

var addClassToDiffLines = router.addClassToDiffLines = function(data) {
  var lines = data.split('\n');
  var resultLines = [];
  for(var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.indexOf('<span class="o">+</span>') === 0) {
      line = '<div class="diff-add-line">' + line + '</div>';
      resultLines.push(line);
    } else if (line.indexOf('<span class="o">-</span>') === 0) {
      line = '<div class="diff-del-line">' + line + '</div>';
      resultLines.push(line);
    } else {
      resultLines.push(line + '\n');
    }
  }
  return resultLines.join('');
};

var parseDiff = router.parseDiff = function(diff) {
  var diffLines = diff.split('\n');
  var diffHeader = diffLines.slice(0, 2);
  var diffBody = diffLines.slice(2);
  var diffParts = [];
  var part;
  for(var i = 0; i < diffBody.length; i++) {
    var line = diffBody[i];
    if (line.indexOf('@@') === 0) {
      var match = line.match(/@@ -(\d+),(\d+) \+(\d+),(\d+) @@/);
      part = {
        content: ''
      };
      part.oldStart = parseInt(match[1]);
      part.oldLength = parseInt(match[2]);
      part.newStart = parseInt(match[3]);
      part.newLength = parseInt(match[4]);
      diffParts.push(part);
      continue;
    }
    part.content += line + ((i === diffBody.length - 1 || diffBody[i+1].indexOf('@@') === 0) ? '' : '\n');
  }
  return diffParts;
};

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

router.setDiffCommit = function(func) {
  diffCommit = func;
};
router.setShowFile = function(func) {
  showFile = func;
};
router.setColorize = function(func) {
  colorize = func;
};

module.exports = router;
