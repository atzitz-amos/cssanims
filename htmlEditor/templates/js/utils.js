

function findAllRegex(regex, str) {
    var indices = [];
    while ( (result = regex.exec(str)) ) {
        indices.push(result.index);
    }
    return indices;
}

function findAll(pattern, str) {
    console.log(str, pattern);
    var i = str.indexOf(pattern);
    var result = i == -1 ? [] : [i];
    while (true) {
        i = str.indexOf(pattern, i+1);
        if (i == -1) break;
        result.push(i);
    }
    return result;
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
