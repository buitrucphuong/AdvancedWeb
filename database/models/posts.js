var mongoose = require('mongoose');

var postsSchema = mongoose.Schema({
    content: String,
    iduserinfo: { type: mongoose.Types.ObjectId, ref: 'userinfo' },
    idcomments: { type: mongoose.Types.ObjectId, ref: 'comments' }
});

module.exports = mongoose.model('posts', postsSchema, 'posts');