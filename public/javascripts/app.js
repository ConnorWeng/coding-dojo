var tdddApp = angular.module('tdddApp', ['ngResource']);

tdddApp.factory('repos', ['$resource', function($resource) {
  return $resource('/gitlab/:privateKey/repos');
}]);

tdddApp.controller('gitCtrl', ['$scope', 'repos', function($scope, repos) {
  $scope.getRepo = function() {
    var repo = repos.get({
      repoUrl: $scope.repoUrl,
      privateKey: $scope.privateKey
    }, function() {
      $scope.repoName = repo.name;
    });
  };
}]);
