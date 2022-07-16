#!/usr/bin/env node
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
const fxParser = require('fast-xml-parser')
const Sketchy = require('../spec/Sketchy')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })
const freehand = require('perfect-freehand')

const sketchy = new Sketchy()


const program = require("commander")
const { exit } = require("process")
const package = require("../package.json")


program
    .name("scribble")
    .version(package.version)
    .description("Extracts svg strokes from jpeg")
    .option("-i, --input <file>", "input file")
        .option("-o, --output <file>", "output file", "out.svg")
    .option("-l, --log <none / info / debug>", "log level", "info")

    .option("-Y, --layers <number>", "number of layer decomposition", 5)
    .option("-W, --distance <number>", "distance between strokes", 0.005)

    .option("-I, --ignore-layer <number>", "layer to ignore", false)

    .option('-C, --last', 'whether the stroke is complete')
    .option('-L, --streamline        <number>', 'how much to streamline the stroke')
    .option('-M, --smoothing         <number>', 'how much to soften the stroke\'s edges')
    .option('-N, --noise             <number>', 'add a random zigzag to the stroke')
    .option('-P, --simulate-pressure', 'whether to simulate pressure based on velocity')
    .option('-S, --size              <number>', 'the base size (diameter) of the stroke')
    .option('-Z, --step-size         <number>', 'distance between breadcrumbs points when working with a path')
    .option('-T, --thinning          <number>', 'the effect of pressure on the stroke\'s size')
    .parse(process.argv)

const options = program.opts()

// todo: grouper par calques

const div = document.createElementNS('http://www.w3.org/2000/svg','svg')
const draw = SVG(div)
//draw.viewbox(0,0,1,1)
draw.css({
  stroke: "black",
  "stroke-width": "0.0002"
})

var Jimp = require('jimp');

//options.input = "./rsc/tpdne.jpeg"

let filename = options.input.split("/").pop()
let extension = filename.split(".").pop()
filename = filename.replace(/\.\w+$/, "")
let buffer = "./rsc/"+filename+"-invert."+extension

// User-Defined Function to read the images
async function main() {
  const image = await Jimp.read
  (options.input);
// invert function
  await image.invert()
      .write(buffer);
}

main()

inkjet.decode(fs.readFileSync(buffer), function (err, imageData) {
  if (err) {
    console.log(err)
    exit(1)
  } else {
    for (let i = 0; i < options.layers; i++) {
      // todo: ignorer plusieurs calques
      if(i === parseInt(options.ignoreLayer)) continue;
        let layer = new Layer(div, imageData);
        layer.drawPattern(
          (255 / options.layers) * i,
          // todo: ajuster la distance suivant le layer
          options.distance,
          // todo: possibilité de randomizer la direction
          Math.cos(i),
          Math.sin(i));
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
// todo: faire des constantes
lines = lines.map(line => ({
  "@_x1": line["@_x1"] * 1000,
  "@_y1": line["@_y1"] * 1000,
  "@_x2": line["@_x2"] * 1000,
  "@_y2": line["@_y2"] * 1000
}))


// segment lines into array of arrays of points
lines = lines.map(line => `M${line["@_x1"]} ${line["@_y1"]}, L${line["@_x2"]} ${line["@_y2"]}`)
lines = lines.map(line => sketchy.getPointsFromSvgPath(line, options.stepSize))
lines = lines.map(line => sketchy.randomize(line, options))

let strokes = lines.map(line => freehand.getStroke(line, options))
let paths = strokes.map(stroke => sketchy.getSvgPathFromStroke(stroke))

const svg = [
  "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
  "<g style=\"fill: transparent; stroke: black\">",
  ...paths.map(path => `<path d="${path}"/>`),
  "</g>",
  "</svg>"
].join("\n")

fs.writeFileSync("rsc/"+filename+".svg", svg, { encoding: 'utf8' })
