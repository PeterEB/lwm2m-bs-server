var _ = require('busyman'),
    lwm2mCodec = require('lwm2m-codec');

var request = require('../lib/components/request.js');

var reqObj,
    bsMock = {
        request : function (req, cb) {
            if (_.isEqual(req, reqObj)) 
                cb(null, { code: '2.04' });
        }
    };

function encodeTlv(pathname, payload) {
    return lwm2mCodec.encode('tlv', pathname, payload);
}

describe('bs-request', function () {
    describe('Functional Check', function () {
        describe('#.write()', function () {
            it('should passing write request object and return status code', function (done) {
                var ip = '192.168.1.110',
                    port = 5683,
                    path = '/1/0',
                    data = { serverURI: 'coap://192.168.1.210:5683' };

                reqObj = {
                    hostname: ip,
                    port: port,
                    pathname: path,
                    method: 'PUT',
                    payload: encodeTlv(path, data),
                    options: {'Content-Format': 'application/tlv'}
                };

                request.write(bsMock, ip, port, path, data, function (err, rsp) {
                    if (rsp.status === '2.04')
                        done();
                });
            });
        });

        describe('#.delete()', function () {
            it('should passing delete request object and return status code', function (done) {
                var ip = '192.168.1.110',
                    port = 5683,
                    path = '/';

                reqObj = {
                    hostname: ip,
                    port: port,
                    pathname: path,
                    method: 'DELETE'
                };

                request.delete(bsMock, ip, port, path, function (err, rsp) {
                    if (rsp.status === '2.04')
                        done();
                });
            });
        });

        describe('#.discover()', function () {
            it('should passing discover request object and return status code', function (done) {
                var ip = '192.168.1.110',
                    port = 5683,
                    path = '/1/0';

                reqObj = {
                    hostname: ip,
                    port: port,
                    pathname: path,
                    method: 'GET',
                    options: {'Accept': 'application/link-format'}
                };

                request.discover(bsMock, ip, port, path, function (err, rsp) {
                    if (rsp.status === '2.04')
                        done();
                });
            });
        });

        describe('#.finish()', function () {
            it('should passing finish request object and return status code', function (done) {
                var ip = '192.168.1.110',
                    port = 5683,
                    path = '/bs';

                reqObj = {
                    hostname: ip,
                    port: port,
                    pathname: path,
                    method: 'POST'
                };

                request.finish(bsMock, ip, port, function (err, rsp) {
                    if (rsp.status === '2.04')
                        done();
                });
            });
        });
    });
});
