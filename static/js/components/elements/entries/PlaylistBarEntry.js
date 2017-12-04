/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                     *
*  PlaylistBarEntry class                                                             *
*                                                                                     *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class PlaylistBarEntry {
    constructor(playlist, playlistBar, id, isLibrary) {

        this.playlist = playlist;

        this.entry = document.createElement("div");
        this.entry.id = playlist.id;
        this.isLibrary = isLibrary;
        this.entry.dataset.childID = id;


        if (this.isLibrary) {
            this.entry.className = "library";
        } else {
            this.entry.className = "playlist";
        }

        this.entry.innerHTML = playlist.getName();

        this.isSelected = false;

        playlistBar.appendChild(this.entry);
    }

    getId() { return this.entry.id; }
    getIsSelected() { return this.isSelected; }

    setIsSelected(isSelected) {
        this.isSelected = isSelected;
        if (this.isSelected) {
            this.entry.classList.add("librarySelected");
        } else {
            this.entry.classList.remove("librarySelected");
        }
    }

}

export default PlaylistBarEntry;
