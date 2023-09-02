const http = require('http');

function ConvertPath(path) {
    const names= path.split('')
    if (path.startsWith('/') && path.endsWith('/')) {
        if (names.length == 2) {
            return path
        } else {
            const lastSlash = names.lastIndexOf('/')
            var result = '';
            names.forEach((name, index) => {
                if (index == lastSlash) return
                if (name == '') {
                    result += '/'
                }
                result += name
            })
            return result
        }
    } else if (!path.endsWith('/')) {
        return path
    }
}
var routes=[]
class HTTPServer {
    port
    line
    words
    file
    _index
    http = new http.createServer((req, res) => {
        const path = req.url
        const route = routes.find(route => ConvertPath(route.path) === ConvertPath(path));
        console.log(routes)
        if (route) {
            res.writeHead(200, {"Content-Type": "text/plain"})
            res.write(route.response)
        } else {
            res.write("Route Not Found 404!")
        }
        res.end()
    })
    constructor(line,  words, file, _index) {
        this.line = line;
        this.words = words;
        this.file = file;
        this._index = _index;
    };
    createServer(port, callback) {
        this.http.listen(port, callback)
    }
    createRoute(path, response) {
        routes.push({path, response})
    }
}



module.exports = HTTPServer