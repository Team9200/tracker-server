const express = require('express');
const app = express();
const config = require('./config/config.json');
const util = require('./util/util');
const database = require('./database');
const PeerTable = require('./database/models/PeerTable');

var storageNodes = {};
var selectedStorage;

// 노드 정보 보고 기능
app.get('/report', function (request, response) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;

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

// 노드가 살아있는지 확인
app.get('/requestInfo', function (request, response) {
    var senderPeerId = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;
    var receiverPeerId = request.query.receiverPeerId;
    
    if (senderPeerId !== undefined || senderPeerId !== "" || receiverPeerId !== undefined || receiverPeerId !== "") {
        PeerTable.findPeer(receiverPeerId)
            .then((peer) => {
                if (peer) {
                    // ToDo: 받는 사람에게 receiver의 peerId를 보내 같은 URL에 접속하도록 해야함
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

// 콜렉터가 스토리지에게 보낼 때 랜덤으로 스토리지를 선택
app.get('/requestStorage', function (request, response) {
    var senderPeerId = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;
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
            // ToDo: 받는 사람에게 receiver의 peerId를 보내 같은 URL에 접속하도록 해야함
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