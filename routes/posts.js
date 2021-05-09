const express = require('express');
const posts = require('./../database/models/posts');
const comments = require('./../database/models/comments');
const users = require('./../database/models/users');
const cloudinary = require('./imageHandle/cloudinary');
const upload = require('./imageHandle/multer');
const multer = require('multer');
const { isLoggedIn, roleAdmin, roleManage, roleSys } = require('./auth.js');
const router = express.Router();

router.post("/post", upload.single("image"), async(req, res) => {
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        var newPosts = new posts({
            content: req.body.content,
            image: result.secure_url,
            iduser: req.user._id,
            created: Date.now()
        });
        newPosts.save(function(err) {
            if (err) {
                res.json({ kq: false, errMsg: err });
            } else {
                users.findOne({ _id: req.user._id }).exec((err, user) => {
                    res.json({
                        content: newPosts,
                        user: user
                    })
                })
            }
        })
    } else {
        var newPosts = new posts({
            content: req.body.content,
            iduser: req.user._id,
            video: req.body.video,
            created: Date.now()
        });
        newPosts.save(function(err) {
            if (err) {
                res.json({ kq: false, errMsg: err });
            } else {
                users.findOne({ _id: req.user._id }).exec((err, user) => {
                    res.json({
                        content: newPosts,
                        user: user
                    })
                })
            }
        })
    }
});

router.get("/load_data", (req, res) => {
    let time = req.query.time
    let limit = parseInt(req.query.limit);
    let start = parseInt(req.query.start);
    users.findOne({ _id: req.user._id }).exec((err, user) => {
        posts.find({ created: { $lt: time } }).limit(limit).skip(start).populate('iduser').sort({ '_id': -1 }).exec(async(err, pt) => {
            const countComment = await Promise.all(pt.map(async(i) => {
                const comment = await comments.countDocuments({ idpost: i._id })
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

router.post("/delete_post", (req, res) => {
    posts.findByIdAndDelete(req.body.id, function(err, data) {
        comments.deleteMany({ idpost: req.body.id }, function(err, data1) {
            if (err) {
                res.json({ kq: false, errMsg: err });
            } else {
                res.send("ok");
            }
        })
    })
})


module.exports = router;