describe('tddd app', function() {
  describe('index page', function() {
    beforeEach(function() {
      browser.get('/');
    });

    it('should jump to the right url', function() {
      element(by.model('repoUrl')).sendKeys('http://gitlab.sdc.icbc/000831501/2014-11-06-coding-dojo');
      element(by.model('privateKey')).sendKeys('x3CWFcfYtxQLmTrg3kQ7');
      element(by.css('.startBtn')).click();
      expect(browser.getCurrentUrl()).toContain('/gitlab/oyZUm9kJiqGPGYdqRg87RwHg3hbjW83l/repos/241/blobs/668a1ad79ff/fnc_get_factor.fnc/ut_get_factor.pck');
    });
  });

  describe('editor page', function() {
    beforeEach(function() {
      browser.get('/#/gitlab/oyZUm9kJiqGPGYdqRg87RwHg3hbjW83l/repos/241/blobs/668a1ad79ff/fnc_get_factor.fnc/ut_get_factor.pck');
    });

    it('should set next and prev style and url correctly', function() {
      expect(element(by.css('.prev')).getAttribute('class')).toBe('prev disabled');
      expect(element(by.css('.prev')).getAttribute('href')).toBe('unsafe:javascript: void 0;');
      expect(element(by.css('.next')).getAttribute('class')).toBe('next');
      expect(element(by.css('.next')).getAttribute('href')).toContain('/gitlab/oyZUm9kJiqGPGYdqRg87RwHg3hbjW83l/repos/241/blobs/8d125892f02/fnc_get_factor.fnc/ut_get_factor.pck');
    });

    it('should go to next commit after clicking next link', function() {
      element(by.css('.next')).click();
      expect(browser.getCurrentUrl()).toContain('/gitlab/oyZUm9kJiqGPGYdqRg87RwHg3hbjW83l/repos/241/blobs/8d125892f02/fnc_get_factor.fnc/ut_get_factor.pck');
    });

    it('should switch file after select new path', function() {
      element(by.css('.next')).click();
      element(by.cssContainingText('option', 'readme.md')).click();
      expect(browser.getCurrentUrl()).toContain('/gitlab/oyZUm9kJiqGPGYdqRg87RwHg3hbjW83l/repos/241/blobs/8d125892f02/readme.md/ut_get_factor.pck');
    });
  });
});
