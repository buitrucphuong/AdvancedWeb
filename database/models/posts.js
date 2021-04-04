var mongoose = require('mongoose');

var postsSchema = mongoose.Schema({
    content: String,
    iduser: { type: mongoose.Types.ObjectId, ref: 'users' },
    created: Date,
    image: String,
    video: String
});

module.exports = mongoose.model('posts', postsSchema, 'posts');