
// DYNAMIC SIZING

function updateDynamicSizing() {
    var screenW = screen.width, screenH = screen.height;
    var body = document.body;
    body.style.setProperty("--component-editor-abs-height", "40vh");
    body.style.setProperty("--component-editor-abs-width", "94vw");

    body.style.setProperty("--component-line-abs-height", "20px");
    var t = document.querySelector(".tab-editor")
    body.style.setProperty("--component-line-abs-width", t.clientWidth - 5 + "px");
}

size = {
    getLineWidth: function () {
        var lineWidth = document.body.style.getPropertyValue("--component-line-abs-width");
        return parseInt(lineWidth.substring(0, lineWidth.length-2));
    }
}

// END DYNAMIC SIZING

// UTILS

function switchAttr(el, attr) {el.hasAttribute(attr) ? el.removeAttribute(attr) : el.setAttribute(attr, "");}

clickRegister = {
    lastClickTimestamp: null,
    isClicked: false,
    register: function () {
        this.isClicked = true;
        this.lastClickTimestamp = (new Date()).getTime();
    },
    release: function () {
        this.isClicked = false;
        this.lastClickTimestamp = null;
    },
    sinceClick: function () {
        return (new Date()).getTime() - this.lastClickTimestamp;
    }
}

// END UTILS

window.onload = () => {
    document.getElementsByClassName("tree-open")[0].addEventListener(
        "click",
        (e) => {switchAttr(document.getElementsByClassName("tree")[0], "hidden");}
    );
    document.querySelectorAll(".tree-node-title").forEach(x=>{x.addEventListener("click", (e) => {switchAttr(x.parentElement, "open")})});

    cursor.init();
    writer.init();

    updateDynamicSizing();
    window.addEventListener("resize", ev=>updateDynamicSizing());

    document.querySelector(".editor-input").addEventListener("input", (e) => {
        writer.writeText(e.data)
        e.target.value = "";
    });  // input

    document.querySelector(".editor-input").addEventListener("keydown", (e) => {
        selection.setCursorPrevPos(cursor.x, cursor.y);
        if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'End', 'Home'].includes(e.code)) {
            if(e.shiftKey) selection.setActive(true);
            else if (selection.selectionActive){
                selection.cancel();
                if (['ArrowLeft', 'ArrowRight'].includes(e.code)) return;
            }
        }
        switch (e.key) {
            case "Backspace":
                writer.deletePrevChar();
                break;
            case "Enter":
                writer.writeLine();
                break;
            case "ArrowLeft":
                writer.moveCursorHoriz(-1);
                break;
            case "ArrowRight":
                writer.moveCursorHoriz(1);
                break;
            case "ArrowUp":
                writer.moveCursorVert(-1);
                break;
            case "ArrowDown":
                writer.moveCursorVert(1);
                break;
            case "Tab":
                writer.writeText("\t")
                e.preventDefault();
                break;
            case "Home":
                cursor.setText("");
                break;
            case "End":
                cursor.setText(writer.lines[writer.currentline-1].text());
        }
    });  // keys

    document.querySelector(".tab-editor").addEventListener("mousedown", (e) => {
        e.preventDefault()
        selection.setCursorPrevPos(cursor.x, cursor.y);
        if (e.shiftKey) selection.setActive(true);
        else selection.cancel();

        var rect = document.querySelector("#line-1").getBoundingClientRect();
        var x = e.x - rect.x; var y = e.y - rect.y;
        const line = Math.ceil(y / 20);
        writer.moveCursorTo(x, line);

        clickRegister.register();
    });  // click down

    document.querySelector(".tab-editor").addEventListener("mouseup", (e) => {clickRegister.release();}) // click up

    document.querySelector(".tab-editor").addEventListener("mousemove", e => {
        if(e.buttons == 1){
            if(!selection.selectionActive) selection.setCursorPrevPos(cursor.x, cursor.y);
            selection.setActive(true);
            var rect = document.querySelector("#line-1").getBoundingClientRect();
            var x = e.x - rect.x; var y = e.y - rect.y;
            const line = Math.ceil(y / 20);
            writer.moveCursorTo(x, line);
        }
    });  // pointer
};


class Line {
    constructor(number, element, current=false){
        this.number = number;
        this.element = element;
        this.current = current;
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
        var lineC = document.querySelector(".tab-lines");
        var toAddBefore = null;
        lineC.childNodes.forEach((el, i) => {
            if (i == index - 1) {toAddBefore = el;}
            if(i >= index - 1) {
                el.textContent = i + 2;
                lines[i].element.id = "line-" + (i + 2);
                lines[i].number = i + 2;
            }
        });
        lineC.insertBefore(lineN, toAddBefore);
    }

    static updateLineNumbersDown(index, lines) {
        var lineC = document.querySelector(".tab-lines");
        var toBeRemoved = null;
        lineC.childNodes.forEach((num, i) => {
            if(i == index - 1) {toBeRemoved=num;}
            if(i > index - 1) {
                num.textContent = i;
                lines[i].element.id = "line-" + i;
                lines[i].number = i;
            }
        });
        lineC.removeChild(toBeRemoved);
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
        selection.setCursorPrevPos(this.x, this.y);
        this.cursor().style.left = x+"px";
        this.cursor().style.top = y+"px";
        this.input().style.left = x+"px";
        this.input().style.top = y+"px";
        this.x = x;
        this.y = y;
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
        this.setPos(this.getWidth(textB), this.y + 20 * direction);
        this.textPos = textB.length;
    },
    moveApproxX: function (approxX, text) {
        var minDistance = null;
        var bestWidth = 0;
        for (var i=0; i<text.length+1; i++) {
            let width = this.getWidth(text.substring(0, i));
            if(minDistance < 0) break;
            if (minDistance == null || approxX - width < minDistance) {
                minDistance = approxX - width;
                bestWidth = width;
            }
        }
        this.textPos = i-1;
        this.setPos(bestWidth, this.y);
    },
    resetBlink: function () {
        this.cursor().removeAttribute("hidden");
        this.stopBlink();
        this.startBlink();
    },
    setVertMovementPos(newPos){
        this.vertMovementPos = Math.max(this.vertMovementPos, newPos);
    }
}

writer = {
    currentline: 1,
    lines: [],
    init: function () {
        this.lines.push(new Line(1, document.getElementById("line-1"), true));
    },
    writeText: function (text) {
        if (selection.selectionActive) {
            this.deleteSelectionContent();
            selection.cancel();
        }
        cursor.setText(this.lines[this.currentline - 1].write(text, cursor.textPos));
    },
    writeLine: function () {
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
    },
    insertLine: function (index) {
        line = document.createElement("div");
        line.className = "line";
        line.id = "line-" + index;
        var container = document.querySelector(".editor-inner");
        if (index == container.childNodes.length-1) {container.appendChild(line);}
        else {container.insertBefore(line, this.lines[index-1].element);}
        /* LINE NUMBER */
        lineN = document.createElement("div");
        lineN.className = "tab-line-number";
        lineN.textContent = index;
        if(this.currentline >= 10) {lineN.style.marginRight = "2px";}
        var lineC = document.querySelector(".tab-lines");
        if(index == lineC.childNodes.length + 1) {lineC.appendChild(lineN);}
        else {Line.updateLineNumbersUp(index, this.lines, lineN);}
        this.lines.splice(index-1, 0, new Line(this.currentline, line, true));
    },
    deletePrevChar: function () {
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
    },
    deleteLine: function () {
        if(this.currentline == 1) return;
        this.lines[this.currentline - 1].deleteLine();
        // line number
        var lnums = document.querySelector(".tab-lines");
        var toBeRemoved = null;
        Line.updateLineNumbersDown(this.currentline, this.lines);
        this.currentline--;
        cursor.changeLine(this.lines[this.currentline].text(), this.lines[this.currentline - 1].text());
        this.lines[this.currentline - 1].setCurrent(true);

        this.lines.splice(this.currentline, 1);
    },
    deleteSpecificLine: function (ln) {
        if(ln == 1) return;
        this.lines[ln-1].deleteLine();
        // line number
        var lnums = document.querySelector(".tab-lines");
        var toBeRemoved = null;
        Line.updateLineNumbersDown(ln, this.lines);
        if (ln <= this.currentline) {
            this.currentline--;
            this.lines[this.currentline - 1].setCurrent(true);
        }
        // cursor.changeLine(this.lines[this.currentline].text(), this.lines[this.currentline-1].text());
        this.lines.splice(ln - 1, 1);
    },
    deleteSelectionContent: function () {
        var coords = selection.getLineCoords().reverse();
        var charLength = cursor.getWidth("a");
        var toBeDeleted = [];
        coords.forEach(([x, y, width], index) => {
            let line = this.lines[y / 20];
            let ind1 = x / charLength, ind2 = (width+x) / charLength;
            cursor.setText(line.deleteText(ind1, ind2));
            if (ind1 == 0 && ind2 >= line.text().length-1) toBeDeleted.push(line);
        });
        toBeDeleted.forEach(l=>this.deleteSpecificLine(l.number));
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
    moveCursorVert: function (direction) {
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
    moveCursorHoriz: function (direction) {
        var line = this.lines[this.currentline - 1];
        if (cursor.textPos + direction < 0){
            if(this.moveCursorVert(-1)) cursor.setText(this.lines[this.currentline - 1].text());
        }
        else if (cursor.textPos + direction > line.text().length){
            if(this.moveCursorVert(1)) cursor.setText("");
        }
        else {cursor.setText(line.text().slice(0, cursor.textPos + direction));}
        cursor.vertMovementPos = null;
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
        console.log(result);
        return result;
    }
}