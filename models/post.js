//var mongodb = require('./db');
var mongodb = require('mongodb').Db,
  settings = require('../settings');
  
function Post(user, title, post) {
  this.user= user;
  this.photo = user.photo;
  this.title = title;
  this.post = post;
}

module.exports = Post;

//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var post = {
      user: this.user,
      time: time,
      title: this.title,
      photo: this.photo,
      post: this.post,
      comments: []
  };
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
       db.close();
        return callback(err);
      }
      //将文档插入 posts 集合
      collection.insert(post, {
        safe: true
      }, function (err) {
        db.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null);//返回 err 为 null
      });
    });
  });
};

//读取文章及其相关信息
Post.getAll = function(name, callback) {
  //打开数据库
  console.log(name);
 mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      //根据 query 对象查询文章
      collection.find(query).sort({
        time: -1
      }).toArray(function (err, docs) {
        console.log("docs"+docs);
        db.close();
        if (err) {
          return callback(err);//失败！返回 err
        }
        callback(null, docs);//成功！以数组形式返回查询的结果
      });
    });
  });
};

//获取一篇文章
Post.getOne = function(name, day, title, callback) {
  //打开数据库
  mongodb.connect(settings.url, function (err, db) {
    if (err) {
      return callback(err);
    }
    //读取 posts 集合
    db.collection('posts', function (err, collection) {
      if (err) {
        db.close();
        return callback(err);
      }
      //根据用户名、发表日期及文章名进行查询
      collection.findOne({
        "user.name": name,
        "time.day": day,
        "title": title
      }, function (err, doc) {
        db.close();
        if (err) {
          return callback(err);
        }
        console.log(doc);
        callback(null, doc);//返回查询的一篇文章
      });
    });
  });
};