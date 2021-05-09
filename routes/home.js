const express = require('express');
const users = require('./../database/models/users');
const notifications = require('./../database/models/notifications')
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();

router.get('/', isLoggedIn, async(req, res) => {
	const user = await users.findOne({_id: req.user._id})
	const notification = await notifications.find().limit(4).sort({'_id' : -1}).populate('idcategory')
	res.render('index', {
		notification: notification,
		user: user
	})
});

module.exports = router;