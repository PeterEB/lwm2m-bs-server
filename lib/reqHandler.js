var coap = require('coap');

var request = require('./request');

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

/*********************************************************
 * Handler function                                      *
 *********************************************************/
function clientBootstrapHandler(bs, req, rsp) {
    var clientName = getClientName(req),
        config = bs.find(clientName),
        ip = req.rsinfo.address,
        port = req.rsinfo.port;

    if (config) {
        sendRsp(rsp, '2.04', '');
    } else {
        sendRsp(rsp, '4.00', '');
    }

    request.write(bs, ip, port, path, config.serverUri, function (err, rsp) {
        request.finish(bs, ip, port, function (err, rsp) {

        });
    });
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
            if (url === 'bs') 
                optType = 'bootstrap';
            break;

        default:
            break;
    }

    return optType;
}

function getClientName(req) {
    var query = url.split('?')[1],
        queryParams = query ? query.split('&') : undefined,
        clientName;

    _.forEach(queryParams, function(queryParam) {     
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
