# Red Hat Status

Visualize uptime across various Red Hat sites.

## Local Installation

```text
npm install
```

## Hot Module Replacement development server

``` text
# start the webpack-dev-server in HMR mode
npm run hot-dev-server
# wait for the first compilation is successful

# Ensure Red Hat resources are proxies through httpd or nginx

# in another terminal/console
# start the node.js server in development mode
npm run start-dev

# open this url in your browser
http://foo.redhat.com/labs/jvmpeg
```

The configuration is `webpack-hot-dev-server.config.js`.

It automatically recompiles when files are changed. When a hot-replacement-enabled file is changed (i. e. stylesheets or React components) the module is hot-replaced. If Hot Replacement is not possible the page is refreshed.

Hot Module Replacement has a performance impact on compilation.


## Production compilation and server

``` text
# build the client bundle and the prerendering bundle
npm run build

# start the node.js server in production mode
npm run start

# open this url in your browser
http://foo.redhat.com/labs/jvmpeg
```

The configuration is `webpack-production.config.js`.

The server is at `lib/server.js`

The production setting builds two configurations: one for the client (`build/public`) and one for the serverside prerendering (`build/prerender`).


## Build visualization

After a production build you may want to visualize your modules and chunks tree.

Use the [analyse tool](http://webpack.github.io/analyse/) with the file at `build/stats.json`.


## Handling deployment to ITOS

```
gg c Message
git tag x.y.z && git push && git push --tags labsdev master && git push --tags gitlab master
```

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
