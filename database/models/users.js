var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
    uid: String,
    name: String,
    pic: String,
    role: String,
    created: Date,
    email: String
});

var users = mongoose.model('users', usersSchema);
module.exports = users;