

class MatchFailure extends Error {
    constructor() {
        super();
        this.name = "MatchFailure";
    }
}


class RegexDefinition {
    type = "regex";
    constructor (name, regex) {
        this.name = name;
        this.regex = regex;
    }
}


class Node {
    static START = "start";
    static START_INDENT = "start_indent";
    static SPACING = "spacing";
    static LITERAL = "literal";
    static REGEX = "regex";
    static LIST = "list";
    static FORK = "fork";
    static REJOIN = "rejoin";
    static TBR = "toBeReplaced";
    static END_INDENT = "end_indent";
    static END = "end";


    static _counter = 0;

    constructor (type, content=null, parent=null, children=null) {
        this.type = type;
        this.content = content;
        this.parent = parent;
        this.children = children == null ? [] : children;
        this.id = Node._counter++;

        this.name = null;

        if(parent != null && type != Node.REJOIN) {
            parent.children.push(this);
        }
    }
}

class Definition {
    static _nodes_cache = {};
    static _nodes_recursive_cache = {};

    type = "definition";
    constructor (name, definition) {
        this.name = name;
        this.definition = definition;
    }
    getAllReferences() {
        return Definition._getAllReferences(this.definition);
    }
    static _replace_tbr(node) {
        for (var i=0; i < node.children.length; i++) {
            if (node.children[i].type == Node.TBR) {
                var name = node.children[i].content[0];
                var start_node = new Node(Node.START_INDENT, [name], null);
                start_node.parent = nd;
                

                node.children[i] = this._nodes_recursive_cache[name];
            }
            else node.children[i] = this._replace_tbr(node.children[i]);
        }
        return node;
    }
    static _create_nodes(def, parent=null, name=null) {
        var nd = (parent == null ? new Node(Node.START, [name]): parent);
        var start = nd;
        var rejoin = null;
        if (nd.type == Node.REJOIN) {
            rejoin = nd.content;
            nd = nd.parent;
        }
        if (def instanceof Context) {
            switch(def.type) {
                case "string":
                    if (def.content[0].length > 1) {
                        for (var el of def.content[0].split("")) {
                            nd = this._create_nodes(new Context(Context.STRING, el), nd, name);
                        }
                    }
                    else {
                        nd = new Node(Node.LITERAL, def.content[0], nd);
                    }
                    break;
                case "or":
                    nd = new Node(Node.FORK, null, nd);
                    var nd_list = [];
                    for (var i = 0; i < def.content.length; i++) {
                        nd_list.push(this._create_nodes(def.content[i], nd, name));
                    }
                    nd = new Node(Node.REJOIN, nd_list, nd);
                    break;
                case "optional":
                    var nd = new Node(Node.FORK, null, nd);
                    var new_nd = nd;
                    for (var i = 0; i < def.content.length; i++) {
                        new_nd = this._create_nodes(def.content[i], new_nd, name)
                    }
                    if (def.mod_multiple) {
                        new_nd = new Node(Node.FORK, null, new_nd, [nd])
                    }
                    nd = new Node(Node.REJOIN, [new_nd], nd);
                    break;
                case "default":
                    for (var i = 0; i < def.content.length; i++) {
                        nd = this._create_nodes(def.content[i], nd, name)
                    }
                    break;
            }
        }
        else if (def instanceof Definition) {
            /*if (def.name in this._nodes_recursive_cache) {
                nd = new Node(Node.TBR, [def.name], nd);
            } else {
                var last_nd = new Node(Node.START, [def.name], nd);
                last_nd.options = def.options;
                this._nodes_recursive_cache[def.name] = last_nd;

                nd = this._create_nodes(def.definition, last_nd, def.name);


                if (nd.type == Node.REJOIN) {
                    rejoin = nd.content;
                    nd = null;
                }
                nd = new Node(Node.END, [def.name], nd);
                name = null;
            }*/
            var last_nd = new Node(Node.START, [def.name], nd);
            last_nd.options = def.options;

            nd = this._create_nodes(def.definition, last_nd, def.name);

            if (nd.type == Node.REJOIN) {
                rejoin = nd.content;
                nd = null;
            }
            nd = new Node(Node.END, [def.name], nd);
            name = null;
        }
        else if (def instanceof ListDefinition) {
            nd = new Node(Node.START, [def.name], nd);
            nd.options = def.options;
            nd = new Node(Node.LIST, def.list, nd);
            if (nd.type == Node.REJOIN) {
                rejoin = nd.content;
                nd = null;
            }
            nd.name = def.name;
            nd = new Node(Node.END, [def.name], nd);
            name = null;
        }
        else if (def instanceof RegexDefinition) {
            nd = new Node(Node.START, [def.name], nd);
            nd.options = def.options;
            nd = new Node(Node.REGEX, def.regex, nd);
            if (nd.type == Node.REJOIN) {
                rejoin = nd.content;
                nd = null;
            }
            nd.name = def.name;
            nd = new Node(Node.END, [def.name], nd);
            name = null;
        }

        else if (def == Context.Space) {nd = new Node(Node.SPACING, null, nd);}

        if (rejoin) {
            rejoin.forEach(r=>r.children.push(nd));
        }

        if (name) {
            nd.name = name;
        }
        if (parent == null && nd.type == Node.REJOIN) {
            nd.content.forEach(r=>r.children.push(undefined));
            nd.parent.children.push(undefined);
        }
        return parent == null ? start : nd;
    }

    static create_nodes(def, name) {
        if (!(name in this._nodes_cache)) {
            var node = this._create_nodes(def instanceof Definition ? def.definition : def, null, name);
            // this._replace_tbr(node);

            this._nodes_cache[name] = node;
            this._nodes_cache[name].options = def.options;

        }
        this._nodes_recursive_cache = [];
        this._nodes_cache[name].name = name;
        return this._nodes_cache[name];
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
        for (name in filterObj(defs, x=>x instanceof Definition)) {
            var def = defs[name];
            this._create_refs(def.definition, defs);
        }
        for (name in filterObj(defs, x=>x instanceof Definition)) {
            var def = defs[name];
        }
        return defs;
    }
    static preload (defs) {
        var result = {};
        for (var i = 0; i < defs.length; i++) {
            var def = defs[i];
            var defname = def.name;
            if (def.regex != undefined) {
                result[defname] = new RegexDefinition(defname, def.regex);
            }
            else if (def.definition != undefined) {
                var _def = this.parseDef(def.definition);
                if (def.definition.includes("|")) {
                    _def = this.parseOrMultiple(_def)
                }
                result[defname] = new Definition(defname, _def);
            }
            else if (def.list != undefined) {
                result[defname] = new ListDefinition(defname, def.list);
            }
            result[defname].refcount = 0;
            result[defname].priority = i;
            result[defname].options = {};
            for (var el in def) {
                if (!(["definition", "regex", "list", "name"].includes(el))) {
                    result[defname].options[el] = def[el];
                }
            }
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
        if (!(element in defs)) {
            throw new Error(`Cannot create reference for element '${element}' because it's not defined`);
        }
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
    static parseOrMultiple(ctx) {
        for (var i = 0; i < ctx.content.length; i++) {
            if (ctx.content.includes("|")) {
                ctx = this.parseOr(ctx);
            }
            if (ctx.content[i] instanceof Context && ctx.content[i].type == "optional") {
                ctx.content[i] = this.parseOrMultiple(ctx.content[i]);
            }
        }
        return ctx;
    }
    static parseOr(ctx) {
        function _(e) {
            if (e instanceof Context && (e.type == Context.OPTIONAL)) {return this.parseOr(e);}
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


class Tokenizer {
    constructor (text) {
        this.text = text;
        this.cursor = 0;
        this._checkpoint = 0;
        this._firstcheckpoint = 0;
    }
    seek () {return this.text.charAt(this.cursor+1)}
    checkpoint (value=null) {this._checkpoint = value == null ?  this.cursor : value;}
    get () {return this.text.substring(this._checkpoint);}
    current () {return this.text.charAt(this.cursor-1)}
    tell () {return this.text.charAt(this.cursor++);}
    empty () {return this.cursor == this.text.length}
    since () {return this.text.substring(this._checkpoint)}
    reset () {this.cursor = -1; this._checkpoint = 0; this._firstcheckpoint = 0;}
    startsWith (str) {return this.since().startsWith(str)}
    getCursor (start) {return this.cursor > this.text.length ? -1 : this.cursor - 1 + start}
}

class Language {
    constructor(name, defs) {
        this.name = name;
        this.definitions = defs;
        this.def_list = new Array(Object.keys(defs).length);
        for (var el in defs) {
            this.def_list[defs[el].priority]= defs[el];
        }
        this.topmost = this.def_list.filter(x=>x.refcount == 0);

        this._cache = {};
        this._cache_spans = {};
    }
    toString() {
        return `<Language '${this.name}' definitions=${this.definitions}>`;
    }

    _label(text, node, index_start=0, name=null, starts=null, s_opts=null) {
        var new_labelled = [];
        var current = node;
        var tokens = new Tokenizer(text);
        tokens.tell();

        //console.group(current.name);
        const ID = node.id;
        name = name == null ? node.name : name;
        starts = starts == null ? {} : starts;
        s_opts = s_opts == null ? {} : s_opts;

        if (this._cache[[text, ID, index_start]] != undefined) return this._cache[[text, ID, index_start]];

        main: {try {
            while (true) {
                if (!current) {
                    break;
                }
                switch (current.type) {
                    case Node.START:
                        starts[current.content[0]] = index_start + tokens._checkpoint;
                        s_opts[current.content[0]] = current.options;
                        current = current.children[0];
                        break;
                    case Node.LITERAL:
                        if (!tokens.startsWith(current.content[0])) {
                            throw new MatchFailure();
                        }
                        tokens.checkpoint();
                        tokens.cursor += current.content[0].length;
                        current = current.children[0];
                        break;
                    case Node.SPACING:
                        while (tokens.current() == " ") {
                            tokens.checkpoint();
                            tokens.tell();
                        }
                        current = current.children[0];
                        break;
                    case Node.REGEX:
                        var result;
                        if ((result = tokens.get().match("^" + current.content)) != null) {
                            tokens.cursor = tokens._checkpoint + result.index + result[0].length;
                            tokens.checkpoint();
                            tokens.tell();
                            current = current.children[0];
                            break;
                        }
                        throw new MatchFailure();
                    case Node.FORK:
                        if (tokens.getCursor(index_start) == -1) {
                            if (!current.children.includes(undefined)) throw new MatchFailure();
                            current = undefined;
                            break;
                        }

                        for (var i = 0; i < current.children.length; i++) {
                            if (current.children[i] == undefined) {
                                break main;
                            }
                            var [labels, index, isMatch] = this._label(tokens.get(), current.children[i], tokens.getCursor(index_start), name, JSON.parse(JSON.stringify(starts)), JSON.parse(JSON.stringify(s_opts)));
                            if (isMatch) {
                                // new_labelled.push([starts[name], index, name])
                                // console.groupEnd();
                                this._cache[[text, ID, index_start]] = [new_labelled.concat(labels), index, true];
                                return [new_labelled.concat(labels), index, true];
                            }
                        }
                        throw new MatchFailure();
                    case Node.LIST:
                        var noMatch = true;
                        for (var lit of current.content) {
                            if (tokens.startsWith(lit)) {
                                noMatch = false;
                                tokens.cursor += lit.length-1;
                                tokens.checkpoint();
                                tokens.cursor += 1;
                                current = current.children[0];
                                break;
                            }
                        }
                        if (noMatch) throw new MatchFailure();
                        break;
                    case Node.END:
                        var s = starts[current.content[0]], c = current.content[0];
                        new_labelled.push([s, tokens.getCursor(index_start), current.content[0], s_opts[c]]);
                        current = current.children[0];
                        if (c == name && !current) {
                            // console.groupEnd();
                            this._cache[[text, ID, index_start]] = [new_labelled, tokens.getCursor(index_start), true];
                            return [new_labelled, tokens.getCursor(index_start), true];
                        }
                        break;
                }
            }
        } catch (e) {
            if (e.name == "MatchFailure") {
                // console.debug("MatchFailure for node", name, "on text", "'"+text+"'");
                // console.groupEnd();
                this._cache[[text, ID, index_start]] = [new_labelled, tokens.getCursor(index_start), false];
                return [new_labelled, tokens.getCursor(index_start), false];
            }
            throw e;
        }}
        // console.groupEnd();
        new_labelled.push([starts[name], tokens.getCursor(index_start), name, s_opts[name]]);
        this._cache[[text, ID, index_start]] = [new_labelled, tokens.getCursor(index_start), true];
        return [new_labelled, tokens.getCursor(index_start), true];
    }

    async label(text) {
       var labelled = [];
       // console.group(text);
       var ind = 0;
       var start_ind = 0;
       var last_ind = 0;
       try {
           while (ind < text.length) {
                for(var def of this.topmost) {
                   var [new_labelled, index, isMatch] = this._label(text.substring(ind), Definition.create_nodes(def, def.name), last_ind);
                   if (isMatch) {
                       labelled = labelled.concat(new_labelled);
                       if (index == -1) {
                           throw new Error();
                       }
                       ind = index;
                       last_ind = ind;
                   }
                }
                if (ind == start_ind) {
                    ind++;
                    last_ind++;
                }
                start_ind = ind;
           }
       } catch (e) {}
       // console.groupEnd();
       return labelled;
    }

    async generateSpans(txt) {
        var x = await this.label(txt);

        if (!(txt in this._cache_spans)) {

            var result = [],
                opts = [],
                spans = [];

            for (var lb of x) {
                for (let i = lb[0]; lb[0] <= i && i < (lb[1] == -1 ? txt.length : lb[1]); i++) {
                    if (result[i] == undefined) result[i] = [];
                    if (opts[i] == undefined) opts[i] = {};
                    result[i].push(lb[2]);
                    opts[i] = {...opts[i], ...lb[3]}
                }
            }

            for (var i = result.length; i < txt.length; i++) {
                result[i] = undefined;
            }

            function _(i, l) {
                if ((opts[i] == undefined || !opts[i]['single']) && i != 0 && ((l[0] == "plain-text" && result[i-1] == undefined) || JSON.stringify(result[i-1]) == JSON.stringify(l))) {
                    spans[spans.length-1][0] += txt[i];
                }
                else {
                    spans.push([txt[i], l, opts[i] || {}]);
                }
            }

            for (let i = 0; i < result.length; i++) {
                if (result[i] == undefined) {
                    _(i, ["plain-text"]);
                }
                else {
                    _(i, result[i]);
                }
            }

            if (!spans.length) {
                spans.push([txt, "plain-text"]);
            }

            this._cache_spans[txt] = spans;
        }
        return this._cache_spans[txt];
    }

    static _loaded = {};
    static async fromLang (lang) {
        if (lang in this._loaded) return this._loaded[lang];
        this._loaded[lang] = await _load(lang);
        return this._loaded[lang];
    }
    static async current () {
        return await this.fromLang("css");  // TODO
    }
}
