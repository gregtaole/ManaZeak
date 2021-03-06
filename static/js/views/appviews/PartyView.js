/* * * * * * * * * * * * * * * * * * * * * *
 *                                         *
 *  PartyView class                        *
 *                                         *
 *  Handle admin settings                  *
 *                                         *
 * * * * * * * * * * * * * * * * * * * * * */

class PartyView extends View {
    constructor() {

        super();
        this.isEnabled = false;
        this._createUI();
        this._eventListener();
    }


    getContainer() {
        this._setPlayPause();

        let that = this;
        JSONParsedPostRequest(
            "ajax/getTrackDetailedInfo/",
            JSON.stringify({
                TRACK_ID: window.app.player.getSourceID()
            }),
            function(response) {
                /* response = {
                 *     DONE      : bool
                 *     ERROR_H1  : string
                 *     ERROR_MSG : string
                 *
                 *     RESULT    : JSON object
                 * } */
                if (response.DONE) {
                    that._setCurrentTrack(new Track(response.RESULT));
                }

                else {
                    new Notification("ERROR", response.ERROR_H1, response.ERROR_MSG);
                }
            }
        );

        return this.ui.container;
    }

//  --------------------------------  PRIVATE METHODS  --------------------------------  //

    /**
     * method : _createUI (private)
     * class  : PartyView
     * desc   : Build UI elements
     **/
    _createUI() {
        this.ui = {
            container: this.container,

            sparksContainer:    document.createElement("DIV"),
            sparksLayer1:       document.createElement("DIV"),
            sparksLayer2:       document.createElement("DIV"),
            sparksLayer3:       document.createElement("DIV"),
            sparksLayer4:       document.createElement("DIV"),

            trackContainer:     document.createElement("DIV"),
            trackCover:         document.createElement("IMG"),

            trackInfoContainer: document.createElement("DIV"),
            trackTitle:         document.createElement("H1"),
            trackArtist:        document.createElement("H2"),
            trackComposer:      document.createElement("H3"),
            trackYearAlbum:     document.createElement("H3"),
            trackGenre:         document.createElement("H3"),

            close:              document.createElement("IMG"),
            previous:           document.createElement("IMG"),
            play:               document.createElement("IMG"),
            next:               document.createElement("IMG"),
        };

        this.ui.container.id             = "party";

        // Smells like Grafikart here ;) (https://www.youtube.com/watch?v=rV6Xgb_4FFo)
        this.ui.sparksContainer.id       = "snow";
        this.ui.sparksLayer1.id          = "snow-layer";
        this.ui.sparksLayer2.id          = "snow-layer";
        this.ui.sparksLayer3.id          = "snow-layer";
        this.ui.sparksLayer4.id          = "snow-layer";

        this.ui.trackContainer.id        = "trackContainer";
        this.ui.trackCover.src           = "/static/img/utils/defaultcover.svg";

        this.ui.trackInfoContainer.id    = "partyTrackInfo";
        this.ui.trackTitle.id            = "a";
        this.ui.trackArtist.id           = "b";
        this.ui.trackComposer.id         = "c";
        this.ui.trackYearAlbum.id        = "d";
        this.ui.trackGenre.id            = "e";

        this.ui.close.id                 = "close";
        this.ui.previous.id              = "previous";
        this.ui.play.id                  = "play";
        this.ui.next.id                  = "next";

        this.ui.close.src                = "/static/img/utils/idea.svg"; // TODO : add ManaZeak log + tooltip
        this.ui.previous.src             = "/static/img/player/previous.svg";
        this.ui.play.src                 = "/static/img/player/play.svg";
        this.ui.next.src                 = "/static/img/player/next.svg";

        this.ui.sparksContainer.appendChild(this.ui.sparksLayer1);
        this.ui.sparksContainer.appendChild(this.ui.sparksLayer2);
        this.ui.sparksContainer.appendChild(this.ui.sparksLayer3);
        this.ui.sparksContainer.appendChild(this.ui.sparksLayer4);

        this.ui.trackInfoContainer.appendChild(this.ui.trackTitle);
        this.ui.trackInfoContainer.appendChild(this.ui.trackArtist);
        this.ui.trackInfoContainer.appendChild(this.ui.trackComposer);
        this.ui.trackInfoContainer.appendChild(this.ui.trackYearAlbum);
        this.ui.trackInfoContainer.appendChild(this.ui.trackGenre);

        this.ui.trackContainer.appendChild(this.ui.trackCover);
        this.ui.trackContainer.appendChild(this.ui.trackInfoContainer);

        this.ui.container.appendChild(this.ui.sparksContainer);
        this.ui.container.appendChild(this.ui.trackContainer);
        this.ui.container.appendChild(this.ui.close);
        this.ui.container.appendChild(this.ui.previous);
        this.ui.container.appendChild(this.ui.play);
        this.ui.container.appendChild(this.ui.next);
    }

    /**
     * method : _eventListener (private)
     * class  : PartyView
     * desc   : TODO
     **/
    _eventListener() {
        let that = this;
        this.ui.close.addEventListener("click", function() {
            document.body.removeChild(that.ui.container);
            that.isEnabled = false;
            window.app.restorePageContent();
        });
        this.ui.play.addEventListener("click", function() {
            window.app.togglePlay();
            that._setPlayPause();
        });
        this.ui.next.addEventListener("click", function() {
            window.app.next();
        });
    }

    /**
     * method : _setPlayPause (private)
     * class  : Controls
     * desc   : Change Play/Pause button depending on player status
     **/
    _setPlayPause() {
        if (window.app.player.getIsPlaying() === true) {
            this.ui.play.src = "/static/img/player/pause.svg";
        }

        else {
            this.ui.play.src = "/static/img/player/play.svg";
        }
    }


    _setCurrentTrack(track) {
        this.ui.trackTitle.innerHTML     = track.title;
        this.ui.trackArtist.innerHTML    = track.artist;
        this.ui.trackComposer.innerHTML  = track.composer;
        this.ui.trackYearAlbum.innerHTML = track.year + " - " + track.album;
        this.ui.trackGenre.innerHTML     = track.genre;

        this.ui.trackCover.src           = track.cover;
    }


    getIsEnabled()       { return this.isEnabled;    }
    setIsEnabled(enabled) { this.isEnabled = enabled; }

}
