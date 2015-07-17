import Marty from 'marty';
import Promise from 'bluebird';

export default class HostAPI extends Marty.HttpStateSource {
    constructor(options) {
        super(options);
    }
    getHost(_id) {
        return this.get(`/status/api/host/${_id}?${+(new Date())}`).then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to get host', res);
        });
    }
    getHosts() {
        //let options = {
        //    type: "GET",
        //    url: `/status/api/hosts`,
        //    contentType: "application/json",
        //    cache: false
        //};
        //return Promise.resolve($.ajax(options));
        return this.get(`/status/api/hosts?${+(new Date())}`).then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to get host', res);
        });
    }
    saveHost(host) {
        let options = {
            type: "POST",
            url: `/status/api/host`,
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(host)
        };
        return Promise.resolve($.ajax(options));
    }
    updateHost(host) {
        let options = {
            type: "PUT",
            url: `/status/api/host`,
            contentType: "application/json",
            processData: false,
            data: JSON.stringify(host)
        };
        return Promise.resolve($.ajax(options));
    }
    deleteHost(host) {
        let options = {
            type: "DELETE",
            url: `/status/api/host/${host._id}`,
            contentType: "application/json"
        };
        return Promise.resolve($.ajax(options));
    }
}