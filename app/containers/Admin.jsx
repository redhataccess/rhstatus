import React from "react";
import Marty from "marty";
import AppBlock from "../components/AppBlock.jsx";
import Spacer from "../components/Spacer.jsx";
import { Panel, Table, Alert, Input, Row, Col, Button, ButtonGroup } from "react-bootstrap";
var omit    = require('lodash/object/omit');
var keys    = require('lodash/object/keys');
var assign  = require('lodash/object/assign');
var map     = require('lodash/collection/map');
var isNaN   = require('lodash/lang/isNaN');

if (Marty.isBrowser) {
    require("./Admin.css");
}

class Admin extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            'warnings': []
        };
    }
    static getProps() {
        return {};
    }
    // Not pure, saves boilerplate code.
    frequencyValid(frequency) {
        if ((isNaN(+frequency) || +frequency < 30)) {
            this.setState({ 'warnings': ['Frequency must be a number and greater than 30 seconds.'] });
            return false
        } else {
            this.setState({ 'warnings': [] });
            return true;
        }
    }
    // This is a brute force way to do forms in React, however, considering I am only working with
    // 2 fields, this is a bit quicker and no need to abstract things just yet.
    createHost(event) {
        event.preventDefault();
        let host = {
            hostname: this.refs['new-hostname-input'].getValue(),
            frequency: this.refs['new-frequency-input'].getValue()
        };
        if (this.frequencyValid(host.frequency)) {
            this.app.hostActions.saveHost(host);
        }

    }
    renderCreateHost() {
        return <Row>
            <Col xs={12}>
                <h3>{`Create new host`}</h3>
                <form className="form-inline" role="form">
                    <div className="form-group">
                        <label className="sr-only" for="hostname">Hostname</label>
                        <Input type="text" ref="new-hostname-input" className="form-control" id="hostname" placeholder="Enter hostname"/>
                    </div>
                    &nbsp;
                    <div className="form-group">
                        <label className="sr-only" for="Frequency">Frequency</label>
                        <Input type="number" ref="new-frequency-input" className="form-control" id="frequency" placeholder="Enter Ping Frequency" min={30} addonAfter='seconds' />
                    </div>
                    &nbsp;
                    <button onClick={this.createHost.bind(this)} className="btn btn-default">Create</button>
                </form>
            </Col>
        </Row>;

    }
    updateHost(host) {
        let hostnameKey = `hostname-input-${host._id}`;
        let frequencyKey = `frequency-input-${host._id}`;
        let updatedHost = assign(host, {
            hostname: this.refs[hostnameKey].getValue(),
            frequency: this.refs[frequencyKey].getValue()
        });
        if (this.frequencyValid(updatedHost.frequency)) {
            this.app.hostActions.updateHost(updatedHost);
        }
    }
    deleteHost(host) {
        this.app.hostActions.deleteHost(host);
    }
    renderHost(host) {
        return <Row key={host._id}>
            <Col xs={12}>
                <form className="form-inline" role="form">
                    <div className="form-group">
                        <label className="sr-only" for="hostname">Hostname</label>
                        <Input type="text" ref={`hostname-input-${host._id}`} className="form-control" id="hostname" placeholder="Enter hostname" defaultValue={host.hostname}/>
                    </div>
                    &nbsp;
                    <div className="form-group">
                        <label className="sr-only" for="Frequency">Frequency</label>
                        <Input type="number" ref={`frequency-input-${host._id}`} className="form-control" id="frequency" placeholder="Enter Ping Frequency" min={30} defaultValue={host.frequency} addonAfter='seconds' />
                    </div>
                    &nbsp;
                    <ButtonGroup>
                        <Button onClick={this.updateHost.bind(this, host)} className="btn btn-default">Update</Button>
                        <Button onClick={this.deleteHost.bind(this, host)} className="btn btn-default">Delete</Button>
                    </ButtonGroup>
                </form>
            </Col>
        </Row>;
    }
    renderHosts(hosts) {
        if (hosts == null) return null;
        let self = this,
            hostElements = map(hosts, h => self.renderHost(h));
        return <div>{hostElements}</div>
    }
    renderWarnings() {
        if (this.state.warnings && this.state.warnings.length > 0) {
            return <div>
                {map(this.state.warnings, w => <Alert bsStyle="warning">{w}</Alert>)}
                <Spacer />
            </div>;
        }
    }
    render() {
        return <div>
            {this.renderWarnings()}
            {this.renderCreateHost()}
            <Spacer />
            <h3>{`Monitoring ${this.props.hosts.length} host(s)`}</h3>
            <Spacer />
            {this.renderHosts(this.props.hosts)}
        </div>;
    }
}

module.exports = Marty.createContainer(Admin, {
    listenTo: ['hostStore'],
    fetch: {
        hosts() {
            return this.app.hostStore.getHosts()
        }
    },
    pending() {
        return <div className='loading'>Loading...</div>;
    },
    failed(errors) {
        return <div className='error'>Failed to load hosts. {errors}</div>;
    }
});
