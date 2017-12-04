class QueueEntry {
    constructor(track) {
        this.next = null;
        this.previous = null;
        this.track = track;
    }

    addNext(other) {
        if(other == null)
            return;

        other.unlink();
        if(this.next) {
            this.next.previous = other;
            other.next = this.next;
        }
        this.next = other;
        other.previous = this;
    }

    addPrev(other) {
        if(other == null)
            return;

        other.unlink();
        if(this.previous) {
            this.previous.next = other;
            other.previous = this.previous;
        }
        this.previous = other;
        other.next = this;
    }

    moveNext() {
        var tmp_t;
        if(this.next)
        {
            tmp_t = this.track;
            this.track = this.next.track;
            this.next.track = tmp_t;
        }
    }

    movePrev() {
        var tmp_t;
        if(this.previous)
        {
            tmp_t = this.track;
            this.track = this.previous.track;
            this.previous.track = tmp_t;
        }
    }

    unlink() {
        if(this.previous)
            this.previous.next = this.next;
        if(this.next)
            this.next.previous = this.previous;
        this.previous = null;
        this.next = null;
    }
}

export default QueueEntry
