// Polyfill
var cancelRequestAnimationFrame = (function() {
    return window.cancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        clearTimeout;
})();

// Polyfill
var requestAnimationFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(/* function */ callback, /* DOMElement */ element) {
            return window.setTimeout(callback, 1000 / 60);
        };
})();

//extend Object
var extend = function () {
    for (var i = 1; i < arguments.length; i++)
        for (var key in arguments[i])
            if (arguments[i].hasOwnProperty(key))
                arguments[0][key] = arguments[i][key];
    return arguments[0];
};

var Animloop = (function() {
    function Animloop(viewPort, options) {
        var self = this;
        this.options = {};
        this.options = extend({
            framesPerSecond: 13,
            framesPerImage: 4,
            idleFrames: [0, 8, 5], //from, to, loops
            mainFrames: [0, 58, 1],
            totalLoops: 1
        }, options);

   
        //vars
        this.viewPort = viewPort;
        this.startFrame = 0;
        this.loopCounter = 0;
        this.state = null;
        this.isStop = false;
        //this.startTime = this.getTimeNow(); //must be set before play
        //Methods
        this.buildConveyor();
        this.idleAnimation();
        this.totalLoopsCounter = 0;

        // this.preloadImages(function() {
        //     self.play();
        // });

    }

    Animloop.prototype.preloadImages = function(done) {
        var images = this.viewPort[0].querySelectorAll('img');
        var total = images.length;
        var counter = 0;
        for(var i = 0; i<images.length; i++) {
            var img = new Image();
            img.src = images[i].src;
            img.onload = function() {
                counter++;
                if(counter === total) {
                    if(done)
                        done();
                }
            }
        }
        
    }

    Animloop.prototype.buildConveyor = function() {
        var self = this;
        this.conveyor = this.viewPort.children();
        this.conveyor.css('position', 'relative');

        var images = this.conveyor.children();

        images
            .show()
            .each(function(i) {
                $(this).css({
                    left: (i * self.options.framesPerImage * 100) + '%',
                    width: (self.options.framesPerImage * 100) + '%',
                    position: 'absolute'
                });
            });
    }

    Animloop.prototype.idleAnimation = function() {
        this.state = 'idle';
        this.options.framesPerSecond = this.options.idleFrames[3];
        this.endFrame = (this.options.idleFrames[1] - this.options.idleFrames[0]) * this.options.idleFrames[2];
        this.loopEnd = this.options.idleFrames[1] - this.options.idleFrames[0]; //
        this.startFrame = this.options.idleFrames[0];
        this.totalFrames = this.options.idleFrames[1] - this.options.idleFrames[0];
        this.startTime = this.getTimeNow();
        this.goToFrame(this.startFrame);
    }

    Animloop.prototype.mainAnimation = function() {
        this.state = 'main';
        this.options.framesPerSecond = this.options.mainFrames[3];
        this.endFrame = (this.options.mainFrames[1] - this.options.mainFrames[0]) * this.options.mainFrames[2];
        this.startFrame = this.options.mainFrames[0];
        this.totalFrames = this.options.mainFrames[1] - this.options.mainFrames[0];
        this.startTime = this.getTimeNow();
        this.goToFrame(this.startFrame);
    }

    Animloop.prototype.getTimeNow = function() {
         return new Date().getTime();
    }

    Animloop.prototype.play = function() {
        var self = this;
        this.isStop = false;
        var time = (this.getTimeNow() - this.startTime) / 1000;
        var frame = Math.floor(time * this.options.framesPerSecond);

        if (frame >= this.endFrame) {
            this.totalLoopsCounter = this.totalLoopsCounter + 0.5;
            if(this.totalLoopsCounter === this.options.totalLoops) {
                this.isStop = true;
            }
            else {
                this.switchState();
            }

        } else {
            this.goToFrame(frame % this.totalFrames + this.startFrame);
        }

        this.requestId = requestAnimationFrame(function() {
            if(self.isStop)
                self.stop()
            else
                self.play();
        });
    }

    Animloop.prototype.checkLoopStatus = function(frame) {
        this.loopCounter++;
        if (this.loopCounter >= this.loops) {
            this.switchState();
        }
    }

    Animloop.prototype.switchState = function() {
        if (this.state === 'idle') {
            this.mainAnimation();
        }
        else {
            this.idleAnimation();
        }
    }

    Animloop.prototype.goToFrame = function(frame){
        //this.conveyor.css('left', -frame * this.options.frameWidth)
        this.conveyor.css('left', -frame * 100 + '%');
    }

    Animloop.prototype.onComplete = function() {}

    Animloop.prototype.stop = function() {
        this.goToFrame(this.options.mainFrames[1]);
        cancelAnimationFrame(this.requestId);
        this.onComplete();
    }

    return Animloop;
})();