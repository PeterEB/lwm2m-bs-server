'use strict';

var _ = require('busyman'),
    coap = require('coap');

var init = require('./init');

function BsServer() {
    this._net = {
        port: 5783
    };

    this._server = null;
    this._agent = null;
    this._enabled = false;
    this._configBox = {};

    coap.updateTiming({
        maxLatency: (reqTimeout - 47) / 2
    });
}

var bsServer = new BsServer();

BsServer.prototype.start = function (callback) {
    init.setupServer(this, function (err, server) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, true, callback);
    });
};

BsServer.prototype.stop = function (callback) {
    var self = this;

    if (!this._enabled) {
        invokeCbNextTick(null, true, callback);
    } else {
        if (!this._server) {
            invokeCbNextTick('server does not exist.', null, callback);
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
        foundConfig;

    if (_.isString(clientNames))
        clientNames = [ clientNames ];
    else if (!_.isUndefined(clientNames) && !_.isArray(clientNames))
        throw new TypeError('clientNames should be a string or an array of strings if given.');
    else if (!clientNames)
        clientNames = _.keys(this._configBox);   // list all

    foundConfig = _.map(clientNames, function (clientName) {        
        return this.find(clientName);
    });

    return foundConfig;
};

BsServer.prototype.configure = function (config) {
    var clientName = config.clientName;

    if (clientName) {
        this._configBox[clientName] = config;
    }

    return clientName;
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
        coapRequest(reqObj, agent);
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
        rsp.payload = decodeTlv(reqObj.pathname, rsp.payload);
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

function decodeTlv(pathname, payload) {
    return lwm2mCodec.decode('tlv', pathname, payload);
}

/*********************************************************
 * Module Exports                                        *
 *********************************************************/
module.exports = bsServer;
