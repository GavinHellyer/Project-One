/**
 * Project Overview
 * 
 * @author Gavin Hellyer <gavin@gva-development.net>
 */
var APN = 'ProjectOverview';

GVADev.require('GVADev.app.BaseApp');
GVADev.require('GVADev.app.' + APN + '.view');
GVADev.require('GVADev.util.Brief');

/**
 * @class ProjectOverview - the app
 */
GVADev.app[APN] = function() {
    this.views = new this.Views();
    
    /**
     * App starts here
     */
    GVADev.app[APN].prototype.start = function() {
        var self = this;
        
        this.renderView('Home');
    };
    
    /**
     * Called when the app is resized
     */
    GVADev.app[APN].prototype.resize = function() {
        // Call the Parent Class Method
        GVADev.app[APN].superClass_.resize.call(this);

        // Dimensions have Changed so Re-Render the App
        GVADev.con('Resizing App.');
        if (this.content) {
            this.content.resize();
        }
    };
    
    /**
     * Called when the app is paused
     */
    GVADev.app[APN].prototype.pause = function() {
    };
    
    /**
     * Called when the app is resumed from background
     */
    GVADev.app[APN].prototype.resume = function() {
    };

    // manual OOP just
    // run the base constructor for this class
    GVADev.base(this);
};
// this runs as this file loads
// adds an anonymous function to run GVADev.inherits for this class to the GVADev preLoadFns array 
// called from the loop inside GVADev.preLoad from GVADev.loadApp() 
GVADev.preLoadFns.push(function() {
    GVADev.inherits(GVADev.app[APN], GVADev.app.BaseApp);
});