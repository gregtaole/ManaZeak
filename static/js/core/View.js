/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
*                                                                                     *
*  ListView class - classical list view                                               *
*                                                                                     *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
class View {
    constructor(data) {
        this.pageContainer = document.getElementById("mainContainer");
        this.container = document.createElement("DIV");
    }

    init(data) {
        this.container.innerHTML = "";
        this._init(data);
        this._eventListener();
    }

    show() {
        this.pageContainer.innerHTML = "";
        this.pageContainer.appendChild(this.container);

        // TODO : dirty work here, put this somewhere else
        if (this.listView.scrollHeight > this.listView.clientHeight) {
            this.header.container.className += " columnHeaderOffset";
        }
    }

    getDataFromPlaylist(playlist) {
        return null;
    }

    _init(data) {
    }

    _eventListener() {
    }
}

export default View;
