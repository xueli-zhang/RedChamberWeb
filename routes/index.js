var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '幻想紅樓夢 I--櫻花飛舞時' });
});
router.post('/signUp', function(req, res){
	console.log("get in to signUp");
	var name = req.body.name,
	password = req.body.password,
		email = req.body.email;

	var md5 = crypto.createHash('md5'),
	password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name : name,
		password : password,
		email : email
	});

	User.get(newUser.name, function(err, user){
		if(err){
			req.flash('signErr', err);
			return res.redirect('/');
		}
		if(user){
			req.flash('signErr', '玩家名稱已存在！');
			return res.redirect('/');
		}
		if(email){
			req.flash('signErr', '郵箱已經在本網站使用過！');
			return res.redirect('/');
		}
		newUser.save(function(err, user){
			if(err){
				req.flash('signErr', err);
				return res.redirect('/');
			}
			req.session.user = user;
			console.log('finishing reg');
			req.flash('success', '註冊成功，歡迎加入！');
			res.redirect('/');
		});
	});
});
router.get('/signUp',function(req, res){
	res.render('index',{title: req.flash()});
})
module.exports = router;
