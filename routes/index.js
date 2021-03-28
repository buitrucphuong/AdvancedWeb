var express = require('express');
var posts = require('./../database/models/posts');
var comments = require('./../database/models/comments');
var users = require('./../database/models/users');
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, function(req, res) {
    res.render('index', {
      user: req.user
  })
});

router.post("/post", function(req, res){
  console.log(req.body.filename)
	var newPosts = new posts({
		content: req.body.content,
    iduser: req.user.id,
    created: Date.now()
	});
	newPosts.save(function(err){
		if(err){
			res.json({kq:false,errMsg:err});
		}else{ 		
			res.json({
        content: newPosts,
        user: req.user
      })
		}
	})
});

router.get("/load_data", function (req, res) {
  let time = req.query.time
  let a = parseInt(req.query.limit);
  let b = parseInt(req.query.start);
  posts.find({created: {$lt: time}}).limit(a).skip(b).populate('iduser').sort({'_id' : -1}).exec((err, pt) => {
      res.send({
        posts: pt,
        user: req.user
    });
  });
});

router.get("/load_comment", function (req, res) {
  let a = parseInt(req.query.limit);
  let b = parseInt(req.query.start);
  comments.find({idpost: req.query.id})
  .limit(a).skip(b)
  .populate('iduser')
  .exec((err, cm) => {
    res.send({
      comment: cm,
      user: req.user
    });
  });
});

router.get('/notification', isLoggedIn, function(req, res, next) {
  res.render('notification', { user: req.user});
});

router.get('/personal/:id', isLoggedIn, function(req, res, next) {
  users.find({_id: req.params.id}).exec((err, user) => {
    res.render('personal', { user});
  });
});

//login page

router.get('/login', (req, res) => {
  res.render('login')
})

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}

module.exports = router;
