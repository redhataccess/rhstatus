import React from "react";
import Marty from "marty";
import { RouteHandler, Link } from "react-router";
import Spacer from "../components/Spacer";
import cx from "classnames";
var _           = require('lodash');
import { Grid, Row, Col, Button, Input, Alert } from "react-bootstrap";

var assign = require('lodash/object/assign');

if(Marty.isBrowser) {
    // c3 requires the window object so exclude it from server side rendering
    var c3 = require("c3");
    require("c3/c3.css");
}

class MetricGraph extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            height: 300
        };
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.url, nextProps.url);
    }
    componentWillUnmount() {
        try {
            this.chart.destroy();
        } catch(e){}
        this.chart = null;
    }
    componentDidMount() {
        this.renderMetric()
    }
    componentDidUpdate() {
        this.renderMetric()
    }
    renderMetric() {
        if (!this.props.metrics && this.props.metrics.length == 0)
            return <span>No metrics found!</span>;

        let self = this;

        // Sort the metrics by the timestamp
        this.props.metrics.sort((a, b) => +(new Date(a.date)) - +(new Date(b.date)));

        // Get the unique x values
        let xs = _.chain(this.props.metrics).pluck('x').unique().map(x => new Date(x)).value();
        xs.unshift('x');
        let groupedData = _.groupBy(this.props.metrics, d => `${d.geo}-${d.url}`);

        // Iterate though each key (GEO) and push that value onto the beginning of the array. This is for c3 format.
        let data = [xs];
        _.each(_.keys(groupedData), (key, i) => {
            let tmp = _.chain(groupedData[key]).pluck('y').value();
            tmp.unshift(key);
            data.push(tmp);
        });

        if (this.chart != null) {
            this.chart.load({
                // This will look something like [['x', 1, 2], ['NA - url', 50, 60], ['NA - url2', 60, 70]]
                columns: data
            });
            this.chart.flush();
            //return;
        }
        this.chart = c3.generate({
            bindto: this.refs['chart'].getDOMNode(),
            size: {
                height: this.state.height,
                width: $(React.findDOMNode(self)).parent().width()
            },
            data: {
                x: 'x',
                // This will look something like [['x', 1, 2], ['NA', 50, 60], ['APAC', 60, 70]]
                columns: data,
                xFormat: '%Y-%m-%d %H:%M:%S'

            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        culling: true
                        //format: '%Y-%m-%d %H'
                    }
                },
                y: {
                    label: 'Response Time (ms)'
                }
            },
            tooltip: {
                format: {
                    title: (d) => d.toLocaleString(),
                    value: (value, ratio, id) => `${Math.round(value)}ms`
                }
            },
            grid: {
                y: {
                    lines: [
                        //{value: 50, text: 'Lable 50 for y'},
                        //{value: 1300, text: 'Lable 1300 for y2', axis: 'y2', position: 'start'},
                        {value: 8000, text: 'High response time', position: 'middle'}
                    ]
                }
            }
        });
        //setTimeout(function() {
        //    self.chart.resize({
        //        height: self.state.height,
        //        width: $(React.findDOMNode(self)).parent().width()
        //    });
        //}, 1);
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
                        <div ref="chart"></div>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

MetricGraph.contextTypes = {
    router: React.PropTypes.func
};

module.exports = Marty.createContainer(MetricGraph, {
    listenTo: ['metricStore'],
    fetch: {
        metrics() {
            return this.app.metricStore.getMetrics({url: this.props.url})
        }
    },
    pending(fetches) {
        if (this.chart != null) {
            this.chart.unload(true);
        }
        return <div className='loading'>Loading...</div>;
    },
    failed(errors) {
        console.error(errors);
        return <div className='error'>Failed to load metrics.</div>;
    }
});
