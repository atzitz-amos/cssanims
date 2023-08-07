

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
    });

    document.querySelector(".editor-input").addEventListener("keydown", (e) => {
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
        }
    });

    document.querySelector(".tab-editor").addEventListener("click", (e) => {
        var rect = document.querySelector("#line-1").getBoundingClientRect();
        var x = e.x - rect.x; var y = e.y - rect.y;
        const line = Math.ceil(y / 20);
        writer.moveCursorTo(x, line);
    });
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
}

cursor = {
    x: 0,
    y: 0,
    textPos: 0,
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
    changeLine: function (text, direction=-1) {
        this.setPos(this.getWidth(text), this.y + 20 * direction);
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
}

writer = {
    currentline: 1,
    lines: [],
    init: function () {
        this.lines.push(new Line(1, document.getElementById("line-1"), true));
    },
    writeText: function (text) {cursor.setText(this.lines[this.currentline - 1].write(text, cursor.textPos));},
    writeLine: function () {
        // TODO: implement writeLine() when cursor not at end of line
        this.lines[this.currentline - 1].setCurrent(false);
        if (this.lines.length > this.currentline){
            this.currentline++;
        }
        else{
            this.currentline++;
            line = document.createElement("div");
            line.className = "line current-line";
            line.id = "line-" + this.currentline;
            document.querySelector(".editor-inner").appendChild(line);
            linenumber = document.createElement("div");
            linenumber.className = "tab-line-number";
            linenumber.innerHTML = this.currentline;
            if(this.currentline >= 10) {linenumber.style.marginRight = "2px";}
            document.querySelector(".tab-lines").appendChild(linenumber);
            this.lines.push(new Line(this.currentline, line, true));
        }
        cursor.changeLine(this.lines[this.currentline - 1].text(), direction=1);
        this.lines[this.currentline - 1].setCurrent(true);
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
        this.lines.splice(this.lines.indexOf(this.lines[this.currentline - 1]), 1);
        // line number
        var lnums = document.querySelector(".tab-lines");
        var toBeRemoved = null;
        lnums.childNodes.forEach((num, index) => {
            if(index == this.currentline - 1) {toBeRemoved=num;}
            if(index > this.currentline - 1) {num.innerHTML = parseInt(num.innerHTML) - 1;}
        });
        lnums.removeChild(toBeRemoved);
        this.currentline--;
        cursor.changeLine(this.lines[this.currentline - 1].text());
        this.lines[this.currentline - 1].setCurrent(true);
    },
    moveCursorTo: function (x, line) {
        // TODO: Fix bug that occurs when one click on the middle of a letter
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
        this.lines[this.currentline - 1].setCurrent(false);
        this.currentline += direction;
        this.lines[this.currentline - 1].setCurrent(true);
        cursor.changeLine(this.lines[this.currentline - 1].text(), direction=direction);
    },
    moveCursorHoriz: function (direction) {
        var line = this.lines[this.currentline - 1];
        if (cursor.textPos + direction < 0){
            return this.moveCursorVert(-1);
        }
        else if (cursor.textPos + direction > line.text().length){
            return this.moveCursorVert(1);
        }
        cursor.setText(line.text().slice(0, cursor.textPos + direction));
    }
}