import Marty from 'marty';
import Uri from 'jsuri';

export default class MetricAPI extends Marty.HttpStateSource {
    constructor(options) {
        super(options);
    }
    getMetrics(opts) {
        let uri = new Uri('/status/api/metrics');
        uri.setPath('/status/api/metrics');
        uri.addQueryParam('geo', opts.geo);
        uri.addQueryParam('url', opts.url);
        return this.get(uri.toString()).then(res => {
            if (res.ok) return res.json();
            throw new Error(`Failed to get metrics given options: ${JSON.stringify(opts)}`, res);
        });
    }
}