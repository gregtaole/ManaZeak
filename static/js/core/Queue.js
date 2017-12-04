/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *                                                                                     *
 *  Queue class - handle the user current tracks queue                                 *
 *                                                                                     *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
//========================================================================================

import QueueEntry from './QueueEntry.js'

class Queue {
    constructor() {
        this.first = null;
        this.last = null;
        this.reverse = false;
    }

    // TODO : add text saying that queue is empty when no track is loaded. Use same size as LI item, and put text at the center, same font as Track title in LI
    // TODO : ? Add notif when track has been added ? To discuss if useful or not
    enqueue(track) {
        var newLink = new QueueEntry(track);

        if(this.first == null)
            this.first = newLink;
        else
            this.last.addNext(newLink);

        this.last = newLink;
    }

    dequeue() {
        if(this.first == null)
            return;

        var tmp;
        if (this.reverse == true) {
            tmp = this.last;
            this.last = this.last.previous;
            if(this.last == null)
                this.first = null;
        } else {
            tmp = this.first;
            this.first = this.first.next;
            if(this.first == null)
                this.last = null;
        }
        tmp.unlink();
        return tmp.track;
    }

    slide(element, newPos) {
        var link = this.first;
        var diff = newPos - element;

        for(;element-- > 0 && link != null; link = link.next);
        if(link != null) {
            if(diff > 0)
                for(; diff-- > 0; link = link.next)
                    link.moveNext();
            else
                for(; diff++ < 0; link = link.previous)
                    link.movePrev();
        }
    }

    isEmpty() {
        return this.first == null;
    }

    setReverse(newReverse) {
        this.reverse = newReverse == true;
    }

    isReverse () {
        return this.reverse;
    }
}

export default Queue
