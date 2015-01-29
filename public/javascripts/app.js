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

tdddApp.controller('editorCtrl', ['$scope', function($scope) {

}]);
