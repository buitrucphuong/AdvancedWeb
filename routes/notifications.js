const express = require('express');
const users = require('./../database/models/users');
const categories = require('./../database/models/categories');
const notifications = require('./../database/models/notifications')
const multer = require('multer');
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();


//Show Notification & Pagination 

router.get("/notification/:page",isLoggedIn, (req, res, next) => {
	let perPage = 10
	let page = req.params.page || 1
	let user = req.user
	let check = false

	notifications.find().sort({created:-1}).skip((perPage * page) - perPage).limit(perPage).populate('idcategory').exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) ,
			user,
			check,
			message: req.flash('success')
		  });
		});
	  });
  	});
  
  //Show Notification With Field & Pagination 
  
  router.post("/notification/field", isLoggedIn,(req, res, next) => {
	let perPage = 10
	let page = req.params.page || 1
	let user = req.user
	let title = req.body.title 
	let content = req.body.content
	let fromday = req.body.fromday
	let today = req.body.today
	let check = false
	let checkbox = req.body.checkbox

	if(title){
		notifications.find({}).sort({created:-1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
			if (err) return next(err);
			const data = notifi.filter(function(item){
				return item.title.toLowerCase().indexOf(title.toLowerCase()) !== -1
			})
			res.render("notification", {
				notifi:data, 
				current: page, 
				pages: Math.ceil(data.length / perPage),
				user: req.user,
				check,
				message:""
			});
		});
	}else if(content){
		notifications.find({}).sort({created:-1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
			if (err) return next(err);
			const data = notifi.filter(function(item){
				return item.content.toLowerCase().indexOf(content.toLowerCase()) !== -1
			})
			res.render("notification", {
				notifi:data, 
				current: page, 
				pages: Math.ceil(data.length / perPage),
				user: req.user,
				check,
				message:""
			});
		});
	}else if((fromday) && (today)){
		let datefrom = new Date(fromday)
		datefrom.setDate(datefrom.getUTCDate())
		datefrom = new Date(datefrom.setHours(0,0,0,0))
		let dateto = new Date(today)
		dateto.setDate(dateto.getUTCDate())
		dateto = new Date(dateto.setHours(23,59,59,999))
		notifications.find({$and: [{created: {$lte: dateto}}, {created: {$gte: datefrom}} ]}).sort({created:-1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
			notifications.find({$and: [{created: {$lte: dateto}}, {created: {$gte: datefrom}} ]}).countDocuments((err, count) => { 
				if (err) return next(err);
				res.render("notification", {
					notifi, 
					current: page, 
					pages: Math.ceil(count / perPage),
					user: req.user,
					check,
					message:""
				});
			});
		});
	}else if(fromday){
		let date = new Date(fromday)
		date.setDate(date.getUTCDate())
		date = new Date(date.setHours(0,0,0,0))
		notifications.find({created: {$gte: date}}).sort({created:-1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
			notifications.find({created: {$gte: date}}).countDocuments((err, count) => { 
				if (err) return next(err);
				res.render("notification", {
					notifi, 
					current: page, 
					pages: Math.ceil(count / perPage),
					user: req.user,
					check,
					message:""
				});
			});
		});
	}else if(today){
		let date = new Date(today)
		date.setDate(date.getUTCDate())
		date = new Date(date.setHours(23,59,59,999))
		notifications.find({created: {$lte: date}}).sort({created:-1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
			notifications.find({created: {$lte: date}}).countDocuments((err, count) => { 
				if (err) return next(err);
				res.render("notification", {
					notifi, 
					current: page, 
					pages: Math.ceil(count / perPage),
					user: req.user,
					check,
					message:""
				});
			});
		});
	}else if(checkbox){
		notifications.find({seen: {$nin: user._id}}).sort({created:-1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
			notifications.find({seen: {$nin: user._id}}).countDocuments((err, count) => { 
				if (err) return next(err);
				res.render("notification", {
					notifi, 
					current: page, 
					pages: Math.ceil(count / perPage),
					user: req.user,
					check,
					message:""
				});
			});
		});
	}else{
		res.redirect("1")
	}
  });
  
//Show Notification Detail
  
  router.get('/notificationdetail/:id', isLoggedIn,function(req, res){
	notifications.findOneAndUpdate({$and:[{_id: req.params.id},{seen: {$nin: req.user._id}}]},{$push: {seen:req.user}}).exec()
	notifications.findOne({_id: req.params.id}).populate('idcategory').exec(function(err, notice){
	  res.render("notificationdetail", {notice, user:req.user})
	})
  })


//faculity

  router.get("/faculity", isLoggedIn, function(req,res){
	let user = req.user
	categories.find().exec(function(err,faculity){
		res.render("faculity",{user,faculity})
	})
  })

  router.get("/faculityNotification/:id",isLoggedIn, function(req, res){
	let perPage = 10; 
	let page = req.params.page || 1; 
	let user = req.user;

	notifications.find({idcategory: req.params.id}).sort({_id: -1}).populate('idcategory').exec(function(err, notifi){
		categories.findById(req.params.id).exec((err, category) => {
			notifications.find({idcategory: req.params.id}).countDocuments((err, count) => { 
				if (err) return next(err);
				res.render("faculityNotification", {
				notifi, 
				current: page, 
				pages: Math.ceil(count / perPage) ,
				user,
				message: req.flash('success'),
				category
				});
			});
		}) 
	})
  })

module.exports = router;