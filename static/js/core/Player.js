/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                     *
 *  Player class - handle song streaming client side, and std action on it             *
 *                                                                                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class Player {
    constructor(cookies) {
    this.cookies = cookies;

    this.player = document.getElementById("audioPlayer");

    this.isPlaying = false;
    this.isMuted   = false;
    this.loopingMode = false;

    this.oldVolume = 0;

    this.init();
    }

    init() {
        this.player.volume = 0.5; // TODO : init from global var in App
        this._eventListener();
    }


    play() {
        this.isPlaying = true;
        this.player.play();
    }


    pause() {
        this.isPlaying = false;
        this.player.pause();
    }


    // Player controls
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }


    stopPlayback() {
        this.pause();
        this.isPlaying = false;
        this.player.currentTime = 0;
        // OR this, but it doesn't keep in memory the current track (to think about)
        // this.player.src = "";
        // TODO : Make a real stop feature ...
    }


    fastForward(event) {
        if (event.ctrlKey) {
            window.app.fastForward(30);
        } else {
            window.app.fastForward(10);
        }
    }


    rewind(event) {
        if (event.ctrlKey) {
            window.app.rewind(30);
        } else {
            window.app.rewind(10);
        }
    }


    mute() {
        this.isMuted = true;
        this.oldVolume = this.player.volume;
        this.player.volume = 0;
    }


    unmute() {
        this.isMuted = false;
        this.player.volume = this.oldVolume;
    }


    changeTrack(url) {
        this.stopPlayback();
        this.player.src = url;
    }

    repeatTrack() {
        this.player.currentTime = 0;
    }

    _eventListener() {
        this.player.addEventListener("ended", window.app.next.bind(window.app));
    }

    // Class Getters and Setters
    getPlayer()                 { return this.player;             }
    getIsPlaying()              { return this.isPlaying;          }

    setIsMuted(muted)           { this.isMuted = muted;           }
    setVolume(volume)           { this.player.volume = volume;    }

}

export default Player
