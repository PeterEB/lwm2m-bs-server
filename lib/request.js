var coap = require('coap'),
    lwm2mCodec = require('lwm2m-codec');

var request = {};

request.write = function (bs, ip, port, path, data, callback) {
    var reqObj = {
            hostname: ip,
            port: port,
            pathname: path,
            method: 'PUT',
            payload: encodeTlv(path, data),
            options: {'Content-Format': 'application/tlv'}
        },
        rspObj;

    bs.request(reqObj, function (err, rsp) {
        rspObj = { status: rsp.code };

        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, rspObj, callback);
    });
};

request.finish = function (bs, ip, port, callback) {
    var reqObj = {
            hostname: ip,
            port: port,
            pathname: '/bs',
            method: 'POST'
        },
        rspObj;

    bs.request(reqObj, function (err, rsp) {
        rspObj = { status: rsp.code };

        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, rspObj, callback);
    });
};

/*********************************************************
 * Private function                                      *
 *********************************************************/
function invokeCbNextTick(err, val, cb) {
    if (_.isFunction(cb))
        process.nextTick(function () {
            cb(err, val);
        });
}

function encodeTlv(pathname, payload) {
    return lwm2mCodec.encode('tlv', pathname, payload);
}

/*********************************************************
 * Module Exports                                        *
 *********************************************************/
 module.exports = request;