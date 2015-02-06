var tdddControllers = angular.module('tdddControllers', ['ngSanitize']);

tdddControllers.controller('gitlabCtrl', ['$scope', '$location', 'repos', 'commits', 'tree', function($scope, $location, repos, commits, tree) {
  $scope.getRepo = function() {
    repos.get({
      repoUrl: $scope.repoUrl,
      privateKey: $scope.privateKey
    }).$promise.then(function(repo) {
      $scope.repo = repo;
      return commits.query({
        privateKey: $scope.repo.encrypted_private_key,
        id: $scope.repo.id
      }).$promise;
    }).then(function(cmts) {
      $scope.sha = cmts[cmts.length - 1]['short_id'];
      return tree.query({
        privateKey: $scope.repo.encrypted_private_key,
        id: $scope.repo.id,
        sha: $scope.sha
      }).$promise;
    }).then(function(fileTree) {
      var files = [];
      for (var i = 0; i < fileTree.length; i++) {
        var file = fileTree[i];
        if (file.type === 'blob') {
          files.push(file);
          if (files.length === 2) {
            break;
          }
        }
      }
      $scope.fileA = files[0].name;
      $scope.fileB = files[1].name;
    }).then(function() {
      $location.path('/gitlab/' + $scope.repo.encrypted_private_key +
                     '/repos/' + $scope.repo.id +
                     '/blobs/' + $scope.sha +
                     '/' + $scope.fileA +
                     '/' + $scope.fileB);
    }).catch(function(reason) {
      console.log(reason);
    });
  };
}]);

tdddControllers.controller('editorCtrl', ['$scope', '$routeParams', '$location', '$sce', 'files', 'commits', 'tree', function($scope, $routeParams, $location, $sce, files, commits, tree) {
  $scope.fileA = $scope.fileB = 'loading...';
  $scope.state = 0;
  fillCode('fileA');
  fillCode('fileB');

  var cmts = commits.query({
    privateKey: $routeParams.privateKey,
    id: $routeParams.id
  }, function() {
    for (var i = 0; i < cmts.length; i++) {
      var cmt = cmts[i];
      if (cmt.short_id === $routeParams.sha) {
        $scope.state = (100 - parseInt(i * 100 / (cmts.length - 1))).toString() + '%';
        if (i - 1 > -1) {
          $scope.next = '/#' + $location.url().replace($routeParams.sha, cmts[i-1]['short_id']);
        }
        if (i + 1 < cmts.length) {
          $scope.prev = '/#' + $location.url().replace($routeParams.sha, cmts[i+1]['short_id']);
        }
        break;
      }
    }
  });

  tree.query({
    privateKey: $routeParams.privateKey,
    id: $routeParams.id,
    sha: $routeParams.sha
  }).$promise.then(function(tree) {
    var filePaths = [];
    for(var i = 0; i < tree.length; i++) {
      var file = tree[i];
      filePaths.push(file.name);
    }
    $scope.filePaths = filePaths;
    $scope.filePathA = $routeParams.fileA;
    $scope.filePathB = $routeParams.fileB;
  });

  $scope.switchFile = function(path) {
    $location.url('/gitlab/' + $routeParams.privateKey +
                  '/repos/' + $routeParams.id +
                  '/blobs/' + $routeParams.sha +
                  '/' + $scope.filePathA +
                  '/' + $scope.filePathB);
  };

  function fillCode(whichFile) {
    var file = files.get({
      privateKey: $routeParams.privateKey,
      id: $routeParams.id,
      sha: $routeParams.sha,
      filePath: $routeParams[whichFile]
    }, function() {
      $scope[whichFile] = $sce.trustAsHtml(file.content);
    });
  }
}]);
