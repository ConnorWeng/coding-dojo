describe('tddd controllers', function() {
  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });

  beforeEach(module('tdddApp'));

  describe('gitlabCtrl', function() {
    var scope, ctrl, $httpBackend, $location;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      scope = $rootScope.$new();
      ctrl = $controller('gitlabCtrl', {$scope: scope});
    }));

    it('should get repo, sha, fileA, fileB', function() {
      var repo = {name: 'a repo', id: '1'};
      scope.privateKey = 'xyz';
      $httpBackend.expectGET('/gitlab/xyz/repos').respond(repo);
      $httpBackend.expectGET('/gitlab/xyz/repos/1/commits').respond([
        {short_id: 'abcd1'},
        {short_id: 'abcd2'}
      ]);
      $httpBackend.expectGET('/gitlab/xyz/repos/1/tree/abcd2').respond([
        {name: 'fa', type: 'blob'},
        {name: 'fb', type: 'tree'},
        {name: 'fc', type: 'blob'}
      ]);
      scope.getRepo();
      $httpBackend.flush();
      expect(scope.repo).toEqualData(repo);
      expect(scope.sha).toBe('abcd2');
      expect(scope.fileA).toBe('fa');
      expect(scope.fileB).toBe('fc');
      expect($location.path()).toBe('/gitlab/xyz/repos/1/blobs/abcd2/fa/fc');
    });
  });

  describe('editorCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, $routeParams) {
      $httpBackend = _$httpBackend_;
      $routeParams.privateKey = 'privateKey';
      $routeParams.id = 'id';
      $routeParams.sha = 'sha';
      $routeParams.fileA = 'fileA';
      $routeParams.fileB = 'fileB';
      $httpBackend.expectGET('/gitlab/privateKey/repos/id/blobs/sha?filePath=fileA').respond({
        content: 'fileA content'
      });
      $httpBackend.expectGET('/gitlab/privateKey/repos/id/blobs/sha?filePath=fileB').respond({
        content: 'fileB content'
      });
      scope = $rootScope.$new();
      ctrl = $controller('editorCtrl', {$scope: scope});
    }));

    it('should get 2 files content and set to scope', function() {
      expect(scope.fileA).toBe('loading...');
      expect(scope.fileB).toBe('loading...');
      $httpBackend.flush();
      expect(scope.fileA).toBe('fileA content');
      expect(scope.fileB).toBe('fileB content');
    });
  })
});
