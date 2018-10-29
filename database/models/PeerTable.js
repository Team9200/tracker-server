const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PeerTable = Schema({
    nodeType: {
        type: String,
        enum: ["storage", "analysis"]
    },
    address: {
        type: String
    },
    token: {
        type: String
    },
    timestamp: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model('PeerTable', PeerTable);