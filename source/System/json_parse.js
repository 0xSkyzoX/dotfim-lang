function ParseToJson(object, vars) {
    var _object_string = new String(object).toString()
    var result = {}
    if (_object_string.startsWith('{') && _object_string.endsWith('}')) {
        const args = _object_string.replace(/[{}]/g, '')
        const object_args = args.split(":").join(" ").split(",")
        object_args.forEach((section) => {
            const contents = section.trim().split(" ").slice(1).join(" ").trim();
            const object_name = section.trim().split(" ")[0]
            if ( contents.startsWith('"') &&  contents.endsWith('"')) {
                result[object_name] = contents.replace(/[""]/g, '')
            } else {
                const momeryVars = vars.find(_vars => _vars.name == contents)
                result[object_name] = momeryVars.content
            }
        })
        return result
    }
}
module.exports = ParseToJson