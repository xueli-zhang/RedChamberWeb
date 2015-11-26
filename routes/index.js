var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res, next) {	
	console.log(req.session);
	res.render('index', { 
  		title: '幻想紅樓夢 I--櫻花飛舞時',
  		user: req.session.user,
  		success: req.flash('success').toString()
  	});
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
	console.log("set up new User!");
	User.get(newUser.name, function(err, user){
		if(err){
			req.flash('signErr', err);
			return res.redirect('/signUpErr');
		}

		console.log("db works ok");
		if(user){
			req.flash('signErr', '玩家名稱已存在！');
			return res.redirect('/signUpErr');
		}
		User.get(newUser.email, function(err, user){
			if(err){				
				req.flash('signErr', err);
				return res.redirect('/signUpErr');
			}

			if(user){
				req.flash('signErr', '郵箱已在本網站經註冊！');
				return res.redirect('/signUpErr');
			}
			console.log("try to save user");
			newUser.save(function(err, user){
				if(err){
					console.log('save error')
					req.flash('signErr', err);
					return res.redirect('/signUpErr');
				}
				req.session.user = user;
				console.log('finishing reg');
				req.flash('success', '註冊成功，歡迎加入！');
				res.redirect('/');
			});
		});
	});
});
router.get('/signUpErr',function(req,res){
	res.render('signUpErr', {'signErr': req.flash('signErr').toString()});
});
module.exports = router;
