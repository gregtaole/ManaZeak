/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *  UserMenu class                                 *
 *                                                 *
 *  Handle the user's menu                         *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */

class UserMenu {
    constructor(container) {

        this.ui = {
            container: document.createElement("DIV"),
            img:       document.createElement("IMG")
        };
        this.menu      = document.createElement("DIV");
        this.menu.id   = "menu";
        this.menuEntry = {
            logout:   null,
            stats:    null,
            settings: null
        };
        this.outside   = document.body;
        this.isVisible = false;

        this.contextMenu = null;

        this._createUI(container);
        this._setupContextMenu();
    }

//  --------------------------------  PRIVATE METHODS  --------------------------------  //


    /**
     * method : _createUI (private)
     * class  : UserMenu
     * desc   : Build UI Elements
     **/
    _createUI(container) {
        this.ui.container.id              = "userExpander";
        this.ui.img.src                   = "/static/img/utils/user.svg";

        this.ui.container.appendChild(this.ui.img);
        container.appendChild(this.ui.container);
    }


    /**
     * method : _setupContextMenu (private)
     * class  : UserMenu
     * desc   : UserMenu context menu
     **/
    _setupContextMenu() {
        let that = this;
        this.contextMenu = new ContextMenu(this.ui.container, null, 'click');

        this.contextMenu.addEntry('invite', 'Invite Code', function() {
            new Modal('inviteCode', null).open();
        });
        this.contextMenu.addEntry('settings', 'Settings', function() {
            window.app.showAppView('mzk_settings');
        });
        this.contextMenu.addEntry('stats', 'Stats', function() {
            window.app.showAppView('mzk_stats');
        });
        this.contextMenu.addEntry('logout', 'Log out', function() {
            window.app.logOut();
        });

        window.app.user.updateIsAdmin(function(is) {
            if (is) {
                let adm = new ContextMenuEntry('admin', 'Admin', function() {
                    window.app.showAppView('mzk_admin');
                });
                that.contextMenu.getRoot().addChild(adm, 'invite', false);
            }
        });
    }

}
