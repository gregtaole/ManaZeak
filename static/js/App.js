/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                     *
*  App class - ManaZeak main class, orchestrate all the front                         *
*                                                                                     *                                                                                     *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
import { getCookies, JSONParsedGetRequest, JSONParsedPostRequest, precisionRound } from './utils/Utils.js'
import FootBar from './components/FootBar.js'
import TopBar from './components/TopBar.js'
import Queue from './core/Queue.js'
import Player from './core/Player.js'
import ListView from './core/views/ListView.js'
import Playlist from './core/Playlist.js'

class App {
    constructor() {
        this.cookies = getCookies();
        // Objects
        this.topBar = new TopBar();
        this.mainContainer = document.createElement("div");
        this.footBar = null;

        this.mainContainer.id = "mainContainer";

        this.player          = null;
        this.playlists       = [];
        this.activePlaylist  = null;
        this.queue           = new Queue();
        this.cssFiles        = {};

        this.availableViews = {
            LIST: {
                index: 0,
                class: ListView
            },
            ALBUM: {
                index: 1,
                class: null
            }
        };

        this.listeners = {};
        for(var property in this) {
            if(typeof this[property] === "function") {
                this.listeners[property] = [];
                var oldFunc = this[property];
                this[property] = (function(pname, func) {
                    return function() {
                        func.apply(this, arguments);
                        for(var i = 0; i < this.listeners[pname].length;++i) {
                            this.listeners[pname][i].apply(null, arguments);
                        }
                    }
                }(property, oldFunc));
            }
        }

        document.body.appendChild(this.topBar.getTopBar());
        document.body.appendChild(this.mainContainer);
    }


    init() {
        this.player = new Player(this.cookies);
        this.footBar = new FootBar();
        document.body.appendChild(this.footBar.getFootBar());

        var that = this;
        // Loading playlists
        JSONParsedGetRequest(
            "ajax/getPlaylists/",
            false,
            function(response) {
                // TODO : ask ordered playlist : backend : libraries first then playlist
                /* response = {
                *     DONE:           bool
                *     PLAYLIST_IDS:   int[] / undefined
                *     PLAYLIST_NAMES: string[] / undefined
                *     ERROR_H1:       string
                *     ERROR_MSG:      string
                * } */
                that._appStart(response);
            }
        );
    }


    _appStart(playlists) {
        var that = this;
        // User already have playlists
        if (playlists.DONE) {
            JSONParsedPostRequest(
                "ajax/getSimplifiedTracks/",
                JSON.stringify({
                    PLAYLIST_ID: playlists.PLAYLIST_IDS[0]
                }),
                function(response) {
                    // response = raw tracks JSON object
                    that.playlists.push(new Playlist(playlists.PLAYLIST_IDS[0],
                        playlists.PLAYLIST_NAMES[0],
                        playlists.PLAYLIST_IS_LIBRARY[0],
                        true,
                        response,
                        undefined));
                        for (var i = 1; i < playlists.PLAYLIST_IDS.length; ++i) {
                            that.playlists.push(new Playlist(playlists.PLAYLIST_IDS[i],
                                playlists.PLAYLIST_NAMES[i],
                                playlists.PLAYLIST_IS_LIBRARY[i],
                                true,
                                undefined, // TODO : load tracks from other playlists.
                                undefined));
                            }

                            that.getAllPlaylistsTracks();
                            that.topBar.init(that.playlists, that.playlists[0]);
                            // TODO : change that.playlists[0] to last ID stored in cookies (0 by default)
                            that.playlists[0].activate();
                            that.changePlaylist();
                            that.footBar.playlistPreview.setVisible(true);
                        }
                    );
                }

                // User first connection
                else {
                    this.playlists.push(new Playlist(0, null, true, false, undefined, function() {
                        that.playlists[0].activate();
                        that.topBar.init(that.playlists, that.playlists[0]);
                        that.footBar.playlistPreview.setVisible(true);
                        that.footBar.playlistPreview.changePlaylist(that.playlists[0]); // TODO : get Lib/Play image/icon
                        // ? that.activePlaylist = that.playlists[0];
                    }));
                }

                this._keyListener();
            }


            requestNewLibrary() {
                var that = this;

                while (this.mainContainer.firstChild) {
                    this.mainContainer.removeChild(this.mainContainer.firstChild);
                }

                this.playlists.push(new Playlist(0, null, true, false, undefined, function() {
                    that.playlists[0].activate();
                    that.topBar.refreshTopBar();
                    that.footBar.playlistPreview.setVisible(true);
                    that.footBar.playlistPreview.changePlaylist(that.playlists[0]); // TODO : get Lib/Play image/icon
                    that.activePlaylist = that.playlists[0];
                }));
            }

            addListener(event, callback) {
                if (Array.isArray(event)) {
                    for (var i = 0; i < event.length; ++i)
                    if (this.listeners[event[i]])
                    this.listeners[event[i]].push(callback);
                }
                else if(this.listeners[event])
                this.listeners[event].push(callback);
            }

            // TODO : put this someday in a Shortcut class (in Utils maybe ?)
            _keyListener() {
                var that = this;

                // Key pressed event
                document.addEventListener("keydown", function(event) {
                    switch (event.keyCode) {
                        case 32: // Space player
                        that.togglePlay();
                        break;
                        case 37: // Left arrow
                        if (event.ctrlKey)
                        that.rewind(30);
                        else
                        that.rewind(10);
                        break;
                        case 38: // Up arrow
                        that.footBar.volumeUp(event);
                        break;
                        case 39: // Right arrow
                        if (event.ctrlKey)
                        that.fastForward(30);
                        else
                        that.fastForward(10);
                        break;
                        case 40: // Down arrow
                        that.footBar.volumeDown(event);
                        break;
                        case 77: // m key (w/ ctrl)
                        if (event.ctrlKey)
                        that.toggleMute(event);
                        break;
                        case 81:
                        if (event.ctrlKey)
                        that.toggleQueue(event);
                        break;
                        default:
                        break;
                    }
                });

                // Key released event
                document.addEventListener("keyup", function(event) {
                    switch (event.keyCode) {
                        case 38: // Up arrow
                        that.footBar.delayHideVolume();
                        break;
                        case 40: // Down arrow
                        that.footBar.delayHideVolume();
                        break;
                        default:
                        break;
                    }
                });
            }



            togglePlay() {
                this.player.togglePlay();
            }

            stopPlayback() {
                this.changePageTitle("ManaZeak");
                this.player.stopPlayback();
                this.topBar.resetMoodbar();
            }

            toggleShuffle() {
                this.activePlaylist.toggleShuffle();
            }

            toggleRepeat() {
                this.activePlaylist.toggleRepeat();
            };

            next() {
                if(this.queue.isEmpty() == false)
                this.popQueue();
                else
                this.activePlaylist.playNextTrack();
            };

            previous() {
                this.activePlaylist.playPreviousTrack();
            }

            repeatTrack() {
                this.player.repeatTrack();
            }

            fastForward(amount) {
                this.player.getPlayer().currentTime += amount;
            }

            rewind(amount) {
                this.player.getPlayer().currentTime -= amount;
            }

            setVolume(volume) {
                if (volume > 1) { volume = 1; }
                else if (volume < 0) { volume = 0; }

                this.player.getPlayer().volume = precisionRound(volume, 2);
            }

            adjustVolume(amount) {
                this.setVolume(this.player.getPlayer().volume + amount);
            }

            mute() {
                this.player.mute();
            }

            unmute() {
                this.player.unmute();
            }

            toggleMute() {
                if(this.player.isMuted) {
                    this.unmute();
                    this.setVolume(this.player.oldVolume);
                } else {
                    this.mute();
                    this.setVolume(0);
                }
            }

            changeTrack(track) {
                var that = this;

                JSONParsedPostRequest(
                    "ajax/getTrackPathByID/",
                    JSON.stringify({
                        TRACK_ID: track.id.track
                    }),
                    function(response) {
                        if (response.RESULT === "FAIL") {
                            new Notification("Bad format.", response.ERROR);
                        } else {
                            that.footBar.trackPreview.setVisible(true);
                            that.footBar.trackPreview.changeTrack(track, response.COVER);
                            that.topBar.changeMoodbar(track.id.track);
                            that.player.changeTrack(".." + response.PATH, track.id.track);
                            that.changePageTitle(response.PATH);
                            that.activePlaylist.updateView(track);
                            that.togglePlay();
                        }
                    }
                );
            }

            changePlaylist() {
                this.footBar.playlistPreview.changePlaylist(this.activePlaylist); // TODO : get Lib/Play image/icon
            }

            changePageTitle(path) {
                // IDEA : Recontruct frrom Track attributes bc special char won't display as below ... (?/etc.)
                document.title = path.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, ''); // Automatically remove path to file and any extension
            }

            getAllPlaylistsTracks() {
                for (var i = 1; i < this.playlists.length ;++i) {
                    this.playlists[i].getPlaylistsTracks(undefined);
                }
            }

            refreshUI() {
                //this.playlists[this.activePlaylist - 1].refreshViews();
                this.topBar.refreshTopBar();
                this.footBar.playlistPreview.changePlaylist(this.activePlaylist); // TODO : get Lib/Play image/icon
            }

            pushQueue(track) {
                this.queue.enqueue(track);
            }

            popQueue () {
                this.changeTrack(this.queue.dequeue());
            }

            reverseQueue(reverse) {
                this.queue.setReverse(reverse);
            }

            moveQueue(element, newPos) {
                this.queue.slide(element, newPos);
            }
            // //TODO: Closure or something
            // var addonSrcs = document.querySelectorAll('script[data-script-type="appAddon"]');
            // for(var i = 0; i < addonSrcs.length; ++i)
            //     addonSrcs[i].src = addonSrcs[i].dataset.src;

        }

        export default App
