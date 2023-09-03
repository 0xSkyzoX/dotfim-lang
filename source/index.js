const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../app');
const routeDir = fs.readdirSync(dir);
const FunctionHandler = require('./System/function');
const HTTPServer = require('./System/http');
const ParseToJson = require('./System/json_parse');
const PortCheck = require('./System/PortCheck');
var vars = [];
var funcs = [];


routeDir.forEach(async route => {
    if (route.endsWith('.fim')) {
        const file = Buffer.from(fs.readFileSync(path.join(dir, route)), 'hex').toString('utf-8').split(/\r\n/);
        file.forEach((line, _index) => {

            const words = line.split(' ');
            const http = new HTTPServer(line, words, file, _index)
            words.forEach((word, index) => {
                if (word == 'func') {
                    const func = new FunctionHandler(line, funcs, words, file, _index + 1);
                    if (!func.find(words[index + 1])) {
                        func.registerFunction();
                    }
                }
                if (word == 'var') {
                    const value = words.slice(index + 3).join(" ")
                    if (value.startsWith('{') && value.endsWith('}')) {
                        vars.push({ name: words[index + 1], content: ParseToJson(value) })
                    } else {
                        vars.push({ name: words[index + 1], content: words.slice(index + 3).join(" ").split('"')[1] });
                    }
                } else if (word == 'print') {
                    if (words.slice(index + 1).join(" ")[0] !== '"') {
                        const searchVariable = vars.find(_var => _var.name == words[index + 1].split(".")[0]);
                        if (typeof searchVariable.content == "object") {
                            if (words[index + 1].split(".").slice(1).join("")) {
                                console.log(searchVariable.content[words[index + 1].split(".").slice(1).join(".")])
                            } else {
                                console.log(searchVariable.content)
                            }
                        } else {
                            console.log(searchVariable.content);
                        }
                    } else {
                        console.log(words.slice(index + 1).join(" ").split('"')[1]);
                    }
                } else if (word.startsWith('print')) {
                    console.log(`Error: ${route}. line ${_index + 1}`);
                } else if (word == 'call') {
                    const func = new FunctionHandler(line, funcs, words, file, _index + 1);
                    func.find(words[index + 1]);
                } else if (word == 'CREATE_SERVER') {
                    if (words[index + 1].startsWith('"') && words[index + 1].endsWith('"')) {
                        http.createServer(words[index + 1].split('"').join(""), () => {
                            if (words.slice(index + 2).join(" ").startsWith('{"') && words.slice(index + 2).join(" ").endsWith('"}')) {
                                const callback_text = words.slice(index + 2).join(" ").replace(/[{""}]/g, '')
                                console.log(callback_text)
                            } else if (words.slice(index + 2).join(" ").trim() == "default") {
                                const default_std = vars.find((_var) => _var.name == "DEFAULT_SYSTEM")
                                console.log(default_std.content.listen_message)
                            }
                        })
                    }
                } else if (word == "CREATE_ROUTE") {
                    if (words.slice(index + 1).join(" ").startsWith("{") && words.slice(index + 1).join(" ").endsWith("}")) {
                        const next_value = ParseToJson(words.slice(index + 1).join(" "), vars)
                        http.createRoute(next_value.path, next_value.response)
                    } else {
                        const memory_route = vars.find(_var => _var.name == words.slice(index + 1).join(" ").trim())
                        http.createRoute(memory_route.content.path, memory_route.content.response)
                    }
                } else if (word == "repeat") {
                    const repeat_times = words[index + 1]

                    for (var i = 0; i < new Number(repeat_times); i++) {
                        console.log(words.splice(index + 2).join(" "))
                    }
                }
            });
        });
    };
});
