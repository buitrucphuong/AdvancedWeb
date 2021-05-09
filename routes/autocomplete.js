const express = require('express');
const users = require('./../database/models/users');
const notifications = require('./../database/models/notifications')
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();

router.get('/autocomplete', async(req, res) => {
        const search = req.query.data
        const user = await users.find({}).select('name pic');
        const result = user.filter(function(item, index) {
            return item.name.toLowerCase().indexOf(search.toLowerCase()) !== -1
        });
        res.send(result.slice(0, 7))
})

router.get('/search',isLoggedIn, async(req, res) => {
    	const search = req.query.search
    	const user = await users.findOne({_id: req.user._id})
	const notification = await notifications.find().limit(4).sort({'_id' : -1}).populate('idcategory')
    	const alluser = await users.find({});
    	const data = alluser.filter(function(item) {
        	return item.name.toLowerCase().indexOf(search.toLowerCase()) !== -1
    	});
	res.render('searchresult', {
		notification: notification,
		user: user,
        result: data,
        search: search
	})
})

module.exports = router;