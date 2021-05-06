const express = require('express');
const users = require('./../database/models/users');
const notifications = require('./../database/models/notifications')
const router = express.Router();
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');

router.get('/addnotice', roleManage, async(req, res) => {
	const user = await users.findOne({_id: req.user._id})
	const notification = await notifications.find().limit(4).populate('idcategory')
	const acc = await users.findById(req.user._id).populate('idcategory')
	
	res.render('addnotice',{
		user: user,
		category: acc.idcategory,
		message: req.flash('success'),
		notification: notification
	})
})

module.exports = router;