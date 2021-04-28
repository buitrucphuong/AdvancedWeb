var mongoose = require('mongoose');

var categoriesSchema = mongoose.Schema({
    name: String
});

module.exports = mongoose.model('categories', categoriesSchema, 'categories');