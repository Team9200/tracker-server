const express = require('express');
const app = express();
const config = require('./config/config.json');
const util = require('./util/util');
const database = require('./database');
const PeerTable = require('./database/models/PeerTable');
const http = require('http');
const URL = require('url').URL;

var storageNodes = {};
var selectedStorage;

// Storage Node -> Tracker Server [Report 기능]
// http://트래커서버ip:29200/report?peerId=피어id&nodeType=storage&storageSize=스토리지사이즈&remainingStorageSize=남은스토리지사이즈&mining=마이닝여부
app.get('/report', function (request, response) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress || 
    request.socket.remoteAddress || request.connection.socket.remoteAddress;
    ip = ip.replace("::ffff:", "");
    ip = ip.replace("::1", "127.0.0.1");

    util.log("success", ip + " is reporting");

    var peerId = request.query.peerId;
    var nodeType = request.query.nodeType;
    var storageSize  = request.query.storageSize;
    var remainingStorageSize  = request.query.remainingStorageSize;
    var mining = request.query.mining;

    switch (nodeType) {
        case 'storage':
            PeerTable.findPeer(peerId)
                .then((peer) => {
                    if (peer) {
                        PeerTable.updateStorageNode(peerId, nodeType, ip, storageSize, remainingStorageSize, mining)
                            .then((table) => {
                                return response.json({success: true});
                            })
                            .catch((error) => {
                                return response.json({success: false, message: error});
                            });
                    } else {
                        PeerTable.createStorageNode(peerId, nodeType, ip, storageSize, remainingStorageSize, mining)
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

// Storage Node -> Storage Node [마이닝 정보 및 샘플 요청, 전송]
// http://트래커서버ip:29200/requestInfo?senderPeerId=보내는피어id&receiverPeerId=받는피어id
app.get('/storageToStorage', function (request, response) {
    var senderPeerId = request.query.senderPeerId;
    var receiverPeerId = request.query.receiverPeerId;
    
    if (senderPeerId !== undefined || senderPeerId !== "" || receiverPeerId !== undefined || receiverPeerId !== "") {
        PeerTable.findPeer(receiverPeerId)
            .then((peer) => {
                if (peer) {
                    try{
                        var options = new URL('http://' + peer.address + ':39200/sendRequest?roomName=' + senderPeerId);
                        http.request(options, function(res) {
                        }).end();
                    } catch(error) {
                        util.log("error", error);
                    }
                    util.log('Storage Node to Storage Node (' + peer.address + ')');
                    return response.json({success: true, peerId: peer.id, SignalingServerURL: peer.address+":19200", roomName : senderPeerId});
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

// Collector Node -> Storage Node, Analysis Node -> Storage Node [스토리지 랜덤 선택 및 파일 전송 기능]
// http://트래커서버ip:29200/sendToStorage?senderPeerId=보내는피어id
app.get('/sendToStorage', function (request, response) {
    var senderPeerId = request.query.senderPeerId;
    var sumStorageSize = 0;
    var checkSumStorageSize = 0;
    var randValue = 0;
    if (senderPeerId !== undefined || senderPeerId !== "" || receiverPeerId !== undefined || receiverPeerId !== "") {
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
                try{
                    var options = new URL('http://' + peer[j].address + ':39200/sendRequest?roomName=' + senderPeerId);
                    http.request(options, function(res) {
                        util.log("success", 'Send to Storage Node (' + peer[j].address + ')');
                    }).end();
                } catch(error) {
                    console.log("error", error);
                }
                return response.json({success: true, peerId: selectedStorage, SignalingServerURL: peer[j].address+":19200", roomName : senderPeerId});
            })
            .catch((error) => {
                return response.json({success: false, message: error});
            });
    } else {
        return response.json({success: false, message: "no peerId"});
    }
});

// Storage Node -> Storage Node [파일을 가지고 있는 Storage Node의 peerId 찾기]
// http://트래커서버ip:29200/findFile?fileHash=찾는파일SHA256해쉬
app.get('/findFile', function(request, response) {
    var fileHash = request.query.fileHash;
    var checkValue = 0;
    PeerTable.findStorage()
        .then((peer) => {
            if (peer) {
                for (var i = 0; i < peer.length; i++) {
                    try{
                        var options = new URL('http://'+ peer[i].address +':39200/findFile?fileHash=' + fileHash);
                        http.request(options, function(res) {
                            var body = '';
                            res.on('data', function(data) {
                                body += data;
                            });

                            res.on('end', function(data) {
                                if (body == "success") {
                                    checkValue = checkValue + 1;
                                    util.log("success", 'Find File at Storage Node (' + peer[i].id + ')');
                                    return response.json({success: true, storagePeerId: peer[i].id});
                                }
                                else if (body == "fail") {
                                    return response.json({success: false});
                                }
                                else {
                                    return response.json({success: false});
                                }
                            });
                        }).end();
                    } catch(error) {
                        util.log("error", error);
                        return response.json({success: false, message: error});
                    } finally {
                        break;
                    }
                }
            }
        })
        .catch((error) => {
            return response.json({success: false, message: error});
        });
});

app.get('/api/Data', function (request, response) {
    PeerTable.findStorage()
        .then((data) => {
            return response.json({
                success: true,
                message: data
            })
        })
        .catch((error) => {
            return response.json({
                success: false,
                message: error
            })
        });
});

app.listen(config.port, function () {
    util.log("success", "server on!");
    database();
});