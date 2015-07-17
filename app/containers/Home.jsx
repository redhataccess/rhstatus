import React from "react";
import Marty from "marty";
import { RouteHandler, Link } from "react-router";
import Spacer from "../components/Spacer";
import AppBlock from "../components/AppBlock";
import MetricGraph from "../containers/MetricGraph";
import cx from "classnames";
var keys        = require('lodash/object/keys');
var omit        = require('lodash/object/omit');
var defaults    = require('lodash/object/defaults');
var map         = require('lodash/collection/map');
import { Grid, Row, Col, Button, Input, Alert } from "react-bootstrap";

var assign = require('lodash/object/assign');

if(Marty.isBrowser) {
    require("./Home.css");
}

class Home extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }
    renderHost(host) {
        return <Row key={host._id}>
            <Col md={3}>
                {host.hostname}
            </Col>
            <Col md={9}>
                <MetricGraph url={host.hostname}></MetricGraph>
            </Col>
        </Row>;
    }
    renderHosts(hosts) {
        if (hosts == null) return null;
        let self = this,
            hostElements = map(hosts, h => self.renderHost(h));
        return <div>{hostElements}</div>
    }
    render() {
        let { loading } = this.props;
        let containerCx = {
            'home': loading
        };
        return (
            <Grid className={cx(containerCx)}>
                <Row>
                    <Col md={12}>
                        <h1>Red Hat Status</h1>
                        <Spacer />
                        <h3>What is this site?</h3>
                        <hr/>
                        <p>We monitor a set of Red Hat sites for uptime and response status. When there is a degradation
                            of service it will be noted here.</p>
                    </Col>
                </Row>
                {this.renderHosts(this.props.hosts)}
            </Grid>
        );
    }
}

// It is a bit unclear exactly how React is aware of react-router consider this is not IoC wired that I can see
// and this is not wired by an import or require, but apparently it's happening somewhere.
// https://github.com/rackt/react-router/blob/master/UPGRADE_GUIDE.md
Home.contextTypes = {
    router: React.PropTypes.func
};

module.exports = Marty.createContainer(Home, {
    listenTo: ['hostStore'],
    fetch: {
        hosts() {
            return this.app.hostStore.getHosts()
        }
        //metrics() {
        //    return this.app.metricStore.getMetrics()
        //}
    },
    pending(fetches) {
        return <div className='loading'>Loading...</div>;
        //return this.done(defaults(fetches, {
        //    hosts: [],
        //    metrics: []
        //}))
    },
    failed(errors) {
        return <div className='error'>Failed to load hosts. {errors}</div>;
    }
});
