var chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect;

chai.use(sinonChai);

var clientReqHandler = require('../lib/components/reqHandler.js');

describe('bs-reqHandler', function () {
    describe('Functional Check', function () {
        describe('#.clientReqHandler()', function () {
            it('should call request and fire bootstrapped event', function (done) {
                var deleteReqCount = 0,
                    writeReqCount = 0,
                    finishReqCount = 0,
                    bsMock = {
                        _net: {
                            ip: '192.168.1.101',
                            port: 5783
                        },
                        find: function (clientName) {
                            if (clientName === 'testNode')
                                return {
                                    clientName: 'testNode',
                                    '0': {
                                        clientName: 'testNode',
                                        serverURI: 'coap://192.168.1.102:5683'
                                    }
                                };
                        },
                        request: function (reqObj, cb) {
                            switch (reqObj.method) {
                                case 'DELETE':      // deleteReq
                                    if (reqObj.hostname === '192.168.1.110' && reqObj.port === 5432)
                                        deleteReqCount += 1;
                                    cb(null, { code: '2.02' });
                                    break;

                                case 'PUT':         // writeReq
                                    if (reqObj.hostname === '192.168.1.110' && reqObj.port === 5432)
                                        writeReqCount += 1;
                                    cb(null, { code: '2.04' });
                                    break;

                                case 'POST':        // finishReq
                                    if (reqObj.hostname === '192.168.1.110' && reqObj.port === 5432)
                                        finishReqCount += 1;
                                    cb(null, { code: '2.04' });
                                    break;

                                default:
                                    break;
                            }
                        },
                        emit: function (evt, clientName) {
                            if (evt === 'bootstrapped') {
                                expect(deleteReqCount).to.be.eql(1);
                                expect(writeReqCount).to.be.eql(3);
                                expect(finishReqCount).to.be.eql(1);
                                done();
                            }
                        },
                    },
                    reqMock = {
                        rsinfo: { 
                            address: '192.168.1.110',
                            port: 5432
                        },
                        code: '0.01',
                        method: 'POST',
                        url: '/bs?ep=testNode'
                    },
                    rspMock = {
                        code: '',
                        end: sinon.spy()
                    };

                clientReqHandler(bsMock, reqMock, rspMock);
            });
        });
    });
});
