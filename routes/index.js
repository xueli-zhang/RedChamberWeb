var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');

/* GET home page. */
router.get('/', function(req, res, next) {	
	console.log(req.session);
	if(req.flash('success').toString()!=""){
		console.log('success:/'+req.flash('success').toString()+'/end of success');
		res.render('index', { 
  			title: '幻想紅樓夢 I--櫻花飛舞時',
  			user: req.session.user,
  			success: req.flash('success').toString()
  		});
  		req.flash('success', "");
	}else{
		res.render('index',{
  			title: '幻想紅樓夢 I--櫻花飛舞時',
  			user: req.session.user,
  			success: null
		});
	}
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
	User.getUserName(newUser.name, function(err, user){
		if(err){
			req.flash('signErr', err);
			return res.redirect('/signUpErr');
		}

		console.log("db works ok");
		if(user){
			req.flash('signErr', '玩家名稱已存在！');
			return res.redirect('/signUpErr');
		}
		User.getEmail(newUser.email, function(err, user){
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
	res.render('signUpErr', {
		title: '未能成功註冊。。。',
		signErr: req.flash('signErr').toString()
	});
});
router.post('/logIn', function(req, res){
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.logPassword).digest('hex');

	User.getUserName(req.body.logName, function(err, user){
		if(!user){
			req.flash('logInErr','該用戶不存在！');
			return res.redirect('/logInErr');
		}
		if(user.password!=password){
			req.flash('logInErr', '密碼錯誤！');
			return res.redirect('/logInErr');
		}
		req.session.user = user;
		res.redirect('/');
	});
});
router.get('/logInErr', function(req, res){
	res.render('logInErr', {
		title: '未能成功登陸。。。',
		logInErr: req.flash('logInErr').toString()
	})
});
router.get('/logOut', function(req, res){
	req.session.user = null;
	res.redirect('/');
});
module.exports = router;
