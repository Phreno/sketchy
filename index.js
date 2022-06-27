#!/opt/nodejs/16.14.2/bin/node
const package = require('./package.json')
const sketchy = require('./spec/Sketchy')
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
const paths = sketchy.getPaths(svgDocument)
// get the points from the paths
const points = paths.map(path => svg.getPoints(path))
// randomize the points
const randomizedPoints = points.map(path => sketchy.randomize(path, { noise: options.noise }))
// get the stroke from the points
const stroke = sketchy.getStroke(randomizedPoints, { noise: options.noise })

