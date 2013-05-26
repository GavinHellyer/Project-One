/**
 * 
 * @fileOverview View Class - provides the presentation layer for the app
 * 
 * @author Gavin Hellyer <gavin@gva-development.net>
 */

GVADev.preLoadFns.push(function() { //Extend OUAnywhere (run code after inheritance calls)
    /**
     * @class View class handles the html formating, etc.
     * This provides the presentation layer for the app.
     * 
     */
    GVADev.app[APN].prototype.Views = function() {
        var self = this;
        GVADev.app[APN].prototype.Views.prototype.Home = function() {
            GVADev.con('View: Home');
            
            //document.body.innerHTML = 'Home!';
        };
    };
});
