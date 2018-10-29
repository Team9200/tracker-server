const express = require('express');
const app = express();
const uuid = require('uuid/v1');
const config = require('./config/config.json');
const util = require('./util/util');



app.get('/report', function (request, response) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 
            req.socket.remoteAddress || req.connection.socket.remoteAddress;

    util.log(ip + " is request", "success");

    var tokenId = request.query.tokenId;
    var storageCapacity  = request.query.storageCapacity;
    var nodeType = request.query.nodeType;

    switch (nodeType) {
        case 'storage':
            // TODO: Insert DB
            response.json({success: true});
            break;
        case 'analysis':
            // TODO: Insert DB
            response.json({success: true});
            break;
        default:
            reponse.json({success: false, message: 'Invalid nodeType'});
            break;
    }

});

app.listen(config.port, function () {
    util.log("server on!", "success");
});