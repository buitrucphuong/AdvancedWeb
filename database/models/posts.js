var mongoose = require('mongoose');

var postsSchema = mongoose.Schema({
    content: String,
    iduser: { type: mongoose.Types.ObjectId, ref: 'users' },
    created: Date
});

module.exports = mongoose.model('posts', postsSchema, 'posts');