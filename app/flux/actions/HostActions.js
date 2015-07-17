var Marty       = require('marty');
var Constants   = require('../constants/HostConstants');

function navigateTo(route, params) {
    require('../../router').transitionTo(route, params || {});
}

class HostActions extends Marty.ActionCreators {
    saveHost(host) {
        let self = this;
        this.app.hostAPI.saveHost(host).then(res => {
            return self.dispatch(Constants.RECEIVE_HOST, res);
        }).catch(err => {
            if (err.message) console.error(err.stack);
            console.error(`err: ${err.status}, Failed to save host: ${err.statusText}`)
        })
    }
    updateHost(host) {
        let self = this;
        this.app.hostAPI.updateHost(host).then(res => {
            return self.dispatch(Constants.UPDATE_HOST, host);
        }).catch(err => {
            if (err.message) console.error(err.stack);
            console.error(`err: ${err.status}, Failed to update host: ${err.statusText}`)
        })
    }
    deleteHost(host) {
        let self = this;
        this.app.hostAPI.deleteHost(host).then(res => {
            return self.dispatch(Constants.DELETE_HOST, host);
        }).catch(err => {
            if (err.message) console.error(err.stack);
            console.error(`err: ${err.status}, Failed to delete host: ${err.statusText}`)
        })
    }
}

module.exports = HostActions;