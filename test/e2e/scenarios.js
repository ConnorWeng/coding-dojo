describe('tddd app', function() {
  it('should get repo name from gitlab', function() {
    browser.get('/');
    element(by.model('repoUrl')).sendKeys('http://gitlab.sdc.icbc/000831501/2014-11-06-coding-dojo');
    element(by.model('privateKey')).sendKeys('x3CWFcfYtxQLmTrg3kQ7');
    element(by.css('.startBtn')).click();
    expect(element(by.css('#result')).getText()).toBe('2014-11-06-coding-dojo');
  });
});
