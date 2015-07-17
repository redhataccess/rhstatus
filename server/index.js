module.exports = function(options) {
    require('babel/register')({
        stage: 0,
        experimental: true
    });

    var fs = require('fs');
    var _ = require('lodash');
    var util = require('util');
    var path = require('path');
    var morgan = require('morgan');
    var express = require('express');
    var Table = require('cli-table');
    var bodyParser = require('body-parser');

    var app = express();
    var server = require('http').Server(app);


    // load bundle information from stats
    var stats = require("../build/stats.json");
    var publicPath = stats.publicPath;
    var styleUrl = options.separateStylesheet && (publicPath + "main.css?" + stats.hash);
    var scriptUrl = publicPath + [].concat(stats.assetsByChunkName.main)[0]; // + "?" + stats.hash;
    var commonsUrl = stats.assetsByChunkName.commons && publicPath + [].concat(stats.assetsByChunkName.commons)[0];


    var ipAddress = options.ipAddress || '127.0.0.1';
    var port = options.port || 8080;
    var env = options.env || 'development';

    console.log("styleUrl: " + styleUrl);
    console.log("scriptUrl: " + scriptUrl);
    console.log("commonsUrl: " + commonsUrl);

    // Create the Simple renderer for non-prerendering
    var Renderer = require("./simpleRenderer");
    var renderer = new Renderer({
        STYLE_URL: styleUrl,
        SCRIPT_URL: scriptUrl,
        COMMONS_URL: commonsUrl,
        ENV: env
    });

    require('marty').HttpStateSource.removeHook('parseJSON');

    console.log("Env is " + env + ', running server http://' + ipAddress + ':' + port);
    server.listen(port, ipAddress);

    process.on('SIGTERM', function() {
        console.log("SIGTERM, exiting.");
        server.close();
    });

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.set('port', port);

    app.use(morgan('dev'));
    // Set the limit otherwise larger payloads can cause 'Request Entity Too Large'
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

    // There are certain Access Labs urls that are being prefixed with /labs, let's catch and fix that.
    app.get(/^\/status\/admin\/(chrome_themes|webassets|services|click|suggest)/, function(req, res, next) {
        var newUrl = req.url.replace("/status/results", "");
        console.log("Redirecting url:" + req.url + " to " + newUrl);
        res.redirect(newUrl);
    });
    app.get(/^\/status\/(chrome_themes|webassets|services|click|suggest)/, function(req, res, next) {
        var newUrl = req.url.replace("/status", "");
        console.log("Redirecting url:" + req.url + " to " + newUrl);
        res.redirect(newUrl);
    });

    // Default is /_assets but need the /status prefix
    app.use("/status/_assets", express.static(path.join(__dirname, "..", "build", "public"), {
        //etag: false,
        //maxAge: "0"
        maxAge: "200d" // We can cache them as they include hashes
    }));

    // load REST API
    require("./api")(app);

    // If prerendering (isomorphism) have to use marty-express as that intercepts all calls and routes them through
    // the react-router and builds the React dom -> html.
    if (options.prerender) {
        console.log("Starting marty-express for pre-rendering.");
        app.use(require('marty-express')({
            routes: require('../app/routes'),
            application: require('../app/application'),
            // Local and blacklist are currently only supported by my forked marty-express repo.  The locals are required
            // for the ejs templates.
            locals: {
                STYLE_URL: styleUrl,
                SCRIPT_URL: scriptUrl,
                COMMONS_URL: commonsUrl,
                ENV: env
            },
            blacklist: [
                /api/,
                /_assets/,
                /login/,
                // These are Red Hat CSP and Labs specific resources, don't process through express.  These should be
                // proxied by Apache httpd or nginx.
                /(chrome_themes|webassets|services|click|suggest)/
            ],
            rendered: function (result) {
                var table = new Table({
                    colWidths: [30, 30, 30, 30, 40],
                    head: ['Store Id', 'Fetch Id', 'Status', 'Time', 'Result']
                });
                _.each(result.diagnostics, function (diagnostic) {
                    table.push([
                        diagnostic.storeId,
                        diagnostic.fetchId,
                        diagnostic.status,
                        diagnostic.time,
                        diagnostic.result != null ? JSON.stringify(diagnostic.result, null, 2).length : JSON.stringify(diagnostic.error || {}, null, ' ')
                    ]);
                });
                console.log(table.toString());
            }
        }));
    } else {
        console.log("Not pre-rendering, using a simple renderer.");
        app.get(/^((?!api|_assets|login|chrome_themes_webassets|services|click|suggest).)*$/gmi, function(req, res) {
            renderer.render(
                req.path,
                {},
                function(err, html) {
                    if(err) {
                        res.statusCode = 500;
                        res.contentType = "text; charset=utf8";
                        res.end(err.message);
                        return;
                    }
                    res.contentType = "text/html; charset=utf8";
                    res.end(html);
                }
            );
        });
    }
};