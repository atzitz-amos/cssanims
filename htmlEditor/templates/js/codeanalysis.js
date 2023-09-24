
class Bracket {
    static OPEN = "opening-bracket";
    static CLOSE = "closing-bracket";

    constructor (char, index, line, type) {
        this.char = char;
        this.index = index;
        this.line = line;
        this.type = type;
    }

    isEqual (other) {
        return other.char === this.char && other.index === this.index && other.line === this.line && other.type === this.type
    }
}

class Code {
    constructor () {
        this.raw = "";
        this.reset();
    }
    reset() {
        this.open_brackets = [];
        this.brackets = [];
    }

    static _INSTANCE = new Code();

    static current () {
        return this._INSTANCE;
    }
}


function handleSpan (span, line) {

    var [start, end, label, opts] = span;
    if (label == Bracket.OPEN) {
        Code.current().open_brackets.push(new Bracket(end == -1 ? line.text().substring(start) : line.text().substring(start, end), start, line, Bracket.OPEN))
    }
    else if (label == Bracket.CLOSE) {
        var last = Code.current().open_brackets.pop();
        let bracket = new Bracket(end == -1 ? line.text().substring(start) : line.text().substring(start, end), start, line, Bracket.CLOSE);
        bracket.linkedTo = last;
        Code.current().brackets.push(last);
        Code.current().brackets.push(bracket);
    }
}


eventDispatcher.listen("writer/change", function (line) {
    Code.current().reset();
    Language.current().then(x=>x.label(line.text())).then(code => {
        code.forEach(span => {
            handleSpan(span, line);
        });
    });
});