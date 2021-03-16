var express = require('express');
var posts = require('./../database/models/posts');
var userinfo = require('./../database/models/userinfo');
var comments = require('./../database/models/comments');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  // console.log(req)
  posts.find({}).exec((err, pt) => {
    res.render('index', {
        posts: pt
    });
  }); 
});

router.get("/load_data", function (req, res) {
  let a = parseInt(req.query.limit);
  let b = parseInt(req.query.start);
  posts.find({})
  .limit(a).skip(b)
  .populate('iduserinfo')
  .populate('idcomments')
  // .sort({'_id' : -1})
  .exec((err, pt) => {
    res.send(pt);
  });
});

router.get('/notification', function(req, res, next) {
  res.render('notification', { title: 'Express' });
});

router.get('/personal', function(req, res, next) {
  res.render('personal', { title: 'Express' });
});

module.exports = router;
