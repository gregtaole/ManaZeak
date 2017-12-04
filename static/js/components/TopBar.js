/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                     *
*  PlaylistBar class - handle the playlist bar                                        *
*                                                                                     *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
import UserMenu from '../components/elements/UserMenu.js'
import NewLibPlayMenu from './modals/NewLibPlayMenu.js'
import PlaylistBarEntry from './elements/entries/PlaylistBarEntry'
import { addVisibilityLock, renderMoodFile, removeVisibilityLock } from '../utils/Utils.js'

class TopBar {
    constructor() {

        this.moodbar = null;
        this.playlistBar = null;
        this.playlists = null;
        this.selectedPlaylist = null;
        this.entries = [];
        this.newPlaylistButton = null;

        this.topBar = document.createElement("div");

        this.userExpander = document.createElement("div");
        this.moodbar = document.createElement("div");
        this.moodbarThumb = document.createElement("div");
        this.playlistBar = document.createElement("div");

        this.topBar.id = "topBar";
        this.userExpander.id = "userExpander";
        this.moodbar.id = "moodbar";
        this.moodbarThumb.id = "moodbarThumb";
        this.playlistBar.id = "playlistBar";

        this.moodbarThumb.isVisible = false;

        this.topBar.appendChild(this.moodbar);
        this.moodbar.appendChild(this.moodbarThumb);
        this.topBar.appendChild(this.userExpander);
        this.topBar.appendChild(this.playlistBar);

        this.userMenu = new UserMenu(this.userExpander);
        this.menu = new NewLibPlayMenu();
    }

    init(playlists, selectedPlaylist) {
        this.removeEntries();
        this.playlists = playlists;

        this.addEntries();
        this.addNewPlaylistButton();
        this.setSelected(selectedPlaylist.id);
        this._eventListener();
    }

    addEntry(playlist) {
        this.entries.push(new PlaylistBarEntry(playlist, this.playlistBar, this.entries.length, playlist.getIsLibrary()));
    }

    addEntries() {
        for (var i = 0; i < this.playlists.length ;++i) {
            this.addEntry(this.playlists[i]);
        }
    }

    removeEntries() {
        for (var i = 0; i < this.entries.length ;++i) {
            this.playlistBar.removeChild(this.entries[i].entry)
        }

        // To the GC, and beyond
        this.entries = [];
    }

    addNewPlaylistButton() {
        this.newPlaylistButton = document.createElement("div");
        this.newPlaylistButton.innerHTML = "+";
        this.playlistBar.appendChild(this.newPlaylistButton);
        this.newPlaylistButton.addEventListener("click", this.newLibPlay.bind(this));
    }

    setSelected(id) {

        for (var i = 0; i < this.entries.length ;++i) {
            if (i == id || this.entries[i].getId() == id) {
                this.selectedPlaylist = i;
                this.entries[i].setIsSelected(true);
            }
        }

    }

    newLibPlay(e) {
        this.menu.toggleVisibilityLock(e);
    }

    unSelectAll() {
        for (var i = 0; i < this.entries.length ;++i) {
            this.entries[i].setIsSelected(false);
        }
    }

    refreshTopBar() {
        if (this.newPlaylistButton) {
            this.playlistBar.removeChild(this.newPlaylistButton);
        }

        this.newPlaylistButton.removeEventListener("click", this.newLibPlay.bind(this));
        this.removeEntries();
        this.addEntries();
        this.addNewPlaylistButton();
        // TODO : set selected to new one
        this.setSelected(this.selectedPlaylist);
    }

    viewClicked(event) {
        var target = event.target;

        // TODO : fix when target is null => when user click outside left or right of the listview
        while(target.parentNode && target.parentNode !== this.playlistBar) {
            target = target.parentNode;
        }

        if(target.parentNode === null) {
            return true;
        }

        var id = target.dataset.childID;

        if (id !== undefined) {
            this.unSelectAll();
            this.setSelected(id);
            this.entries[id].playlist.activate();
            window.app.refreshUI();
        }
    }

    changeMoodbar(id) {
        if (!this.moodbarThumb.isVisible) {
            this.moodbarThumb.isVisible = true;
            addVisibilityLock(this.moodbarThumb);
        }
        // TODO : add thumb if not already, also, hide thumb at app start
        var that = this;

        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                var tmp = JSON.parse(this.responseText);
                renderMoodFile(tmp.MOOD, that.moodbar);
            }
        };

        xhr.open("POST", "ajax/getMoodbarByID/", true);
        xhr.setRequestHeader('X-CSRFToken', window.app.cookies['csrftoken']);
        xhr.send(JSON.stringify({
            TRACK_ID: id
        }));
    }

    resetMoodbar() {
        d3.selectAll('#moodbar svg').remove();
        this.moodbarThumb.isVisible = false;
        removeVisibilityLock(this.moodbarThumb);
    }


    toggleUserMenu() {
        this.userMenu.toggleVisibilityLock();
    }

    _eventListener() {
        this.userExpander.addEventListener("click", this.toggleUserMenu.bind(this));
        this.playlistBar.addEventListener("click", this.viewClicked.bind(this));
    }

    getTopBar() {
        return this.topBar;
    }
}

export default TopBar
