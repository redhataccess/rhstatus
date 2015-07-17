var Marty       = require('marty');
var Constants   = require ("../constants/MetricConstants");
var find        = require('lodash/collection/find');
var I           = require('immutable');
var _           = require('lodash');

class MetricStore extends Marty.Store {
    constructor(options) {
        super(options);
        this.state = {};
        this.handlers = {
            addMetrics: Constants['RECEIVE_METRICS']
        };
    }
    addMetrics(metrics) {
        if (metrics == null) {
            this.state = null;
        } else if (metrics.length == 0) {
            this.state = []
        } else {
            this.state = metrics;
        }

        this.hasChanged();
    }
    _makeId(opts) {
        return `${opts.url}-${opts.geo}`
    }
    // TODO -- eventually pass in a date range or something of the sort to restrict the mongo query.  Right now it is
    // just the last 30 days for prototyping
    getMetrics(opts) {
        return this.fetch({
            id: this._makeId(opts),
            locally: function () {
                if(this.hasAlreadyFetched(this._makeId(opts))) {
                    return this.state;
                }
            },
            remotely: function () {
                return this.app.metricQueries.getMetrics(opts)
            }
        });
    }
}

module.exports = MetricStore;