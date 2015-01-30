describe('tddd controllers', function() {
  beforeEach(module('tdddApp'));

  describe('gitlabCtrl', function() {
    var scope, ctrl, $httpBackend;

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();
      ctrl = $controller('gitlabCtrl', {$scope: scope});
    }));

    it('should set the repo name', function() {
      scope.privateKey = 'xyz';
      $httpBackend.expectGET('/gitlab/xyz/repos').respond({name: 'a repo'});
      scope.getRepo();
      $httpBackend.flush();
      expect(scope.repoName).toBe('a repo');
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
