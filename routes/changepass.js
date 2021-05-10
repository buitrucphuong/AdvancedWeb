const express = require('express');
const users = require('./../database/models/users');
const notifications = require('./../database/models/notifications')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();

router.get('/changepass', roleSys, async(req, res) => {
	const user = await users.findOne({_id: req.user._id})
	const notification = await notifications.find().limit(6).sort({'_id' : -1}).populate('idcategory')
	
	res.render('changepass', {
		user: user,
		message: req.flash('success'),
		messageError: req.flash('error'),
		notification: notification
	})
})

router.post('/changepass', roleSys, (req, res) => {
	users.findOne({_id: req.user._id}, (err, acc) => {
		bcrypt.compare(req.body.currentpass, acc.password, (err,isMatch)=> {
			if(isMatch) {
				if(req.body.currentpass != req.body.newpass) {
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
				}else{
					req.flash('error', 'Mật khẩu mới phải khác mật khẩu hiện tại!')
					res.redirect('/changepass');
				}
			} else {
				req.flash('error', 'Mật khẩu hiện tại không chính xác!')
				res.redirect('/changepass');
			}
		});
	})
})

module.exports = router;