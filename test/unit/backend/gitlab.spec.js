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

  describe('getFileWithDiff', function() {
    var req, res;

    var mockDiffCommit = function(diffs) {
      router.setDiffCommit(function() {
        return {
          then: function(f) {
            f([{
              new_path: 'src/some_file.java',
              diff: diffs
            }]);
            return {
              catch: function(f) {}
            };
          }
        };
      });
    };

    beforeEach(function() {
      router.setShowFile(function() {
        return {
          then: function(f) {
            f('System.out.println("line1");\nSystem.out.println("line2");\nSystem.out.println("line3");\nSystem.out.println("line4");\nSystem.out.println("line5");\nSystem.out.println("line6");\nSystem.out.println("line7");\nSystem.out.println("line8");\nSystem.out.println("line9");\nSystem.out.println("line10");');
          }
        };
      });

      req = {
        params: {
          id: 'id',
          sha: 'sha'
        },
        query: {
          filePath: 'src|some_file.java'
        }
      };
      res = {
        json: function(o) {}
      };
    });

    it('should call colorize with right arguments with one diff', function() {
      mockDiffCommit('--- a/src/some_file.java\n+++ b/src/some_file.java\n@@ -3,2 +3,4 @@\nSystem.out.println("line3");\nSystem.out.println("line4");\n+System.out.println("line5");\n+System.out.println("line6");');
      router.setColorize(function(code, type, format, callback) {
        code.should.equal('System.out.println("line1");\nSystem.out.println("line2");\nSystem.out.println("line3");\nSystem.out.println("line4");\n+System.out.println("line5");\n+System.out.println("line6");\nSystem.out.println("line7");\nSystem.out.println("line8");\nSystem.out.println("line9");\nSystem.out.println("line10");');
      });
      router.getFileWithDiff(req, res, {});
    });

    it('should call colorize with right arguments with two diff', function() {
      mockDiffCommit('--- a/src/some_file.java\n+++ b/src/some_file.java\n@@ -3,2 +3,4 @@\nSystem.out.println("line3");\nSystem.out.println("line4");\n+System.out.println("line5");\n+System.out.println("line6");\n@@ -8,1 +8,3 @@\n-System.out.println("error");\n+System.out.println("line8");\nSystem.out.println("line9");\nSystem.out.println("line10");');
      router.setColorize(function(code, type, format, callback) {
        code.should.equal('System.out.println("line1");\nSystem.out.println("line2");\nSystem.out.println("line3");\nSystem.out.println("line4");\n+System.out.println("line5");\n+System.out.println("line6");\nSystem.out.println("line7");\n-System.out.println("error");\n+System.out.println("line8");\nSystem.out.println("line9");\nSystem.out.println("line10");');
      });
      router.getFileWithDiff(req, res, {});
    });
  });

  describe('parseDiff', function() {
    it('should parse given diffs and return array of diff parts', function() {
      router.parseDiff(["--- a/test/unit/frontend/controllers.spec.js",
                        "+++ b/test/unit/frontend/controllers.spec.js",
                        "@@ -105,5 +105,14 @@ describe('tddd controllers', function() {",
                        "       expect(scope.filePathA).toBe('fileA');",
                        "       expect(scope.filePathB).toBe('fileB');",
                        "     });",
                        "-  })",
                        "+",
                        "+    it('should return html with diff', function() {",
                        "+      $httpBackend.expectGET('/gitlab/privateKey/repos/id/commits/sha?filePath=fileA').respond({",
                        "+        content: 'fileA content with diff'",
                        "+      });",
                        "+      scope.showDiff('fileA');",
                        "+      $httpBackend.flush();",
                        "+      expect($sce.getTrustedHtml(scope.fileA)).toBe('fileA content with diff');",
                        "+    });",
                        "+  });",
                        " });"].join('\n')).should.eql([{
                          content: ["       expect(scope.filePathA).toBe('fileA');",
                                    "       expect(scope.filePathB).toBe('fileB');",
                                    "     });",
                                    "-  })",
                                    "+",
                                    "+    it('should return html with diff', function() {",
                                    "+      $httpBackend.expectGET('/gitlab/privateKey/repos/id/commits/sha?filePath=fileA').respond({",
                                    "+        content: 'fileA content with diff'",
                                    "+      });",
                                    "+      scope.showDiff('fileA');",
                                    "+      $httpBackend.flush();",
                                    "+      expect($sce.getTrustedHtml(scope.fileA)).toBe('fileA content with diff');",
                                    "+    });",
                                    "+  });",
                                    " });"].join('\n'),
                          oldStart: 105,
                          oldLength: 5,
                          newStart: 105,
                          newLength: 14
                        }]);
    });
  });
});
