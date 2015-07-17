var Marty = require('marty');
var Constants = require('../constants/HostConstants');

class HostQueries extends Marty.Queries {
    getHost(_id) {
        let self = this;
        return this.app.hostAPI.getHost(_id)
            .then(res => {
                //self.app.hostStore.addHost(res);
                return self.dispatch(Constants.RECEIVE_HOST, res);
            })
    }
    getHosts() {
        let self = this;
        return this.app.hostAPI.getHosts()
            .then(res => {
                //self.app.hostStore.addHosts();
                return self.dispatch(Constants.RECEIVE_HOSTS, res);
            })
    }
}
module.exports = HostQueries;