const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../app');
const routeDir = fs.readdirSync(dir);
const FunctionHandler = require('./System/function');
const HTTPServer = require('./System/http')

routeDir.forEach(async route => {
    if (route.endsWith('.fim')) {
        const file = Buffer.from(fs.readFileSync(path.join(dir, route)), 'hex').toString('utf-8').split(/\r\n/);
        var vars = [];
        var funcs = [];
        file.forEach((line, _index) => {
            const words = line.split(' ');
            const http = new HTTPServer(line, words, file, _index)
            words.forEach((word, index) => {
                if (word == 'var') {
                    vars.push({ name: words[index + 1], content: words.slice(index + 3).join(" ").split('"')[1] });
                } else if (word == 'print') {
                    if (words.slice(index + 1).join(" ")[0] !== '"') {
                        const searchVariable = vars.find(_var => _var.name == words[index + 1]);
                        console.log(searchVariable.content);
                    } else {
                        console.log(words.slice(index + 1).join(" ").split('"')[1]);
                    }
                } else if (word.startsWith('print')) {
                    console.log(`Error: ${route}. line ${_index + 1}`);
                } else if (word == 'func') {
                    const func = new FunctionHandler(line, funcs, words, file, _index + 1);
                    func.registerFunction();
                } else if (word == 'call') {
                    const func = new FunctionHandler(line, funcs, words, file, _index + 1);
                    func.call(words[index + 1]);
                } else if (word == 'CREATE_SERVER') {
                    if (words[index + 1].startsWith('"') && words[index + 1].endsWith('"')) {
                        http.createServer(words[index + 1].split('"').join(''), () => {
                            if (words.slice(index + 2).join(" ").startsWith('{"') && words.slice(index + 2).join(" ").endsWith('"}')) {
                                const callback_text = words.slice(index + 2).join(" ").split('{"').join("").split('"}').join("")
                                console.log(callback_text)
                            } else {
                                const searchVariable = vars.find(_var => _var.name == words[index + 2])
                                console.log(searchVariable.content)
                            }
                        })
                    }
                } else if (word == "CREATE_ROUTE") {
                    const response_index = words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").indexOf('response:')
                    const path = words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").slice(1, response_index).join("").split('"').join("")
                    const response = words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").slice(response_index + 1).join(" ").split('"').join("")
                    if (words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").slice(1, response_index).join("").startsWith('"') && words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").slice(1, response_index).join("").endsWith('"') 
                    || words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").slice(response_index+1).join("").startsWith('"') && words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").slice(response_index+1).join("").endsWith('"')) {
                        http.createRoute(path, response.trim())
                    } else {
                        const path = vars.find(_var => _var.name == words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ").slice(1, response_index).join(""))
                        const response = vars.find(_var => _var.name == words.slice(index + 1).join(" ").replace(/[{}]/g, '').split(" ")[response_index+1])
                        http.createRoute(path.content.trim() || path.trim(), response.content.trim() || response.trim())
                    }
                }
            });
        });
    };
});
