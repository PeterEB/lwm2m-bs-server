var expect = require('chai').expect;

var bsServer = require('../index'),
    config = require('../lib/config.js');

describe('bs-server - Constructor Check', function () {
    describe('bsServer', function () {
        it('should throw TypeError if attrs is not correct', function () {
            expect(bsServer._net.port).to.be.eql(config.port);
            expect(bsServer._enabled).to.be.eql(false);
            expect(bsServer._bootstraping).to.be.eql(false);
            expect(bsServer._configBox).to.be.eql({});
            expect(bsServer._dbPath).to.be.eql(config.defaultDbPath);
        });
    });
});

describe('bs-server - Signature Check', function () {
    describe('#.find()', function () {
        it('should throw TypeError if clientName is not a string', function () {
            expect(function () { return bsServer.find(); }).to.throw(TypeError);
            expect(function () { return bsServer.find(undefined); }).to.throw(TypeError);
            expect(function () { return bsServer.find(null); }).to.throw(TypeError);
            expect(function () { return bsServer.find(NaN); }).to.throw(TypeError);
            expect(function () { return bsServer.find(100); }).to.throw(TypeError);
            expect(function () { return bsServer.find({}); }).to.throw(TypeError);
            expect(function () { return bsServer.find([]); }).to.throw(TypeError);
            expect(function () { return bsServer.find(true); }).to.throw(TypeError);
            expect(function () { return bsServer.find(new Date()); }).to.throw(TypeError);
            expect(function () { return bsServer.find(function () {}); }).to.throw(TypeError);

            expect(function () { return bsServer.find('xx'); }).not.to.throw(TypeError);
        });
    });

    describe('#.list()', function () {
        it('should throw TypeError if given clientName is not a string or an array', function () {
            expect(function () { return bsServer.list(null); }).to.throw(TypeError);
            expect(function () { return bsServer.list(NaN); }).to.throw(TypeError);
            expect(function () { return bsServer.list(100); }).to.throw(TypeError);
            expect(function () { return bsServer.list({}); }).to.throw(TypeError);
            expect(function () { return bsServer.list(true); }).to.throw(TypeError);
            expect(function () { return bsServer.list(new Date()); }).to.throw(TypeError);
            expect(function () { return bsServer.list(function () {}); }).to.throw(TypeError);

            expect(function () { return bsServer.list(); }).not.to.throw(TypeError);
            expect(function () { return bsServer.list(undefined); }).not.to.throw(TypeError);
            expect(function () { return bsServer.list([]); }).not.to.throw(TypeError);
            expect(function () { return bsServer.list('xx'); }).not.to.throw(TypeError);
        });
    });

    describe('#.configure()', function () {
        it('should throw TypeError if clientName is not a string', function () {
            expect(function () { return bsServer.configure(); }).to.throw(TypeError);
            expect(function () { return bsServer.configure(undefined, {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure(null, {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure(NaN, {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure(100, {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure({}, {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure([], {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure(true, {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure(new Date(), {}); }).to.throw(TypeError);
            expect(function () { return bsServer.configure(function () {}, {}); }).to.throw(TypeError);

            expect(function () { return bsServer.configure('xx', {}); }).not.to.throw(TypeError);
        });

        it('should throw TypeError if config is not an object', function () {
            expect(function () { return bsServer.configure('xx'); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', undefined); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', null); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', NaN); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', 100); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', 'xx'); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', []); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', true); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', new Date()); }).to.throw(TypeError);
            expect(function () { return bsServer.configure('xx', function () {}); }).to.throw(TypeError);

            expect(function () { return bsServer.configure('xx', {}); }).not.to.throw(TypeError);
        });
    });
});