/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                     *
*  PlaylistBar class - handle the playlist bar                                        *
*                                                                                     *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
import TrackPreview from './elements/TrackPreview.js'
import Controls from './elements/Controls.js'
import PlaylistPreview from './elements/PlaylistPreview.js'
import ProgressBar from './elements/ProgressBar.js'

class FootBar {
    constructor() {
        this.footBar = document.createElement("DIV");

        this.controlsContainer = document.createElement("DIV");
        this.progressContainer = document.createElement("DIV");

        this.footBar.id = "footBar";
        this.controlsContainer.className = "mzk-controls-container";

        this.trackPreview    = new TrackPreview(this.footBar);
        this.controls        = new Controls(this.controlsContainer);
        this.playlistPreview = new PlaylistPreview(this.footBar);

        this.footBar.appendChild(this.controlsContainer);
        this.progressBar = new ProgressBar(this.controlsContainer);

        this._init();
    }

    _init() {
        this._eventListener();
    }

    _eventListener() {
        var that = this;

        window.app.addListener('togglePlay', function() {
            if(window.app.player.getIsPlaying()) {
                that.progressBar.refreshInterval(window.app.player.getPlayer());
            }
        });

        window.app.addListener('stopPlayback', function() {
            that.progressBar.stopRefreshInterval();
            that.progressBar.resetProgressBar();
        });

        window.app.addListener(['fastForward', 'rewind'], function() {
            that.progressBar.updateProgress(window.app.player.getPlayer());
        });

    }

    volumeUp(event) {
        this.controls.volumeBar.volumeUp(event);
    }

    volumeDown(event) {
        this.controls.volumeBar.volumeDown(event);
    }

    delayHideVolume() {
        this.controls.volumeBar.delayHideVolume();
    }

    getFootBar() { return this.footBar; }


}

export default FootBar;
