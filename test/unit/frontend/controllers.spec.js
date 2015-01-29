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
});
