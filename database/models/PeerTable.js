const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PeerTable = Schema({
    nodeType: {
        type: String,
        require: true,
        enum: ["storage", "analysis"]
    },
    address: {
        type: String,
        require: true
    },
    token: {
        type: String,
        require: true
    },
    storageSize: {
        type: Number
    },
    timestamp: {
        type: Date
    }
});

PeerTable.statics.createStorageNode = function (nodeType, address, token, storageSize) {
    const PeerTable = new this({
        nodeType,
        address,
        token,
        storageSize
    });
    
    return PeerTable.save();
}

PeerTable.statics.createAnalysisNode = function (nodeType, address, token) {
    const PeerTable = new this({
        nodeType,
        address,
        token
    });
    
    return PeerTable.save();
}

module.exports = mongoose.model('PeerTable', PeerTable);