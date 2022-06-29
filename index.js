#!/opt/nodejs/16.14.2/bin/node
const package = require('./package.json')
const sketchy = new require('./spec/Sketchy')()
const program = require('commander')
const fxParser = require('fast-xml-parser')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })
const freehand = require('perfect-freehand')
const pathSplitter = require("./vendor/PathSplitter")
const fs = require('fs')
const LOGGER = require('./vendor/Logger')
const { exit } = require('process')

program
    .name("sketchy")
    .version(package.version)
    .description("A tool to generate a sketchy stroke")
    .option('--input                    <file>', 'input file')
    .option('--output                   <file>', 'output file', 'out.svg')
    .option('--log                      <level>', 'log level', 'none')
    .option('--noise                    <number>', 'Add a random zigzag to the stroke', 0)
    // perfect-freehand options
    .option('--stroke-size              <number>', 'The base size (diameter) of the stroke.', 8)
    .option('--stroke-thinning          <number>', 'The effect of pressure on the stroke\'s size.', 0.5)
    .option('--stroke-smoothing         <number>', 'How much to soften the stroke\'s edges.', 0.5)
    .option('--stroke-streamline        <number>', 'How much to streamline the stroke.', 0.5)
    .option('--stroke-simulate-pressure <boolean>', 'Whether to simulate pressure based on velocity.', true)
    .option('--stroke-last              <boolean>', 'Whether the stroke is complete.', false)

    .parse(process.argv)



LOGGER.deleteLogFiles()
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
LOGGER.info("Reading input file " + options.input)
const svgString = fs.readFileSync(options.input, 'utf8')
LOGGER.info("Parsing input file " + options.input)
const svgDocument = parser.parse(svgString)
LOGGER.info("Getting paths from " + options.input)
let paths = sketchy.getPathsFromSvg(svgDocument)
LOGGER.info("Splitting paths into subpaths")
paths = paths.map(path => pathSplitter(path)).flat()
LOGGER.info("Generating sketchy stroke from " + options.input)
const breadcrumbs = paths.map(path => sketchy.getPointsFromSvgPath(path))
LOGGER.info("Add some noise sketchy stroke " + options.noise)
let weaves = options.noise
    ? breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
    : breadcrumbs
LOGGER.info("Generating freehand stroke")
console.log(options)
const strokes = weaves.map(weave => freehand.getStroke(weave), {
    size: parseFloat(options.strokeSize),
    thinning: parseFloat(options.strokeThinning),
    smoothing: parseFloat(options.strokeSmoothing),
    streamline: parseFloat(options.strokeStreamline),
    simulatePressure: options.strokeSimulatePressure,
    last: options.strokeLast,
})
LOGGER.info("Rendering svg from sketchy stroke")
const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
    ...strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
    "</svg>"
].join("\n")

LOGGER.info("Writing output file")
fs.writeFileSync(options.output, svg, { encoding: 'utf8' })

exit(0)
