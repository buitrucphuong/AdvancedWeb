var mongoose = require('mongoose');

var commentsSchema = mongoose.Schema({
    content: String,
    iduserinfo: { type: mongoose.Types.ObjectId, ref: 'userinfo' }
});

module.exports = mongoose.model('comments', commentsSchema, 'comments');