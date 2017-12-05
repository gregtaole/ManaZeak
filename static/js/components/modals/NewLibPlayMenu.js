/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                     *
*  UserMenu class - handle the user's menu                                            *
*                                                                                     *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class NewLibPlayMenu {
    constructor(){
        this.newLibPlayMenu = null;
        this.entries = {
            library: null,
            playlist: null
        };
        this.outside = document.body;
        this.isVisible = false;

        this._init();
    }

    _init() {
        this.newLibPlayMenu = document.createElement("div");
        this.newLibPlayMenu.id = "newLibPlay";

        this.entries.library = document.createElement("p");
        this.entries.playlist = document.createElement("p");

        this.entries.library.innerHTML = "New library";
        this.entries.playlist.innerHTML = "New playlist";

        this.newLibPlayMenu.appendChild(this.entries.library);
        this.newLibPlayMenu.appendChild(this.entries.playlist);

        this._eventListener();
        this._keyListener();

        document.body.appendChild(this.newLibPlayMenu);
    }

    toggleVisibilityLock(event) {
        if (!this.isVisible) {
            this.isVisible = !this.isVisible;
            this.newLibPlayMenu.style.top  = event.pageY + "px";
            this.newLibPlayMenu.style.left = event.pageX + "px";
            addVisibilityLock(this.newLibPlayMenu);
        } else {
            this.isVisible = !this.isVisible;
            removeVisibilityLock(this.newLibPlayMenu);
        }
    }

    newLibrary(event) {
        this.toggleVisibilityLock(event);
        window.app.requestNewLibrary();
    }

    newPlaylist(event) {
        this.toggleVisibilityLock(event);
    }

    _eventListener() {
        this.entries.library.addEventListener("click", this.newLibrary.bind(this));
        this.entries.playlist.addEventListener("click", this.newPlaylist.bind(this));
    }

    _keyListener() {
        var that = this;

        // Key pressed event
        document.addEventListener("keydown", function(event) {
            switch (event.keyCode) {
                case 27: // Esc
                if (that.isVisible) { that.toggleVisibilityLock(); }
                break;
                default:
                break;
            }
        });
    }


    getContextMenu() { return this.contextMenu; }
}

export default NewLibPlayMenu
