/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                     *
 *  Controls class - handle the playlist info container (right/footbar)                *
 *                                                                                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var Controls = function() {
    // UI
    this.ui = {
        play: {
            button: document.getElementById("buttonPlay"),
            image:  document.getElementById("imagePlay")
        },
        stop: {
            button: document.getElementById("buttonStop"),
            image:  document.getElementById("imageStop")
        },
        mute: {
            button: document.getElementById("buttonMute"),
            image:  document.getElementById("imageMute")
        },
        repeat: {
            button: document.getElementById("buttonRepeat"),
            image:  document.getElementById("imageRepeat")
        },
        shuffle: {
            button: document.getElementById("buttonShuffle"),
            image:  document.getElementById("imageShuffle")
        },
        next: {
            button: document.getElementById("buttonNext"),
            image:  document.getElementById("imageNext")
        },
        previous: {
            button: document.getElementById("buttonPrevious"),
            image:  document.getElementById("imagePrevious")
        },
        queueExpander: {
            button: document.getElementById("queueExpander"),
            image:  document.getElementById("imageQueueExpander")
        }
    };

    this._eventListener();
};


Controls.prototype = {
    _eventListener: function() {
        var that = this;
        // Button event listeners
        this.ui.play.button.addEventListener("click", function() {
            window.app.togglePlay();
            if(window.app.player.getIsPlaying() == true)
                that.ui.play.image.src = "/static/img/player/pause.svg";
            else
                that.ui.play.image.src = "/static/img/player/play.svg";
        });
        this.ui.stop.button.addEventListener("click", function() {
            that.ui.play.image.src = "/static/img/player/play.svg";
            window.app.stopPlayback();
        });

        this.ui.mute.button.addEventListener("click", window.app.toggleMute.bind(window.app));
        this.ui.shuffle.button.addEventListener("click", window.app.toggleShuffle.bind(window.app));
        this.ui.repeat.button.addEventListener("click", window.app.toggleRepeat.bind(window.app));
        this.ui.next.button.addEventListener("click", window.app.next.bind(window.app));
        this.ui.previous.button.addEventListener("click", window.app.previous.bind(window.app));
        //this.ui.queueExpander.button.addEventListener("click", this.toggleQueue.bind(this));
    }
};