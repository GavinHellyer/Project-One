/**
 * ios Platform Interface
 */
GVADev.require("GVADev.platforms.Base");

/**
 * @class GVADev.platform.ios - interface to the ios platform
 */
GVADev.platforms.ios = function(app) {

    this.name = 'ios';
    this.dataDir = '';    // file system location of data directory
    this.dataDirURI = ''; // URI based reference to data directory

    /**
     * Set up some platform specific stuff
     */
    GVADev.platforms.ios.prototype.init = function() {
        /*
         if (!window.plugins)
         window.plugins = {};
         
         // Add Downloader plugin
         window.plugins.Downloader = new this._Downloader(this); // Add the plugin for downloader
         this.downloadFile = window.plugins.Downloader.downloadFile; // make a shortcut to the download function
         
         // Add file opener plugin
         window.plugins.fileOpener = new this._FileOpener();
         */

        var self = this;

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            self.fileSystem = fileSystem;
        },
                function() { // no filesystem - something wrong
                    console.log('ERROR requesting file system when loading platform');
                }); //of requestFileSystem

        console.log("call the file downloader");
    };
    /**
     * Ensure the data directory is created - if not then create it.
     * This is called when platform is initialised.
     */
    GVADev.platforms.ios.prototype.createDataDir = function() {

        // Set the location of the data directory
        // for IOS we can just use the base data dir name

        this.dataDir = this.app.DATA_DIR + '/';

        // Set the location as it would be referenced from a webpage
        this.dataDirURI = './../../Documents/' + this.dataDir;

        this.createDir(this.dataDir);
    };
    /**
     * Determine if we have internet
     * @returns boolean - false if not connected, true is connected or unknown
     */
    GVADev.platforms.ios.prototype.online = function() {
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
    GVADev.platforms.ios.prototype.loadDataFile = function(params) {
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
    GVADev.platforms.ios.prototype.loadFile = function(params) {
        var filename = params.filename,
                onSuccess = params.onSuccess,
                onError = params.onError;

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            // successfully got the filesystem
            fileSystem.root.getFile(filename, {
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
                }, function() {
                    // Failed to get the file
                    if (onError)
                        onError();
                });

            }, function() {
                // Failed to get file system
                if (onError)
                    onError();
            });
        });
    };
    /**
     * Opens a file in the data directory using Android intent
     */
    GVADev.platforms.ios.prototype.openDataFile = function(filename) {
        filename = this.dataDirURI + filename;
        return this.openFile(filename);
    };
    /**
     * Opens a file using IOS plugin
     */
    GVADev.platforms.ios.prototype.openFile = function(filename) {
        var self = this;
        cordova.exec(null, function() {
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
    GVADev.platforms.ios.prototype.deleteDataFile = function(params) {
        params.filename = this.dataDir + params.filename;
        this.loadFile(params);
    };
    /**
     * Deletes a file from from Android filesystem.
     * Follows a similar process to getFile, but deletes the file instead of loading contents.
     */
    GVADev.platforms.ios.prototype.deleteFile = function(params) {
        var filename = params.filename,
                onSuccess = params.onSuccess,
                onError = params.onError;
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            fileSystem.root.getFile(filename, {
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
        }, function() {
            // Failed to get file system
            if (onError)
                onError();
        });
    };
    /**
     * File Opener class, used to initialise the file opener  phonegap plugin.
     * Does really do much else!
     */
    GVADev.platforms.ios.prototype._FileOpener = function() {
    };


    GVADev.base(this, app);
};
// this runs as this file loads
// adds an anonymous function to run GVADev.inherits for this class to the GVADev preLoadFns array 
// called from the loop inside GVADev.preLoad from GVADev.loadApp()
GVADev.preLoadFns.push(function() {
    GVADev.inherits(GVADev.platforms.ios, GVADev.platforms.Base);
});


