const mongoose = require('mongoose');
const mongodb_url = 'mongodb+srv://trucphuong:buitrucphuong@cluster0.fu9dy.mongodb.net/AdvancedWeb?retryWrites=true&w=majority'


class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        mongoose.connect(mongodb_url, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
            .then(() => {
                console.log("Cloud Database connection successfully!");
            })
            .catch(err => {
                console.log("Failed to connect database")
            })
    }
}



module.exports = new Database();