var mongoose = require('mongoose');

var notificationsSchema = mongoose.Schema({
    title: String,
    content: String,
    iduser: { type: mongoose.Types.ObjectId, ref: 'users' },
    created: Date,
    idcategory: { type: mongoose.Types.ObjectId, ref: 'categories' },
    seen:[{
        type: mongoose.Types.ObjectId, ref: 'users' 
    }]
});

module.exports = mongoose.model('notifications', notificationsSchema, 'notifications');