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
      var repo = {name: 'a repo', id: '1', encrypted_private_key: 'encrypted_xyz'};
      scope.privateKey = 'xyz';
      $httpBackend.expectGET('/gitlab/xyz/repos').respond(repo);
      $httpBackend.expectGET('/gitlab/encrypted_xyz/repos/1/commits').respond([
        {short_id: 'abcd1'},
        {short_id: 'abcd2'}
      ]);
      $httpBackend.expectGET('/gitlab/encrypted_xyz/repos/1/tree/abcd2').respond([
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
      expect($location.path()).toBe('/gitlab/encrypted_xyz/repos/1/blobs/abcd2/fa/fc');
    });
  });

  describe('editorCtrl', function() {
    var scope, ctrl, $httpBackend, $location, $sce;

    beforeEach(inject(function(_$httpBackend_, _$location_, _$sce_, $rootScope, $controller, $routeParams) {
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $sce = _$sce_;
      $routeParams.privateKey = 'privateKey';
      $routeParams.id = 'id';
      $routeParams.sha = 'sha';
      $routeParams.fileA = 'fileA';
      $routeParams.fileB = 'fileB';
      $location.path('/gitlab/privateKey/repos/id/blobs/sha/fileA/fileB');
      $httpBackend.expectGET('/gitlab/privateKey/repos/id/blobs/sha?filePath=fileA').respond({
        content: 'fileA content'
      });
      $httpBackend.expectGET('/gitlab/privateKey/repos/id/blobs/sha?filePath=fileB').respond({
        content: 'fileB content'
      });
      $httpBackend.expectGET('/gitlab/privateKey/repos/id/commits').respond([{
        short_id: 'trival3'
      }, {
        short_id: 'trival2'
      }, {
        short_id: 'sha'
      }, {
        short_id: 'trival1'
      }]);
      scope = $rootScope.$new();
      ctrl = $controller('editorCtrl', {$scope: scope});
    }));

    it('should get 2 files content and set to scope', function() {
      expect(scope.fileA).toBe('loading...');
      expect(scope.fileB).toBe('loading...');
      $httpBackend.flush();
      expect($sce.getTrustedHtml(scope.fileA)).toBe('fileA content');
      expect($sce.getTrustedHtml(scope.fileB)).toBe('fileB content');
    });

    it('should set state, next, prev', function() {
      expect(scope.state).toBe(0);
      expect(scope.next).toBe(void 0);
      expect(scope.prev).toBe(void 0);
      $httpBackend.flush();
      expect(scope.state).toBe('34%');
      expect(scope.next).toBe('/#/gitlab/privateKey/repos/id/blobs/trival2/fileA/fileB');
      expect(scope.prev).toBe('/#/gitlab/privateKey/repos/id/blobs/trival1/fileA/fileB');
    });
  })
});
