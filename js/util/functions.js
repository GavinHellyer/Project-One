var functions = function() {
    functions.prototype.methodExists = function(obj, methodName) {
        if (typeof(obj[methodName]) !== 'undefined' && typeof(obj[methodName]) === 'function') {
            return true;
        }
        
        return false;
    };
};

GVADev.util.fn = new functions();