var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'CodingDojo' });
});

router.get('/templates/:name', function(req, res) {
  res.render(req.params.name, { title: 'CodingDojo' });
});

module.exports = router;
