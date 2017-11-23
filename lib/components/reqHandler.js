var coap = require('coap'),
    _ = require('busyman');

var request = require('./request');

var RSP = {
        created: '2.01', 
        deleted: '2.02', 
        changed: '2.04', 
        content: '2.05', 
        badreq: '4.00',
        unauth: '4.01', 
        forbid: '4.03', 
        notfound: '4.04', 
        notallowed: '4.05', 
        timeout: '4.08', 
        serverError: '5.00'
    };

function clientReqHandler(bs, req, rsp) {
    var optType = clientReqParser(req),
        reqHdlr;

    switch (optType) {
        case 'bootstrap':
            reqHdlr = clientBootstrapHandler;
            break;
        case 'empty':
            rsp.reset();
            break;
        default:
            break;
    }

    if (reqHdlr)
        setImmediate(function () {
            reqHdlr(bs, req, rsp);
        });
}

// [HACK]
/*********************************************************
 * Handler function                                      *
 *********************************************************/
function clientBootstrapHandler(bs, req, rsp) {
    var clientName = getClientName(req),
        configs = bs.find(clientName),
        ip = req.rsinfo.address,
        port = req.rsinfo.port,
        securityObj,
        serverObj,
        shortServerIdCount = 1,
        securityObjCount = 0,
        serverObjCount = 0,
        count = 0;

/***********************************************************************************/
/***********************************************************************************/
    function writeSecurityAndServerObjReq(config, callback) {
        var shortServerId = shortServerIdCount;
        shortServerIdCount += 1;

        securityObj = { 
            serverURI: '',
            bootstrapServer: false,
            securityMode: 3,
            pubKeyId: '',
            serverPubKeyId: '',
            secretKey: '',
            shortServerId: shortServerId
        };

        serverObj = {
            shortServerId: shortServerId,
            lifetime: 86400,
            notificationStoring: true,
            binding: 'U'
        };

        _.forEach(config, function (value, key) {
            switch (key) {
                case 'serverURI':
                case 'securityMode':
                case 'pubKeyId':
                case 'serverPubKeyId':
                case 'secretKey':
                case 'smsSecurityMode':
                case 'smsBindingKeyParam':
                case 'smsBindingSecretKey':
                case 'lwm2mServerSmsNum':
                case 'shortServerId':
                case 'clientHoldOffTime':
                    securityObj[key] = value;
                    break;

                case 'lifetime':
                case 'defaultMinPeriod':
                case 'defaultMaxPeriod':
                case 'disable':
                case 'disableTimeout':
                case 'notificationStoring':
                case 'binding':
                    serverObj[key] = value;
                    break;

                default:
                    break;
            }
        });

        request.write(bs, ip, port, '/lwm2mSecurity/' + securityObjCount, securityObj, function (err, rsp) {
            if (err) {
                callback(err);
            } else if (rsp.status === RSP.changed) {
                securityObjCount += 1;
                request.write(bs, ip, port, '/lwm2mServer/' + serverObjCount, serverObj, function (err, rsp) {
                    if (err) {
                        callback(err);
                    } else if (rsp.status === RSP.changed) {
                        serverObjCount += 1;
                        callback(null, rsp);
                    } else {
                        callback(new Error(ip + ':' + port + '/lwm2mServer' + ' Write operation did not succeed with status: ' + rsp.status + '.'));
                    }
                });
            } else {
                callback(new Error(ip + ':' + port + '/lwm2mSecurity' + ' Write operation did not succeed with status: ' + rsp.status + '.'));
            }
        });
    }
/***********************************************************************************/
/***********************************************************************************/
    if (_.isObject(configs) && configs.length !== 0) {
        sendRsp(rsp, RSP.changed, '');

        securityObj = {
            lwm2mServerURI: 'coap://' + bs._net.ip + ':' + bs._net.port,
            bootstrapServer: true,
            securityMode: 3,
            pubKeyId: '',
            serverPubKeyId: '',
            secretKey: '',
            shortServerId: shortServerIdCount
        };

        setTimeout(function () {
            request.delete(bs, ip, port, '/', function (err, rsp) {
                if (err) {
                    bs.emit('error', err);
                } else if (rsp.status === RSP.deleted) {
                    // Write Bootstrap Server LWM2M Security Objecy
                    request.write(bs, ip, port, 'lwm2mSecurity/' + securityObjCount, securityObj, function (err, rsp) {
                        if (err) {
                            bs.emit('error', err);
                        } else if (rsp.status === RSP.changed) {
                            securityObjCount += 1;
                            shortServerIdCount += 1;
                            // Write Configs LWM2M Security and Server Object
                            _.forEach(configs, function (config, key) {
                                if (key !== 'clientName') {
                                    writeSecurityAndServerObjReq(config, function (err, rsp) {
                                        if (err) {
                                            bs.emit('error', err);
                                        } else {
                                            count += 1;
                                            // Finish Bootstrap
                                            if (count === _.keys(configs).length - 1) {
                                                request.finish(bs, ip, port, function (err, rsp) {
                                                    if (err) {
                                                        bs.emit('error', err);
                                                    } else if (rsp.status === RSP.changed) {
                                                        bs.emit('bootstrapped', clientName);
                                                    } else {
                                                        bs.emit('error', new Error(ip + ':' + port + ' Finish operation did not succeed with status: ' + rsp.status + '.'));
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        } else {
                            bs.emit('error', new Error(ip + ':' + port + '/lwm2mSecurity' + ' Write operation did not succeed with status: ' + rsp.status + '.'));
                        }
                    });
                } else {
                    bs.emit('error', new Error(ip + ':' + port + '/ Delete operation did not succeed with status: ' + rsp.status + '.'));
                }
            });
        }, 50);
    } else {
        sendRsp(rsp, RSP.badreq, '');
    }
}

/*********************************************************
 * Private function                                      *
 *********************************************************/
function clientReqParser(req) {
    var optType,
        url;

    if (req.code === '0.00' && req._packet.confirmable && req.payload.length === 0)
        return 'empty';
    
    switch (req.method) {
        case 'POST':
            url = req.url ? req.url.split('?')[0] : undefined;
            if (url === '/bs') 
                optType = 'bootstrap';
            else
                optType = 'empty';
            break;

        default:
            optType = 'empty';
            break;
    }

    return optType;
}

function getClientName(req) {
    var query = req.url.split('?')[1],
        queryParams = query ? query.split('&') : undefined,
        clientName;

    _.forEach(queryParams, function(queryParam) {
        queryParam = queryParam.split('=');
        if(queryParam[0] === 'ep') {
            clientName = queryParam[1];
        }
    });

    return clientName;
}

function sendRsp(rsp, code, data) {
    rsp.code = code;
    rsp.end(data);
}

/*********************************************************
 * Module Exports                                        *
 *********************************************************/
module.exports = clientReqHandler;
