/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                     *
 *  Track class - track object from db with all its metadata                           *
 *                                                                                     *
 *  track     : raw track incoming from db JSON                                        *
 *                                                                                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
var Track = function(track) {

    // Track internal attributes
    this.ui = {
        entry: null,
        id: null,
        x: 0,
        y: 0
    };
    this.isSelected = false;


    // Filling Track object
    this.id = {
        track: track.ID,
        album: track.ALBUM.ID,
        artists: this._getArtistsIDFromArtistsArray(track.ARTISTS)
    };
    this.title        = track.TITLE;
    this.year         = track.YEAR;
    this.composer     = track.COMPOSER;
    this.perfomer     = track.PERFOMER;
    this.track        = track.TRACK_NUMBER;
    this.trackTotal   = track.ALBUM.TOTAL_TRACK;
    this.disc         = track.DISC_NUMBER;
    this.discTotal    = track.ALBUM.TOTAL_DISC;
    this.bpm          = track.BPM;
    this.lyrics       = track.LYRICS;
    this.comment      = track.COMMENT;
    this.bitRate      = track.BITRATE;
    this.sampleRate   = track.SAMPLERATE;
    this.duration     = track.DURATION;
    this.size         = track.SIZE;
    this.lastModified = track.LAST_MODIFIED;
    this.artist       = this._getArtistFromArtistsArray(track.ARTISTS);
    this.album        = track.ALBUM.TITLE;
    this.genre        = track.GENRE;
    this.fileType     = track.FILE_TYPE;
};


Track.prototype = {

    _getArtistsIDFromArtistsArray: function(artists) {
        var artistsID = [];

        for (var i = 0; i < artists.length ;++i) {
            artistsID.push(artists[i].ID);
        }

        return artistsID;
    },


    _getArtistFromArtistsArray: function(artists) {
        var artistsName = []; // Artists name array
        var artist = ""; // Output string

        for (var i = 0; i < artists.length ;++i) {
            artistsName.push(artists[i].NAME);
        }

        artistsName.sort(); // In order to get artists alphabetically ordered

        for (i = 0; i < artistsName.length ;++i) {
            artist += artistsName[i];

            if (i < (artistsName.length - 1)) { artist += ", "; }
        }

        return artist;
    },


    newListViewEntry: function(listView) {
        this.ui.entry = document.createElement("div");
        this.ui.entry.id = this.id.track;
        this.ui.entry.className = "trackContainer";

        var title    = document.createElement("div");
        var artist   = document.createElement("div");
        var composer = document.createElement("div");
        var album    = document.createElement("div");
        var genre    = document.createElement("div");
        var year     = document.createElement("div");

        title.className    = "title";
        artist.className   = "artist";
        composer.className = "composer";
        album.className    = "album";
        genre.className     = "genre";
        year.className     = "year";

        title.innerHTML    = this.title;
        artist.innerHTML   = this.artist;
        composer.innerHTML = this.composer;
        album.innerHTML    = this.album;
        genre.innerHTML    = this.genre;
        year.innerHTML     = this.year;

        this.ui.entry.appendChild(title);
        this.ui.entry.appendChild(artist);
        this.ui.entry.appendChild(composer);
        this.ui.entry.appendChild(album);
        this.ui.entry.appendChild(genre);
        this.ui.entry.appendChild(year);

        // TODO : store listenners, and add single click listenner
        this.ui.entry.addEventListener("dblclick", this.toggleSelected.bind(this));

        listView.appendChild(this.ui.entry);
    },


    toggleSelected: function() {
        // TODO : console.log(this.ui.entry.getBoundingClientRect());
        if (this.isSelected) {
            this.isSelected = !this.isSelected;
            this.ui.entry.style.background = "none";
        } else {
            this.isSelected = !this.isSelected;
            this.ui.entry.style.background = "red";
        }
    }
};
