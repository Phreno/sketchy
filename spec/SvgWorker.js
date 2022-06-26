
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const SVG = require("svg.js")(window)
const fxParser = require("fast-xml-parser")
const document = window.document
const draw = SVG(document.documentElement)

module.exports = function SvgWorker() {
    self = {}
    const parser = new fxParser.XMLParser({
        ignoreAttributes: false
    })
    self.parse = (svg) => parser.parse(svg)
    self.getPoints = function getPoints(str) {
        const path = draw.path(str)
        const step = 10
        const length = path.length()
        return [...Array(Math.ceil(length / step)).keys()].map(i => {
            const point = path.pointAt(i * step)
            return [point.x, point.y]
        })
    }
    return self
}