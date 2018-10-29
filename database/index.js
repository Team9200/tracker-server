const mongoose = require('mongoose');
const config = require('../config/config.json');
const util = require('../util/util');

module.exports = () => {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db.url);
    mongoose.connection.on('error', console.error.bind(console, 'mongoose connection error'));
    mongoose.connection.on('open', function () {
        util.log('success', 'connected to database');
    });
    mongoose.connection.on('disconnected', () => {
        util.log('success', 'disconnected from database');
    });
};