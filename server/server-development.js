require("./index")({
    env: 'development',
    // I personally prefer a separateStylesheet for manipulating css in the browser
    separateStylesheet: true,
    prerender: false,
    defaultPort: 8080
});
