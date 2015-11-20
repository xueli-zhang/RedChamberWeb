var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '幻想紅樓夢 I--櫻花飛舞時' });
});

module.exports = router;
