const express = require('express');
const app = express();
const uuid = require('uuid/v1');
const config = require('./config/config.json');
const util = require('./util/util');
const PeerTable = require('./database/models/PeerTable');

app.get('/report', function (request, response) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
            req.socket.remoteAddress || req.connection.socket.remoteAddress;

    util.log("success", ip + " is request");

    var tokenId = request.query.tokenId;
    var storageSize  = request.query.storageSize;
    var nodeType = request.query.nodeType;

    switch (nodeType) {
        case 'storage':
            PeerTable.createStorageNode(nodeType, ip, tokenId, storageSize)
                .then((table) => {
                    return response.json({success: true});                    
                })
                .catch((error) => {
                    return response.json({success: false, message: error});
                });
            break;
        case 'analysis':
            PeerTable.createAnalysisNode(nodeType, ip, tokenId)
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

app.listen(config.port, function () {
    util.log("success", "server on!");
});