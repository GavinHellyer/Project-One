/**
 * Base Platform interface Class - defines the structure for specific platform interface classes
 * 
 * @author Nigel Clarke <nigel.clarke@pentahedra.com>
 */

/**
 * @class GVADev.platforms.Base - defines the base class structure for platform interface classes
 */
GVADev.platforms.Base = function(app) {
    this.app = app;
    /**
     * Init the platform interface
     * @private
     */
    GVADev.platforms.Base.prototype._init = function() {
        var self = this;
        if (GVADev._deviceReady) {
            document.addEventListener("resume", function() {
                self.app.resume();
            }, false);
            document.addEventListener("backbutton", function() {
                self.app.deviceBackButton();
            }, false);

            document.addEventListener("pause", function() {
                self.app.pause();
            }, false);
        }
        else {
            alert('device not ready, so not event handlers set');
        }
        this._dataDir = "/tmp/"; // initial placeholder value will be overwritten
        this.createDataDir();
        this.init();
    };
    /**
     * Sub-class init function - overidden by the sub class if required
     */
    GVADev.platforms.Base.prototype.init = function() {

    };
    /**
     * Use the platform's alert/message interface
     * @param {object} optional params:
     * <ul>
     * <li>{String} msg - the message to output</li>
     * <li>{String} title - a title for the message</li>
     * <li>{String} buttonName - label for the 'OK' button</li>
     * <li>{function} onComplete - a function to call when message closed</li>
     * </ul>
     */
    GVADev.platforms.Base.prototype.alert = function(params) {
        var message = params.msg || 'Unknown alert of type:'+typeof params,
                alertCallback = params.onComplete || function() {
        },
                title = params.title,
                buttonName = params.buttonName || 'OK';
        if(typeof params === "string") {
            message = params;
        }
        navigator.notification.alert(message, alertCallback, title, buttonName);
    };                        
    /**
     * Downloads a file.
     * Note: maybe overwritten by sub-class platform
     */
    GVADev.platforms.Base.prototype.downloadFile = function(params) {
        var url = params.url,
                localFilename = this.dataDir + params.localFilename,
                forceOverwrite = params.overwrite === undefined ? true : params.overwrite,
                subDir = params.subDir || '',
                onSuccess = params.onSuccess || function() {},
                progress = params.progress || function() {},
                onError = params.onError || function() {};
        if (subDir !== '') {
            subDir = subDir.replace('^\/', ''); // trim the front '/' if present
            this.platform.createDir(this.dataDir + subDir); // Ensure the subDir exists
        }

        //todo make this use a temporary filename (ie "<filename>.downloading") in case filetransfer fails in process
        this.fileSystem.root.getFile(localFilename, {create: true, exclusive: !forceOverwrite}, function(fileEntry) {
            var localPath = fileEntry.fullPath,
                ft = new FileTransfer();
            ft.onprogress = function(progressEvent) {
                var perc=(progressEvent.loaded / progressEvent.total)*100 | 0;
                progress({
                    progress: perc
                });
            }
            ft.download(url, localPath, onSuccess, onError);
        }, function() { // on error of getting the file
            if(forceOverwrite) {// if we were set to overwrite the file and it failed then call error
                console.log('error getting local file for download');
                onError();
            }
        });
    };
    /**
     * Log events for analytics purposes - to be overriden by the platform
     */
    GVADev.platforms.Base.prototype.log = function() {
    };
    /**
     * Checks to see if a file exists within the data directory
     */
    GVADev.platforms.Base.prototype.doesDataFileExist = function(params) {
        params.filename = this.dataDir + params.filename;
        return this.doesFileExist(params);
    };
    /**
     * Checks to see if a file exists, anywhere on filesystem
     */
    GVADev.platforms.Base.prototype.doesFileExist = function(params) {
        this.fileSystem.root.getFile(params.filename, {
            create: false
        }, params.yes || function() {
        }, params.no || function() {
        });
    };
    /**
     * Creates a directory if it doesn't already exist
     * @param {String} directory name
     */
    GVADev.platforms.Base.prototype.createDir = function(dirName) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
            var entry = fileSystem.root;
            entry.getDirectory(dirName, {
                create: true,
                exclusive: false
            }, function() {
                // Success
            }, function() {
                // Error
                console.log("Error creating directory " + error.code);
            });
        }, null);
    };
    /**
     * Ensure the data directory is created - if not then create it.
     * Override for each platform.
     
     GVADev.platforms.Base.prototype.createDataDir = function() {
     }; 
     /**
     * Loads a file from the App's data firectory.
     * Override for each platform.
     */
    GVADev.platforms.Base.prototype.loadDataFile = function() {
    };
    this._init();
};
