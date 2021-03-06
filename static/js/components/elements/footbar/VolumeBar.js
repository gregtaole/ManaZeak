/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *  VolumeBar class                                *
 *                                                 *
 *  Handle the volume bar depending on the         *
 *  player's volume                                *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */

class VolumeBar {
    constructor(container) {

        this.volume       = 0; // Volume value is an int between 0 and 100
        this.isDragging   = false;
        this.volumeLockId = -1;

        this._createUI(container);
        this._init();
    }

//  --------------------------------  PUBLIC METHODS  ---------------------------------  //

    /**
     * method : delayHideVolume (public)
     * class  : VolumeBar
     * desc   : Delay volume bar invisibility
     **/
    delayHideVolume() {
        let that = this;

        window.clearTimeout(this.volumeLockId);
        this.volumeLockId = window.setTimeout(function() {
            removeVisibilityLock(that.volumeBar.wrapper);
        }, 1500);
    }


    /**
     * method : volumeUp (public)
     * class  : VolumeBar
     * desc   : Raise volume
     * arg    : {object} event
     **/
    volumeUp(event) {
        addVisibilityLock(this.volumeBar.wrapper);

        window.app.player.setIsMuted(false);

        if (!event.ctrlKey) { window.app.adjustVolume(0.1);  }
        else                { window.app.adjustVolume(0.01); }
    }


    /**
     * method : volumeDown (public)
     * class  : VolumeBar
     * desc   : Down volume
     * arg    : {object} event
     **/
    volumeDown(event) {
        addVisibilityLock(this.volumeBar.wrapper);

        window.app.player.setIsMuted(false);

        if (!event.ctrlKey) { window.app.adjustVolume(-0.1);  }
        else                { window.app.adjustVolume(-0.01); }
    }

//  --------------------------------  PRIVATE METHODS  --------------------------------  //

    /**
     * method : _createUI (private)
     * class  : VolumeBar
     * desc   : Build UI elements
     **/
    _createUI(container) {
        this.ui = {
            mute: {
                button: document.createElement("A"),
                image:  document.createElement("IMG")
            }
        };
        this.volumeBar = {
            wrapper:    document.createElement("DIV"),
            container:  document.createElement("DIV"),
            current:    document.createElement("DIV"),
            thumb:      document.createElement("DIV")
        };

        this.volumeBar.wrapper.id   = "volumeBarWrapper";
        this.volumeBar.container.id = "volumeBar";
        this.volumeBar.current.id   = "volume";
        this.volumeBar.thumb.id     = "volumeThumb";
        this.ui.mute.button.id      = "buttonMute";
        this.ui.mute.image.id       = "imageMute";

        this.ui.mute.image.src      = "/static/img/player/volume.svg";

        this.ui.mute.button.appendChild(this.ui.mute.image);
        this.volumeBar.container.appendChild(this.volumeBar.current);
        this.volumeBar.container.appendChild(this.volumeBar.thumb);
        this.volumeBar.wrapper.appendChild(this.volumeBar.container);
        this.ui.mute.button.appendChild(this.volumeBar.wrapper);
        container.appendChild(this.ui.mute.button);
    }


    /**
     * method : _eventListener (private)
     * class  : VolumeBar
     * desc   : VolumeBar event listeners
     **/
    _eventListener() {
        let that = this;

        this.ui.mute.image.addEventListener("click", window.app.toggleMute.bind(window.app));
        this.volumeBar.container.addEventListener("mousedown", that._mouseDown.bind(this));

        window.addEventListener("mousemove", this._mouseMove.bind(this));
        window.addEventListener("mouseup", this._mouseUp.bind(this));
        window.app.listen("setVolume", function() {
            that._updateVolume(window.app.player.getPlayer().volume * 100);
        });
    }


    /**
     * method : _init (private)
     * class  : VolumeBar
     * desc   : Init default volume, set/store player empty source and listen
     **/
    _init() {
        this._updateVolume(50); // TODO : init from global var in App os user settings
        this._eventListener();
    }


    /**
     * method : _mouseDown (private)
     * class  : VolumeBar
     * desc   : Action on mouse down event
     * arg    : {object} event - MouseEvent
     **/
    _mouseDown(event) {
        //TODO: fix this
        if (!this.isDragging &&
            (event.target.id === "volume" || event.target.id === "volumeBar" || event.target.id === "volumeThumb")) {
            this.isDragging = true;
            this._moveVolume(event);
            this._toggleVisibilityLock();
            window.app.setVolume(this.volume / 100);
        }
    }


    /**
     * method : _mouseMove (private)
     * class  : VolumeBar
     * desc   : Action on mouse move event
     * arg    : {object} event - MouseEvent
     **/
    _mouseMove(event) {
        if (this.isDragging) {
            this._toggleVisibilityLock();
            this._moveVolume(event);
            window.app.setVolume(this.volume / 100);
        }
    }


    /**
     * method : _mouseUp (private)
     * class  : VolumeBar
     * desc   : Action on mouse up event
     * arg    : {object} event - MouseEvent
     **/
    _mouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this._toggleVisibilityLock();
            this._updateVolume(this.volume);
        }
    }


    /**
     * method : _moveVolume (private)
     * class  : VolumeBar
     * desc   : Updates UI volume according to event location
     * arg    : {object} event - MouseEvent
     **/
    _moveVolume(event) {
        let boundRect                       = this.volumeBar.container.getBoundingClientRect();
        let distanceToBottomInPx            = boundRect.bottom - event.clientY;
        let distanceToBottomInPr            = (distanceToBottomInPx * 100) / boundRect.height;
        // OOB protection
        if (distanceToBottomInPr > 100) { distanceToBottomInPr = 100; }
        if (distanceToBottomInPr < 0)   { distanceToBottomInPr = 0;   }
        // Style assignation
        this.volume                         = distanceToBottomInPr;
        this.volumeBar.current.style.height = distanceToBottomInPr + "%";
        this.volumeBar.thumb.style.bottom   = distanceToBottomInPr + "%";
    }


    /**
     * method : _toggleVisibilityLock (private)
     * class  : VolumeBar
     * desc   : Enable/disable the visibility lock on VolumeBar
     **/
    _toggleVisibilityLock() {
        if (this.isDragging) { addVisibilityLock(this.volumeBar.wrapper);    }
        else                 { removeVisibilityLock(this.volumeBar.wrapper); }
    }


    /**
     * method : _updateVolume (private)
     * class  : VolumeBar
     * desc   : Updates volume to a given value
     * arg    : {int} volume - The volume to set
     **/
    _updateVolume(volume) {
        this.volume                                = volume;
        this.volumeBar.current.style.height        = volume + "%";
        this.volumeBar.thumb.style.bottom          = volume + "%";

        if (volume === 0) { this.ui.mute.image.src = "/static/img/player/mute.svg";   }
        else              { this.ui.mute.image.src = "/static/img/player/volume.svg"; }
    }

//  ------------------------------  GETTERS / SETTERS  --------------------------------  //

    setVolume(volume) { this.volume = volume; }

}
