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

tdddApp.factory('files', ['$resource', function($resource) {
  return $resource('/gitlab/:privateKey/repos/:id/blobs/:sha');
}]);

tdddApp.controller('gitlabCtrl', ['$scope', 'repos', function($scope, repos) {
  $scope.getRepo = function() {
    var repo = repos.get({
      repoUrl: $scope.repoUrl,
      privateKey: $scope.privateKey
    }, function() {
      $scope.repoName = repo.name;
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
