/* * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                 *
 *  QueueView class                                *
 *                                                 *
 *  Classical queue (pre)view                      *
 *                                                 *
 * * * * * * * * * * * * * * * * * * * * * * * * * */

class QueuePreview {
    constructor(container) {

        this.contextMenu = null;
        this.reverse     = window.app.queue.isReverse();
        this.isLocked    = false;

        this._createUI(container);
        this._eventListener();
        this._contextMenuSetup();
    }

//  --------------------------------  PUBLIC METHODS  ---------------------------------  //

    /**
     * method : preview (public)
     * class  : QueuePreview
     * desc   : TODO
     **/
    preview() {
        if (isVisibilityLocked(this.ui.container))
            return;

        addVisibilityLock(this.ui.container);
        window.setTimeout(removeVisibilityLock.bind(null, this.ui.container), 2000);
    }


    /**
     * method : lock (public)
     * class  : QueuePreview
     * desc   : Show and lock QueuePreview
     **/
    lock() {
        this.isLocked = true;
        addVisibilityLock(this.ui.container);
    }


    /**
     * method : hide (public)
     * class  : QueuePreview
     * desc   : Hide QueuePreview
     **/
    hide() {
        this.isLocked = false;
        removeVisibilityLock(this.ui.container);
    }

//  --------------------------------  PRIVATE METHODS  --------------------------------  //

    /**
     * method : _addEntry (private)
     * class  : QueuePreview
     * desc   : Add an entry in QueuePreview
     **/
    _addEntry(track) {
        let li              = document.createElement("LI");
        let img             = document.createElement("IMG");
        let body            = document.createElement("DIV");
        let title           = document.createElement("SPAN");
        let origin          = document.createElement("SPAN");
        let composer        = document.createElement("SPAN");
        let qControls       = document.createElement("DIV");
        let qControlsUp     = document.createElement("SPAN");
        let qControlsDown   = document.createElement("SPAN");

        body.className      = "mzk-qprev-body";
        title.className     = "mzk-qprev-title";
        origin.className    = "mzk-qprev-origin";
        composer.className  = "mzk-qprev-composer";
        qControls.className = "mzk-qprev-controls";

        title.innerText         = track.title;
        origin.innerText        = track.artist + ' - ' + track.album + ' (' + track.year + ')';
        composer.innerText      = 'Composed by: ' + track.composer;
        qControlsUp.innerText   = "U";
        qControlsDown.innerText = "D";

        img.src = track.cover;

        qControlsUp.dataset.callback   = "moveUp";
        qControlsDown.dataset.callback = "moveDown";

        body.appendChild(title);
        body.appendChild(origin);
        body.appendChild(composer);

        qControls.appendChild(qControlsUp);
        qControls.appendChild(qControlsDown);

        li.appendChild(img);
        li.appendChild(body);
        li.appendChild(qControls);

        this.ui.queueList.appendChild(li);
    }


    /**
     * method : _contextMenuSetup (private)
     * class  : QueuePreview
     * desc   : TODO
     **/
    _contextMenuSetup() {

    }


    /**
     * method : _createUI (private)
     * class  : QueuePreview
     * desc   : Build UI elements
     **/
    _createUI(container) {
        this.ui = {
            container:      document.createElement("DIV"),
            statusBar:  {
                container:  document.createElement("DIV"),
                trackCount: document.createElement("SPAN"),
                reverseBox: document.createElement("INPUT"),
                reverseLbl: document.createElement("LABEL")
            },
            queueList:      document.createElement("UL")
        };

        this.ui.container.className            = "mzk-queue-preview";
        this.ui.statusBar.container.className  = "mzk-queue-status";
        this.ui.queueList.className            = "mzk-queue-list";

        this.ui.statusBar.trackCount.innerText = "0 tracks";
        this.ui.statusBar.reverseLbl.innerText = "Reverse Play:";
        this.ui.statusBar.reverseBox.type      = "checkbox";
        this.ui.statusBar.reverseBox.value     = this.reverse;

        this.ui.statusBar.container.appendChild(this.ui.statusBar.trackCount);
        this.ui.statusBar.container.appendChild(this.ui.statusBar.reverseLbl);
        this.ui.statusBar.reverseLbl.appendChild(this.ui.statusBar.reverseBox);

        this.ui.container.appendChild(this.ui.queueList);
        this.ui.container.appendChild(this.ui.statusBar.container);

        container.appendChild(this.ui.container);
    }


    /**
     * method : _eventListener (private)
     * class  : QueuePreview
     * desc   : QueuePreview event listeners
     **/
    _eventListener() {
        let self = this;

        let findParentLI = function(element) {
            while (element.tagName !== 'UL' && element.tagName !== 'LI') {
                element = element.parentNode;

                if (element.tagName === 'LI') { return element; }
                else                          { return null;    }
            }
        };

        this.ui.statusBar.reverseBox.addEventListener('click', function() {
            window.app.reverseQueue(!self.reverse);
        });
        this.ui.queueList.addEventListener('click', function(event) {
            let li, sib;

            switch (event.target.dataset.callback) {
                case 'moveUp':
                    li = findParentLI(event.target);

                    if (li !== null || li !== undefined) {
                        sib = li.previousSibling;

                        if (sib !== null || li !== undefined) {
                            for (let i = 0; li.parentNode.children[i] !== li; ++i) {}

                            self.ui.queueList.insertBefore(self.ui.queueList.removeChild(li), sib);
                            window.app.moveQueue(i, i -1);
                        }
                    }
                    break;

                case 'moveDown':
                    li = findParentLI(event.target);
                    if (li !== null || li !== undefined) {
                        sib = li.nextSibling;

                        if (sib !== null || li !== undefined) {
                            for (let i = 0; li.parentNode.children[i] !== li; ++i) {}

                            self.ui.queueList.insertBefore(self.ui.queueList.removeChild(li), sib.nextSibling);
                            window.app.moveQueue(i, i + 1);
                        }

                    }
                    break;

                default:
                    // TODO : Switch default event
                    break;
            }
        });
        document.body.addEventListener('click', function() {
            removeVisibilityLock(self.ui.container);
        });
        window.app.listen('pushQueue', function(track) {
            self._addEntry(track);
        });
        window.app.listen('popQueue', function() {
            self.ui.queueList.removeChild(self.reverse ? self.ui.queueList.lastChild : self.ui.queueList.firstChild);
        });
        window.app.listen('reverseQueue', function(reverse) {
            self.reverse = reverse;
        });
    }

//  ------------------------------  GETTERS / SETTERS  --------------------------------  //

    getIsLocked() { return this.isLocked; }

}
