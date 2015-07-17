var { urlPrefix } = require('../settings');
var assign      = require("lodash/object/assign");
var ObjectID    = require('mongodb').ObjectID;

module.exports = function(app, db) {
    // Get Host
    app.get(`${urlPrefix}/api/host/:_id`, (req, res) => {
        res.setHeader("Content-Type", "application/json");
        db.collection("hosts").findOneAsync({_id: ObjectID(req.params._id)})
            .then((doc) => {
                console.log(`Found doc with length: ${JSON.stringify(doc, null, ' ').length}`);
                res.send(doc)
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send(err);
            });
    });
    // Get all hosts
    app.get(`${urlPrefix}/api/hosts`, function(req, res) {
        console.log(`Fetching all hosts from mongo.`);
        res.setHeader("Content-Type", "application/json");
        db.collection("hosts").find({}).toArrayAsync()
            .then(docs => res.send(docs))
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            });
    });

    // Delete a host
    app.delete(`${urlPrefix}/api/host/:_id`, function(req, res) {
        res.setHeader("Content-Type", "application/json");
        db.collection("hosts").removeOneAsync({_id: new ObjectID(req.params._id)}, {w: 1})
            .then(r => res.send({status: 'success', numRemoved: r.result.n}))
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            });
    });
    // Insert a host
    app.post(`${urlPrefix}/api/host`, function(req, res) {
        res.setHeader("Content-Type", "application/json");
        let timestamp = +(new Date());
        let doc = assign(req.body, {created: timestamp, updated: timestamp});
        db.collection("hosts").insertOneAsync(doc, {w: 1})
            .then(result => res.send(doc))
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            });
    });
    // Update a host
    app.put(`${urlPrefix}/api/host`, function(req, res) {
        res.setHeader("Content-Type", "application/json");
        let timestamp = +(new Date());
        let doc = assign(req.body, {
            _id: ObjectID(req.body._id),
            updated: timestamp,
            frequency: +req.body.frequency
        });
        console.log(`Updating a host: ${JSON.stringify(doc, null, ' ')}`);
        db.collection("hosts").saveAsync(doc, {w: 1})
            .then(r => res.send({status: 'success', numRemoved: r.result.n}))
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            });
    });
};
