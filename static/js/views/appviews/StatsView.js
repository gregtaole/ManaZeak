/* * * * * * * * * * * * * * * * * * * * * *
 *                                         *
 *  StatsView class                        *
 *                                         *
 *  Handle stats                           *
 *                                         *
 * * * * * * * * * * * * * * * * * * * * * */

class StatsView extends View {
    constructor() {

        super();
        this._init();
    }

//  --------------------------------  PUBLIC METHODS  ---------------------------------  //

    /**
     * method : _fetchStats (public)
     * class  : StatsView
     * desc   : Fetch statistics from server
     **/
    fetchStats() {
        let that = this;
        let modal = new Modal("fetchStats");
        modal.open();

        JSONParsedGetRequest(
            "ajax/getUserStats/",
            function(response) {
                /* response = {
                 *     DONE              : bool
                 *     ERROR_H1          : string
                 *     ERROR_MSG         : string
                 *
                 *     USERNAME          : string
                 *     NB_TRACK_LISTENED : int
                 *     NB_TRACK_PUSHED   : int
                 *     TOTAL_TRACK       : int
                 *     PREF_ARTISTS      : [][]
                 *     PREF_GENRES       : [][]
                 *     PREF_TRACKS       : [][]
                 *     LEAST_ARTISTS     : [][]
                 *     LEAST_GENRES      : [][]
                 *     LEAST_TRACKS      : [][]
                 * } */
                modal.close();

                if (response.DONE) {
                    that.ui.userName.innerHTML    = response.USERNAME;
                    that.ui.totalPlayed.innerHTML = "Tracks played : " + response.NB_TRACK_LISTENED;
                    that.ui.totalPushed.innerHTML = "Tracks uploaded : " + response.NB_TRACK_PUSHED + " (" +  // TODO : get from serv toptal track on serv
                        Math.round(((response.NB_TRACK_PUSHED) / response.TOTAL_TRACK) * 100) / 100 +
                        "% of all the music here)";
                    that._updatePrefArtistsList(response.PREF_ARTISTS);
                    that._updatePrefGenresList(response.PREF_GENRES);
                    that._updatePrefTracksList(response.PREF_TRACKS);
                    that._updateLeastArtistsList(response.LEAST_ARTISTS);
                    that._updateLeastGenresList(response.LEAST_GENRES);
                    that._updateLeastTracksList(response.LEAST_TRACKS);
                }

                else {
                    new Notification("ERROR", response.ERROR_H1, response.ERROR.MSG);
                }
            }
        );
    }


//  --------------------------------  PRIVATE METHODS  --------------------------------  //

    /**
     * method : _clearPageSpace (private)
     * class  : AdminView
     * desc   : Clear the UI content div from all its child
     **/
    _clearPageSpace() {
        this.ui.content.innerHTML = "";
        this._unselectAllMenuEntries();
    }


    /**
     * method : _createUI (private)
     * class  : StatsView
     * desc   : Build UI elements
     **/
    _createUI() {
        this.ui = {
            container:    this.container,
            menu:         document.createElement("DIV"),
            menuTitle:    document.createElement("H2"),

            menuList:     document.createElement("UL"),
            menuTrack:   document.createElement("LI"),
            menuArtist:  document.createElement("LI"),
            menuGenre:   document.createElement("LI"),

            content:      document.createElement("DIV"),
            contentTitle: document.createElement("H1"),
        };

        this.ui.container.id          = "stats";
        this.ui.menu.id               = "leftMenu";
        this.ui.content.id            = "content";

        this.ui.menuTitle.innerHTML   = "Statistics";
        this.ui.menuArtist.innerHTML = "Artist";
        this.ui.menuTrack.innerHTML  = "Track";
        this.ui.menuGenre.innerHTML  = "Genre";

        this.ui.menuList.appendChild(this.ui.menuArtist);
        this.ui.menuList.appendChild(this.ui.menuTrack);
        this.ui.menuList.appendChild(this.ui.menuGenre);

        this.ui.menu.appendChild(this.ui.menuTitle);
        this.ui.menu.appendChild(this.ui.menuList);
        this.ui.container.appendChild(this.ui.menu);
        this.ui.container.appendChild(this.ui.content);

        this._eventListener();
        this._requestArtistPage();
    }


    _eventListener() {
        this.ui.menuArtist.addEventListener("click", this._requestArtistPage.bind(this));
        this.ui.menuTrack.addEventListener("click", this._requestTrackPage.bind(this));
        this.ui.menuGenre.addEventListener("click", this._requestGenrePage.bind(this));
    }


    _init() {
        this._createUI();
    }


    _requestArtistPage() {
        this._clearPageSpace();

        this.ui.menuArtist.className   = "selected";
        this.ui.contentTitle.innerHTML = "Artists statistic";

        let artistsLeft                = document.createElement("DIV");
        let artistsRight               = document.createElement("DIV");
        let prefArtistsLabel           = document.createElement("P");
        let prefArtists                = document.createElement("UL");
        let leastArtistsLabel          = document.createElement("P");
        let leastArtists               = document.createElement("UL");

        prefArtistsLabel.id            = "label";
        leastArtistsLabel.id           = "label";
        artistsLeft.className          = "col";
        artistsRight.className         = "col";

        artistsLeft.appendChild(prefArtistsLabel);
        artistsLeft.appendChild(prefArtists);
        artistsRight.appendChild(leastArtistsLabel);
        artistsRight.appendChild(leastArtists);
        this.ui.content.appendChild(this.ui.contentTitle);
        this.ui.content.appendChild(document.createElement("HR"));
        this.ui.content.appendChild(artistsLeft);
        this.ui.content.appendChild(artistsRight);

        let that = this;
        JSONParsedGetRequest(
            "stats/getUserPrefArtists/",
            function(response) {
                /* response = {
                 *     DONE              : bool
                 *     ERROR_H1          : string
                 *     ERROR_MSG         : string
                 *
                 *     PREF_ARTISTS      : [][]
                 *     LEAST_ARTISTS     : [][]
                 * } */
                if (response.DONE) {
                    if (response.ERROR_H1 !== "null") {
                        prefArtistsLabel.innerHTML     = "";
                        leastArtistsLabel.innerHTML    = "";
                        that.ui.contentTitle.innerHTML = "No stats yet to display about artists. Use ManaZeak before going there!";
                    }

                    else {
                        prefArtistsLabel.innerHTML     = "Top Artists";
                        leastArtistsLabel.innerHTML    = "Flop Artists";

                        that._updatePrefArtistsList(response.PREF_ARTISTS, prefArtists);
                        that._updateLeastArtistsList(response.LEAST_ARTISTS, leastArtists);
                    }
                }

                else {
                    new Notification("ERROR", response.ERROR_H1, response.ERROR_MSG);
                }
            }
        );
    }


    _requestGenrePage() {
        this._clearPageSpace();

        this.ui.menuGenre.className    = "selected";
        this.ui.contentTitle.innerHTML = "Genres statistic";

        let genresLeft                 = document.createElement("DIV");
        let genresRight                = document.createElement("DIV");
        let prefGenresLabel            = document.createElement("P");
        let prefGenres                 = document.createElement("UL");
        let leastGenresLabel           = document.createElement("P");
        let leastGenres                = document.createElement("UL");

        prefGenresLabel.id             = "label";
        leastGenresLabel.id            = "label";
        genresLeft.className           = "col";
        genresRight.className          = "col";

        genresLeft.appendChild(prefGenresLabel);
        genresLeft.appendChild(prefGenres);
        genresRight.appendChild(leastGenresLabel);
        genresRight.appendChild(leastGenres);
        this.ui.content.appendChild(this.ui.contentTitle);
        this.ui.content.appendChild(document.createElement("HR"));
        this.ui.content.appendChild(genresLeft);
        this.ui.content.appendChild(genresRight);

        let that = this;

        JSONParsedGetRequest(
            "stats/getUserPrefGenres/",
            function(response) {
                /* response = {
                 *     DONE              : bool
                 *     ERROR_H1          : string
                 *     ERROR_MSG         : string
                 *
                 *     PREF_GENRES      : [][]
                 *     LEAST_GENRES     : [][]
                 * } */
                if (response.DONE) {
                    if (response.ERROR_H1 !== "null") {
                        prefGenresLabel.innerHTML      = "";
                        leastGenresLabel.innerHTML     = "";
                        that.ui.contentTitle.innerHTML = "No stats yet to display about genres. Use ManaZeak before going there!";
                    }

                    else {
                        prefGenresLabel.innerHTML      = "Top Genres";
                        leastGenresLabel.innerHTML     = "Flop Genres";

                        that._updatePrefGenresList(response.PREF_GENRES, prefGenres);
                        that._updateLeastGenresList(response.LEAST_GENRES, leastGenres);
                    }
                }

                else {
                    new Notification("ERROR", response.ERROR_H1, response.ERROR_MSG);
                }
            }
        );
    }


    _requestTrackPage() {
        this._clearPageSpace();

        this.ui.menuTrack.className    = "selected";
        this.ui.contentTitle.innerHTML = "Tracks statistic";

        let tracksLeft                 = document.createElement("DIV");
        let tracksRight                = document.createElement("DIV");
        let prefTracksLabel            = document.createElement("P");
        let prefTracks                 = document.createElement("UL");
        let leastTracksLabel           = document.createElement("P");
        let leastTracks                = document.createElement("UL");

        prefTracksLabel.id             = "label";
        leastTracksLabel.id            = "label";
        tracksLeft.className           = "col";
        tracksRight.className          = "col";

        tracksLeft.appendChild(prefTracksLabel);
        tracksLeft.appendChild(prefTracks);
        tracksRight.appendChild(leastTracksLabel);
        tracksRight.appendChild(leastTracks);
        this.ui.content.appendChild(this.ui.contentTitle);
        this.ui.content.appendChild(document.createElement("HR"));
        this.ui.content.appendChild(tracksLeft);
        this.ui.content.appendChild(tracksRight);

        let that = this;

        JSONParsedGetRequest(
            "stats/getUserPrefTracks/",
            function(response) {
                /* response = {
                 *     DONE              : bool
                 *     ERROR_H1          : string
                 *     ERROR_MSG         : string
                 *
                 *     PREF_TRACKS      : [][]
                 *     LEAST_TRACKS     : [][]
                 * } */
                if (response.DONE) {
                    if (response.ERROR_H1 !== "null") {
                        prefTracksLabel.innerHTML      = "";
                        leastTracksLabel.innerHTML     = "";
                        that.ui.contentTitle.innerHTML = "No stats yet to display about tracks. Use ManaZeak before going there!";
                    }

                    else {
                        console.log(response);
                        prefTracksLabel.innerHTML      = "Top Tracks";
                        leastTracksLabel.innerHTML     = "Flop Tracks";

                        that._updatePrefTracksList(response.PREF_TRACKS, prefTracks);
                        that._updateLeastTracksList(response.LEAST_TRACKS, leastTracks);
                    }
                }

                else {
                    new Notification("ERROR", response.ERROR_H1, response.ERROR_MSG);
                }
            }
        );
    }


    _unselectAllMenuEntries() {
        this.ui.menuArtist.className = "";
        this.ui.menuTrack.className  = "";
        this.ui.menuGenre.className  = "";
    }


    /**
     * method : _updateLeastArtistsList (private)
     * class  : StatsView
     * desc   : Updates the flop artists list
     * arg    : {[int][int]} leastArtists - Key/Value artists array
     **/
    _updateLeastArtistsList(leastArtists, ui) {
        let counter = 1; // A must here since void element is not in a fixed index in array
        for (let i = 0; i < leastArtists.length; ++i) {
            if (leastArtists[i][0] !== null) {
                let entry = document.createElement("LI");

                if (leastArtists[i][0] !== "") {
                    entry.innerHTML =  counter + ". " + leastArtists[i][0] + " (" + leastArtists[i][1] + " tracks played)"; // 0 = name, 1 = counter
                }

                else {
                    entry.innerHTML =  counter + ". Untagged artist (" + leastArtists[i][1] + " tracks played)"; // 0 = name, 1 = counter
                }
                ++counter;
                ui.appendChild(entry);
            }
        }
    }


    /**
     * method : _updateLeastArtistsList (private)
     * class  : StatsView
     * desc   : Updates the favorite artists list
     * arg    : {[int][int]} prefArtists - Key/Value artists array
     **/
    _updatePrefArtistsList(prefArtists, ui) {
        let counter = 1; // A must here since void element is not in a fixed index in array
        for (let i = 0; i < prefArtists.length; ++i) {
            if (prefArtists[i][0] !== null) {
                let entry = document.createElement("LI");

                if (prefArtists[i][0] !== "") {
                    entry.innerHTML = counter + ". " + prefArtists[i][0] + " (" + prefArtists[i][1] + " tracks played)"; // 0 = name, 1 = counter
                }

                else {
                    entry.innerHTML = counter + ". Untagged artist (" + prefArtists[i][1] + " tracks played)"; // 0 = name, 1 = counter
                }

                ++counter;
                ui.appendChild(entry);
            }
        }
    }


    /**
     * method : _updateLeastGenresList (private)
     * class  : StatsView
     * desc   : Updates the flop tracks list
     * arg    : {[][]} leastGenres - Key/Value tracks array
     **/
    _updateLeastGenresList(leastGenres, ui) {
        let counter = 1; // A must here since void element is not in a fixed index in array
        for (let i = 0; i < leastGenres.length; ++i) {
            if (leastGenres[i][0] !== null) {
                let entry = document.createElement("LI");

                if (leastGenres[i][0] !== "") {
                    entry.innerHTML = counter + ". " + leastGenres[i][0] + " (played " + leastGenres[i][1] + " times, is " + precisionRound(leastGenres[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }

                else {
                    entry.innerHTML = counter + ". Untagged genre (played " + leastGenres[i][1] + " times, is " + precisionRound(leastGenres[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }

                ++counter;
                ui.appendChild(entry);
            }
        }
    }


    /**
     * method : _updatePrefGenresList (private)
     * class  : StatsView
     * desc   : Updates the favorite tracks list
     * arg    : {[int][int]} prefTracks - Key/Value tracks array
     **/
    _updatePrefGenresList(prefGenres, ui) {
        let counter = 1; // A must here since void element is not in a fixed index in array
        for (let i = 0; i < prefGenres.length; ++i) {
            if (prefGenres[i][0] !== null) {
                let entry = document.createElement("LI");

                if (prefGenres[i][0] !== "") {
                    entry.innerHTML = counter + ". " + prefGenres[i][0] + " (played " + prefGenres[i][1] + " times, is " + precisionRound(prefGenres[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }

                else {
                    entry.innerHTML = counter + ". Untagged genre (played " + prefGenres[i][1] + " times, is " + precisionRound(prefGenres[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }

                ++counter;
                ui.appendChild(entry);
            }
        }
    }


    /**
     * method : _updateLeastArtistsList (private)
     * class  : StatsView
     * desc   : Updates the flop tracks list
     * arg    : {[int][int]} leastTracks - Key/Value tracks array
     **/
    _updateLeastTracksList(leastTracks, ui) {
        let counter = 1; // A must here since void element is not in a fixed index in array
        for (let i = 0; i < leastTracks.length; ++i) {
            if (leastTracks[i][0] !== null) {
                let entry = document.createElement("LI");

                if (leastTracks[i][0]) {
                    entry.innerHTML = counter + ". " + leastTracks[i][0] + " (played " + leastTracks[i][1] + " times, average listening : " + precisionRound(leastTracks[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }

                else {
                    entry.innerHTML = counter + ". Untagged track (played " + leastTracks[i][1] + " times, average listening : " + precisionRound(leastTracks[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }

                ++counter;
                ui.appendChild(entry);

            }
        }
    }


    /**
     * method : _updatePrefTracksList (private)
     * class  : StatsView
     * desc   : Updates the favorite tracks list
     * arg    : {[int][int]} prefTracks - Key/Value tracks array
     **/
    _updatePrefTracksList(prefTracks, ui) {
        let counter = 1; // A must here since void element is not in a fixed index in array
        for (let i = 0; i < prefTracks.length; ++i) {
            if (prefTracks[i][0] !== null) {
                let entry = document.createElement("LI");

                if (prefTracks[i][0] !== "") {
                    entry.innerHTML = counter + ". " + prefTracks[i][0] + " (played " + prefTracks[i][1] + " times, average listening : " + precisionRound(prefTracks[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }

                else {
                    entry.innerHTML = counter + ". Untagged track (played " + prefTracks[i][1] + " times, average listening : " + precisionRound(prefTracks[i][2], 1) + "%)"; // 0 = name, 1 = counter
                }
                ++counter;
                ui.appendChild(entry);

            }
        }
    }

}
