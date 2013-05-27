GVADev.util.Brief = function(params) {
    if (params === undefined) {
        params = {};
    }
    
    this.container = params.id;
    this.stage = null;
    this.data = {
        duration: 14
    };

    GVADev.util.Brief.prototype.init = function() {
        function writeMessage(messageLayer, message) {
            var context = messageLayer.getContext();
            messageLayer.clear();
            context.font = '18pt Calibri';
            context.fillStyle = 'black';
            context.fillText(message, 10, 25);
        }
        
        this.stage = new Kinetic.Stage({
            container: this.container,
            width: 578,
            height: 200
        });
        var durationLayer = new Kinetic.Layer();
        var messageLayer = new Kinetic.Layer();

        var bar = new Kinetic.Rect({
            x: 3,
            y: 23,
            width: this.stage.getWidth() - 6,
            height: 20,
            fill: 'black',
            stroke: 'white',
            strokeWidth: 2,
            opacity: 0.7
        });
        
        var circle1 = new Kinetic.Circle({
            x: 50,
            y: 35,
            radius: 30,
            fill: 'blue',
            opacity: 0.5
        });
        
        var circle2 = new Kinetic.Circle({
            x: 80,
            y: 40,
            radius: 40,
            fill: 'blue',
            opacity: 0.5
        });
        
        /*
        * mousedown and touchstart are desktop and
        * mobile equivalents so they are often times
        * used together
        */
//        circle.on('mousedown touchstart', function() {
//            writeMessage(messageLayer, 'Mousedown or touchstart');
//        });
        /*
        * mouseup and touchend are desktop and
        * mobile equivalents so they are often times
        * used together
        */
//        circle.on('mouseup touchend', function() {
//            writeMessage(messageLayer, 'Mouseup or touchend');
//        });

        durationLayer.add(circle1);
        durationLayer.add(circle2);
        durationLayer.add(bar);
        
        this.stage.add(durationLayer);
        this.stage.add(messageLayer);
    };
    
    GVADev.util.Brief.prototype.create = function() {
    };
    
    GVADev.util.Brief.prototype.resize = function ( p ) {
        var w = p.w || this.w,
        h = p.h || this.h;
    };
    
    this.init();
};