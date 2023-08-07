

// UTILS

function switchAttr(el, attr) {el.hasAttribute(attr) ? el.removeAttribute(attr) : el.setAttribute(attr, "");}

// END UTILS

window.onload = () => {
    document.getElementsByClassName("tree-open")[0].addEventListener(
        "click",
        (e) => {switchAttr(document.getElementsByClassName("tree")[0], "hidden");}
    );
    document.querySelectorAll(".tree-node-title").forEach(x=>{x.addEventListener("click", (e) => {switchAttr(x.parentElement, "open")})});

    cursor.init();
    writer.init();

    document.querySelector(".editor-input").addEventListener("input", (e) => {
        writer.writeText(e.data)
        e.target.value = "";
    });  // input

    document.querySelector(".editor-input").addEventListener("keydown", (e) => {
        switch (e.key) {
            case "Backspace":
                writer.deletePrevChar();
                break;
            case "Enter":
                writer.writeLine();
                break;
            case "ArrowLeft":
                if (e.shiftKey) {selection.moveHoriz(-1);}
                writer.moveCursorHoriz(-1);
                break;
            case "ArrowRight":
                if (e.shiftKey) {selection.moveHoriz(1);}
                writer.moveCursorHoriz(1);
                break;
            case "ArrowUp":
                if (e.shiftKey) {selection.moveVert(-1);}
                writer.moveCursorVert(-1);
                break;
            case "ArrowDown":
                if (e.shiftKey) {selection.moveVert(-1);}
                writer.moveCursorVert(1);
                break;
        }
    });  // keys

    document.querySelector(".tab-editor").addEventListener("click", (e) => {
        var rect = document.querySelector("#line-1").getBoundingClientRect();
        var x = e.x - rect.x; var y = e.y - rect.y;
        const line = Math.ceil(y / 20);
        writer.moveCursorTo(x, line);
    });  // pointer
};


class Line {
    constructor(number, element, current=false){
        this.number = number;
        this.element = element;
        this.current = current;
    }
    write(text, pos){
        var inner = this.element.innerHTML;
        this.element.innerHTML = inner.substring(0, pos) + text + inner.substring(pos);
        return inner.substring(0, pos) + text;
    }
    append(text){
        this.element.innerHTML += text;
    }
    setCurrent(value){
        this.current = value;
        if (value) {this.element.classList.add("current-line");}
        else {this.element.classList.remove("current-line")}
    }
    deleteChar(index) {
        var before = this.element.innerHTML.slice(0, index);
        var newHTML = before + this.element.innerHTML.slice(index+1);
        this.element.innerHTML = newHTML; this.element.innerHTML;
        return before;
    }
    empty() {
        return this.element.innerHTML == "";
    }
    text() {
        return this.element.innerHTML;
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
                el.innerHTML = i + 2;
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
                num.innerHTML = i;
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
    init: function () {this.startBlink();},
    startBlink: function () {this.blinkID = window.setInterval(()=>{switchAttr(document.querySelector(".tab-editor-cursor"), "hidden");}, 750);},
    stopBlink: function () {window.clearInterval(this.blinkID); this.blinkID = null;},
    cursor: function () {return document.querySelector(".tab-editor-cursor");},
    input: function () {return document.querySelector(".editor-input");},
    setPos: function (x, y) {
        this.cursor().style.left = x+"px";
        this.cursor().style.top = y+"px";
        this.input().style.left = x+"px";
        this.input().style.top = y+"px";
        this.x = x;
        this.y = y;
        this.input().focus();
        this.resetBlink();
    },
    setText: function (text) {
        distance = this.getWidth(text);
        this.setPos(distance, this.y);
        this.textPos = text.length;
    },
    getWidth: function (text) {
        sizer = document.querySelector(".sizer");
        sizer.innerHTML = text;
        return parseInt(window.getComputedStyle(sizer).width.slice(0, -2));
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
    writeText: function (text) {cursor.setText(this.lines[this.currentline - 1].write(text, cursor.textPos));},
    writeLine: function () {
        var prevline = this.lines[this.currentline - 1]
        prevline.setCurrent(false);
        var toMove = "";
        if (cursor.textPos < prevline.text().length) {
            toMove = prevline.text().slice(cursor.textPos);
            prevline.element.innerHTML = prevline.text().slice(0, cursor.textPos);
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
        lineN.innerHTML = index;
        if(this.currentline >= 10) {lineN.style.marginRight = "2px";}
        var lineC = document.querySelector(".tab-lines");
        if(index == lineC.childNodes.length + 1) {lineC.appendChild(lineN);}
        else {Line.updateLineNumbersUp(index, this.lines, lineN);}
        this.lines.splice(index-1, 0, new Line(this.currentline, line, true));
    },
    deletePrevChar: function () {
        if(this.lines[this.currentline - 1].empty()) return this.deleteLine();
        else if(cursor.textPos == 0){
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

        this.lines.splice(this.lines.indexOf(this.lines[this.currentline]), 1);
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
        if (this.currentline + direction == 0 || this.currentline + direction > this.lines.length) return;
        var firstline = this.lines[this.currentline - 1];

        firstline.setCurrent(false);
        this.currentline += direction;
        this.lines[this.currentline - 1].setCurrent(true);

        cursor.setVertMovementPos(cursor.textPos);
        textB = this.lines[this.currentline - 1].text().substring(0, cursor.vertMovementPos);
        cursor.setVertMovementPos(textB.length);
        cursor.changeLine(firstline.text(), textB, direction=direction);
    },
    moveCursorHoriz: function (direction) {
        var line = this.lines[this.currentline - 1];
        if (cursor.textPos + direction < 0){
            this.moveCursorVert(-1);
            cursor.setText(this.lines[this.currentline - 1].text());
        }
        else if (cursor.textPos + direction > line.text().length){
            this.moveCursorVert(1);
            cursor.setText("");
        }
        else {cursor.setText(line.text().slice(0, cursor.textPos + direction));}
        cursor.vertMovementPos = null;
    }
}

selection = {
    selectionStartX: null,
    selectionStartY: null,
    selectionActive: false,

    startEl: function () {return document.querySelector("selection-start");}
    middleEl: function () {return document.querySelector("selection-middle");}
    endEl: function () {return document.querySelector("selection-end");}

    start: function (x, y) {
        this.selectionStartX = x;
        this.selectionStartY = y;
        this.selectionActive = true;
        this.startEl().style.left = x;
        this.startEl().style.top = y;
    },
    moveHoriz: function (direction) {
        if (!selectionActive) {
            start(cursor.x, cursor.y);
        }
        this.expand(direction);
    },
    expand: function (direction) {
        if (direction == -1){

        }
    }
}