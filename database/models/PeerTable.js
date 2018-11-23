const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PeerTable = Schema({
    id: {
        type: String,
        require: true,
        unique: true
    },
    nodeType: {
        type: String,
        require: true,
        enum: ["storage", "analysis"]
    },
    address: {
        type: String,
        require: true
    },
    storageSize: {
        type: Number
    },
    mining: {
        type: String,
        enum: ["true", "flase"]
    },
    timestamp: {
        type: Date
    }
});

PeerTable.statics.createStorageNode = function (id, nodeType, address, storageSize, mining) {
    const PeerTable = new this({
        id,
        nodeType,
        address,
        storageSize,
        mining
    });
    
    return PeerTable.save();
}

PeerTable.statics.createAnalysisNode = function (id, nodeType, address) {
    const PeerTable = new this({
        id,
        nodeType,
        address
    });
    
    return PeerTable.save();
}

PeerTable.statics.findPeer = function (peerId) {
    return this.findOne({id: peerId});
}

PeerTable.statics.findStorage = function () {
    return this.find();
}

module.exports = mongoose.model('PeerTable', PeerTable);