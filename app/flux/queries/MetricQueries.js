var Marty = require('marty');
var Constants = require('../constants/MetricConstants');

class MetricQueries extends Marty.Queries {
    getMetrics(opts) {
        let self = this;
        this.dispatch(Constants.RECEIVE_METRICS_STARTING);
        return this.app.metricAPI.getMetrics(opts)
            .then(res => self.dispatch(Constants.RECEIVE_METRICS, res))
            .catch(err => self.dispatch(Constants.RECEIVE_METRICS_FAILED, err))
    }
}
module.exports = MetricQueries;