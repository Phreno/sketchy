#!/opt/nodejs/16.14.2/bin/node
const package = require('./package.json')
const sketchy = new require('./spec/Sketchy')()
const program = require('commander')
const fxParser = require('fast-xml-parser')
const parser = new fxParser.XMLParser({ignoreAttributes: false})
const freehand = require('perfect-freehand')
const fs = require('fs')
program
    .name("sketchy")
    .version(package.version)
    .description("A tool to generate a sketchy stroke")
    .option('--input <file>', 'input file')
    .option('--output <file>', 'output file', 'output.svg')
    .option('--noise <number>', 'noise', 0.5)
    .parse(process.argv)

const options = program.opts()

// check if input file is provided
if (!options.input) {
    console.error("No input file provided")
    process.exit(1)
}
// check if file exists
else if (!fs.existsSync(options.input)) {
    console.error("Input file does not exist")
    process.exit(1)
}

// retrieve the svg from the file
const svgString = fs.readFileSync(options.input, 'utf8')
// parse the svg
const svgDocument = parser.parse(svgString)
// get the paths from the svg
const paths = sketchy.getPathsFromSvg(svgDocument)
// get the points from the paths
const breadcrumbs = paths.map(path => sketchy.getPointsFromSvgPath(path))
// randomize the points
const weaves = breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
// get the stroke from the points
const strokes = weaves.map(weave => freehand.getStroke(weave, {
    size: 10,
    thinning: 0.5
}))
// get the svg from the stroke
const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='100%' height='100%'>",
    ...strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
    "</svg>"

].join("\n")
// write the svg to the output file
fs.writeFileSync(options.output, svg)