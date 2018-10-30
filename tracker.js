const express = require('express');
const app = express();
const uuid = require('uuid/v1');
const config = require('./config/config.json');
const util = require('./util/util');
const database = require('./database');
const PeerTable = require('./database/models/PeerTable');

app.get('/report', function (request, response) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;

    util.log("success", ip + " is request");

    var peerId = request.query.peerId;
    var storageSize  = request.query.storageSize;
    var nodeType = request.query.nodeType;

    switch (nodeType) {
        case 'storage':
            PeerTable.createStorageNode(peerId, nodeType, ip, storageSize)
                .then((table) => {
                    return response.json({success: true});                    
                })
                .catch((error) => {
                    return response.json({success: false, message: error});
                });

            break;
        case 'analysis':
            PeerTable.createAnalysisNode(peerId, nodeType, ip)
                .then((table) => {
                    return response.json({success: true});
                })
                .catch((error) => {
                    return response.json({success: false, message: error});
                });

            break;
        default:
            reponse.json({success: false, message: 'Invalid nodeType'});
            break;
    }

});

app.get('/requestInfo', function (request, response) {
    var peerId = request.query.peerId;
    
    if (peerId !== undefined || peerId !== "") {
        PeerTable.findPeer(peerId)
            .then((peer) => {
                return response.json({success: true, message: peer})
            })
            .catch((error) => {
                return response.json({success: false, message: error});
            });

    } else {
        return response.json({success: false, message: "no peerId"});
    }
});

app.listen(config.port, function () {
    util.log("success", "server on!");
    database();
});