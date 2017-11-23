'use strict';

var fs = require('fs'),
    _ = require('busyman'),
    coap = require('coap'),
    util = require('util'),
    lwm2mId = require('lwm2m-id'),
    lwm2mCodec = require('lwm2m-codec'),
    EventEmitter = require('events').EventEmitter;

var init = require('./init'),
    config = require('./config'),
    Bsdb = require('./components/bs-db');

var reqTimeout = 60;

function BsServer() {
    EventEmitter.call(this);

    this._net = {
        ip: null,
        port: config.port
    };

    this._server = null;
    this._agent = null;
    this._enabled = false;
    this._bootstraping = false;
    this._configBox = {};
    this._dbPath = config.defaultDbPath;
/*
 clientName: {
    clientName: xxx,
    id: {
        clientName: 'xxx',
        serverURI: 'coap://xxx:xxx',
        ...
    },
    ...
 }
*/
    try {
        fs.statSync(config.defaultDbFolder);
    } catch (e) {
        fs.mkdirSync(config.defaultDbFolder);
    }

    this._db = new Bsdb(this._dbPath); 

    coap.updateTiming({
        maxLatency: (reqTimeout - 47) / 2
    });
}

util.inherits(BsServer, EventEmitter);

var bsServer = new BsServer();

BsServer.prototype.start = function (callback) {
    init.setupServer(this, function (err, result) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, result, callback);
    });
};

BsServer.prototype.stop = function (callback) {
    var self = this;

    if (!this._enabled) {
        invokeCbNextTick(null, true, callback);
    } else {
        if (!this._server) {
            invokeCbNextTick(new Error('server does not exist.'), null, callback);
        } else {
            this._server.close(function () {
                self._server = null;
                self._enabled = false;
                invokeCbNextTick(null, true, callback);
            });
        }
    }
};

BsServer.prototype.find = function (clientName) {
    return this._configBox[clientName];
};

BsServer.prototype.list = function (clientNames) {
    var self = this,
        foundConfig = {};

    if (_.isString(clientNames))
        clientNames = [ clientNames ];
    else if (!_.isUndefined(clientNames) && !_.isArray(clientNames))
        throw new TypeError('clientNames should be a string or an array of strings if given.');
    else if (!clientNames)
        clientNames = _.keys(this._configBox);   // list all

    _.map(clientNames, function (clientName) {        
        foundConfig[clientName] = this.find(clientName);
    });

    return foundConfig;
};

BsServer.prototype.configure = function (config, callback) {
    var clientName = config.clientName,
        serverURI = config.serverURI,
        configId;

    if (!clientName || !serverURI) {
        invokeCbNextTick(new Error('config should has clientName and serverURI.'), null, callback);
    } else if (!this._enabled) {
        invokeCbNextTick(new Error('bootstrap server does not enabled.'), null, callback);
    } else if (this._bootstraping) {
        invokeCbNextTick(new Error('bootstrap server is bootstraping.'), null, callback);
    } else if (!this._configBox[clientName] || !_.isObject(this._configBox[clientName])) {
        this._configBox[clientName] = { clientName: clientName };
        configId = getNewConfigId(this, clientName);
        this._configBox[clientName][configId] = config;

        this._db.insert(this._configBox[clientName], function (err, newDoc) {
            if (err)
                invokeCbNextTick(err, null, callback);
            else
                invokeCbNextTick(null, clientName, callback);
        });
    } else {
        _.forEach(this._configBox[clientName], function (obj, id) {
            _.forEach(obj, function (value, name) {
                if (serverURI === value)
                    configId = id;
            });
        });

        if (_.isNil(configId)) 
            configId = getNewConfigId(this, clientName);

        this._configBox[clientName][configId] = config;
        this._db.modify(clientName, configId, config, function (err, newDoc) {
            if (err)
                invokeCbNextTick(err, null, callback);
            else
                invokeCbNextTick(null, clientName, callback);
        });
    }
};

BsServer.prototype.remove = function (clientName, configId, callback) {
    var config = this._configBox[clientName];

    if (clientName && config && configId) {
        this._db.replace(clientName, this._configBox[clientName], function (err, newDoc) {
            if (err) {
                invokeCbNextTick(err, null, callback);
            } else {
                delete this._configBox[clientName][configId];
                invokeCbNextTick(null, clientName, callback);
            }
        });
    } else if (clientName && config) {
        this._db.removeByClientName(clientName, function (err, newDoc) {
            if (err) {
                invokeCbNextTick(err, null, callback);
            } else {
                delete this._configBox[clientName];
                invokeCbNextTick(null, clientName, callback);
            }
        });
    } else if (_.isNil(clientName)) {
        this._db.removeAllDocs(function (err, newDoc) {
            if (err) {
                invokeCbNextTick(err, null, callback);
            } else {
                delete this._configBox;
                this._configBox = {};
                invokeCbNextTick(null, true, callback);
            }
        });
    } else {
        invokeCbNextTick(new Error('clientName does not exist.'), null, callback);
    }
};

BsServer.prototype.request = function (reqObj, callback) {
    var agent;

    if (!reqObj.hostname || !reqObj.port || !reqObj.method) {
        return invokeCbNextTick('bad reqObj.', null, callback);
    }

    if (this._agent)
        agent = this._agent;

    if (!this._enabled) {
        return invokeCbNextTick('server does not enabled.', null, callback);
    } else {
        coapRequest(reqObj, agent, callback);
    }
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

function coapRequest(reqObj, originalAgent, callback) {
    var agent = originalAgent,
        req = agent.request(reqObj);

    req.on('response', function (rsp) {
        if (!_.isEmpty(rsp.payload) && rsp.headers['Content-Format'] === 'application/json') {
            rsp.payload = decodeJson(reqObj.pathname, rsp.payload);
        } else if (!_.isEmpty(rsp.payload) && rsp.headers['Content-Format'] === 'application/tlv') {
            rsp.payload = decodeTlv(reqObj.pathname, rsp.payload);
        } else if (!_.isEmpty(rsp.payload)) {
            rsp.payload = checkRescType(reqObj.pathname, rsp.payload.toString());
        }

        invokeCbNextTick(null, rsp, callback);
    });

    req.on('error', function(err) {
        if (err.retransmitTimeout) {
            invokeCbNextTick(err, null, callback);
        } else {
            invokeCbNextTick(err, null, callback);
        }        
    });
    
    req.end(reqObj.payload);
}

function getNewConfigId(bs, clientName, id) {
    var configId = id || 0;

    if (bs._configBox[clientName][configId]) {
        configId += 1;
        return getNewConfigId(bs, clientName, configId);
    } else {
        return configId;
    }
}

function decodeJson(pathname, payload) {
    return lwm2mCodec.decode('json', pathname, payload);
}

function decodeTlv(pathname, payload) {
    return lwm2mCodec.decode('tlv', pathname, payload);
}

function checkRescType (path, value) {
    var pathArray = path.split('?')[0].split('/'),  // '/x/y/z',
        dataDef,
        dataType,
        data;

    if (pathArray[0] === '') 
        pathArray = pathArray.slice(1);

    if (pathArray[pathArray.length-1] === '')           
        pathArray = pathArray.slice(0, pathArray.length-1);

    if (pathArray.length < 3 || _.isObject(value))
        return value;

    dataDef = lwm2mId.getRdef(pathArray[0], pathArray[2]);

    if (dataDef)
        dataType = dataDef.type;
    
    switch (dataType) {
        case 'string':
            data = value;
            break;
        case 'integer':
        case 'float':
            data = Number(value);
            break;
        case 'boolean':
            if (value === '0') {
                data = false;
            } else {
                data = true;
            }
            break;
        case 'time':
            data = value;
            break;
        default:
            if (Number(value))
                data = Number(value);
            else 
                data = value;
            break;
    }

    return data;
}

/*********************************************************
 * Module Exports                                        *
 *********************************************************/
module.exports = bsServer;
