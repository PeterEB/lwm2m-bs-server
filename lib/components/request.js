var _ = require('busyman'),
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
        };

    bs.request(reqObj, function (err, rsp) {
        if (err) {
            invokeCbNextTick(err, null, callback);
        } else {
            invokeCbNextTick(null, { status: rsp.code }, callback);
        }
    });
};

request.delete = function (bs, ip, port, path, callback) {
    var reqObj = {
            hostname: ip,
            port: port,
            pathname: path,
            method: 'DELETE'
        };

    bs.request(reqObj, function (err, rsp) {
        if (err) {
            invokeCbNextTick(err, null, callback);
        } else {
            invokeCbNextTick(null, { status: rsp.code }, callback);
        }
    });
};

request.discover = function (bs, ip, port, path, callback) {
    var reqObj = {
            hostname: ip,
            port: port,
            pathname: path,
            method: 'GET',
            options: {'Accept': 'application/link-format'}
        };

    bs.request(reqObj, function (err, rsp) {
        if (err) {
            invokeCbNextTick(err, null, callback);
        } else {
            invokeCbNextTick(null, { status: rsp.code }, callback);
        }
    });
};

request.finish = function (bs, ip, port, callback) {
    var reqObj = {
            hostname: ip,
            port: port,
            pathname: '/bs',
            method: 'POST'
        };

    bs.request(reqObj, function (err, rsp) {
        if (err) {
            invokeCbNextTick(err, null, callback);
        } else {
            invokeCbNextTick(null, { status: rsp.code }, callback);
        }
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
 