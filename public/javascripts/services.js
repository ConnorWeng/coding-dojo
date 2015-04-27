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

tdddApp.factory('counter', ['$resource', function($resource) {
  return $resource('/counter/:name', {}, {
    incr: {method:'POST', params: {name: '@name'}}
  });
}]);

tdddApp.factory('diff', ['$resource', function($resource) {
  return $resource('/gitlab/:privateKey/repos/:id/commits/:sha');
}]);

tdddApp.factory('problem', ['$resource', function($resource) {
  return $resource('/problem/:id', {id: '@id'});
}]);

tdddApp.factory('solution', ['$resource', function($resource) {
  return $resource('/problem/:id/solution/:sid', {id: '@id'});
}]);
