/** 
 * GVADev - Namespace and single global for an HTML5/Javascript driven Mobile App.
 * File contains the guts of the GVADev framework, including:
 * <ul>
 * <li> namespace constants </li>
 * <li> Inheritance mechanism </li>
 * <li> Require (dependency) mechanism </li>
 * <li> Loading mechanism </li>
 * </ul>
 * 
 * @author Gavin Hellyer <nigel.clarke@pentahedra.com>
 *
 *
 */
/**
 * @namespace GVADev namespace, holds the framework together in a single entity
 */
// when this file loads from script tag in index.html this var is created and the
// code in the function runs as a result of the keyword 'new'
var GVADev = new function() {

    /** @namespace Utilities namespace*/
    this.util = function() {
    };
    /** @namespace Apps namespace*/
    this.app = function() {
    };
    /** @namespace Platforms namespace*/
    this.platforms = function() {
    };

    // library is local to the app in the javascript folder
    this.libPath = 'js/';

    // used by the require(load) mechanism
    //
    // track number of calls to loadApp()
    this.loadingTicks = 0;

    // track number of files that require loading
    this.requiredFiles = 0;

    // track number of files that have loaded
    this.fileCount = 0;

    // used by require() to check if file has been loaded
    this.fileLoaded = {};

    // is changed to true if core is minified, removing the need for the require mechanism
    this.__mini = false;

    // functions can be loaded into here, to be run just before the App is launched  - mainly used to set up inheritance once all required files are loaded
    this.preLoadFns = [];

    // used to let app know device is ready
    this._deviceReady = false;

    // reference to head tag in index.html used by require() to append additional script tags
    this.head = document.getElementsByTagName('head')[0];
};
// because the var above was created when this file first loaded we can now
// reference GVADev to setup some constants within it

GVADev.DATA_LEVEL = 20;
GVADev.CONTROL_LEVEL = 50;
GVADev.CONTROLLER_LEVEL = 90;
GVADev.OVERLAY_CONTROLLER_LEVEL = 8000;
GVADev.POP_UP_LEVEL = 9000;
GVADev.CLOSE_LEVEL = 9500;
GVADev.DEBUG_LEVEL = 10000;
GVADev.ABSOLUTE_TOP = 50000;
GVADev.DEBUG = true;

/**
 * Basic console.log which hides/shows on debug(true/false)
 * 
 * @param {type} msg
 */
GVADev.con = function(msg) {
    if (GVADev.DEBUG) {
        console.log(msg);
    }
};

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   goog.base(this, a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
GVADev.inherits = function(childCtor, parentCtor) {
    var tempCtor = function() {
    };
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    childCtor.prototype.constructor = childCtor;
};
/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be 'this'.
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
GVADev.base = function(me, opt_methodName, var_args) {
    var caller = arguments.callee.caller;
    if (caller.superClass_) {
// This is a constructor. Call the superclass constructor.
        return caller.superClass_.constructor.apply(
                me, Array.prototype.slice.call(arguments, 1));
    }
    var args = Array.prototype.slice.call(arguments, 2);
    var foundCaller = false;
    for (var ctor = me.constructor;
            ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
        if (ctor.prototype[opt_methodName] === caller) {
            foundCaller = true;
        }
        else if (foundCaller) {
            return ctor.prototype[opt_methodName].apply(me, args);
        }
    }
// If we did not find the caller in the prototype chain,
// then one of two things happened:
// 1) The caller is an instance method.
// 2) This method was not called by the right caller.
    if (me[opt_methodName] === caller) {
        return me.constructor.prototype[opt_methodName].apply(me, args);
    }
    else {
        throw Error('GVADev.base called from a method of one name (' + me[opt_methodName] + ') to a method of a different name:' + caller);
    }
};

/**
 * GVADev.require - provides a dependancy mechanism
 *
 * @param {String} obj name of the javascript function(class) required
 */
GVADev.require = function(obj) {
    // Replace all occurrences of . with a / 
    var fn = obj.toLowerCase().replace(/\./g, '/');

    // Replace the prefix gvadev with the lib path and tag on the extention .js
    var s = fn.replace(/^gvadev\//, this.libPath) + '.js';

    // If minified, then no need to load util files
    if (this.__mini && obj.match(/^GVADev\.util/)) {
        return;
    }

    // If the required file is not loaded setup a new script tag to load it and append to DOM
    if (!this.fileLoaded[fn]) {
        this.fileLoaded[fn] = true;
        this.requiredFiles++;
        
        var inc = document.createElement('script');
        inc.src = s;
        inc.type = 'text/javascript';

        // Set the script tag's onload function to increment the file loaded counter 
        inc.onload = function() {
            GVADev.fileCount++;
        };

        this.head.appendChild(inc);
    }
};

/**
 * A function to monitor the outer frame of our main web page
 * On a change of size, the callback function 'fn' is called
 *
 * Note: we use this loop, because the default window.onorientationchange event is suppressed on some mobile platforms
 *
 * This function only executes once, as we only want one loop
 *
 * @param {function} fn - callback function to execute when a resize happens
 */
GVADev.onOrientChange = function(fn) {
    if (GVADev._OCHandlerSet)
        return;
    GVADev._OCHandlerSet = true;
    GVADev._oldInnerWidth = window.innerWidth;
    GVADev._oldOuterWidth = window.outerWidth;
    GVADev._oldInnerHeight = window.innerHeight;
    GVADev._oldOuterHeight = window.outerHeight;
    if (GVADev._onOChangeInterval) {
        window.clearInterval(GVADev._onOChangeInterval);
    }
    GVADev._onOChangeInterval = window.setInterval(function() {
        try {
            if (GVADev._oldInnerWidth !== window.innerWidth
                    || GVADev._oldOuterWidth !== window.outerWidth
                    || GVADev._oldInnerHeight !== window.innerHeight
                    || GVADev._oldOuterHeight !== window.outerHeight) {
                fn();
            }
            GVADev._oldInnerWidth = window.innerWidth;
            GVADev._oldOuterWidth = window.outerWidth;
            GVADev._oldInnerHeight = window.innerHeight;
            GVADev._oldOuterHeight = window.outerHeight;
        }
        catch (e) {
            if (GVADev._oldInnerWidth !== window.innerWidth
                    || GVADev._oldInnerHeight !== window.innerHeight) {
                fn();
            }
            GVADev._oldInnerWidth = window.innerWidth;
            GVADev._oldInnerHeight = window.innerHeight;
        }
    }, 40);
    window.onorientationchange = fn;
};
/**
 * Combines the mouse and touch events to present a unified interface to events
 * @param {event} e - touch or click event
 * @returns {object} json structure containing elements: pageX,pageY
 */
GVADev.combineMouseTouch = function(e) { // combine Mouse and Touch events into a common structure { pageX, pageY }
    if (e.touches !== undefined && e.touches[0] !== undefined) {
        return {
            pageX: e.touches[0].pageX,
            pageY: e.touches[0].pageY,
            touches: e.touches
        };
    }
//when on mobile safari, the coordinates information is inside the targetTouches object
    if (e.targetTouches !== undefined)
        if (e.targetTouches[0] !== undefined)
            e = e.targetTouches[0];
    if (e.pageX !== undefined && e.pageY !== undefined)
        return {
            pageX: e.pageX,
            pageY: e.pageY
        };
    var element = (!document.compatMode || document.compatMode === 'CSS1Compat') ? document.documentElement : document.body;
    return {
        pageX: e.clientX + element.scrollLeft,
        pageY: e.clientY + element.scrollTop
    };
};
/**
 * Do some housekeeping before we launch the App.
 * - Clear the page.
 * - Set up inheritances, etc.
 */
GVADev.preLoad = function() {
    var i;
    GVADev.initPage(); // intialise the page

    for (i = 0; i < GVADev.preLoadFns.length; i++)
        GVADev.preLoadFns[i]();
};

/**
 * Sets up the HTML page ready for use - n other words removes it's current contents and scrolls to the top of the page
 */
GVADev.initPage = function() {
    //document.body.innerHTML = '';
    window.scrollTo(0, 0);
};

/**
 * Used to start the Application - Used in conjunction with GVADev.require to load the relevant code.
 * Implements a loop which waits until all the required files are loaded and the device is ready.
 * Then initialises an instance of the App.
 *
 * @param {string} appName - the name of the Application to load when all files are present
 */
GVADev.loadApp = function(appName) {
    if (appName) {
        document.addEventListener('deviceready', function() {
            GVADev._deviceReady = true;
        }, false);

        // Save App Name as it will be needed in next cycle
        this.appName = 'GVADev.app.' + appName;

        GVADev.require(this.appName + '.main');
        GVADev.loadingTicks = 0;
    }
    else {
        GVADev.loadingTicks++;
    }

    if ((GVADev._deviceReady && this.fileCount >= this.requiredFiles) || this.loadingTicks > 100) {
        if (this.loadingTicks > 100) {
            GVADev.con('Problem Loading all Required files - loaded: ' + this.fileCount + ' of ' + this.requiredFiles);
        }

        // Run all the functions that are in the preload array
        GVADev.preLoad();

        // Run the application instance
        var app = eval(this.appName);
        GVADev.theApp = new app();
        
        // Setup orientation change to call App's resize function
        GVADev.onOrientChange(function() {
            GVADev.theApp.resize();
        });
    }
    else {
        // not ready to run app so call this function again less parameter in 40ms 
        setTimeout('GVADev.loadApp();', 40);
    }
};

/**
 *  Helper Function called only once when this file loads
 */
GVADev.configureLocalStorage = function() {
    try {
        if (localStorage) {
            GVADev._localStorageAvailable = true;
        }
        else {
            GVADev._localStorageAvailable = false;
        }
    } catch (e) {
        GVADev._localStorageAvailable = false;
    }

    if (GVADev._localStorageAvailable) {
        GVADev.con('LocalStorage: Supported.');

        // Storage found, so Create Storage Functions
        GVADev.Storage = {
            save: function(id, data) {
                localStorage[id] = JSON.stringify(data);
            },
            load: function(id) {
                var data = localStorage[id];
                if (data === null || !data) {
                    return null;
                }
                
                return JSON.parse(data);
            },
            clear: function(id) {
                localStorage[id] = null;
            }
        };
    }
    else {
        GVADev.con('LocalStorage: NOT Supported.');
        
        // No Storage found, so use Cookie approach
        GVADev.Storage = {
            save: function(id, data) {
                document.cookie = (id) + '=' + encodeURIComponent(JSON.stringify(data));
            },
            load: function(id) {
                var s = '; ' + document.cookie + ';',
                    p = s.indexOf('; ' + id + '=');
                
                if (p < 0) {
                    return '';
                }
                
                p = p + id.length + 3;
                var p2 = s.indexOf(';', p + 1);
                
                return JSON.parse(decodeURIComponent(s.substring(p, p2)));
            }
        };
    }
};

/**
 *  Helper Function called only once when this file loads
 */
GVADev.identifyDeviceType = function() {
    /**
     * Set platform name and load platform specific cordova .js file
     * regardless of platform Cordova names the .js file the same, for example cordova-2.4.0.js
     * we split them into their own area, rename to simply cordova.js and load when required
     * 
     * Example:
     *  rename the Android version of cordova-2.4.0.js to cordova.js 
     *  copy cordova.js to platform folder js/cordova/android
     *  file is now in place for .require call
     */
    var userAgent = navigator.userAgent;

    if (userAgent.indexOf('Android') > 0) {
        GVADev.con('Device Type: Android.');
        
        GVADev.platformName = 'Android';
        GVADev.require('GVADev.cordova.android.cordova');
    } else if (userAgent.indexOf('iPad') > 0) {
        GVADev.con('Device Type: iOS.');
        
        GVADev.platformName = 'ios';
        GVADev.require('GVADev.cordova.ios.cordova');
    } else if (userAgent.indexOf('iPhone') > 0) {
        GVADev.con('Device Type: iOS.');
        
        GVADev.platformName = 'ios';
        GVADev.require('GVADev.cordova.ios.cordova');
    } else {
        GVADev.con('Device Type: Desktop.');
        
        // Default to Desktop
        GVADev.platformName = 'Desktop';
        // In Desktop, so set device ready
        GVADev._deviceReady = true;
    }
};

// Call Helper Function to Configure LocalStorage
GVADev.configureLocalStorage();

// Call Helper Function to Identify Device
GVADev.identifyDeviceType();