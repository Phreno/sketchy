#!/opt/nodejs/16.14.2/bin/node
const package = require('./package.json')
const sketchy = new require('./spec/Sketchy')()
const program = require('commander')
const fxParser = require('fast-xml-parser')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })
const freehand = require('perfect-freehand')
const pathSplitter = require("./tools/PathSplitter")
const fs = require('fs')
const LOGGER = require('./tools/Logger')
const { exit } = require('process')
const { startTimer, stopTimer } = require("./tools/timer")

program
    .name("sketchy")
    .version(package.version)
    .description("A tool to generate a sketchy stroke")
    .option('-i, --input             <file>', 'input file')
    .option('-o, --output            <file>', 'output file', 'out.svg')
    .option('-l, --log               <none / info / debug>', 'log level', 'none')
    .option('-d, --dump', 'display result on stdout')
    // perfect-freehand options
    .option('-C, --last', 'whether the stroke is complete')
    .option('-L, --streamline        <number>', 'how much to streamline the stroke')
    .option('-M, --smoothing         <number>', 'how much to soften the stroke\'s edges')
    .option('-N, --noise             <number>', 'add a random zigzag to the stroke')
    .option('-P, --simulate-pressure', 'whether to simulate pressure based on velocity')
    .option('-S, --size              <number>', 'the base size (diameter) of the stroke')
    .option('-T, --thinning          <number>', 'the effect of pressure on the stroke\'s size')

    .parse(process.argv)



// LOGGER.deleteLogFiles()
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

startTimer()
LOGGER.level = options.log
const svgString = fs.readFileSync(options.input, 'utf8')
LOGGER.info(stopTimer() + "Reading input file " + options.input)
LOGGER.debug(svgString)

startTimer()
const svgDocument = parser.parse(svgString)
LOGGER.info(stopTimer() + "Parsing")
LOGGER.debug(JSON.stringify(svgDocument, null, 2))

let paths = [], points = []

    startTimer()
    paths = sketchy.getPathsFromSvg(svgDocument)
    LOGGER.info(stopTimer() + "*** Extracting paths")
    //LOGGER.debug(JSON.stringify(paths, null, 2))

    startTimer()
    paths = paths.map(path => pathSplitter(path)).flat()
    LOGGER.info(stopTimer() + "Splitting paths into subpaths")
    LOGGER.debug(JSON.stringify(paths, null, 2))

    startTimer()
    paths = paths.map(path => sketchy.getPointsFromSvgPath(path))
    LOGGER.info(stopTimer() + "Parsing paths")
    //LOGGER.debug(JSON.stringify(paths, null, 2))

    startTimer()
    points = sketchy.getPointsFromSvg(svgDocument)
    LOGGER.info(stopTimer() + "*** Extracting points")
    //LOGGER.debug(JSON.stringify(points, null, 2))

    startTimer()
    points = points.map(point => sketchy.getPointsFromSvgPoints(point))
    LOGGER.info(stopTimer() + "Parsing points")
    //LOGGER.debug(JSON.stringify(points, null, 2))


startTimer()
let breadcrumbs = [...paths, ...points]
if (options.noise) {
    breadcrumbs = breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
    LOGGER.info(stopTimer() + "Adding noise")
}
//LOGGER.debug(JSON.stringify(breadcrumbs, null, 2))

startTimer()
const strokes = breadcrumbs.map(weave => freehand.getStroke(weave, options))
LOGGER.info(stopTimer() + "*** Generating freehand stroke")
//LOGGER.debug(JSON.stringify(strokes, null, 2))

startTimer()
const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
    ...strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
    "</svg>"
].join("\n")
LOGGER.info(stopTimer() + "Rendering SVG document")
//LOGGER.debug(svg)

startTimer()
fs.writeFileSync(options.output, svg, { encoding: 'utf8' })
LOGGER.info(stopTimer() + "Writing output file " + options.output)

if (options.dump) {
    console.log(svg)
}

exit(0)
