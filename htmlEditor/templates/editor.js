

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
        if (e.key == "Backspace") {
            writer.deletePrevChar();
        }
        else if (e.key == "Enter") {
            writer.writeLine();
        }
    });

    var rect = document.querySelector("#line-1").getBoundingClientRect();
    document.querySelector(".tab-editor").addEventListener("click", (e) => {
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
        console.log(pos, inner, inner.substring(0, pos+2));
        return inner.substring(0, pos) + text;
    }
    setCurrent(value){
        this.current = value;
        if (value) {this.element.classList.add("current-line");}
        else {this.element.classList.remove("current-line")}
    }
    deleteChar(index) {
        var last = this.element.innerHTML.charAt(index);
        var newHTML = this.element.innerHTML.slice(0, index) + this.element.innerHTML.slice(index+1);
        this.element.innerHTML = newHTML;
        return last;
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
    },
    moveLetter: function (letter, backward=false) {
        sizer = document.querySelector(".sizer");
        sizer.innerHTML = letter;;
        let distance = parseInt(window.getComputedStyle(sizer).width.slice(0, -2));
        if (backward){
            distance = -distance;
        }
        this.setPos(this.x + distance, this.y);
    },
    setLetter: function (text, backward=false) {
        distance = this.getWidth(text);
        if (backward){
            distance = -distance;
        }
        this.setPos(distance, this.y);
        this.textPos = text.length * (backward ? -1 : 1);
    },
    changeLine: function () {
            this.setPos(0, this.y + 20);
    },
    getWidth: function (text) {
        sizer = document.querySelector(".sizer");
        sizer.innerHTML = text;
        return parseInt(window.getComputedStyle(sizer).width.slice(0, -2));
    },
    upLine: function (text) {
        this.setPos(this.getWidth(text), this.y - 20);
    },
    moveApproxX: function (approxX, text) {
        var minDistance = null;
        var bestWidth = 0;
        for (var i=0; i<text.length; i++) {
            let width = this.getWidth(text.substring(0, i+1));
            if(minDistance < 0) break;
            if (minDistance == null || approxX - width < minDistance) {
                minDistance = approxX - width;
                bestWidth = width;
            }
        }
        this.textPos = i;
        console.log(this.textPos)
        this.setPos(bestWidth, this.y);
        this.resetBlink();
    },
    resetBlink: function () {
        this.cursor().removeAttribute("hidden");
        this.stopBlink();
        this.startBlink();
    }
}

writer = {
    currentline: 1,
    lines: [],
    init: function () {
        this.lines.push(new Line(1, document.getElementById("line-1"), true));
    },
    writeText: function (text) {cursor.setLetter(this.lines[this.currentline - 1].write(text, cursor.textPos));},
    writeLine: function () {
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
        cursor.changeLine();
        this.lines[this.currentline - 1].setCurrent(true);
    },
    deletePrevChar: function () {
        if(this.lines[this.currentline - 1].empty()){
            return this.deleteLine();
        }
        cursor.moveLetter(this.lines[this.currentline - 1].deleteChar(cursor.textPos), true);
    },
    deleteLine: function () {
        if(this.currentline == 1) return;
        this.lines[this.currentline - 1].deleteLine();
        this.lines.splice(this.lines.indexOf(this.lines[this.currentline - 1]), 1);
        // line number
        var lnums = document.querySelector(".tab-lines");
        lnums.childNodes.forEach((num, index) => {
            if(index == this.currentline - 1) {lnums.removeChild(num);}
            if(index >= this.currentline) {num.innerHTML = parseInt(num.innerHTML) - 1;}
        });
        this.currentline--;
        cursor.upLine(this.lines[this.currentline - 1].text());
        this.lines[this.currentline - 1].setCurrent(true);
    },
    moveCursorTo: function (x, line) {
        if (line > this.lines.length){line = this.lines.length;}
        if (line < 1) {line = 1;}
        this.lines[this.currentline - 1].setCurrent(false);
        this.currentline = line;
        this.lines[this.currentline - 1].setCurrent(true);
        cursor.setPos(cursor.x, line * 20 - 20)
        cursor.moveApproxX(x, this.lines[this.currentline - 1].text());
    }
}