var tdddApp = angular.module('tdddApp', ['ngResource', 'ngRoute', 'tdddControllers']);

tdddApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'templates/list',
      controller: 'listCtrl'
    }).
    when('/gitlab', {
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
