var coap = require('coap');

var reqHandler = require('./reqHandler');

var init = {};

init.setupServer = function (bs, callback) {
    coap.registerFormat('application/tlv', 11542);      // Leshan TLV binary Content-Formats

    serverStart(bs, function (err, server) {
        if (err) {
            invokeCbNextTick(err, null, callback);
        } else {
            bs._enabled = true;
            bs._server = server;
            invokeCbNextTick(null, true, callback);
        }
    });
};

/*********************************************************
 * Private function                                      *
 *********************************************************/
function serverStart(bs, callback) {
    var server = coap.createServer({
            type: 'udp4'
        });

    bs._agent = new coap.Agent({ type: 'udp4', socket: server._sock});

    server.on('request', function (req, rsp) {
        if (!_.isEmpty(req.payload)) 
            req.payload = req.payload.toString();

        reqHandler(bs, req, rsp);
    });

    server.listen(bs._net.port, function (err) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else 
            invokeCbNextTick(null, server, callback);
    });
}

function loadConfigsFromDb(bs, callback) {

}

function invokeCbNextTick(err, val, cb) {
    if (_.isFunction(cb))
        process.nextTick(function () {
            cb(err, val);
        });
}

/*********************************************************
 * Module Exports                                        *
 *********************************************************/
 module.exports = init;