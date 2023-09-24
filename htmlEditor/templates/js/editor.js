
// EVENTS

// CONSTANTS
const BLOCK_CTRL_MOVEMENT = [":", ".", ";", ",", "(", ")", "[", "]", "{", "}", " "];

// EVENT LISTENERS

eventDispatcher.scope("window", {
    init: function () {
        var screenW = screen.width, screenH = screen.height;
        var body = document.body;
        body.style.setProperty("--component-editor-abs-height", "40vh");
        body.style.setProperty("--component-editor-abs-width", "94vw");
        body.style.setProperty("--component-editor-layer-abs-height", "100%"); // TODO

        body.style.setProperty("--component-line-abs-height", "20px");
        var t = document.querySelector(".tab-editor")
        body.style.setProperty("--component-line-abs-width", t.clientWidth - 5 + "px");
    },
    resize: function () {
        var screenW = screen.width, screenH = screen.height;
        var body = document.body;
        body.style.setProperty("--component-editor-abs-height", "40vh");
        body.style.setProperty("--component-editor-abs-width", "94vw");

        body.style.setProperty("--component-line-abs-height", "20px");
        var t = document.querySelector(".tab-editor")
        body.style.setProperty("--component-line-abs-width", t.clientWidth - 5 + "px");
    }
});

eventDispatcher.scope("input", {
    input: function (e) {
        writer.writeText(e.data)
        e.target.value = "";
    }
});

eventDispatcher.scope("keyboard", {
    "keydown": function (e) {selection.setCursorPrevPos(cursor.x, cursor.y);},
    "key": {
        "left|right|up|down|end|home!!": function (e) {
            if(e.shiftKey) selection.setActive(true);
        },
        "backspace": function (e) {
            writer.deletePrevChar(e.ctrlKey);
        },
        "enter": function (e) {
            writer.writeLine();
        },
        "left": function (e) {
            writer.moveCursorHoriz(-1, e.ctrlKey);
        },
        "right": function (e) {
            writer.moveCursorHoriz(1, e.ctrlKey);
        },
        "up": function (e) {
            writer.moveCursorVert(-1, e.ctrlKey);
        },
        "down": function (e) {
            writer.moveCursorVert(1, e.ctrlKey);
        },
        "tab": function (e) {
            writer.writeText("\t")
            e.preventDefault();
        },
        "home": function (e) {
            cursor.setText("");
        },
        "end": function (e) {
            cursor.setText(writer.lines[writer.currentline-1].text());
        },
        "delete": function (e) {
            writer.deleteNextChar(e.ctrlKey);
        },
        "ctrl/a": function (e) {
            selection.setCursorPrevPos(0, 0);
            selection.setActive(true);
            var length = writer.lines.length - 1;
            selection.update(parseInt(writer.lines[length].text().length * cursor.getWidth("a")), length * 20);
        },
        "ctrl/c": function (e) {

        },
        "ctrl/v": function (e) {
            navigator.clipboard.readText().then(text => {
                console.log(text);
            });
        }
    }
});

eventDispatcher.scope("mouse", {
    "down": function (e) {
        selection.setCursorPrevPos(cursor.x, cursor.y);
        if (e.shiftKey) selection.setActive(true);
        else selection.cancel();

        var rect = document.querySelector("#line-1").getBoundingClientRect();
        var x = e.x - rect.x; var y = e.y - rect.y;
        const line = Math.ceil(y / 20);
        writer.moveCursorTo(x, line);
    },
    "move": function (e) {
        if(e.buttons == 1){
            if(!selection.selectionActive) selection.setCursorPrevPos(cursor.x, cursor.y);
            selection.setActive(true);
            var rect = document.querySelector("#line-1").getBoundingClientRect();
            var x = e.x - rect.x; var y = e.y - rect.y;
            const line = Math.ceil(y / 20);
            writer.moveCursorTo(x, line);
        }
    },
    "wheel": function (e) {scroll.scrollAdd(e.deltaY)}
});

eventDispatcher.scope("selection", {
    "event": {
        "keyboard/key": {
            "left": function (e) {
                if(!e.shiftKey) {
                    if (selection.direction() == 1) writer.moveCursorTo(selection.startX, selection.startY / 20 + 1);
                    else writer.moveCursorTo(cursor.x, cursor.y / 20 + 1);
                    selection.cancel();
                    return true;
                }
            },
            "right": function (e) {
                if(!e.shiftKey) {
                    if (selection.direction() == -1) writer.moveCursorTo(selection.startX, selection.startY / 20 + 1);
                    else writer.moveCursorTo(cursor.x, cursor.y / 20 + 1);
                    selection.cancel();
                    return true;
                }
            },
            "down": function (e) {
                if(!e.shiftKey) {
                    writer.moveCursorTo(selection.currentX, selection.currentY / 20 + 1)
                    selection.cancel();
                }
            },
            "up": function (e) {
                console.log(selection);
                if(!e.shiftKey) {
                    writer.moveCursorTo(selection.currentX, selection.prevY / 20 + 1)
                    selection.cancel();
                }
            },
        }
    }
});

eventDispatcher.scope("writer", {
    "line|delete/line": function () {
        scroll.onLineCountChange(writer.lines.length);
    },
    "delete/line": function (ln) {
        scroll.onLineDelete(ln.number, ln.number - 1);
    }
});

eventDispatcher.scope("cursor", {
    "line-change": function (x, last, new_) {
        scroll.onLineChange(last, new_);
    }
});

// END EVENTS LISTENER

// DYNAMIC SIZING

size = {
    getLineWidth: function () {
        var lineWidth = document.body.style.getPropertyValue("--component-line-abs-width");
        return parseInt(lineWidth.substring(0, lineWidth.length-2));
    }
}

// END DYNAMIC SIZING

// UTILS

function switchAttr(el, attr) {el.hasAttribute(attr) ? el.removeAttribute(attr) : el.setAttribute(attr, "");}

// END UTILS

window.addEventListener("load2", () => { // TODO
    document.getElementsByClassName("tree-open")[0].addEventListener(
        "click",
        (e) => {switchAttr(document.getElementsByClassName("tree")[0], "hidden");}
    );
    document.querySelectorAll(".tree-node-title").forEach(x=>{x.addEventListener("click", (e) => {switchAttr(x.parentElement, "open")})});

    cursor.init();
    writer.init();
    eventDispatcher.dispatch("init")

    window.addEventListener("resize", ev=>eventDispatcher.dispatch("window/resize"));

    document.querySelector(".editor-input").addEventListener("input", (e) => eventDispatcher.dispatch("input/input", e));  // input

    document.querySelector(".editor-input").addEventListener("keydown", (e) => {
        eventDispatcher.dispatch("keyboard/keydown", e);

        function map(k) {
            switch (k) {
                case "ArrowLeft":
                    return "left";
                case "ArrowRight":
                    return "right";
                case "ArrowUp":
                    return "up";
                case "ArrowDown":
                    return "down";
                default:
                    return k.toLowerCase();
            }
        }
        
        var name = map(e.key);
        
        eventDispatcher.dispatch("keyboard/key/"+name, e);
        if (e.ctrlKey) {
            eventDispatcher.dispatch("keyboard/key/ctrl/" + name, e);
        }
        if (e.shiftKey) {
            eventDispatcher.dispatch("keyboard/key/shift/" + name);
        }
        if (e.altKey) {
            eventDispatcher.dispatch("keyboard/key/alt/" + name);
        }
    });  // keys

    document.querySelector(".tab-editor").addEventListener("mousedown", (e) => {
        e.preventDefault()
        eventDispatcher.dispatch("mouse/down", e);
    });  // click down

    document.querySelector(".tab-editor").addEventListener("mousemove", e => {eventDispatcher.dispatch("mouse/move", e)});  // pointer

    document.querySelector(".tab-editor").addEventListener("mousewheel", e => {eventDispatcher.dispatch("mouse/wheel", e)});  // pointer
}, false);


class Line {
    constructor(number, element, current=false){
        this.number = number;
        this.element = element;
        this.current = current;
        this.visible = true;
    }
    write(text, pos){
        var inner = this.element.textContent;
        this.element.textContent = inner.substring(0, pos) + text + inner.substring(pos);
        return inner.substring(0, pos) + text;
    }
    append(text){
        this.element.textContent += text;
    }
    setCurrent(value){
        this.current = value;
        if (value) {
            document.querySelector(".active-line").style.top = this.number * 20 - 20 + "px";
        }
    }
    deleteChar(index) {
        return this.deleteText(index, index+1);
    }
    deleteText(start, end) {
        var before = this.element.textContent.slice(0, start);
        var newHTML = before + this.element.textContent.slice(end);
        this.element.textContent = newHTML;
        return before;
    }
    empty() {
        return this.element.textContent == "";
    }
    text() {
        return this.element.textContent;
    }
    deleteLine () {
        document.querySelector(".editor-inner").removeChild(this.element);
    }

    static updateLineNumbersUp(index, lines, lineN){
        var gutter = document.querySelector(".editor-gutter");
        var toAddBefore = null;
        gutter.childNodes.forEach((el, i) => {
            if (i == index - 1) {toAddBefore = el;}
            if(i >= index - 1) {
                el.childNodes[0].textContent = i + 2;
                lines[i].element.id = "line-" + (i + 2);
                lines[i].number = i + 2;
            }
        });
        gutter.insertBefore(lineN, toAddBefore);
    }

    static updateLineNumbersDown(index, lines) {
        var gutter = document.querySelector(".editor-gutter");
        var toBeRemoved = null;
        gutter.childNodes.forEach((num, i) => {
            if(i == index - 1) {toBeRemoved=num;}
            if(i > index - 1) {
                num.textContent = i;
                lines[i].element.id = "line-" + i;
                lines[i].number = i;
            }
        });
        gutter.removeChild(toBeRemoved);
    }
}

cursor = {
    x: 0,
    y: 0,
    textPos: 0,
    vertMovementPos: null,
    blinkID: null,
    init: function () {this.startBlink(); this.getWidth('init');},
    startBlink: function () {this.blinkID = window.setInterval(()=>{switchAttr(document.querySelector(".tab-editor-cursor"), "hidden");}, 750);},
    stopBlink: function () {window.clearInterval(this.blinkID); this.blinkID = null;},
    cursor: function () {return document.querySelector(".tab-editor-cursor");},
    input: function () {return document.querySelector(".editor-input");},
    setPos: function (x, y) {
        eventDispatcher.dispatch("cursor/pos", x, y);
        selection.setCursorPrevPos(this.x, this.y);
        this.cursor().style.left = x+"px";
        this.cursor().style.top = y+"px";
        this.input().style.left = x+"px";
        this.input().style.top = y+"px";
        this.x = x;
        this.y = y;
        this.textPos = parseInt(x / this.getWidth("a"));
        this.input().focus();
        this.resetBlink();
        selection.update(x, y);
    },
    setText: function (text) {
        distance = this.getWidth(text);
        this.setPos(distance, this.y);
        this.textPos = text.length;
    },
    getWidth: function (text) {
        sizer = document.querySelector(".sizer");
        sizer.textContent = text;
        return parseInt(sizer.clientWidth);
    },
    changeLine: function (textA, textB, direction=-1) {
        eventDispatcher.dispatch("cursor/line-change", this.getWidth(textB), parseInt(this.y / 20), parseInt((this.y + 20 * direction) / 20));
        this.setPos(this.getWidth(textB), this.y + 20 * direction);
        this.textPos = textB.length;
    },
    moveApproxX: function (approxX, text) {
        var x = Math.round(approxX / this.getWidth("a"));
        if (x > text.length) {x = text.length;}
        this.textPos = x;
        this.setPos(x * this.getWidth("a"), this.y);
    },
    resetBlink: function () {
        this.cursor().removeAttribute("hidden");
        this.stopBlink();
        this.startBlink();
    },
    setVertMovementPos(newPos){
        this.vertMovementPos = Math.max(this.vertMovementPos, newPos);
    },
    getCtrlMovementNewPos: function (text, direction) {
        i = this.textPos;
        while (!BLOCK_CTRL_MOVEMENT.includes(text.charAt(i))) {
            if (i == this.textPos){}
            if (direction == 1 && i == text.length || direction == -1 && i == 0) {
                return i;
            }
            i += direction;
        }
        while (text.charAt(i) == text.charAt(i + direction)) i += direction;
        return direction == 1 ? i : i + 1;
    }
}

writer = {
    currentline: 1,
    lines: [],
    init: function () {
        this.lines.push(new Line(1, document.getElementById("line-1"), true));
    },
    writeText: function (text) {
        eventDispatcher.dispatch("writer/text", this.lines[this.currentline-1], text);
        if (selection.selectionActive) {
            this.deleteSelectionContent();
        }
        cursor.setText(this.lines[this.currentline - 1].write(text, cursor.textPos));
        eventDispatcher.dispatch("writer/change", this.lines[this.currentline - 1]);
    },
    writeLine: function () {
        if (selection.selectionActive) {
            this.deleteSelectionContent();
        }
        var prevline = this.lines[this.currentline - 1]
        prevline.setCurrent(false);
        var toMove = "";
        if (cursor.textPos < prevline.text().length) {
            toMove = prevline.text().slice(cursor.textPos);
            prevline.element.textContent = prevline.text().slice(0, cursor.textPos);
        }
        this.insertLine(++this.currentline);
        var line = this.lines[this.currentline - 1];
        line.setCurrent(true);
        line.append(toMove);
        cursor.changeLine(this.lines[this.currentline - 2].text(), "", direction=1);
        eventDispatcher.dispatch("writer/line", this.lines[this.currentline-1])
        eventDispatcher.dispatch("writer/change", this.lines[this.currentline-1])
    },
    insertLine: function (index) {
        line = document.createElement("div");
        line.className = "line";
        line.id = "line-" + index;
        var container = document.querySelector(".editor-inner");
        if (index == container.childNodes.length-1) {container.appendChild(line);}
        else {container.insertBefore(line, this.lines[index-1].element);}
        /* LINE NUMBER */
        var lineC = document.createElement("div");
        lineC.className = "tab-line";
        lineN = document.createElement("div");
        lineN.className = "tab-line-number";
        lineN.textContent = index;
        lineC.appendChild(lineN);
        var gutter = document.querySelector(".editor-gutter");
        if(index == gutter.childNodes.length + 1) {
            gutter.appendChild(lineC);
        }
        else {Line.updateLineNumbersUp(index, this.lines, lineC);}
        this.lines.splice(index-1, 0, new Line(this.currentline, line, true));
    },
    deletePrevChar: function (ctrlDown=false) {
        eventDispatcher.dispatch("writer/delete/prev", this.lines[this.currentline-1], ctrlDown);
        if (selection.selectionActive) {
            this.deleteSelectionContent();
            return eventDispatcher.dispatch("writer/change", this.lines[this.currentline]);
        }
        if(this.lines[this.currentline - 1].empty()) return this.deleteLine();
        else if(cursor.textPos == 0){
            if(this.currentline == 1) return;
            var text = this.lines[this.currentline - 1].text();
            this.deleteLine();
            cursor.textPos = this.lines[this.currentline - 1].text().length;
            this.lines[this.currentline - 1].append(text);
        }
        else {
            cursor.setText(this.lines[this.currentline - 1].deleteChar(cursor.textPos - 1));
        }
        eventDispatcher.dispatch("writer/change", this.lines[this.currentline - 1]);
    },
    deleteLine: function () {
        if(this.currentline == 1) return;
        this.lines[this.currentline - 1].deleteLine();
        // line number
        var lnums = document.querySelector(".editor-gutter");
        var toBeRemoved = null;
        Line.updateLineNumbersDown(this.currentline, this.lines);
        this.currentline--;
        cursor.changeLine(this.lines[this.currentline].text(), this.lines[this.currentline - 1].text());
        this.lines[this.currentline - 1].setCurrent(true);
        this.lines.splice(this.currentline, 1);

        eventDispatcher.dispatch("writer/delete/line", this.lines[this.currentline - 1]);
        eventDispatcher.dispatch("writer/change", this.lines[this.currentline - 1]);
    },
    deleteSpecificLine: function (ln) {
        if(ln == 1) return;
        var toMove = "";
        this.lines[ln-1].deleteLine();
        // line number
        var lnums = document.querySelector(".editor-gutter");
        var toBeRemoved = null;
        Line.updateLineNumbersDown(ln, this.lines);
        if (ln <= this.currentline) {
            this.currentline--;
            cursor.changeLine(this.lines[this.currentline-1].text(), this.lines[this.currentline-1].text());
            this.lines[this.currentline - 1].setCurrent(true);
        }
        // cursor.changeLine(this.lines[this.currentline].text(), this.lines[this.currentline-1].text());
        this.lines.splice(ln - 1, 1);
        eventDispatcher.dispatch("writer/delete/line", ln);
    },
    deleteSelectionContent: function () {
        var coords = selection.getLineCoords();
        var charLength = cursor.getWidth("a");
        var toBeDeleted = [];
        coords.reverse().forEach(([x, y, width], index) => {
            let line = this.lines[y / 20];
            let ind1 = x / charLength, ind2 = (width+x) / charLength;
            if (ind2 - ind1 > line.text().length) {
                if (line.number < this.lines.length) toBeDeleted.push(this.lines[line.number]);
            }
            cursor.setText(line.deleteText(ind1, ind2));
        });
        toBeDeleted.forEach(l => {
            if (l.text().length != 0) {
                this.lines[l.number - 2].append(l.text());
            }

            this.deleteSpecificLine(l.number);
        });
        cursor.setPos(selection.prevX, cursor.y)
        selection.cancel();
        eventDispatcher.dispatch("writer/delete/selection",)
    },
    moveCursorTo: function (x, line) {
        // TODO [delayed fix]: Fix bug that occurs when one click on the middle of a letter
        if (line > this.lines.length){line = this.lines.length;}
        if (line < 1) {line = 1;}
        this.lines[this.currentline - 1].setCurrent(false);
        this.currentline = line;
        this.lines[this.currentline - 1].setCurrent(true);
        cursor.setPos(cursor.x, line * 20 - 20)
        cursor.moveApproxX(x, this.lines[this.currentline - 1].text());
    },
    moveCursorVert: function (direction, ctrlDown=false) {
        if (this.currentline + direction == 0 || this.currentline + direction > this.lines.length){
             return cursor.resetBlink();
        }
        var firstline = this.lines[this.currentline - 1];

        firstline.setCurrent(false);
        this.currentline += direction;
        this.lines[this.currentline - 1].setCurrent(true);

        cursor.setVertMovementPos(cursor.textPos);
        textB = this.lines[this.currentline - 1].text().substring(0, cursor.vertMovementPos);
        cursor.setVertMovementPos(textB.length);
        cursor.changeLine(firstline.text(), textB, direction=direction);
        return true;
    },
    moveCursorHoriz: function (direction, ctrlDown=false) {
        var line = this.lines[this.currentline - 1];
        if (cursor.textPos + direction < 0){
            if(this.moveCursorVert(-1)) cursor.setText(this.lines[this.currentline - 1].text());
        }
        else if (cursor.textPos + direction > line.text().length){
            if(this.moveCursorVert(1)) cursor.setText("");
        }
        else {
            if (!ctrlDown) cursor.setText(line.text().slice(0, cursor.textPos + direction));
            else {
                cursor.setText(line.text().slice(0, cursor.getCtrlMovementNewPos(line.text(), direction)));
            }
        }
        cursor.vertMovementPos = null;
    },
    text () {
        return this.lines.map(x=>x.text()).join(" ");
    },
    setHTMLLinesContent (html) {

    }
}

selection = {
    startX: null,
    startY: null,
    prevX: null,
    prevY: null,
    currentX: null,
    currentY: null,
    selectionActive: false,

    startEl: function () {return document.querySelector(".selection-start");},
    middleEl: function () {return document.querySelector(".selection-middle");},
    endEl: function () {return document.querySelector(".selection-end");},

    setCursorPrevPos: function (x, y) {
        if (!this.selectionActive) {
            this.startX = x;
            this.startY = y;
        }
    },
    setActive: function (active) {this.selectionActive = active;},
    cancel: function () {
        this.selectionActive = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.prevX = null;
        this.prevY = null;
        this.redraw(0, 0);
    },
    update: function (x, y) {
        var sx = this.startX, sy = this.startY;
        if (y < sy || (y == sy && x < sx)) {
            [sx, sy, x, y] = [x, y, this.startX, this.startY];
        }
        if (this.selectionActive) {
            this.currentX = x;
            this.currentY = y;
            this.redraw(sx, sy);
        }
    },
    redraw: function (x, y) {
        this.prevX = x;
        this.prevY = y;
        const [[sx, sy, sw, sh], [mx, my, mw, mh], [ex, ey, ew, eh]] = this.getCoords();

        this.startEl().style.left = sx+"px";
        this.startEl().style.top = sy+"px";
        this.startEl().style.width = sw+"px";
        this.middleEl().style.left = mx+"px";
        this.middleEl().style.top = my+"px";
        this.middleEl().style.width = mw+"px";
        this.middleEl().style.height = mh+"px";
        this.endEl().style.left = ex+"px";
        this.endEl().style.top = ey+"px";
        this.endEl().style.width = ew+"px";
    },
    getCoords: function () {
        // return coords of the selection with format: [start, middle, end]
        // where each coord is formatted as so: [x, y, width, height]
        var sx = this.prevX, sy = this.prevY;
        var cx = this.currentX, cy = this.currentY;
        var lineCount = Math.floor((cy - sy) / 20) + 1;

        var lineWidth = size.getLineWidth();

        var coords = [[sx, sy, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

        if(lineCount == 1){
            coords[0][2] = cx - sx;
            coords[0][3] = 1;
        }
        else {
            coords[0][2] = lineWidth - sx
            coords[0][3] = 1;
        }
        if(lineCount > 1) {
            coords[2][0] = 0;
            coords[2][1] = cy;
            coords[2][2] = cx;
            coords[2][3] = 1;
        }
        if (lineCount > 2) {
            coords[1][0] = 0;
            coords[1][1] = sy + 20;
            coords[1][2] = lineWidth;
            coords[1][3] = 20 * (lineCount - 2);
        }
        return coords;
    },
    getLineCoords: function () {
        const [start, mid, end] = this.getCoords();
        const result = start[3] == 0 ? [] : [[start[0], start[1], start[2]]];

        for (let i = 0; i < mid[3] / 20; i++) {
            result.push([mid[0], i * 20 + mid[1], mid[2]]);
        }
        if (end[3] != 0) result.push([end[0], end[1], end[2]]);
        return result;
    },
    direction: function () {
        if (this.startY > cursor.y || (this.startY == cursor.y && this.startX > cursor.x)) {return -1;}
        return 1;
    }
}

scroll = {
    // TODO: bug when writing a character when line is hidden
    amount: 0,
    height: 20,
    onLineCountChange: function (count) {
        this.height = count * 20;

        var e = document.querySelector(".tab-editor");
        document.body.style.setProperty('--component-editor-layer-abs-height',
            this.height < e.clientHeight ? e.clientHeight + "px" : this.height+"px"
        );
    },
    onLineChange: function (last, new_) {
        var start = parseInt(-this.amount / 20);
        var maxLines = 10;
        if (new_ - start > maxLines || new_ - start < 0) {
            this.amount += 20 * (last - new_);
        }
        document.body.style.setProperty("--scroll", this.amount + "px");
    },
    onLineDelete: function (last, new_) {
        var start = parseInt(-this.amount / 20);
        var maxLines = 10;
        if (start != 0 && new_ - start < maxLines - 2) {
            this.amount += 20 * (last - new_);
        }
        document.body.style.setProperty("--scroll", this.amount + "px");
    },
    scrollAdd: function (delta) {
        delta = delta * -0.3;
        if (writer.lines.length < 12) return;
        if (this.amount + delta >= 0) {this.amount = 0;}
        else if (this.amount + delta < -writer.lines.length * 20 + 11 * 20) {this.amount = -writer.lines.length * 20 + 11 * 20;}
        else this.amount += delta;
        document.body.style.setProperty("--scroll", this.amount + "px");
    }
}
