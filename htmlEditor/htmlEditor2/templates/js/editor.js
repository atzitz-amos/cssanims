
const $ = document.querySelector;
const $$ = (s, sper=null) => {
    function _(e, t, v) {
        switch(t) {
            case '.':
                e.classList.add(v);
                break;
            case '#':
                e.id = v;
                break;
        }
    }

    let name = ""
    let el = null;
    let type = null;
    for (let i of s) {
        if ([".", "#"].includes(i)) {
            if (!el) {
                el = document.createElement(name);
            }
            else {
                _(el, type, name);
            }
            type = i;
            name = "";
        } else name += i;
    }
    _(el, type, name);

    if (sper){
        sper.appendChild(el);
    }
    return el;
}; // shortcuts, not to be confused with JQuery. This lib is written in pure js.

function _Editor(element, w, h) {
    let root = $$("div.editor-root.dark", element);
    root.style.setProperty("--root-w", w + "px");
    root.style.setProperty("--root-h", h + "px");

    let gutter = $$("div.editor-gutter", root)
      , body = $$("div.editor-body", root);
}