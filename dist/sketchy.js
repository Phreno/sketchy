#!/opt/nodejs/16.14.2/bin/node
// vendor
const program = require('commander')
const fxParser = require('fast-xml-parser')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })
const { exit } = require('process')
const freehand = require('perfect-freehand')
const fs = require('fs')
// lib
const pathSplitter = require("../tools/PathSplitter")
const package = require('../package.json')
const sketchy = new require('../spec/Sketchy')()
const LOGGER = require('../tools/Logger')
const { startTimer, stopTimer } = require("../tools/timer")

program
    .name("sketchy")
    .version(package.version)
    .description("A tool to generate a sketchy stroke")
    .option('-i, --input             <file>', 'input file')
    .option('-o, --output            <file>', 'output file', 'out.svg')
    .option('-l, --log               <none / info / debug>', 'log level', 'info')
    .option('-d, --dump', 'display result on stdout')
    // perfect-freehand options
    .option('-C, --last', 'whether the stroke is complete')
    .option('-L, --streamline        <number>', 'how much to streamline the stroke')
    .option('-M, --smoothing         <number>', 'how much to soften the stroke\'s edges')
    .option('-N, --noise             <number>', 'add a random zigzag to the stroke')
    .option('-P, --simulate-pressure', 'whether to simulate pressure based on velocity')
    .option('-S, --size              <number>', 'the base size (diameter) of the stroke')
    .option('-Z, --step-size         <number>', 'distance between breadcrumbs points when working with a path')
    .option('-T, --thinning          <number>', 'the effect of pressure on the stroke\'s size')
    .parse(process.argv)


const debug = (data , file)=>options.log === 'debug' && fs.writeFileSync('./debug/' + file, data, 'utf8')

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
debug(svgString, 'svgString.svg')

startTimer()
const svgDocument = parser.parse(svgString)
LOGGER.info(stopTimer() + "Parsing")
debug(JSON.stringify(svgDocument, null, 2), 'svgDocument.json')

let paths = [], points = []

startTimer()
paths = sketchy.getPathsFromSvg(svgDocument)
LOGGER.info(stopTimer() + "*** Extracting paths: " + paths.length)
debug(JSON.stringify(paths, null, 2), 'extracted-paths.json')

startTimer()
paths = paths.map(path => pathSplitter(path)).flat()
LOGGER.info(stopTimer() + "Splitting paths into subpaths: " + paths.length)
debug(JSON.stringify(paths, null, 2), 'splitted-paths.json')

startTimer()
paths = paths.map(path => sketchy.getPointsFromSvgPath(path, options.stepSize))
LOGGER.info(stopTimer() + "Parsing paths")
debug(JSON.stringify(paths, null, 2), 'parsed-paths.json')

startTimer()
points = sketchy.getPointsFromSvg(svgDocument)
LOGGER.info(stopTimer() + "*** Extracting points: " + points.length)
debug(JSON.stringify(points, null, 2), 'extracted-points.json')

startTimer()
points = points.map(point => sketchy.getPointsFromSvgPoints(point))
LOGGER.info(stopTimer() + "Parsing points")
debug(JSON.stringify(points, null, 2), 'parsed-points.json')


startTimer()
let breadcrumbs = [...paths, ...points]
if (options.noise) {
    breadcrumbs = breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
    LOGGER.info(stopTimer() + "Adding noise")
}
LOGGER.info(stopTimer() + "*** Generating breadcrumbs: " + breadcrumbs.length)

startTimer()
const strokes = breadcrumbs.map(weave => freehand.getStroke(weave, options))
LOGGER.info(stopTimer() + "*** Generating freehand stroke")
debug(JSON.stringify(strokes, null, 2), 'strokes.json')

startTimer()
const svg = [
    "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
    "<g>",
    ...strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
    "</g>",
    "</svg>"
].join("\n")
LOGGER.info(stopTimer() + "Rendering SVG document")
debug(svg, 'output.svg')

startTimer()
fs.writeFileSync(options.output, svg, { encoding: 'utf8' })
LOGGER.info(stopTimer() + "Writing output file " + options.output)

options.dump && console.log(svg)

exit(0)
