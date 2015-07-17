var Marty       = require('marty');
var Constants   = require ("../constants/HostConstants");
var find        = require('lodash/collection/find');
var I           = require('immutable');
var _           = require('lodash');

class HostStore extends Marty.Store {
    constructor(options) {
        super(options);
        this.state = {};
        this.handlers = {
            updateHost: Constants['UPDATE_HOST'],
            removeHost: Constants['DELETE_HOST'],
            addHost: Constants['RECEIVE_HOST'],
            addHosts: Constants['RECEIVE_HOSTS']
        };
    }
    updateHost(host) {
        this.state[host._id] = host;
        this.hasChanged();
    }
    addHost(host) {
        this.state[host._id] = host;
        this.hasChanged();
    }
    removeHost(host) {
        delete this.state[host._id];
        this.hasChanged();
    }
    /**
     *  Hash hosts by _id
     * @param hosts Array of host objects
     */
    hashHosts(hosts) {
        let obj = {};
        _.each(hosts, h => obj[h._id] = h);
        return obj;
    }
    addHosts(hosts) {
        if (hosts == null) {
            this.state = null;
        } else if (hosts.length == 0) {
            this.state = {}
        } else {
            this.state = this.hashHosts(hosts);
        }

        this.hasChanged();
    }
    getHost(_id) {
        return this.fetch({
            id: _id,
            locally: function () {
                return this.state[_id];
            },
            remotely: function () {
                return this.app.hostQueries.getHost(_id)
            }
        });
    }
    getHosts() {
        return this.fetch({
            id: 'all-hosts',
            locally: function () {
                if(this.hasAlreadyFetched('all-hosts')) {
                    //return this.state;
                    return _.values(this.state);
                }
                //if (_.keys(this.state).length == 0) {
                //    return undefined;
                //}
                //return _.values(this.state);
            },
            remotely: function () {
                console.log("Remotely fetching hosts");
                return this.app.hostQueries.getHosts()
            }
        });
    }
}

module.exports = HostStore;