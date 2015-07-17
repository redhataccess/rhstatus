var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, NotFoundRoute, Redirect } = Router;

var App = require('../app/containers/App.jsx');
var Home = require('../app/containers/Home.jsx');
var Admin = require('../app/containers/Admin.jsx');
var NotFoundPage = require('./components/NotFoundPage.jsx');

module.exports = (
    <Route handler={App}>
        <Route name="status" path="/status/?" handler={Home} />
        <Route name="admin" path="/status/admin/?" handler={Admin} />
        <Redirect from="/?" to="home" />
        <Route path="*" component={NotFoundPage} />
    </Route>
);