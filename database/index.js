const mongoose = require('mongoose');
const config = require('../config/config.json');

module.exports = () => {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db.url);
    mongoose.connection.on('error', console.error.bind(console, 'mongoose connection error'));
    mongoose.connection.on('open', function () {
        console.log('connected to database');
    });
    mongoose.connection.on('disconnected', () => {
        console.log('disconnected from database');
    });
};