
// LIB
const $ = (x) => document.querySelector(x); // just a little gain of place, nothing to do with JQuery

const _ = (x) => document.createElement(x);

HTMLElement.prototype.class = function (c) {this.classList.add(c); return this;};


// Editor

LHolder = class {
    constructor(i) {
        this.d = [];

        this.load(i);
    }

    load (d) {
        d.split('\n').forEach(l=>newLine(l, -1));
    }

    newLine (l, i) {

        this.d.push(new Line())
    }
}

View = class {
    constructor(v, i, e, w) {
        this.o = this.content(v); // original content
        this.l = i; // line numbers?
        this.e = e; // the editor element
        this.d = w ? w : new LHolder(v); // the data

        this.init();
    }

    init () {
        this.e.appendChild(_('div').class('.editor-gutter'))
    }

    content (v) {
        return v;
    }
}

Cursor = class {
    constructor(e) {

    }
}

Input = class {
    constructor(e) {}
}

Editor = class {
    constructor (e, d, i, t, o, r) {
        this.e = e; // the editor element
        this.d = d; // cursor if provided
        this.i = i; // the view
        this.t = t; // the highlighting utility
        this.o = o; // editable?
        this.r = r; // event function

        this.p = new Input(this); // the input
    }
}

window.onload = ()=>{var e = new (function (e, d, i, t, o, r) {
    /*
        Initialize new editor,
            e: the editor element
            d: editor editable?
            i: line numbers?
            t: highlight?
            o: original content
            r: event function
    */
    return new Editor(
        e,
        d ? new Cursor(e) : null,
        new View(o, i, e),
        t,
        d,
        r
    );
}
) ($('.tabcontent'), true, true, true, "", null)}