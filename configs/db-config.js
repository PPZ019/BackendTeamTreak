const mongoose = require('mongoose');
const {MONGO_URI } = process.env;


const dbConnection = () => {
    mongoose.connect(MONGO_URI )
        .then(() => console.log('Database Connection Successfull'))
        .catch(err => console.log('Failed To Connect With Database, \nReason : ' + err.message))
}

module.exports = dbConnection;