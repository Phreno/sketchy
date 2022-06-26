
let fxParser = require("fast-xml-parser")
module.exports = function SvgWorker(){
    self = {}
    const parser =new fxParser.XMLParser({
        ignoreAttributes: false
    })
    self.parse = (svg) => parser.parse(svg)
    self.getPoints = function getPoints(str)
    {
        return []
    }
    return self
}