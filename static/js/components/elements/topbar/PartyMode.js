/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *  PartyMode class                                *
 *                                                 *
 *  Handle the firring of the PartyView in TopBar  *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */

class PartyMode {
    constructor(container) {


        this._createUI(container);
        this._init();
    }

//  --------------------------------  PRIVATE METHODS  --------------------------------  //

    /**
     * method : _createUI (private)
     * class  : PartyMode
     * desc   : Build UI elements
     **/
    _createUI(container) {
        this.ui = {
            container: document.createElement("DIV"),
            img:       document.createElement("IMG")
        };

        this.ui.container.id = "partyMode";
        this.ui.img.src      = "/static/img/utils/party.svg";

        this.ui.container.appendChild(this.ui.img);
        container.appendChild(this.ui.container);
    }


    /**
     * method : _init (private)
     * class  : PartyMode
     * desc   : Listen to events
     **/
    _init() {
        this._eventListener();
    }


    /**
     * method : _eventListener (private)
     * class  : PartyMode
     * desc   : WishList event listeners
     **/
    _eventListener() {
        this.ui.img.addEventListener("click", function() {
            window.app.hidePageContent();
            window.app.showAppView("mzk_party");
        });
    }

}
