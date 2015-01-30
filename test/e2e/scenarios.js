describe('tddd app', function() {
  it('should jump to the right url', function() {
    browser.get('/');
    element(by.model('repoUrl')).sendKeys('http://gitlab.sdc.icbc/000831501/2014-11-06-coding-dojo');
    element(by.model('privateKey')).sendKeys('x3CWFcfYtxQLmTrg3kQ7');
    element(by.css('.startBtn')).click();
    expect(browser.getCurrentUrl()).toContain('/gitlab/x3CWFcfYtxQLmTrg3kQ7/repos/241/blobs/668a1ad79ff/fnc_get_factor.fnc/ut_get_factor.pck');
  });
});
