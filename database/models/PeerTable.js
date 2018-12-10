const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PeerTable = Schema({
    expire: {
        type: Date,
        default: Date.now
    },
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
    remainingStorageSize: {
        type: Number
    },
    mining: {
        type: String,
        enum: ["true", "flase"]
    }
});

PeerTable.statics.createStorageNode = function (id, nodeType, address, storageSize, remainingStorageSize, mining) {
    const PeerTable = new this({
        id,
        nodeType,
        address,
        storageSize,
        remainingStorageSize,
        mining
    });
    
    return PeerTable.save();
}

PeerTable.statics.updateStorageNode = function (id, nodeType, address, storageSize, remainingStorageSize, mining) {
    this.remove({id:id}).exec();
    const PeerTable = new this({
        id,
        nodeType,
        address,
        storageSize,
        remainingStorageSize,
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

var PeerTableModel = mongoose.model('PeerTable', PeerTable);
module.exports = PeerTableModel;