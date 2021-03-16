var mongoose = require('mongoose');

var userinfoSchema = mongoose.Schema({
    name: String,
    avatar: String
});

module.exports = mongoose.model('userinfo', userinfoSchema, 'userinfo');