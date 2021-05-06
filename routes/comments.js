const express = require('express');
const comments = require('./../database/models/comments');
const users = require('./../database/models/users');
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();

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
			users.findOne({_id: req.user._id}).exec((err, user) => {
				res.json({
					content: newComments,
					user: user
				})
			})
		}
	})
});

router.get("/load_comment", async(req, res) => {
	let time = req.query.time
	let limit = parseInt(req.query.limit);
	let start = parseInt(req.query.start);

	const user = await users.findOne({_id: req.user._id})
	const cm = await comments.find({idpost: req.query.id, created: {$lt: time}}).limit(limit).skip(start).populate('iduser').sort({'_id' : -1})
	res.send({
		comment: cm,
		user: user
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

module.exports = router;