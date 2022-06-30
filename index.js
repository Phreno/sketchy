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
    .option('-d, --dump              <boolean>', 'display result on stdout', false)
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

let timer
const startTimer = () => {
    timer = new Date()
}
const stopTimer = () => {
    const time = new Date() - timer
    return `(${time}ms)\t`
}

startTimer()
LOGGER.level = options.log
const svgString = fs.readFileSync(options.input, 'utf8')
LOGGER.info(stopTimer() + "Reading input file " + options.input)
LOGGER.debug(svgString)

startTimer()
const svgDocument = parser.parse(svgString)
LOGGER.info(stopTimer() + "Parsing")
LOGGER.debug(JSON.stringify(svgDocument, null, 2))

startTimer()
let paths = sketchy.getPathsFromSvg(svgDocument)
LOGGER.info(stopTimer() + "Extracting paths")
LOGGER.debug(JSON.stringify(paths, null, 2))

startTimer()
paths = paths.map(path => pathSplitter(path)).flat()
LOGGER.info(stopTimer() + "Splitting paths into subpaths")
LOGGER.debug(JSON.stringify(paths, null, 2))

startTimer()
let breadcrumbs = paths.map(path => sketchy.getPointsFromSvgPath(path))
if (options.noise) {
    LOGGER.info("Activate noise " + options.noise)
    breadcrumbs = breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
}
LOGGER.info(stopTimer() + "Extracting breadcrumbs ")
LOGGER.debug(JSON.stringify(breadcrumbs, null, 2))

startTimer()
const strokes = breadcrumbs.map(weave => freehand.getStroke(weave), {
    size: parseFloat(options.strokeSize),
    thinning: parseFloat(options.strokeThinning),
    smoothing: parseFloat(options.strokeSmoothing),
    streamline: parseFloat(options.strokeStreamline),
    simulatePressure: options.strokeSimulatePressure,
    last: options.strokeLast,
})
LOGGER.info(stopTimer() + "Generating freehand stroke")
LOGGER.debug(JSON.stringify(strokes, null, 2))

startTimer()
const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
    ...strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
    "</svg>"
].join("\n")
LOGGER.info(stopTimer() + "Rendering SVG document")
LOGGER.debug(svg)

startTimer()
fs.writeFileSync(options.output, svg, { encoding: 'utf8' })
LOGGER.info(stopTimer() + "Writing output file " + options.output)

if(options.dump){
    console.log(svg)
}

exit(0)
