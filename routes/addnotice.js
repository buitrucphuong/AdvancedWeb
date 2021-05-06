const express = require('express');
const users = require('./../database/models/users');
const notifications = require('./../database/models/notifications')
const router = express.Router();
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');

router.get('/addnotice', roleManage, async(req, res) => {
	const user = await users.findOne({_id: req.user._id})
	const notification = await notifications.find().limit(4).sort({'_id' : -1}).populate('idcategory')
	const acc = await users.findById(req.user._id).populate('idcategory')
	
	res.render('addnotice',{
		user: user,
		category: acc.idcategory,
		message: req.flash('success'),
		notification: notification
	})
})

router.get('/updatenotice/:id', roleManage, async(req, res) => {
	const user = await users.findOne({_id: req.user._id})
	const notification = await notifications.find().limit(4).sort({'_id' : -1}).populate('idcategory')
	const acc = await users.findById(req.user._id).populate('idcategory')
	const notice = await notifications.findById(req.params.id)
	res.render('updatenotice',{
		user: user,
		category: acc.idcategory,
		message: req.flash('success'),
		notification: notification,
		notice: notice
	})
})

router.post('/updatenotice/:id', (req, res) => {
    notifications.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
				title: req.body.title,
				idcategory: req.body.category,
				content: req.body.content
            }
        },
        function(err, data) {
            if (err) {
                res.json({ kq: false, errMsg: err });
            } else {
                req.flash('success', 'Cập nhật thông báo thành công!')
				backURL = req.header('Referer') || '/';
				res.redirect(backURL);
            }
        });
})

router.get('/deletenotice/:id', (req, res) => {
	notifications.findByIdAndDelete(req.params.id, function(err, data) {
		if (err) {
			res.json({ kq: false, errMsg: err });
		} else {
			req.flash('success', 'Xóa thông báo thành công!')
			backURL = req.header('Referer') || '/';
			res.redirect(backURL);
		}
	})
})

module.exports = router;