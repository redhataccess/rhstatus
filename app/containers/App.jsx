import React from "react";
import Marty from "marty";
import { RouteHandler, Link } from "react-router";
import { Grid, Row, Col, Button, Input, Alert } from "react-bootstrap";

if(Marty.isBrowser) {
    require("./App.css");
}

class App extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
    }
    render() {
        return (
            <Grid>
                <Row>
                    <Col md={12}>
                        <RouteHandler />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

// It is a bit unclear exactly how React is aware of react-router consider this is not IoC wired that I can see
// and this is not wired by an import or require, but apparently it's happening somewhere.
// https://github.com/rackt/react-router/blob/master/UPGRADE_GUIDE.md
App.contextTypes = {
    router: React.PropTypes.func
};

module.exports = App;
