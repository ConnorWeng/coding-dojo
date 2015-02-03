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
