var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');

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
		email : email,
		photo : "https://88f7585151da6f0eb044adb480012d24af7f35ca.googledrive.com/host/0B8VElOPvAs5qVHlhNTRHbmVkLW8/userDPho.png"
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
	res.render('err', {
		title: '未能成功註冊。。。',
		err: req.flash('signErr').toString()
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
	res.render('err', {
		title: '未能成功登陸。。。',
		err: req.flash('logInErr').toString()
	});
});
router.get('/logOut', function(req, res){
	req.session.user = null;
	res.redirect('/');
});

router.get('/redChamberForum', function(req, res){
	Post.getAll(null, function(err, posts){
		if(err){
			posts = [];
		}
		res.render('redChamberForum',{
			title: '夢幻紅樓夢遊戲討論區',
			user: req.session.user,
			PostSucc: req.flash('PostSucc').toString(),
			posts: posts
		});
	});
});

router.post('/redChamberForum', function(req, res){
	console.log('staring to post');
	var currentUser = req.session.user,
		post = new Post(currentUser, req.body.title, req.body.post);
	post.save(function(err){
		if(err){
			req.flash('PostErr', err);
			return res.redirect('/PostErr');
		}
		req.flash('PostSucc', '發佈成功');
		res.redirect('/redChamberForum');
	});
});

router.get('/PostErr', function(req, res){
	res.render('err',{
		title: '發表出錯了。。。',
		user: req.session.user,
		err: req.flash('PostErr').toString()
	});
});

router.post('/upload', function(req, res){
	req.flash('PostSucc', '上傳成功！');
	res.redirect('/redChamberForum');
});

router.get('/u/:name', function (req, res) {
  //检查用户是否存在
  User.getUserName(req.params.name, function (err, user) {
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/');//用户不存在则跳转到主页
    }
    //查询并返回该用户的所有文章
    Post.getAll(user.name, function (err, posts) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      res.render('user', {
        title: user.name,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  }); 
});

router.get('/u/:name/:day/:title', function (req, res) {
  Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/');
    }
    res.render('article', {
      title: req.params.title,
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

module.exports = router;
