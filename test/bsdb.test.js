var fs = require('fs'),
    path = require('path'),
    _ = require('busyman'),
    expect = require('chai').expect;

var Bsdb = require('../lib/components/bsdb.js');

var dbPath = path.resolve('./test/database_test/bs.db'),
    bsdb;

try {
    fs.statSync('./test/database_test');
} catch (e) {
    fs.mkdirSync('./test/database_test');
}

var nodeMock1 = {
    clientName: 'mock01',
    '0': {
        clientName: 'mock01',
        serverURI: 'coap://192.168.1.110:5683'
    }, 
    '1': {
        clientName: 'mock01',
        serverURI: 'coap://192.168.1.121:5683'
    }
};

var nodeMock2 = {
    clientName: 'mock02',
    '0': {
        clientName: 'mock02',
        serverURI: 'coap://192.168.1.110:5683'
    }, 
    '1': {
        clientName: 'mock02',
        serverURI: 'coap://192.168.1.121:5683'
    }
};

var nodeMock3 = {
    clientName: 'mock03',
    '0': {
        clientName: 'mock03',
        serverURI: 'coap://192.168.1.110:5683'
    }, 
    '1': {
        clientName: 'mock03',
        serverURI: 'coap://192.168.1.121:5683'
    }
};

describe('bsdb', function () {
    before(function () {
        bsdb = new Bsdb(dbPath);
    });

    describe('Functional Check', function () {
        describe('#.insert()', function () {
            it('should insert nodeMock1 and return doc', function (done) {
                bsdb.insert(nodeMock1, function (err, doc) {
                    delete doc._id;
                    if (_.isEqual(doc, nodeMock1)) 
                        done();
                });
            });

            it('should insert nodeMock2 and return doc', function (done) {
                bsdb.insert(nodeMock2, function (err, doc) {
                    delete doc._id;
                    if (_.isEqual(doc, nodeMock2)) 
                        done();
                });
            });
        });

        describe('#.exportClientNames()', function () {
            it('should export all client names', function (done) {
                bsdb.exportClientNames(function (err, names) {
                    var allNames = ['mock01', 'mock02', 'mock03'],
                        hasAll = true;

                    _.forEach(names, function (name) {
                        if (!_.includes(allNames, name)) hasAll = false;
                    });

                    if (hasAll) 
                        done();
                });
            });
        });

        describe('#.findByClientName()', function () {
            it('should return nodeMock1', function (done) {
                bsdb.findByClientName('mock01', function (err, doc) {
                    delete doc._id;
                    if (_.isEqual(doc, nodeMock1)) 
                        done();
                });
            });

            it('should return nodeMock2', function (done) {
                bsdb.findByClientName('mock02', function (err, doc) {
                    delete doc._id;
                    if (_.isEqual(doc, nodeMock2)) 
                        done();
                });
            });

            it('should return null', function (done) {
                bsdb.findByClientName('mock03', function (err, doc) {
                    if (_.isNull(doc)) 
                        done();
                });
            });

            it('should insert nodeMock3 and return doc', function (done) {
                bsdb.insert(nodeMock3, function (err, doc) {
                    delete doc._id;
                    if (_.isEqual(doc, nodeMock3)) 
                        done();
                });
            });

            it('should return nodeMock3', function (done) {
                bsdb.findByClientName('mock03', function (err, doc) {
                    delete doc._id;
                    if (_.isEqual(doc, nodeMock3)) 
                        done();
                });
            });
        });

        describe('#.replace()', function () {
            it('should replace configs 0', function (done) {
                bsdb.replace('mock01', { clientName: 'mock01', '0': { clientName: 'mock01', serverURI: 'coap://192.168.1.111:5683' }}, function (err, num) {
                    return bsdb.findByClientName('mock01', function (err, doc) {
                        if (doc['0'].serverURI === 'coap://192.168.1.111:5683') 
                            done();
                    });
                });
            });

            it('should not replace mock04 and return err', function (done) {
                bsdb.replace('mock04', { clientName: 'mock03', serverURI: 'coap://192.168.1.110:5683' }, function (err, num) {
                    if (err) 
                        done();
                });
            });
        });

        describe('#.modify()', function () {
            it('should modify configs and return diff', function (done) {
                bsdb.modify('mock01', '0', { clientName: 'mock01', serverURI: 'coap://192.168.1.133:5683' }, function (err, diff) {
                    if (diff['0'].serverURI === 'coap://192.168.1.133:5683') 
                        done();
                });
            });

            it('should not modify mock04 and return err', function (done) {
                bsdb.modify('mock04', '0', { clientName: 'mock01', serverURI: 'coap://192.168.1.133:5683' }, function (err, diff) {
                    if (err) 
                        done();
                });
            }); 
        });

        describe('#.removeByClientName()', function () {
            it('should remove mock01', function (done) {
                bsdb.removeByClientName('mock01', function (err, num) {
                    return bsdb.findByClientName('mock01', function (err, doc) {
                        if (_.isNull(doc)) 
                            done();
                    });
                });
            });

            it('should remove mock02', function (done) {
                bsdb.removeByClientName('mock02', function (err, num) {
                    return bsdb.findByClientName('mock02', function (err, doc) {
                        if (_.isNull(doc)) 
                            done();
                    });
                });
            });

            it('should remove mock03', function (done) {
                bsdb.removeByClientName('mock03', function (err, num) {
                    return bsdb.findByClientName('mock03', function (err, doc) {
                        if (_.isNull(doc)) 
                            done();
                    });
                });
            });

            it('should not remove unknow client and return 0', function (done) {
                bsdb.removeByClientName('mock04', function (err, num) {
                    if (num === 0) 
                        done();
                });
            });
        });
    });
});
