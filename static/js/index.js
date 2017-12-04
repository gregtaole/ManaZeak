import App from './App.js'
// var AppController = require('./AppController.js');

console.log("Hello from Webpack")

document.addEventListener('DOMContentLoaded', function() {
    console.log("Init app ...")
    window.app = new App();
    app.init();
    //TODO: Move this to footbar
});
