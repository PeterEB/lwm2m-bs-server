var bsServer = require('../index.js');

bsServer.start(function (err) {
	if (err)
		console.log(err);
	else
		console.log('bss start');
});

bsServer.configure({ clientName: 'coap-node-bbstest', serverUri: 'coap://leshan.eclipse.org:5683'});
