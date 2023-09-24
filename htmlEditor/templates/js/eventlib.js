

eventDispatcher = {
    scopes: {},
    eventListeners: {},
    _createscopeobj: function (obj, newobj=undefined) {
        function destructurateName(n, o) {
            var temp = o;
            n.split("/").slice(0, -1).forEach(x => {
                if (!(x in temp)) {
                    temp[x] = {};
                }
                temp = temp[x];
            });
            return temp;
        }

        newobj = newobj == undefined ? {} : newobj;
        for (name in obj) {
            if (typeof obj[name] === "function") {
                var lindex = name.lastIndexOf("!");
                var priority = lindex == -1 ? 0 : name.slice(name.indexOf("!"), lindex+1).length
                var nname = lindex == -1 ? name : name.slice(0, lindex-1)
                nname.split("|").forEach(n => {
                    var temp = destructurateName(n, newobj);
                    let arr = n.split("/");
                    let x = arr[arr.length - 1];
                    if (! (x in temp)) {temp[x] = [];}
                    temp[x].push([priority, obj[name]]);
                });
            }
            else {
                var temp = destructurateName(name, newobj);
                let arr = name.split("/");
                let lastname = arr[arr.length - 1];
                temp[lastname] = (this._createscopeobj(obj[name], temp[lastname]));
            }
        }
        return newobj;
    },
    scope: function (name, obj) {
        this.scopes[name] = this._createscopeobj(obj);
    },
    listen: function (event, func) {
        if (arguments.length > 2) {
            const [...args] = arguments;
            args.slice(0, -1).forEach(ev=>this.listen(ev, args[args.length - 1]));
        }
        else {
            var lindex = event.lastIndexOf("!");
            var priority = lindex == -1 ? 0 : event.slice(event.indexOf("!"), lindex+1).length
            event = lindex == -1 ? event : event.slice(0, lindex - priority+1);
            if (!(event in this.eventListeners)) {
                this.eventListeners[event] = [];
            }
            this.eventListeners[event].push([priority, func]);
        }
    },
    dispatch: function (event, ...args) {
        function invokeSelectionEvent (...a) {
            return eventDispatcher.dispatch("selection/event/" + event, ...a);
        }

        if (event == "init") {
            for (let scope in this.scopes) {
                if ("init" in this.scopes[scope]) {
                    this.scopes[scope]["init"].forEach(x=>x[1](...args));
                }
            }
            return;
        }

        var callStack = [];

        if (!(event.startsWith("selection")) && selection.selectionActive) {
            callStack.push([1, invokeSelectionEvent]);
        }
        const [scope, ...namespace] = event.split("/");
        if (scope in this.scopes) {
            var obj = this.scopes[scope];
            namespace.forEach(el => {if(obj != undefined && el in obj) {obj = obj[el];} else {obj = undefined;}});
            if(obj != undefined) {callStack = callStack.concat(obj);}
        }
        if (event in this.eventListeners) {
            callStack = callStack.concat(this.eventListeners[event]);
        }
        var result = undefined;
        callStack.sort((a, b) => b[0] - a[0]).forEach(call => {
            if (result) {
                return;
            }
            result = call[1](...args);
        });
        return result;
    }
}