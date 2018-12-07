const express = require('express');
const app = express();
const config = require('./config/config.json');
const util = require('./util/util');
const database = require('./database');
const PeerTable = require('./database/models/PeerTable');

var storageNodes = {};
var selectedStorage;

// 노드 Report 기능
app.get('/report', function (request, response) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;

    ip = ip.replace("::ffff:", "");

    util.log("success", ip + " is request");

    var peerId = request.query.peerId;
    var nodeType = request.query.nodeType;
    var storageSize  = request.query.storageSize;
    var mining = request.query.mining;

    switch (nodeType) {
        case 'storage':
            PeerTable.findPeer(peerId)
                .then((peer) => {
                    if (peer) {
                        PeerTable.updateStorageNode(peerId, nodeType, ip, storageSize, mining)
                            .then((table) => {
                                return response.json({success: true});
                            })
                            .catch((error) => {
                                return response.json({success: false, message: error});
                            });
                    } else {
                        PeerTable.createStorageNode(peerId, nodeType, ip, storageSize, mining)
                            .then((table) => {
                                return response.json({success: true});
                            })
                            .catch((error) => {
                                return response.json({success: false, message: error});
                            });
                    }
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

// 노드 파일 전송 기능
app.get('/requestInfo', function (request, response) {
    var senderPeerId = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;
    var receiverPeerId = request.query.receiverPeerId;
    
    senderPeerId = senderPeerId.replace("::ffff:", "");

    if (senderPeerId !== undefined || senderPeerId !== "" || receiverPeerId !== undefined || receiverPeerId !== "") {
        PeerTable.findPeer(receiverPeerId)
            .then((peer) => {
                if (peer) {
                    return response.json({success: true, peerId: peer.id, peerURL: peer.address+":19200#"+senderPeerId});
                } else {
                    return response.json({success: false});
                }
            })
            .catch((error) => {
                return response.json({success: false, message: error});
            });
    } else {
        return response.json({success: false, message: "no peerId"});
    }
});

// 콜렉터 -> 스토리지 랜덤 선정 및 파일 전송 기능
app.get('/requestStorage', function (request, response) {
    var senderPeerId = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;

    senderPeerId.replace("::ffff:", "");

    var sumStorageSize = 0;
    var checkSumStorageSize = 0;
    var randValue = 0;
    PeerTable.findStorage()
        .then((peer) => {
            if (peer) {
                for (var i = 0; i < peer.length; i++) {
                    sumStorageSize = sumStorageSize + peer[i].storageSize;
                    storageNodes[peer[i].id] = peer[i].storageSize;
                }
                randValue = Math.floor(Math.random() * sumStorageSize) + 1;
                for (var j = 0; j < peer.length; j++) {
                    checkSumStorageSize = checkSumStorageSize + peer[j].storageSize;
                    if (randValue <= checkSumStorageSize) {
                        selectedStorage = peer[j].id;
                        break;
                    }
                }
            }
            return response.json({success: true, peerId: selectedStorage, peerURL: peer[j].address+":19200#"+senderPeerId});
        })
        .catch((error) => {
            return response.json({success: false, message: error});
        });
});

app.listen(config.port, function () {
    util.log("success", "server on!");
    database();
});