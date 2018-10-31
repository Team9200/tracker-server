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
    timestamp: {
        type: Date
    }
});

PeerTable.statics.createStorageNode = function (id, nodeType, address, storageSize) {
    const PeerTable = new this({
        id,
        nodeType,
        address,
        storageSize
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

module.exports = mongoose.model('PeerTable', PeerTable);