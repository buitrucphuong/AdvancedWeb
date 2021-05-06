const express = require('express');
const users = require('./../database/models/users');
const categories = require('./../database/models/categories');
const notifications = require('./../database/models/notifications')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();


router.get('/adduser', roleAdmin, async(req, res) => {
	const user = await users.findOne({_id: req.user._id})
	const notification = await notifications.find().limit(4).populate('idcategory')
	const category = await categories.find()
	res.render('adduser', { 
		user: user,
		category: category,
		message: req.flash('success'),
		messageError: req.flash('error'),
		notification: notification
	});
});

router.post('/adduser', roleAdmin, (req, res) => {
	users.findOne({username: req.body.username}, (err, acc) => {
    	if(acc) {
            req.flash('error', 'Tên đăng nhập đã được sử dụng!')
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

module.exports = router;