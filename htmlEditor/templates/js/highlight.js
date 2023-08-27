
class RegexDefinition {
    constructor (name, regex) {
        this.name = name;
        this.regex = regex;
    }
}

class Definition {
    constructor (name, definition) {
        this.name = name;
        this.definition = definition;
    }
}

class ListDefinition {
    constructor (name, list) {
        this.name = name;
        this.list = list;
    }
}

function preload (defs) {
    var result = {};
    for (var defname in defs) {
        var def = defs[defname];
        if (def.regex != undefined) {
            result[defname] = new RegexDefinition(defname, def.regex);
        }
        else if (def.definition != undefined) {
            result[defname] = new Definition(defname, parseDef(def.definition));
        }
        else if (def.list != undefined) {
            result[defname] = new ListDefinition(defname, def.list);
        }
        result[defname].refcount = 0;
    }
    console.log(result);
    return result;
}

class Context {
    static DEFAULT = "default";
    static OPTIONAL = "optional";
    static STRING = "string";

    static Space = new Object(); // sentinel object to indicate space

    constructor (type, content = null) {
        this.type = type;
        this.content = content == null ? [] : content;
        this.children = [];
        this.parent = null;
        this.closed = false;

        this.mod_multiple = false;
    }
    nested (other) {
        this.children.push(other);
        this.content.push(other);
        other.parent = this;
        return other;
    }
    add (text) {
        if (text == "") return;
        this.content.push(text);
    }
    close () {
        this.closed = true;
        return this.parent;
    }
    multiple () {
        this.mod_multiple = true;
        return this;
    }
}


function parseDef(def) {
    var parts = [];
    var lastI = 0;
    var ctx = new Context(Context.DEFAULT);

    function _parse(start, end) {
        if (start != undefined) {
            var char = def.charAt(start);
            var part = end == undefined ? def.substring(start+1) : def.substring(start+1, end);
            var nospace = false;
        }
        else {
            var char = " ";
            var part = def.substring(0, end)
            var nospace = true;
        }
        if (ctx.type == "string" && char != "'") {
            return ctx.add(char);
        }
        // console.log(def, "§" + part + "§", "<" + char + ">")
        if (char == "'") {
            if (ctx.type == Context.STRING) {
                ctx = ctx.close();
            }
            else {
                ctx = ctx.nested(new Context(Context.STRING));
            }
        }
        else if (char == "[") {
            ctx = ctx.nested(new Context(Context.OPTIONAL));
        }
        else if (char == "]") {
            if (ctx.type != Context.OPTIONAL) throw new Error("Syntax error, closing bracket without corresponding opening one");
            ctx = ctx.close();
        }
        else if (char == " ") {
            if (!nospace) ctx.add(Context.Space);
        }
        else if (char == "+") {
            var last = ctx.content[ctx.content.length - 1];
            ctx.content[ctx.content.length - 1] = last instanceof Context ? last.multiple() : new Context(Context.DEFAULT, [last]).multiple();
        }
        else if (char == "*") {
            var last = ctx.content[ctx.content.length - 1];
            if (!(last instanceof Context) || last.type != Context.OPTIONAL) {
                last = new Context(Context.OPTIONAL, [last]);
            }
            ctx.content[ctx.content.length - 1] = last.multiple();
        }
        ctx.add(part);
    }

    var indexes = findAll(/\[|\]|\*|\+| |'/g, def)
    _parse(undefined, indexes[0]);
    for (var i = 0; i < indexes.length; i++) {
        _parse(indexes[i], indexes[i + 1]);
    }
    if (ctx.content.includes("|")) {
        ctx.content.split("|").forEach((el, i) => {
            console.log(el.first(x=>x!=Context.Space), i);
        });
    }

    switch (ctx.type) {
        case Context.STRING:
            throw new Error("Syntax error: missing closing quote at _" + def.definition + "_");
        case Context.OPTIONAL:
            throw new Error("Syntax error: missing closing bracket at _" + def.definition + "_")
    }

    return ctx;
}

function _ref(element, defs) {
    if (!(element in defs)) {throw new Error(`Cannot create reference for element '${element}' because it's not defined`);}
    defs[element].refcount++;
    return defs[element];
}

function _create_refs (ctx, defs) {
    for (var i = 0; i < ctx.content.length; i++) {
        var element = ctx.content[i];
        if(element instanceof Context && element.type != Context.STRING) {
            _create_refs(element, defs);
        }
        else if(typeof element == "string" && element != "|") {
            ctx.content[i] = _ref(element, defs);
        }
    }
}


function loaddefs(defs) {
    var defs = preload(defs);
    for (name in defs) {
        var def = defs[name];
        if (def instanceof Definition) {
            _create_refs(def.definition, defs);
        }
    }
}

function _load(name) {
    fetch("http://localhost:63342/cssanims/htmlEditor/templates/langs/lang-"+name+".json")
        .then(x=>x.json())
        .then(lang=>{
            var definition = loaddefs(lang.definitions);
        });
}


class Formatter {
    static _loaded = {};
    static fromLang (lang) {
        console.log(this);
        if (lang in this._loaded) return this._loaded[lang];
        this._loaded[lang] = _load(lang);
        return this._loaded[lang];
    }
}


eventDispatcher.listen("writer/change", line => {
    if (line == undefined) return;
    var formatter = Formatter.fromLang("css");  // TODO: change to tab language
});