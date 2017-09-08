var coap = require('coap'),
    _ = require('busyman');

var request = require('./request');

function clientReqHandler(bs, req, rsp) {
    var optType = clientReqParser(req),
        reqHdlr;
console.log(optType);
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

/*********************************************************
 * Handler function                                      *
 *********************************************************/
function clientBootstrapHandler(bs, req, rsp) {
    var clientName = getClientName(req),
        configs = bs.find(clientName),
        ip = req.rsinfo.address,
        port = req.rsinfo.port,
        lwm2mSecurityObj;

console.log(configs);
    if (configs) {
        sendRsp(rsp, '2.04', '');
        lwm2mSecurityObj = {
            lwm2mServerURI: 'coap://' + bs._net.ip + ':' + bs._net.port,    // [TODO]
            bootstrapServer: true,
            securityMode: 3,
            pubKeyId: '',
            serverPubKeyId: '',
            secretKey: '',
            smsSecurityMode: 3,
            smsBindingKeyParam: '',
            smsBindingSecretKey: ''
        };

        request.write(bs, ip, port, 'lwm2mSecurity/0', lwm2mSecurityObj, function (err, rsp) {
            console.log(rsp);
            if (err) {
                console.log(err);
                // [TODO]
            } else {
                _.forEach(configs, function (config) {

                }); // [TODO]
            }

            // [TODO]
            request.finish(bs, ip, port, function (err, rsp) {

            });
        });
    } else {
        sendRsp(rsp, '4.00', '');
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
