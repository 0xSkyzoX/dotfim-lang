class FunctionHandler {
    line;
    funcs;
    words;
    file;
    _index;
    constructor(line, funcs, words, file, _index){
        this.line = line;
        this.funcs = funcs;
        this.words = words;
        this.file = file;
        this._index = _index;
    };

    registerFunction() {
        var _isEndFunction = true;
        var endLine = 0;
        while (_isEndFunction) {
            if (this.file[endLine].split(" ")[0] == "]") {
                _isEndFunction = !_isEndFunction;
                this.funcs.push({name: this.words[1], position: {startLine: this._index, endLine: endLine+1}});
            }
            endLine+=1;
        };
    };
    call(functionName) {
        const findFunctionMemory = this.funcs.find((func) => func.name = functionName);
        
    };
};

module.exports = FunctionHandler;