var tdddApp = angular.module('tdddApp', ['ngResource', 'ngRoute', 'tdddControllers']);

tdddApp.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'templates/list',
      controller: 'listCtrl'
    }).
    when('/gitlab', {
      templateUrl: 'templates/gitlab',
      controller: 'gitlabCtrl'
    }).
    when('/problem/:id', {
      templateUrl: 'templates/problem',
      controller: 'problemCtrl'
    }).
    when('/gitlab/:privateKey/repos/:id/blobs/:sha/:fileA/:fileB', {
      templateUrl: 'templates/editor',
      controller: 'editorCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });

  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);
