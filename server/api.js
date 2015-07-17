var { generateMongoUrl, urlPrefix } = require('./settings');

var mongoUrl    = generateMongoUrl();
var assign      = require("lodash/object/assign");
var Promise     = require("bluebird");
var MongoDB     = Promise.promisifyAll(require("mongodb"));
var MongoClient = Promise.promisifyAll(MongoDB.MongoClient);
var ObjectID    = require('mongodb').ObjectID;

console.log(`Connecting to mongo with ${mongoUrl}`);

var db = null;

//https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
var makeMongoConnection = function () {
    return new Promise((resolve, reject) => {
        MongoClient.connectAsync(mongoUrl, {
            server: {
                auto_reconnect: true,
                poolSize: 10
            }
        }).then(_db => {
            db = _db;
            resolve(db);
        }).catch(err => {
            reject(err);
        });
    });
};

// http://stackoverflow.com/questions/23597059/promise-and-nodejs-mongodb-driver
module.exports = function(app) {
    // Initialize the Mongo Connection pool
    makeMongoConnection()
        .then(db => {
            // Require each subset of api calls and pass the express app and mongo db (pooled)
            require('./apis/hosts.js')(app, db);
            require('./apis/metrics.js')(app, db);
        }).catch((err) => {
            console.error(`Could not initialize API due to a connection issue with mongo: ${err.message}`)
        });
};
