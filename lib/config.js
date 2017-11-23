'use strict';

module.exports = {
    // the cserver's COAP server will start listening.
    // default is 5683.
    port: 5783, 

    // indicates if the server should create IPv4 connections (udp4) or IPv6 connections (udp6).
    // default is udp4.
    connectionType: 'udp4', 

    // path to the file where the data is persisted.
    // default is ./lib/database/coap.db.
    dbPath: null,  

    defaultDbFolder: __dirname + '/database',

    defaultDbPath: __dirname + '/database/bs.db'
};
