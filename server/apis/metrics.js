var { urlPrefix } = require('../settings');
var assign      = require("lodash/object/assign");
var ObjectID    = require('mongodb').ObjectID;
var fillValues  = require('keygaps').fillValues;

var oneDayMs = 86400000;
var oneMonthMs = oneDayMs * 30;

var getLastThirtyDays = function () {
    return new Date(+(new Date()) - oneMonthMs)
};

// Schema
// {
//    "_id" : ObjectId("55a0162505ba47d9b70a28de"),
//    "date" : ISODate("2015-07-10T18:59:49.560Z"),
//    "statusCode" : 200,
//    "msTaken" : 119,
//    "geo" : "NA",
//    "url" : "https://www.redhat.com",
//    "error" : null
//}
module.exports = function(app, db) {
    // Get Host
    //app.get(`${urlPrefix}/api/metric/:_id`, (req, res) => {
    //    res.setHeader("Content-Type", "application/json");
    //    db.collection("hosts").findOneAsync({_id: ObjectID(req.params._id)})
    //        .then((doc) => {
    //            console.log(`Found doc with length: ${JSON.stringify(doc, null, ' ').length}`);
    //            res.send(doc)
    //        })
    //        .catch((err) => {
    //            console.error(err);
    //            res.status(500).send(err);
    //        });
    //});
    // Get all metrics in the last 24 hours
    app.get(`${urlPrefix}/api/metrics`, function(req, res) {
        console.log(`Fetching metrics from the last 30 days from mongo`);
        var url = req.query.url;
        var geo = req.query.geo;
        var match = {
            $match: {
                date: {
                    $gte: getLastThirtyDays()
                },
                url: url
            }
        };
        console.log("Aggregating over metrics");
        console.log("$match: " + JSON.stringify(match));
        res.setHeader("Content-Type", "application/json");
        db.collection("metrics").aggregateAsync([
            match,
            // Group by hour and take the avg ms times
            {
                $group: {
                    _id: {
                        url: '$url',
                        geo: '$geo',
                        year: { $year: '$date' },
                        month: { $month: '$date' },
                        day: { $dayOfMonth: '$date' },
                        hour: { $hour: '$date' }
                    },
                    msAvg: {
                        $avg: '$msTaken'
                    }
                }
            },
            // Project with the string versions of the date fields.  $substr forces a coersion to a string for the
            // $concat in the next group
            {
                $project:  {
                    _id: 0,
                    url: '$_id.url',
                    geo: '$_id.geo',
                    year: { $substr: ['$_id.year', 0, -1]},
                    month: { $substr: ['$_id.month', 0, -1]},
                    day: { $substr: ['$_id.day', 0, -1]},
                    hour: { $substr: ['$_id.hour', 0, -1]},
                    y: '$msAvg'
                }

            },
            // Re-project now with the concatenated date for the x value
            {
                $project:  {
                    _id: 0,
                    url: '$url',
                    geo: '$geo',
                    x: {
                        // Specify UTC so new Date() can do the right tz conversions
                        $concat: ['$year', '-', '$month', '-', '$day', ' ', '$hour', ':00:00 UTC']
                    },
                    y: '$y'
                }
            },
            {
                $sort:  { url: 1, x: 1 }
            }
        ])
            .then(docs => {
                let output = fillValues({
                    values: docs,
                    yValue: -1,
                    keyFunction: function (input) { return [input.url, input.geo, input.x]; },
                    valueFunction: function (input) {
                        var obj = {};
                        obj['url'] = arguments[0][0];
                        obj['geo'] = arguments[0][1];
                        obj['x'] = arguments[0][2];
                        return obj
                    }
                });
                res.send(output.values)
            })
            .catch(err => {
                console.error(err);
                res.status(500).send(err);
            });
    });

    //// Delete a host
    //app.delete(`${urlPrefix}/api/host/:_id`, function(req, res) {
    //    res.setHeader("Content-Type", "application/json");
    //    db.collection("hosts").removeOneAsync({_id: new ObjectID(req.params._id)}, {w: 1})
    //        .then(r => res.send({status: 'success', numRemoved: r.result.n}))
    //        .catch(err => {
    //            console.error(err);
    //            res.status(500).send(err);
    //        });
    //});
    //// Insert a host
    //app.post(`${urlPrefix}/api/host`, function(req, res) {
    //    res.setHeader("Content-Type", "application/json");
    //    let timestamp = +(new Date());
    //    let doc = assign(req.body, {created: timestamp, updated: timestamp});
    //    db.collection("hosts").insertOneAsync(doc, {w: 1})
    //        .then(result => res.send(doc))
    //        .catch(err => {
    //            console.error(err);
    //            res.status(500).send(err);
    //        });
    //});
    //// Update a host
    //app.put(`${urlPrefix}/api/host`, function(req, res) {
    //    res.setHeader("Content-Type", "application/json");
    //    let timestamp = +(new Date());
    //    let doc = assign(req.body, {
    //        _id: ObjectID(req.body._id),
    //        updated: timestamp,
    //        frequency: +req.body.frequency
    //    });
    //    console.log(`Updating a host: ${JSON.stringify(doc, null, ' ')}`);
    //    db.collection("hosts").saveAsync(doc, {w: 1})
    //        .then(r => res.send({status: 'success', numRemoved: r.result.n}))
    //        .catch(err => {
    //            console.error(err);
    //            res.status(500).send(err);
    //        });
    //});
};
