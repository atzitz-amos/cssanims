

class RegexDefinition {
    type = "regex";
    constructor (name, regex) {
        this.name = name;
        this.regex = regex;
    }
}

class Definition {
    type = "definition";
    constructor (name, definition) {
        this.name = name;
        this.definition = definition;
    }
    getAllReferences() {
        return Definition._getAllReferences(this.definition);
    }

    static _getAllReferences(ctx) {
        var result = [];
        for (var i = 0; i < ctx.content.length; i++) {
            var el = ctx.content[i];
            if (el instanceof Context) {
                result = result.concat(this._getAllReferences(el));
            }
            if (el instanceof Definition || el instanceof ListDefinition || el instanceof RegexDefinition) {
                result.push(el.name);
            }
        }
        return result;
    }
}

class ListDefinition {
    type = "list";
    constructor (name, list) {
        this.name = name;
        this.list = list;
    }
}


class Context {
    static DEFAULT = "default";
    static OPTIONAL = "optional";
    static STRING = "string";
    static OR = "or";

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


class LanguageParser {
    static load(defs) {
        var defs = this.preload(defs);
        for (name in defs) {
            var def = defs[name];
            if (def instanceof Definition) {
                this._create_refs(def.definition, defs);
            }
        }
        return defs;
    }
    static preload (defs) {
        var result = {};
        for (var defname in defs) {
            var def = defs[defname];
            if (def.regex != undefined) {
                result[defname] = new RegexDefinition(defname, def.regex);
            }
            else if (def.definition != undefined) {
                var def = this.parseDef(def.definition);
                result[defname] = new Definition(defname, def.content.includes("|") ? this.parseOr(def) : def);
            }
            else if (def.list != undefined) {
                result[defname] = new ListDefinition(defname, def.list);
            }
            result[defname].refcount = 0;
        }
        return result;
    }
    static parseDef(def) {
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

        var indexes = findAllRegex(/\[|\]|\*|\+| |'/g, def)
        _parse(undefined, indexes[0]);
        for (var i = 0; i < indexes.length; i++) {
            _parse(indexes[i], indexes[i + 1]);
        }
        switch (ctx.type) {
            case Context.STRING:
                throw new Error("Syntax error: missing closing quote at _" + def.definition + "_");
            case Context.OPTIONAL:
                throw new Error("Syntax error: missing closing bracket at _" + def.definition + "_")
        }

        return ctx;
    }
    static _ref(element, defs) {
        if (!(element in defs)) {throw new Error(`Cannot create reference for element '${element}' because it's not defined`);}
        defs[element].refcount++;
        return defs[element];
    }
    static _create_refs (ctx, defs) {
        for (var i = 0; i < ctx.content.length; i++) {
            var element = ctx.content[i];
            if(element instanceof Context && element.type != Context.STRING) {
                this._create_refs(element, defs);
            }
            else if(typeof element == "string" && element != "|") {
                ctx.content[i] = this._ref(element, defs);
            }
        }
    }
    static parseOr(ctx) {
        function _(e) {
            if (e instanceof Context && e.type == Context.OPTIONAL) {return this.parseOr(e);}
            return e;
        }

        var chains = [], chain = [];
        ctx.content.split("|").forEach((el, i) => {
            var x = el.filter(e => e != Context.Space);
            if (x.length == 0) throw new Error("Syntax error");
            else if (x.length == 1){
                chain.push(_(x[0]));
            }
            else {
                chain.push(_(x[i == 0 ? x.length - 1 : 0]));
                chains = chains.concat(chain);
                chain = [];
            }
        });
        if (chain.length != 0) chains = chains.concat(chain);
        var start = ctx.content.indexOf(chains[0]);
        var end = ctx.content.indexOf(chains[chains.length-1], start);
        ctx.content = ctx.content.slice(0, start).concat(new Context(Context.OR, chains)).concat(ctx.content.slice(end+1));
        return ctx;
    }
}

async function _load(name) {
    var definition = await fetch("http://localhost:63342/cssanims/htmlEditor/templates/langs/lang-"+name+".json")
        .then(x=>x.json())
        .then(lang=>{
            return new Language(name, LanguageParser.load(lang.definitions));
        });
    return definition;
}


class Language {
    constructor(name, defs) {
        this.name = name;
        this.definitions = defs;
        this.def_list = [];
        this.topmost = [];
        for (var el in defs) {
            this.def_list.push(defs[el]);
            if (defs[el].refcount==0) this.topmost.push(defs[el]);
        }
    }
    toString() {
        return `<Language '${this.name}' definitions=${this.definitions}>`;
    }

    _create_chain(node) {
        function _(name, r, arr) {
            var result = [name];
            r.forEach(x=>{
                result = result.concat(_(x, arr[x], arr))
            });
            return result;
        }
        var reqs = {};
        for (var name in this.definitions) {
            if (this.definitions[name] instanceof Definition) reqs[name] = this.definitions[name].getAllReferences();
            else reqs[name] = [];
        }
        var chain = _(node, reqs[node], reqs);
        return [...new Set(chain)].reverse();
    }

    _label(text, name, labelled) {
        function _(name, el){
            if (!(name in labelled)) {
                labelled[name] = [];
            }
            labelled[name].push(el)
        }
        var def = this.definitions[name];
        if (def instanceof Definition) {
            var possible = null;
            def.definition.content.forEach(el => {
                if (el == Context.Space) {
                }
                else if (el instanceof Context) {
                }
                else if (el instanceof Definition || el instanceof ListDefinition || el instanceof Reference) {
                }
            });
        }
        else if (def instanceof ListDefinition) {
            def.list.forEach(el => {
                findAll(el, text).forEach(occ => _(def.name, [occ, occ + el.length, el, def.name]))
            });
        }
        else {
            [...text.matchAll(new RegExp(def.regex, "g"))].forEach(x=>{
                _(def.name, [x.index, x.index + x[0].length, x[0], def.name]);
            });
        }
        return labelled;
    }

    label(text) {
        for (var i=0; i<this.topmost.length; i++) {
            var node = this.topmost[i];
            if (node.type == "definition") {
                var chain = this._create_chain(node.name);
                var labelled = {};
                chain.forEach(x=>{
                    labelled = this._label(text, x, labelled);
                });
                console.log("ds", node.name, labelled);
            }
        }
    }
    identifyDefinition (text, definition) {

    }
    identifyList (text, list) {

    }
    identifyRegex (text, regex) {

    }

    static _loaded = {};
    static async fromLang (lang) {
        if (lang in this._loaded) return this._loaded[lang];
        this._loaded[lang] = await _load(lang);
        return this._loaded[lang];
    }
}