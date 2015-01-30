var tdddApp = angular.module('tdddApp', ['ngResource', 'ngRoute']);

tdddApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'templates/gitlab',
      controller: 'gitlabCtrl'
    }).
    when('/gitlab/:privateKey/repos/:id/blobs/:sha/:fileA/:fileB', {
      templateUrl: 'templates/editor',
      controller: 'editorCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

tdddApp.factory('repos', ['$resource', function($resource) {
  return $resource('/gitlab/:privateKey/repos');
}]);

tdddApp.factory('commits', ['$resource', function($resource) {
  return $resource('/gitlab/:privateKey/repos/:id/commits');
}]);

tdddApp.factory('tree', ['$resource', function($resource) {
  return $resource('/gitlab/:privateKey/repos/:id/tree/:sha');
}]);

tdddApp.factory('files', ['$resource', function($resource) {
  return $resource('/gitlab/:privateKey/repos/:id/blobs/:sha');
}]);

tdddApp.controller('gitlabCtrl', ['$scope', '$location', 'repos', 'commits', 'tree', function($scope, $location, repos, commits, tree) {
  $scope.getRepo = function() {
    repos.get({
      repoUrl: $scope.repoUrl,
      privateKey: $scope.privateKey
    }).$promise.then(function(repo) {
      $scope.repo = repo;
      return commits.query({
        privateKey: $scope.privateKey,
        id: $scope.repo.id
      }).$promise;
    }).then(function(cmts) {
      $scope.sha = cmts[cmts.length - 1]['short_id'];
      return tree.query({
        privateKey: $scope.privateKey,
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
      $location.path('/gitlab/' + $scope.privateKey +
                     '/repos/' + $scope.repo.id +
                     '/blobs/' + $scope.sha +
                     '/' + $scope.fileA +
                     '/' + $scope.fileB);
    });
  };
}]);

tdddApp.controller('editorCtrl', ['$scope', '$routeParams', 'files', function($scope, $routeParams, files) {
  $scope.fileA = $scope.fileB = 'loading...';
  fillCode('fileA');
  fillCode('fileB');
  $scope.state = '80%';

  function fillCode(whichFile) {
    var file = files.get({
      privateKey: $routeParams.privateKey,
      id: $routeParams.id,
      sha: $routeParams.sha,
      filePath: $routeParams[whichFile]
    }, function() {
      $scope[whichFile] = file.content;
    });
  }
}]);
