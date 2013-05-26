/**
 * BaseApp
 */
GVADev.require("GVADev.platforms.Android");
GVADev.require("GVADev.platforms.ios");
GVADev.require("GVADev.platforms.Desktop");
GVADev.require('GVADev.util.functions');

/**
 * @class BaseApp - the base class for all Applications
 */
GVADev.app.BaseApp = function() {
    /**
     * Initialises elements of the App
     */
    GVADev.app.BaseApp.prototype.init = function() {
        if (GVADev.platformName === "Android") {
            this.platform = new GVADev.platforms.Android(this);
        } else if (GVADev.platformName === "ios") {
            this.platform = new GVADev.platforms.ios(this);
        } else {
            // Default to desktop
            this.platform = new GVADev.platforms.Desktop(this);
        }

        // Determine App's size
        this.calcDims();

        this.start();
    };

    /**
     * Render the current view.
     * Called on view changes or whenever the app is resized.
     */
    GVADev.app.BaseApp.prototype.renderView = function(newView) {
        if (GVADev.util.fn.methodExists(this.views, newView)) {
            GVADev.con('Rendering View: ' + newView);
            this.view = newView;
            this.views[newView]();
        } else {
            GVADev.con('Can\'t Render Empty View');
        }
    };

    /**
     * Empty the page contents
     */
    GVADev.app.BaseApp.prototype.emptyPage = function() {
        document.body.innerHTML = '';
    };
    
    /**
     * Resize the app
     */
    GVADev.app.BaseApp.prototype.resize = function() {
        this.calcDims();
    };

    /**
     * Starts the app. Override this in the App sub class
     */
    GVADev.app.BaseApp.prototype.start = function() {
    };

    /**
     * Called by the platform interface when an App is resumed (brought back into the foreground).
     * Intended to be overriden
     */
    GVADev.app.BaseApp.prototype.resume = function() {
    };

    /**
     * Called by the platform interface when an App is sent to background
     * Intended to be overriden
     */
    GVADev.app.BaseApp.prototype.pause = function() {
    };

    /**
     * Called by the platform interface when the device's back button is hit (if it has one!)
     * Intended to be overriden
     */
    GVADev.app.BaseApp.prototype.deviceBackButton = function() {
    };

    /**
     * Called when the app's container is resized - most likely when the device is rotated.
     * Determines the app's dimensions
     * Intended to be extended by the sub-class
     */
    GVADev.app.BaseApp.prototype.calcDims = function() {
        this.w = window.innerWidth || window.outerWidth || 480;
        this.h = window.innerHeight || window.outerHeight || 480;
    };

    this.init();
};