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
    .option('-i, --input             <file>', 'input file')
    .option('-o, --output            <file>', 'output file', 'out.svg')
    .option('-l, --log               <level>', 'log level', 'none')
    // perfect-freehand options
    .option('-C, --last              <boolean>', 'Whether the stroke is complete.', false)
    .option('-L, --streamline        <number>', 'How much to streamline the stroke.', 0.5)
    .option('-M, --smoothing         <number>', 'How much to soften the stroke\'s edges.', 0.5)
    .option('-N, --noise             <number>', 'Add a random zigzag to the stroke', 0)
    .option('-P, --simulate-pressure <boolean>', 'Whether to simulate pressure based on velocity.', true)
    .option('-S, --size              <number>', 'The base size (diameter) of the stroke.', 8)
    .option('-T, --thinning          <number>', 'The effect of pressure on the stroke\'s size.', 0.5)

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

// add a timer
let timer

// a function to start the timer
const startTimer = () => {
    timer = new Date()
}

const stopTimer = () => {
    const time = new Date() - timer
    return `\t(${time}ms)`
}



startTimer()
LOGGER.level = options.log
const svgString = fs.readFileSync(options.input, 'utf8')
LOGGER.info("Reading input file " + options.input + stopTimer())



startTimer()
const svgDocument = parser.parse(svgString)
LOGGER.info("Parsing" + stopTimer())

startTimer()
let paths = sketchy.getPathsFromSvg(svgDocument)
LOGGER.info("Extracting paths"+stopTimer())

startTimer()
paths = paths.map(path => pathSplitter(path)).flat()
LOGGER.info("Splitting paths into subpaths"+stopTimer())

startTimer()
let breadcrumbs = paths.map(path => sketchy.getPointsFromSvgPath(path))
if(options.noise){
    LOGGER.info("Activate noise " + options.noise)
    breadcrumbs = breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
}
LOGGER.info("Extracting breadcrumbs " + stopTimer())

startTimer()
const strokes = breadcrumbs.map(weave => freehand.getStroke(weave), {
    size: parseFloat(options.strokeSize),
    thinning: parseFloat(options.strokeThinning),
    smoothing: parseFloat(options.strokeSmoothing),
    streamline: parseFloat(options.strokeStreamline),
    simulatePressure: options.strokeSimulatePressure,
    last: options.strokeLast,
})
LOGGER.info("Generating freehand stroke" +stopTimer())

startTimer()
const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
    ...strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
    "</svg>"
].join("\n")
LOGGER.info("Rendering SVG document" + stopTimer())

startTimer()
fs.writeFileSync(options.output, svg, { encoding: 'utf8' })
LOGGER.info("Writing output file " + options.output + stopTimer())

exit(0)
