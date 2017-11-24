# lwm2m-bs-server
Bootstrap server of lightweight M2M (LWM2M).

[![NPM](https://nodei.co/npm/coap-node.png?downloads=true)](https://nodei.co/npm/lwm2m-bs-server/)  

[![Build Status](https://travis-ci.org/PeterEB/lwm2m-bs-server.svg?branch=develop)](https://travis-ci.org/PeterEB/lwm2m-bs-server)
[![npm](https://img.shields.io/npm/v/lwm2m-bs-server.svg?maxAge=2592000)](https://www.npmjs.com/package/lwm2m-bs-server)
[![npm](https://img.shields.io/npm/l/lwm2m-bs-server.svg?maxAge=2592000)](https://www.npmjs.com/package/lwm2m-bs-server)

<br />

## Documentation  

Please visit the [Wiki](https://github.com/PeterEB/lwm2m-bs-server/wiki).

<br />

## Overview

[**OMA Lightweight M2M**](http://technical.openmobilealliance.org/Technical/technical-information/release-program/current-releases/oma-lightweightm2m-v1-0) (LWM2M) is a resource constrained device management protocol relies on [**CoAP**](https://tools.ietf.org/html/rfc7252). And **CoAP** is an application layer protocol that allows devices to communicate with each other RESTfully over the Internet.  

**coap-shepherd**, **coap-node** and **lwm2m-bs-server** modules aim to provide a simple way to build and manage a **LWM2M** machine network. 
* Server-side library: [**coap-shepherd**](https://github.com/PeterEB/coap-shepherd)
* Client-side library: [**coap-node**](https://github.com/PeterEB/coap-node)
* Bootstrap server library: **lwm2m-bs-server** (this module)
* [**A simple demo webapp**](https://github.com/PeterEB/quick-demo)

![coap-shepherd net](https://raw.githubusercontent.com/PeterEB/documents/master/coap-shepherd/media/lwm2m_net.png)  

### LWM2M Bootstrap Server: lwm2m-bs-server

* It is a **LWM2M** Bootstrap Server application framework running on node.js.  

<br />

## Installation

> $ npm install lwm2m-bs-server --save  

<br />

## Usage

This example shows how to start a bootstrap server and set a client bootstrap configuration after the server is ready:

```js
var bsServer = require('lwm2m-bs-server');

bsServer.on('ready', function () {
	console.log('Bootstrap server is ready.');

    bsServer.configure({ 
        clientName: 'lwm2m-client-test', 
        serverURI: 'coap://leshan.eclipse.org:5683'
    });
});

bsServer.start(function (err) {
    if (err) 
        console.log(err);
});
```

<br />

## License

Licensed under [MIT](https://github.com/PeterEB/lwm2m-bs-server/blob/master/LICENSE).
