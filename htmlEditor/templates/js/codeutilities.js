
function reset() {
    if (document.getElementById("cursor-style")) {
        document.head.removeChild(document.getElementById("cursor-style"));
    }
    hovering = {};
}

var mx = 0, my = 0;

var hovering = {};
var modals = [];

function checkForHover(x, y, elements) {
    reset();

    var none = true;

    elements.forEach(e=>{
        if (e.offsetLeft < x && e.offsetLeft + e.clientWidth > x) {
            eventDispatcher.dispatch("mouse/hover", e)
            none = false;
        }
    });

    return !none;
}


eventDispatcher.listen("keyboard/key/shift!!!", function(e) {
    if (e.buttons == 1) return;
    const line = writer.lines[Math.ceil(my / 20) - 1];
    return line ? checkForHover(mx, my, line.element.childNodes) : false;
});

eventDispatcher.listen("mouse/move!!!!", function(e) {
    mx = e.layerX, my = e.layerY;
});


eventDispatcher.listen("mouse/hover", function(e) {
    if (e.classList.contains("hl-color")) {
        /*const cursorStyle = document.createElement('style');
        cursorStyle.innerHTML = '*{cursor: pointer!important;}';
        cursorStyle.id = 'cursor-style';
        document.head.appendChild(cursorStyle);
        console.log(document.body.style)
        hovering["color"] = e;*/
        var line = document.querySelector("#line-1").getBoundingClientRect(), modal = document.querySelector(".editor-modals").getBoundingClientRect();
        var lx = line.x, ly = line.y;
            Mx = modal.x, My = modal.y;
        modals.push(new ModalColorPreview(e.offsetLeft + e.clientWidth/2 - Mx + lx, e.offsetTop - My + ly, e.textContent).render());
    }
});

eventDispatcher.listen("mouse/down!!", function (e) {
    reset();
    modals.forEach(modal => modal.destroy());
    modals = [];

    mx, my = null, null;
});

eventDispatcher.listen("keyboard/keydown", function (e) {
    if (e.code == "ShiftLeft" || e.code == "ShiftRight") return;
    modals.forEach(modal => modal.destroy());
    modals = [];
});


window.addEventListener("load", () => {
    document.addEventListener("keyup", function(e) {
        if (e.code != "ShiftLeft") {return;}
        reset();
        modals.forEach(modal => modal.destroy());
        modals = [];
    });
}, false);