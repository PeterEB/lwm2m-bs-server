var bsServer = require('../index.js');

bsServer.on('ready', function () {
    bsServer.configure({ 
        clientName: 'coap-node-bbstest', 
        serverURI: 'coap://127.0.0.1:5683'
    }, function (err) {
        console.log(bsServer._configBox);
    });
});

bsServer.on('error', function (err) {
    console.log(err);
});

bsServer.start(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('bss start');
        console.log(bsServer._net);
    }
});

