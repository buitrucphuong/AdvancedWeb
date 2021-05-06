const express = require('express');
const users = require('./../database/models/users');
const categories = require('./../database/models/categories');
const notifications = require('./../database/models/notifications')
const multer = require('multer');
const {isLoggedIn, roleAdmin, roleManage, roleSys} = require('./auth.js');
const router = express.Router();

router.use('/', require('./addnotice'))
router.use('/', require('./adduser'))
router.use('/', require('./changepass'))
router.use('/', require('./comments'))
router.use('/', require('./home'))
router.use('/', require('./personal'))
router.use('/', require('./posts'))

//Show Notification & Pagination 

router.get("/notification/:page",isLoggedIn, (req, res, next) => {
	let perPage = 10; 
	let page = req.params.page || 1; 
  
	let user = req.user
	notifications.find().sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) ,
			user
		  });
		});
	  });
  });
  
  //Show Notification With Field & Pagination 
  
  router.post("/notification/field", isLoggedIn,(req, res, next) => {
	let perPage = 10; 
	let page = req.params.page || 1; 
	
	let title = req.body.title
	let content = req.body.content
	let fromday = req.body.fromday
	let today = req.body.today
  
	//field = {title,content,fromday,today,seen}
	//res.send(title + " " + content + " " + fromday + " " + today)
  
	// notification.findOne({title:title, content:content}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
	//     notification.countDocuments((err, count) => { 
	//       if (err) return next(err);
	//       res.render("notification", {
	//         notifi, 
	//         current: page, 
	//         pages: Math.ceil(count / perPage) 
	//       });
	//     });
	//   });
  
	if((!title) & (!content) & (!fromday) & (!today)){
	  res.redirect("1")
	}else if(title){
	  notifications.find({title:title}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi:notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
		console.log(notifi)
	  });
	}else if(content){
	  notifications.find({content:content}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
	  });
	}else if(fromday){
	  notifications.find({fromday:fromday}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
	  });
	}else if(today){
	  notifications.find({today:today}).sort({created:1}).skip((perPage * page) - perPage).limit(perPage).exec((err, notifi) => {
		notifications.countDocuments((err, count) => { 
		  if (err) return next(err);
		  res.render("notification", {
			notifi, 
			current: page, 
			pages: Math.ceil(count / perPage) 
		  });
		});
	  });
	}else{
	}
  });
  
  //Show Notification Detail
  
  router.get('/notification/:page/notificationdetail/:id', isLoggedIn,function(req, res){
	notifications.findOneAndUpdate({_id: req.params.id},{seen:true})
	notifications.findOne({_id: req.params.id}).populate('idcategory').exec(function(err, notice){
	  res.render("notificationdetail", {notice, user:req.user})
	})
  })
  
  router.get('/notificationdetail/:id', isLoggedIn,function(req, res){
	notifications.findOneAndUpdate({_id: req.params.id},{seen:true}).exec()
	notifications.findOne({_id: req.params.id}).populate('idcategory').exec(function(err, notice){
	  res.render("notificationdetail", {notice, user:req.user})
	})
  })

  router.get('/test', (req, res) => {
	  res.render('test')
  })

module.exports = router;
