#!/opt/nodejs/16.14.2/bin/node
const package = require('./package.json')
const sketchy = new require('./spec/Sketchy')()
const program = require('commander')
const fxParser = require('fast-xml-parser')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })
const freehand = require('perfect-freehand')
const fs = require('fs')
const LOGGER = require('./vendor/Logger')

program
    .name("sketchy")
    .version(package.version)
    .description("A tool to generate a sketchy stroke")
    .option('--input <file>', 'input file')
    .option('--output <file>', 'output file', 'output.svg')
    .option('--noise <number>', 'noise', 0)
    .option('--stroke-size <number>', 'stroke size', 10)
    .option('--stroke-thinning <number>', 'stroke thinning', 0.5)
    .option('--log <level>', 'log level', 'info')
    .parse(process.argv)

const options = program.opts()
// check if input file is provided
if (!options.input) {
    LOGGER.error("No input file provided")
    process.exit(1)
}

// check if file exists
else if (!fs.existsSync(options.input)) {
    LOGGER.error("Input file does not exist")
    process.exit(1)
}

LOGGER.level = options.log

LOGGER.info("Reading input file")
const svgString = fs.readFileSync(options.input, 'utf8')
LOGGER.info("Parsing input file")
const svgDocument = parser.parse(svgString)
LOGGER.info("Getting paths from input file")
const paths = sketchy.getPathsFromSvg(svgDocument)
LOGGER.info("Generating sketchy stroke")
const breadcrumbs = paths.map(path => sketchy.getPointsFromSvgPath(path))
LOGGER.info("Add some noise sketchy stroke")
const weaves = breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
LOGGER.info("Generating freehand stroke")
const strokes = weaves.map(weave => freehand.getStroke(weave, { size: options.strokeSize, thinning: options.strokeThinning }))
LOGGER.info("Generating output file")
const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='100%' height='100%'>",
    ...strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
    "</svg>"

].join("\n")
LOGGER.info("Writing output file")
fs.writeFileSync(options.output, svg)