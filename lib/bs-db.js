'use strict';

var Datastore = require('nedb'),
    _ = require('busyman');

function Bsdb (dbPath) {
    this.db = new Datastore({ 
        filename: dbPath, 
        autoload: true 
    });

    this.db.ensureIndex({ 
        fieldName: 'clientName'
    }, function (err) {
        if (err)
            throw err;
    });
}


Bsdb.prototype.insert = function (doc, callback) {
    this.db.insert(doc, function (err, newDoc) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, newDoc, callback);
    });
};

Bsdb.prototype.exportClientNames = function (callback) {
    this.db.find({}, { clientName: 1, _id: 0 }, function (err, nodes) {
        if (err) {
            invokeCbNextTick(err, null, callback);
        } else {
            _.map(nodes, function (cNameInfo) {
                invokeCbNextTick(null, cNameInfo.clientName, callback);
            });
        }
    });
};

Bsdb.prototype.findByClientName = function (cName, callback) {
    this.db.findOne({ clientName: cName }, { _id: 0 }, function (err, doc) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, doc, callback);
    });
};

Bsdb.prototype.findByClientNameWithId = function (cName, callback) {
    this.db.findOne({ clientName: cName }, function (err, doc) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, doc, callback);
    });
};

Bsdb.prototype.removeByClientName = function (cName, callback) {
    this.db.remove({ clientName: cName }, { multi: true }, function (err, numRemoved) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, numRemoved, callback);
    });
};

Bsdb.prototype.removeAllDocs = function (callback) {
    this.db.remove({}, { multi: true }, function (err, numRemoved) {
        if (err)
            invokeCbNextTick(err, null, callback);
        else
            invokeCbNextTick(null, numRemoved, callback);
    });
};

Bsdb.prototype.modify = function (cName, config, callback) {
    var self = this,
        diffObj = {};

    if (config.clientName !== cName) {
        return invokeCbNextTick(new Error('clientName cannot be modified.'), null, callback);
    }

    this.findByClientName(cName, function (err, doc) {
        if (err) {
            invokeCbNextTick(err, null, callback);
        } else if (!doc) {
            invokeCbNextTick(new Error('No such object ' + cName + ' for property modifying.'), null, callback);
        } else {
            self.db.update({ clientName: cName }, { $set: config }, { multi : true }, function (err, numReplaced) {
                if (err) {
                    invokeCbNextTick(err, null, callback);
                } else {
                    self.findByClientName(cName, function (err, newDoc) {
                        if (err) {
                            invokeCbNextTick(err, null, callback);
                        } else {
                            invokeCbNextTick(null, newDoc, callback);
                        }
                    });
                }
            });
        }
    });
};

function invokeCbNextTick(err, val, cb) {
    if (_.isFunction(cb))
        process.nextTick(function () {
            cb(err, val);
        });
}

module.exports = Bsdb;
