var chai = require('chai');
var sinon = require('sinon');
var router = require('../../../routes/gitlab.route');

chai.should();

describe('tddd', function() {
  describe('crypto', function() {
    it('should encrypt and decrypt text correctly', function() {
      var plain = 'x3C!!!WFxxxcfYtxQLmTrg3kQ7';
      var encrypted = router.encrypt(plain);
      router.decrypt(encrypted).should.equal(plain);
    });
  });
});
