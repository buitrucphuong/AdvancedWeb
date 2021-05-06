const express = require('express');
const posts = require('./../database/models/posts');
const comments = require('./../database/models/comments');
const users = require('./../database/models/users');
const multer = require('multer');
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();

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
					users.findOne({_id: req.user._id}).exec((err, user) => {
						res.json({
							content: newPosts,
							user: user
						})
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
				users.findOne({_id: req.user._id}).exec((err, user) => {	
					res.json({
						content: newPosts,
						user: user
					})
				})
			}
		})
		}
	});
});

router.get("/load_data", (req, res) => {
	let time = req.query.time
	let limit = parseInt(req.query.limit);
	let start = parseInt(req.query.start);
	users.findOne({_id: req.user._id}).exec((err, user) => {
		posts.find({created: {$lt: time}}).limit(limit).skip(start).populate('iduser').sort({'_id' : -1}).exec(async(err, pt) => {
			const countComment = await Promise.all(pt.map(async(i) => {
				const comment = await comments.countDocuments({idpost: i._id})
				return comment
			}))
			res.send({
				posts: pt,
				countComment: countComment,
				user: user
			});
		});
	});
});

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

router.post("/update_post", (req, res) => {
	console.log(req.body)
})

module.exports = router;