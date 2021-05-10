const express = require('express');
const posts = require('./../database/models/posts');
const comments = require('./../database/models/comments');
const users = require('./../database/models/users');
const notifications = require('./../database/models/notifications')
const cloudinary = require('./imageHandle/cloudinary');
const upload = require('./imageHandle/multer');
const multer = require('multer');
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();

router.get('/personal', isLoggedIn, async(req, res) => {
	notifications.find().limit(6).populate('idcategory').sort({'_id' : -1}).exec((err, notification) => {
		users.findOne({_id: req.user._id}).exec((err, user) => {
			users.findOne({_id: req.query.id}).exec((err, users) => {
				res.render('personal', {
					user: user,
					users: users,
					notification: notification,
					message: req.flash('success')
				});
			});
		})
	});
});

router.get("/load_data_personal", (req, res) => {
	let idu = req.query.id
	let time = req.query.time
	let limit = parseInt(req.query.limit);
	let start = parseInt(req.query.start);
	users.findOne({_id: req.user._id}).exec((err, user) => {
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
				countComment: countComment,
				user: user
			});
		});
	});
});

router.post('/updateinfo', isLoggedIn, (req, res) => {
	users.findByIdAndUpdate({ _id: req.user._id }, {
		$set: {
			name: req.body.name,
			class: req.body.class,
			faculty: req.body.faculty
		}
	},
	function(err, data) {
		if (err) {
			res.json({ kq: false, errMsg: err });
		} else {
			req.flash('success', 'Cập nhật thông tin cá nhân thành công!');
			backURL = req.header('Referer') || '/';
			res.redirect(backURL);
		}
	});
})

router.post("/updateavt", upload.single("pic"), async(req, res) => {
	const result = await cloudinary.uploader.upload(req.file.path);
	await users.findByIdAndUpdate({ _id: req.user._id }, {
		$set: {
			pic: result.secure_url,
		}
	},
	function(err, data) {
		if (err) {
			res.json({ kq: false, errMsg: err });
		} else {
			req.flash('success', 'Cập nhật ảnh đại diện thành công!');
			backURL = req.header('Referer') || '/';
			res.redirect(backURL);
		}
	});
});

module.exports = router;