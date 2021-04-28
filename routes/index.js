var express = require('express');
var posts = require('./../database/models/posts');
var comments = require('./../database/models/comments');
var users = require('./../database/models/users');
var categories = require('./../database/models/categories');
var notifications = require('./../database/models/notifications')
var bcrypt = require('bcryptjs');
var saltRounds = 10;
var multer = require('multer');
var router = express.Router();

/* GET home page. */
router.get('/', isLoggedIn, (req, res) => {
    res.render('index', {
		user: req.user
  	})
});

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

router.post("/post", (req, res) => {
	upload(req, res, (err) => {
		if(req.file) {
		if (err instanceof multer.MulterError) {
			console.log("A Multer error occurred when uploading.");
		} else if (err) {
			console.log("An unknown error occurred when uploading." + err);
		} else {
			
			var newPosts = new posts({
				content: req.body.content,
				image: req.file.filename,
				iduser: req.user._id,
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
			iduser: req.user._id,
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

router.post("/post-comment", (req, res) => {
	var newComments = new comments({
		content: req.body.content,
		iduser: req.user._id,
		idpost: req.body.idpost,
		created: Date.now()
	});
	newComments.save((err) => {
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

router.get("/load_data", (req, res) => {
	let time = req.query.time
	let limit = parseInt(req.query.limit);
	let start = parseInt(req.query.start);
	
	posts.find({created: {$lt: time}}).limit(limit).skip(start).populate('iduser').sort({'_id' : -1}).exec(async(err, pt) => {
		
		const countComment = await Promise.all(pt.map(async(i) => {
			const comment = await comments.countDocuments({idpost: i._id})
			return comment
		}))
		res.send({
			posts: pt,
			countComment: countComment,
			user: req.user
		});
	});
});

router.get("/load_data_personal", (req, res) => {
	let idu = req.query.id
	let time = req.query.time
	let limit = parseInt(req.query.limit);
	let start = parseInt(req.query.start);

	posts.find({iduser: idu, created: {$lt: time}})
	.limit(limit)
	.skip(start)
	.populate('iduser')
	.sort({'_id' : -1})
	.exec(async(err, pt) => {
		const countComment = await Promise.all(pt.map(async(i) => {
			const comment = await comments.countDocuments({idpost: i._id})
			return comment
		}))
		res.send({
			posts: pt,
			user: req.user,
			countComment: countComment
		});
	});
});

router.get("/load_comment", (req, res) => {
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

router.post("/delete_comment", (req, res) => {
	comments.findByIdAndDelete(req.body.id, function(err, data) {
		if (err) {
			res.json({ kq: false, errMsg: err });
		} else {
			res.send("ok");
		}
	})
})

router.post("/delete_post", (req, res) => {
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

router.get('/notification', isLoggedIn, (req, res) => {
  	res.render('notification', { user: req.user});
});

router.get('/personal', isLoggedIn, (req, res) => {
	users.findOne({_id: req.query.id}).exec((err, user) => {
		res.render('personal', { user: req.user, users: user});
	});
});

router.get('/adduser', roleAdmin, (req, res) => {
	categories.find().exec((err, category) => {
		res.render('adduser', { 
			user: req.user,
			category: category,
			message: req.flash('success')
		});
	});
});

router.post('/adduser', roleAdmin, (req, res) => {
	users.findOne({username: req.body.username}, (err, acc) => {
    	if(acc) {
            console.log('Username đã được sử dụng!')
            backURL = req.header('Referer') || '/';
            res.redirect(backURL);
        }else {
			bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
				let newUser = new users({
					name: req.body.name,
					username: req.body.username,
					password: hash,
					idcategory: req.body.idcategory,
					role: "manage",
					created: Date.now()
				});
				newUser.save(function(err) {
					if (err) {
						res.json({ kq: false, errMsg: err });
					} else {
						req.flash('success', 'Thêm tài khoản thành công!')
						backURL = req.header('Referer') || '/';
						res.redirect(backURL);
					}
				})
			})
		}
	})
})

router.get('/addnotice', roleManage, (req, res) => {
	users.find({username: "buitrucphuong"}).populate('idcategory').exec((err, acc) => {
		res.render('addnotice',{
			user: req.user,
			category: acc,
			message: req.flash('success')
		})
	})
})

router.post('/addnotice', roleManage, (req, res) => {
	let newNotice = new notifications({
		title: req.body.title,
		content: req.body.content,
		iduser: req.user._id,
		created: Date.now(),
		idcategory: req.body.category
	});
	newNotice.save(function(err) {
		if (err) {
			res.json({ kq: false, errMsg: err });
		} else {
			req.flash('success', 'Thêm thông báo thành công!')
			backURL = req.header('Referer') || '/';
			res.redirect(backURL);
		}
	})
})

router.get('/changepass', roleSys, (req, res) => {
	res.render('changepass', {
		user: req.user,
		message: req.flash('success'),
		messageError: req.flash('error')
	})
})

router.post('/changepass', roleSys, (req, res) => {
	users.findOne({_id: req.user._id}, (err, acc) => {
		bcrypt.compare(req.body.currentpass, acc.password, (err,isMatch)=> {
			if(isMatch) {
				bcrypt.hash(req.body.newpass, saltRounds, function(err, hash) {
					users.findByIdAndUpdate({ _id: req.user._id }, 
					{$set: {password: hash}},
					function(err, data) {
						if (err) {
							res.json({ kq: false, errMsg: err });
						} else {
							req.flash('success', 'Đổi mật khẩu thành công!')
							res.redirect('/changepass');
						}
					});
				})
			} else {
				req.flash('error', 'Mật khẩu hiện tại không chính xác!')
				res.redirect('/changepass');
			}
		});
	})
})
//login page

router.get('/login', (req, res) => {
  	res.render('login',{
		message: req.flash('error')
	})
})

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}

function roleAdmin(req, res, next) {
	if (req.isAuthenticated() && req.user.role == 'admin')
		return next();
	res.redirect('/');
}

function roleManage(req, res, next) {
	if (req.isAuthenticated() && req.user.role == 'manage')
		return next();
	res.redirect('/');
}

function roleSys(req, res, next) {
	if (req.isAuthenticated() && (req.user.role == 'manage' || req.user.role == 'admin'))
		return next();
	res.redirect('/');
}

//Show Notification & Pagination 

router.get("/notification/:page",isLoggedIn, (req, res, next) => {
	let perPage = 10; 
	let page = req.params.page || 1; 
  
	let user = req.user
	notifications.find().sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) ,
			user
		  });
		});
	  });
  });
  
  //Show Notification With Field & Pagination 
  
  router.post("/notification/field", isLoggedIn,(req, res, next) => {
	let perPage = 10; 
	let page = req.params.page || 1; 
	
	let title = req.body.title
	let content = req.body.content
	let fromday = req.body.fromday
	let today = req.body.today
  
	//field = {title,content,fromday,today,seen}
	//res.send(title + " " + content + " " + fromday + " " + today)
  
	// notification.findOne({title:title, content:content}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
	//     notification.countDocuments((err, count) => { 
	//       if (err) return next(err);
	//       res.render("notification", {
	//         notifi, 
	//         current: page, 
	//         pages: Math.ceil(count / perPage) 
	//       });
	//     });
	//   });
  
	if((!title) & (!content) & (!fromday) & (!today)){
	  res.redirect("1")
	}else if(title){
	  notifications.find({title:title}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi:notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
		console.log(notifi)
	  });
	}else if(content){
	  notifications.find({content:content}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
	  });
	}else if(fromday){
	  notifications.find({fromday:fromday}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
	  });
	}else if(today){
	  notifications.find({today:today}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
	  });
	}else{
	}
  });
  
  //Show Notification Detail
  
  router.get('/notification/:page/notificationdetail/:id', isLoggedIn,function(req, res){
	notifications.findOneAndUpdate({_id: req.params.id},{seen:true})
	notifications.findOne({_id: req.params.id}).populate('idcategory').exec(function(err, notice){
	  res.render("notificationdetail", {notice, user:req.user})
	})
  })
  
  router.get('/notificationdetail/:id', isLoggedIn,function(req, res){
	notifications.findOneAndUpdate({_id: req.params.id},{seen:true}).exec()
	notifications.findOne({_id: req.params.id}).populate('idcategory').exec(function(err, notice){
	  res.render("notificationdetail", {notice, user:req.user})
	})
  })

module.exports = router;
