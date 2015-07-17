var fs      = require("fs");
var path    = require("path");
var ejs     = require("ejs");
var _       = require("lodash");
var index   = fs.readFileSync(path.resolve(__dirname, "./views/index.ejs"), "utf-8");

/**
 * Statically compile the html from the ejs on startup, since this is not a pre-render then body and state will
 * be empty.
 * @param options
 * @constructor
 */
function SimpleRenderer(options) {
    this.html = ejs.render(index, _.defaults(options, {body: '', state: ''}));
}

SimpleRenderer.prototype.render = function(_path, _readItems, callback) {
    //callback(null, this.html);
    callback(null, this.html);
};

module.exports = SimpleRenderer;