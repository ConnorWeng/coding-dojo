describe('tddd app', function() {
  describe('index page', function() {
    beforeEach(function() {
      browser.get('/#/gitlab');
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

    it('should display commit message', function() {
      expect(element(by.css('.msg')).getText()).toBe('初始化文件');
    });

    it('should see diff after clicking diff button', function() {
      browser.get('/#/gitlab/oyZUm9kJiqGPGYdqRg87RwHg3hbjW83l/repos/241/blobs/ce18f06df69/fnc_get_factor.fnc/ut_get_factor.pck');
      element.all(by.css('.diff')).get(0).click();
      expect(element.all(by.css('.diff-add-line')).count()).toBe(5);
      expect(element.all(by.css('.diff-del-line')).count()).toBe(1);
    });
  });

  describe('list page', function() {
    beforeEach(function() {
      browser.get('/');
    });

    it('should add a new problem onto the page', function() {
      var problems = element.all(by.repeater('problem in problems'));
      element(by.css('.add-problem')).click();
      var time = new Date().getTime();
      element(by.css('.title')).sendKeys('title' + time);
      element(by.css('.desc')).sendKeys('desc' + time);
      element(by.css('.btn')).click();
      expect(problems.last().getText()).toBe('title' + time);
    });

    it('should jump to problem page after clicking one of problem title', function() {
      element.all(by.repeater('problem in problems')).get(0).click();
      expect(browser.getCurrentUrl()).toContain('/#/problem/1');
    });
  });

  describe('problem page', function() {
    beforeEach(function() {
      browser.get('/');
      element.all(by.repeater('problem in problems')).get(0).click();
    });

    it('should add a new solution onto the page', function() {
      var solutions = element.all(by.repeater('solution in solutions'));
      var time = new Date().getTime();
      element(by.css('.add-solution')).click();
      element(by.css('.title')).sendKeys('title' + time);
      element(by.css('.author')).sendKeys('author' + time);
      element(by.css('.link')).sendKeys('link' + time);
      element(by.css('.btn')).click();
      expect(solutions.last().getText()).toBe('title' + time);
    });
  });
});
