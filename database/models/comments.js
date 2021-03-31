var mongoose = require('mongoose');

var commentsSchema = mongoose.Schema({
    content: String,
    iduser: { type: mongoose.Types.ObjectId, ref: 'users' },
    idpost: { type: mongoose.Types.ObjectId, ref: 'posts' },
    created: Date
});

module.exports = mongoose.model('comments', commentsSchema, 'comments');