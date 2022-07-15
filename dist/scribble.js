#!/opt/nodejs/16.14.2/bin/node
// returns a window with a document and an svg root node
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
const { SVG, registerWindow } = require('@svgdotjs/svg.js')
const { Layer } = require("../tools/Layer.js")
// register window and document
registerWindow(window, document)
fs = require("fs")
const inkjet = require('inkjet');
const { exit } = require('process')
const fxParser = require('fast-xml-parser')
const Sketchy = require('../spec/Sketchy')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })
const freehand = require('perfect-freehand')
const Jimp = require('jimp')

const sketchy = new Sketchy()


const div = document.createElementNS('http://www.w3.org/2000/svg','svg')
const draw = SVG(div)
//draw.viewbox(0,0,1,1)
draw.css({
  stroke: "black",
  "stroke-width": "0.0002"
})


inkjet.decode(fs.readFileSync('./rsc/tpdne.jpeg'), function (err, imageData) {
  if (err) {
    console.log(err)
    exit(1)
  } else {
    for (let i = 0; i < 5; i++) {
      let layer = new Layer(div, imageData);
      layer.drawPattern((255 / 5) * i, 0.005, Math.cos(i), Math.sin(i));
    }
  }
})


// parse Svg String
let svgDocument = parser.parse(draw.svg())
let lines = sketchy.getLinesFromSvg(svgDocument)
console.log(lines.length + " lines found")
// remove duplicate lines
lines = lines.reduce((acc, line) => {
    const alreadyExists = acc.some(dirty => Object.keys(dirty).every(keys => dirty[keys] === line[keys]))
    if (!alreadyExists) acc.push(line)
    return acc
}, [])

// scale lines
lines = lines.map(line => ({
  "@_x1": line["@_x1"] * 10000,
  "@_y1": line["@_y1"] * 10000,
  "@_x2": line["@_x2"] * 10000,
  "@_y2": line["@_y2"] * 10000
}))


// segment lines into array of arrays of points
lines = lines.map(line => `M${line["@_x1"]} ${line["@_y1"]}, L${line["@_x2"]} ${line["@_y2"]}`)
lines = lines.map(line => sketchy.getPointsFromSvgPath(line, 10))
lines = lines.map(line => sketchy.randomize(line, {noise: 10}))

let strokes = lines.map(line => freehand.getStroke(line))
let paths = strokes.map(stroke => sketchy.getSvgPathFromStroke(stroke))

const svg = [
  "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
  "<g>",
  ...paths.map(path => `<path d='${path}'/>`),
  "</g>",
  "</svg>"
].join("\n")

fs.writeFileSync("rsc/out.svg", svg, { encoding: 'utf8' })
