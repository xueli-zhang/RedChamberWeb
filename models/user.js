//var mongodb = require('./db');
var mongodb = require('mongodb').Db,
  settings = require('../settings');
function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.photo = user.photo;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
  //要存入数据库的用户文档
  var user = {
      name: this.name,
      password: this.password,
      email: this.email,
      photo: this.photo
  };
  //打开数据库
 mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
       db.close();
        return callback(err);//错误，返回 err 信息
      }
      //将用户数据插入 users 集合
      collection.insert(user, {
        safe: true
      }, function (err, user) {
        db.close();
        if (err) {
          return callback(err);//错误，返回 err 信息
        }
        callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
      });
    });
  });
};

//通过名字读取用户信息
User.getUserName = function(name, callback) {
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
       db.close();
        return callback(err);//错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        name: name
      }, function (err, user) {
        db.close();
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        callback(null, user);//成功！返回查询的用户信息
      });
    });
  });
};

//通过email读取数据
User.getEmail = function(email, callback) {
  //打开数据库
  console.log('email call');
 mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);//错误，返回 err 信息
    }
    //读取 users 集合
    db.collection('users', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);//错误，返回 err 信息
      }
      //查找用户名（name键）值为 name 一个文档
      collection.findOne({
        email: email
      }, function (err, user) {
        db.close();
        if (err) {
          return callback(err);//失败！返回 err 信息
        }
        callback(null, user);//成功！返回查询的用户信息
      });
    });
  });
};

User.update = function(user, callback){
 mongodb.connect(settings.url, function (err, db) {
    if(err){
       return callback(err);
    }
    db.collection('users', function(err, collection){
      if(err){
        db.close();
        return callback(err);
      }
      collection.update({
        "email": user.email
      },{
        $set: 
        {
          name: user.name,
          password: user.password,
          photo: user.photo
        }
      }, function(err){
        db.close();
        if(err){
          return callback(err);
        }
        callback(null);      
      });
    });
  });
};