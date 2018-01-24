var _ = require('busyman'),
    lwm2mId = require('lwm2m-id'),
    lwm2mCodec = require('lwm2m-codec');

var request = {};

request.write = function (bs, ip, port, path, data, callback) {
    var reqObj = {
            hostname: ip,
            port: port,
            pathname: getNumPath(path),
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
            pathname: getNumPath(path),
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
            pathname: getNumPath(path),
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

function encodeJson(pathname, payload) {
    return lwm2mCodec.encode('json', pathname, payload);
}

function oidNumber(oid) {
    var oidItem = lwm2mId.getOid(oid);

    oidItem = oidItem ? oidItem.value : parseInt(oid);   

    if (_.isNaN(oidItem))
        oidItem = oid;

    return oidItem;
}

function ridNumber(oid, rid) {
    var ridItem = lwm2mId.getRid(oid, rid);

    if (_.isUndefined(rid))
        rid = oid;

    ridItem = ridItem ? ridItem.value : parseInt(rid);   

    if (_.isNaN(ridItem))
        ridItem = rid;

    return ridItem;
}

function getPathArray(path) {
    var pathArray = path.split('/');       // '/x/y/z'

    if (pathArray[0] === '') 
        pathArray = pathArray.slice(1);

    if (pathArray[pathArray.length-1] === '')           
        pathArray = pathArray.slice(0, pathArray.length-1);

    return pathArray;  // ['x', 'y', 'z']
}

function getNumPath(path) {
    var pathArray = getPathArray(path),       // '/lwm2mServer/2/defaultMaxPeriod'
        soPath = '',
        oid,
        rid;

    if (path === '/')
        return path;

    if (pathArray[0]) {    //oid
        oid = oidNumber(pathArray[0]);
        soPath += '/' + oid;

        if (pathArray[1]) {    //iid
            soPath += '/' + pathArray[1]; 

            if (pathArray[2]) {    //rid
                rid = ridNumber(oid, pathArray[2]);
                soPath +=  '/' + rid;
            } 
        }
    }

    return soPath;      // '/1/2/3'
}

/*********************************************************
 * Module Exports                                        *
 *********************************************************/
 module.exports = request;
 