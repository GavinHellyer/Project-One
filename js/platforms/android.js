/**
 * Android Platform Interface
 */

GVADev.require("GVADev.platforms.Base");

/**
 * @class GVADev.platform.Android - interface to the Android platform
 */
GVADev.platforms.Android = function(app) {

    this.name = 'Android';
    this.dataDir = '';    // file system location of data directory
    this.dataDirURI = ''; // URI based reference to data directory

    /**
     * Set up some platform specific stuff
     */
    GVADev.platforms.Android.prototype.init = function() {
        var self = this;
        if (!window.plugins)
            window.plugins = {};

        // Add Analytics plugin
        window.plugins.Analytics = new this._Analytics(this.app,this); // Add the plugin for Analytics
        this.log = window.plugins.Analytics.log; // make a shortcut to the log function

        // Add UnZipper plugin
        window.plugins.ImportEpub = new this._ImportEpub(); // Add the plugin for UnZipper
        this.ImportEpub = window.plugins.ImportEpub.import;
        //window.plugins.UnZipper = new this._UnZipper(this.app, this); // Add the plugin for UnZipper

        // Add file opener plugin
        window.plugins.fileOpener = new this._FileOpener();

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            self.fileSystem = fileSystem;
        }, function() { // no filesystem - something wrong
            console.log('ERROR requesting file system when loading platform');
        }); //of requestFileSystem

    };
    /**
     * Ensure the data directory is created - if not then create it.
     * This is called when platform is initialised.
     */
    GVADev.platforms.Android.prototype.createDataDir = function() {
        // Set the location of the data directory
        this.dataDir = "/sdcard/Android/data/" + this.app.DATA_DIR + '/';
        // Set the location as it would be referenced from a webpage
        this.dataDirURI = 'file://' + this.dataDir;

        this.createDir(this.dataDir);
    };
    /**
     * Determine if we have internet
     * @returns boolean - false if not connected, true is connected or unknown
     */
    GVADev.platforms.Android.prototype.online = function() {
        if (navigator.connection.type === Connection.NONE)
            return false; // only fail if definitely offline
        return true; // otherwise assume we're online
    };
    /**
     * Loads a file from the data directory.
     * @param {object} params - including
     * <ul>
     * <li>{string} filename: name of the file in the data directory</li>
     * <li>{function} onSuccess: - called with the contents of the file if successful</li>
     * <li>{function} onError: - called on error</li>
     * </ul>
     */
    GVADev.platforms.Android.prototype.loadDataFile = function(params) {
        params.filename = this.dataDir + params.filename;
        this.loadFile(params);
    };
    /**
     * Loads a file from the Android file system.
     * The process first requests a filesystem,
     * then requests a file handler for the file in question,
     * then attempts to load the contents
     * and finally if successful, sends the contents to the success callback function.
     */
    GVADev.platforms.Android.prototype.loadFile = function(params) {
        var filename = params.filename,
                onSuccess = params.onSuccess,
                onError = params.onError;

        this.fileSystem.root.getFile(filename, {
            create: true
        }, function(fileEntry) {
            fileEntry.file(function(file) {
                // successfully got the file
                var reader = new FileReader(); // Use Cordova's built in FileReader
                reader.onloadend = function(evt) {
                    var content = evt.target.result;
                    if (onSuccess) {
                        onSuccess(content);
                    }
                };
                reader.readAsText(file);
            });
        }, function() {
            // Failed to get the file
            if (onError)
                onError();
        });
    };
    /**
     * Opens a file in the data directory using Android intent
     */
    GVADev.platforms.Android.prototype.openDataFile = function(filename) {
        filename = this.dataDirURI + filename;
        return this.openFile(filename);
    };
    /**
     * Opens a file using Android intent
     */
    GVADev.platforms.Android.prototype.openFile = function(filename) {
        var self = this;
        cordova.exec(null, function() { //Error occurred
            self.alert({
                msg: 'You need to install an app that can open this type of file.',
                title: 'Could not open file'
            });
        }
        , "FileOpener", "openFile", [filename]);
    };
    /**
     * Deletes a file from the data directory
     * @param {object} params - including
     * <ul>
     * <li>{string} filename: name of the file in the data directory</li>
     * <li>{function} onSuccess: - called when deleted</li>
     * <li>{function} onError: - called on error</li>
     * </ul>
     */
    GVADev.platforms.Android.prototype.deleteDataFile = function(params) {
        params.filename = this.dataDir + params.filename;
        this.loadFile(params);
    };
    /**
     * Deletes a file from Android filesystem.
     * Follows a similar process to getFile, but deletes the file instead of loading contents.
     */
    GVADev.platforms.Android.prototype.deleteFile = function(params) {
        var filename = params.filename,
                onSuccess = params.onSuccess,
                onError = params.onError;
        this.fileSystem.root.getFile(filename, {
            create: true
        }, function(fileEntry) {
            fileEntry.remove(function() {
                if (onSuccess)
                    onSuccess();
            }, function() {
                // Failed to delete file
                if (onError)
                    onError();
            });
        }, function() {
            // Failed to get file
            if (onError)
                onError();
        });
    };
    /**
     * File Opener class, used to initialise the file opener  phonegap plugin.
     * Does really do much else!
     */
    GVADev.platforms.Android.prototype._FileOpener = function() {
    };

    /**
     * @class Analytics class, makes the log call to the Analytics plugin
     * Initialised in init() to add the plugin to cordova
     * @private
     */
    GVADev.platforms.Android.prototype._Analytics = function(app,platform) {
        platform._analyticsServerParams = {
            server: "https://sm449.vledev2.open.ac.uk/", // live = app.SERVER,
            uri: app.ANALYTICS_URI,
            logfile: platform.dataDir+app.LOGFILE
        };
        /**
         * Logs an event
         * @param {object} params - params to log, timestamp is added
         */
        GVADev.platforms.Android.prototype._Analytics.prototype.log = function(eventParams) {
            var now = new Date(),
                    d = "0"+now.getUTCDate(),
                    m = "0"+now.getUTCMonth(),
                    y = now.getUTCFullYear(),
                    h = "0"+now.getUTCHours(),
                    mins = "0"+now.getUTCMinutes(),
                    s = "0"+now.getUTCSeconds(),
                    time = y + '-' + m.slice(-2) + '-' + d.slice(-2) + 'T' + h.slice(-2) + ':' + mins.slice(-2) + ':' + s.slice(-2) + 'Z';
                    // UTC time in the format: "yyyy-mm-ddThh:mm:ssZ" ie. "2013-03-21T15:07:33Z"
                    
            eventParams.time = time;
            this._analyticsServerParams.online = this.online();
            console.log('calling analytics plugin');
            return cordova.exec(
                    function() { // success
                    },
                    function(error) { // error handler
                        console.log('Logger error: '+ error);
                    },
                    "Analytics",
                    "log",
                    [this._analyticsServerParams, eventParams]
                    );
        };
    };
    
    GVADev.platforms.Android.prototype._ImportEpub = function() {
        GVADev.platforms.Android.prototype._ImportEpub.prototype.import = function(file, successCallback, errorCallback) {
            return cordova.exec(successCallback, errorCallback, "ZipPlugin", "unzip", [file]);
        };
    };
    

    GVADev.platforms.Android.prototype._UnZipper = function(app, platform) {
        GVADev.platforms.Android.prototype._UnZipper.prototype.progress = function(eventParams) {
            return cordova.exec(
                function(progress) { // success
                    return progress;
                },
                function(error) { // error handler
                    console.log('UnZipper error: '+ error);
                },
                "UnZipper",
                "progress",
                [eventParams]
            );
        };
    };
    
    GVADev.base(this, app);
};
// this runs as this file loads
// adds an anonymous function to run GVADev.inherits for this class to the GVADev preLoadFns array 
// called from the loop inside GVADev.preLoad from GVADev.loadApp()
GVADev.preLoadFns.push(function() {
    GVADev.inherits(GVADev.platforms.Android, GVADev.platforms.Base);
});


