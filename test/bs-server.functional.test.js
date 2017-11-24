var fs = require('fs'),
    path = require('path'),
    _ = require('busyman'),
    expect = require('chai').expect;

var bsServer = require('../index');

describe('bs-server - Functional Check', function() {
    before(function (done) {
        try {
            fs.unlinkSync(path.resolve('./lib/database/bs.db'));
        } catch (e) {
            console.log(e);
        }

        bsServer.start(function (err) {
            done();
        });
    });

    after(function (done) {
        bsServer.remove(function (err) {
            done();
        });
    });

    describe('#.configure()', function() {
        it('should configure client config', function (done) {
            var config;
            bsServer.configure('testNode1', { serverURI: 'coap://192.168.1.101:4321' }, function (err, clientName) {
                config = bsServer.find('testNode1');

                expect(clientName).to.be.eql('testNode1');
                expect(config.clientName).to.be.eql('testNode1');
                expect(config[0].serverURI).to.be.eql('coap://192.168.1.101:4321');
                done();
            });
        });

        it('should configure client config', function (done) {
            var config;
            bsServer.configure('testNode1', { serverURI: 'coap://192.168.1.101:4322' }, function (err, clientName) {
                config = bsServer.find('testNode1');

                expect(clientName).to.be.eql('testNode1');
                expect(config.clientName).to.be.eql('testNode1');
                expect(config[1].serverURI).to.be.eql('coap://192.168.1.101:4322');
                done();
            });
        });

        it('should configure client config', function (done) {
            var config;
            bsServer.configure('testNode2', { serverURI: 'coap://192.168.1.102:4321' }, function (err, clientName) {
                config = bsServer.find('testNode2');

                expect(clientName).to.be.eql('testNode2');
                expect(config.clientName).to.be.eql('testNode2');
                expect(config[0].serverURI).to.be.eql('coap://192.168.1.102:4321');
                done();
            });
        });

        it('should configure client config', function (done) {
            var config;
            bsServer.configure('testNode3', { serverURI: 'coap://192.168.1.103:4321' }, function (err, clientName) {
                config = bsServer.find('testNode3');

                expect(clientName).to.be.eql('testNode3');
                expect(config.clientName).to.be.eql('testNode3');
                expect(config[0].serverURI).to.be.eql('coap://192.168.1.103:4321');
                done();
            });
        });

        it('should receive error if the config do not have serverURI', function (done) {
            bsServer.configure('testNode4', {}, function (err, clientName) {
                expect(bsServer.find('testNode4')).to.be.eql(undefined);
                expect(err).to.be.an('error');
                done();
            });
        });
    });

    describe('#.remove()', function() {
        it('should remove a client config', function (done) {
            bsServer.remove('testNode1', 1, function (err) {
                expect(bsServer.find('testNode1')[1]).to.be.eql(undefined);
                done();
            });           
        });

        it('should remove a client config', function (done) {
            bsServer.remove('testNode3', function (err) {
                expect(bsServer.find('testNode3')).to.be.eql(undefined);
                done();
            });           
        });

        it('should receive error if remove a not exist client config', function () {
            bsServer.remove('testNode4', function (err) {
                expect(err).to.be.an('error');
                done();
            });                     
        });
    });

    describe('#.find()', function() {
        it('should find client config', function () {
            var config = bsServer.find('testNode1');

            expect(config).to.be.an('object');
            expect(config.clientName).to.be.eql('testNode1');
            expect(config[0].serverURI).to.be.eql('coap://192.168.1.101:4321');
        });

        it('should receive undefined if find a not exist client config', function () {
            expect(bsServer.find('testNode4')).to.be.eql(undefined);      
        });
    });

    describe('#.list()', function() {
        it('should list all clients config', function () {
            var configs = bsServer.list();

            expect(configs).to.be.an('object');
            expect(configs.testNode1).to.be.an('object');
            expect(configs.testNode2).to.be.an('object');
            expect(configs.testNode1.clientName).to.be.eql('testNode1');
            expect(configs.testNode2.clientName).to.be.eql('testNode2');
            expect(configs.testNode1[0].serverURI).to.be.eql('coap://192.168.1.101:4321');
            expect(configs.testNode2[0].serverURI).to.be.eql('coap://192.168.1.102:4321');
        });

        it('should list given clients config', function () {
            var clientNames = [ 'testNode2' ],
                configs = bsServer.list(clientNames);

            expect(configs).to.be.an('object');
            expect(configs.testNode1).to.be.eql(undefined);
            expect(configs.testNode2).to.be.an('object');
            expect(configs.testNode2.clientName).to.be.eql('testNode2');
            expect(configs.testNode2[0].serverURI).to.be.eql('coap://192.168.1.102:4321');
        });
    });    

    describe('#.stop()', function() {
        it('should stop server', function (done) {
           bsServer.stop(function (err) {
                expect(bsServer._server).to.be.eql(null);
                expect(bsServer._enabled).to.be.eql(false);
                done();
            });
        });
    });    
});
