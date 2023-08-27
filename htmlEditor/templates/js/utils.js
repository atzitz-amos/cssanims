

function findAll(regex, str) {
    var indices = [];
    while ( (result = regex.exec(str)) ) {
        indices.push(result.index);
    }
    return indices;
}

Array.prototype.split = function (pattern) {
    var arr = this;
    var result = [];
    var last = 0;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === pattern) {
            result.push(arr.slice(last, i));
            last = i+1;
        }
    }
    if (last != i) {
        result.push(arr.slice(last));
    }
    return result;
}

Array.prototype.first = function (condition) {
    return this.filter(condition)[0];
}
