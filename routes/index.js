var express = require('express');
var posts = require('./../database/models/posts');
var comments = require('./../database/models/comments');
var users = require('./../database/models/users');
var multer = require('multer');
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, function(req, res) {
    res.render('index', {
      user: req.user
  })
});

// router.post("/post", function(req, res){
//   console.log(req.body)
// 	var newPosts = new posts({
// 		content: req.body.content,
//     iduser: req.user.id,
//     created: Date.now()
// 	});
// 	newPosts.save(function(err){
// 		if(err){
// 			res.json({kq:false,errMsg:err});
// 		}else{ 		
// 			res.json({
//         content: newPosts,
//         user: req.user
//       })
// 		}
// 	})
// });

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
      cb(null, './public/upload')
  },
  filename: function(req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname)
  }
});

var upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
      if (file.mimetype == "image/bmp" ||
          file.mimetype == "image/png" ||
          file.mimetype == "image/gjf" ||
          file.mimetype == "image/jpg" ||
          file.mimetype == "image/jpeg") {
          cb(null, true)
      } else {
          return cb(new Error('Only image are allowed!'))
      }
  }
}).single("image");

router.post("/post", function(req, res) {
  upload(req, res, function(err) {
    if(req.file) {
      if (err instanceof multer.MulterError) {
        console.log("A Multer error occurred when uploading.");
      } else if (err) {
          console.log("An unknown error occurred when uploading." + err);
      } else {
        var newPosts = new posts({
            content: req.body.content,
            image: req.file.filename,
            iduser: req.user.id,
            video: req.body.video,
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
      }
    }
    else {
      var newPosts = new posts({
        content: req.body.content,
        iduser: req.user.id,
        video: req.body.video,
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
    }
  });
});

router.post("/post-comment", function(req, res){
	var newComments = new comments({
		content: req.body.content,
    iduser: req.user.id,
    idpost: req.body.idpost,
    created: Date.now()
	});
	newComments.save(function(err){
		if(err){
			res.json({kq:false,errMsg:err});
		}else{ 		
			res.json({
        content: newComments,
        user: req.user
      })
		}
	})
});

router.get("/load_data", function (req, res) {
  let time = req.query.time
  let limit = parseInt(req.query.limit);
  let start = parseInt(req.query.start);
  posts.find({created: {$lt: time}}).limit(limit).skip(start).populate('iduser').sort({'_id' : -1}).exec((err, pt) => {
      res.send({
        posts: pt,
        user: req.user
    });
  });
});

router.get("/load_data_personal", function (req, res) {
  let idu = req.query.id
  let time = req.query.time
  let limit = parseInt(req.query.limit);
  let start = parseInt(req.query.start);
  posts.find({iduser: idu, created: {$lt: time}}).limit(limit).skip(start).populate('iduser').sort({'_id' : -1}).exec((err, pt) => {
      res.send({
        posts: pt,
        user: req.user
    });
  });
});

router.get("/load_comment", function (req, res) {
  let time = req.query.time
  let limit = parseInt(req.query.limit);
  let start = parseInt(req.query.start);
  comments.find({idpost: req.query.id, created: {$lt: time}})
  .limit(limit).skip(start)
  .populate('iduser')
  .sort({'_id' : -1})
  .exec((err, cm) => {
    res.send({
      comment: cm,
      user: req.user
    });
  });
});

router.post("/delete_comment", function(req, res) {
  comments.findByIdAndDelete(req.body.id, function(err, data) {
    if (err) {
        res.json({ kq: false, errMsg: err });
    } else {
      res.send("ok");
    }
  })
})

router.post("/delete_post", function(req, res) {
  posts.findByIdAndDelete(req.body.id, function(err, data) {
    comments.deleteMany({idpost: req.body.id}, function(err, data1) {
      if (err) {
          res.json({ kq: false, errMsg: err });
      } else {
        res.send("ok");
      }
    })
  })
})

router.get('/notification', isLoggedIn, function(req, res, next) {
  res.render('notification', { user: req.user});
});

router.get('/personal', isLoggedIn, function(req, res, next) {
  users.findOne({_id: req.query.id}).exec((err, user) => {
    res.render('personal', { user: req.user, users: user});
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
