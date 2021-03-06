var bsServer = require('../index.js');

bsServer.on('ready', function () {
    bsServer.configure('coap-node-test', [{
        serverURI: 'coap://leshan.eclipse.org:5683'
    }]);

});

bsServer.on('bootstrapped', function () {
    console.log('bootstrapped');
});

bsServer.on('error', function (err) {
    console.log(err);
});

bsServer.start(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('>> lwm2m bootstrap server start!');
    }
});
