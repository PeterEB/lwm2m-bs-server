var bsServer = require('../index.js');

bsServer.on('ready', function () {
    bsServer.configure({ 
        clientName: 'coap-node-bbstest', 
        serverURI: 'coap://leshan.eclipse.org:5683'
    }, function (err) {
        console.log(bsServer._configBox);
    });
});

bsServer.start(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('bss start');
        console.log(bsServer._net);
    }
});

