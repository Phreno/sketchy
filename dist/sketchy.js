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
const { LOGGER } = require('../tools/Logger')

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


const debug = (data, file) => options.log === 'debug' && fs.writeFileSync('./debug/' + file, data, 'utf8')

// LOGGER.deleteLogFiles()
const options = program.opts()
// check if input file is provided
if (!options.input) {
    LOGGER.error("No input file provided")
    process.exit(1)
}
else if (!fs.existsSync(options.input)) {
    LOGGER.error("Input file does not exist")
    process.exit(1)
}
const worker = {
    svgString: null,
    svgDocument: null,
    paths: [],
    points: [],
    breadcrumbs: [],
    strokes: [],
    svg: null
}
LOGGER.time(
    "Reading input file " + options.input, () => {
        LOGGER.level = options.log
        worker.svgString = fs.readFileSync(options.input, 'utf8')
        debug(worker.svgString, 'svgString.svg')
    })
LOGGER.time(
    "Parsing svg data", () => {
        worker.svgDocument = parser.parse(worker.svgString)
        debug(JSON.stringify(worker.svgDocument, null, 2), 'svgDocument.json')
    })
LOGGER.time(
    "Extracting paths", () => {
        worker.paths = sketchy.getPathsFromSvg(worker.svgDocument)
        LOGGER.info(worker.paths.length + " paths found")
        debug(JSON.stringify(worker.paths, null, 2), 'extracted-paths.json')
    })
LOGGER.time(
    "Splitting paths", () => {
        worker.paths = worker.paths.map(path => pathSplitter(path)).flat()
        LOGGER.info(worker.paths.length + " paths found")
        debug(JSON.stringify(worker.paths, null, 2), 'splitted-paths.json')
    })
LOGGER.time(
    "Rendering (x,y) coords from svg paths", () => {
        worker.paths = worker.paths.map(path => sketchy.getPointsFromSvgPath(path, options.stepSize))
        debug(JSON.stringify(worker.paths, null, 2), 'parsed-paths.json')
    })
LOGGER.time(
    "Extracting points", () => {
        worker.points = sketchy.getPointsFromSvg(worker.svgDocument)
        LOGGER.info(worker.points.length + " points found")
        debug(JSON.stringify(worker.points, null, 2), 'extracted-points.json')
    })
LOGGER.time(
    "Rendering (x,y) coords from svg points", () => {
        worker.points = worker.points.map(point => sketchy.getPointsFromSvgPoints(point))
        debug(JSON.stringify(worker.points, null, 2), 'parsed-points.json')
    })
LOGGER.time(
    "Extracting breadcrumbs", () => {
        worker.breadcrumbs = [...worker.paths, ...worker.points]
        LOGGER.info(worker.breadcrumbs.length + " breadcrumbs found")
        if (options.noise) {
            worker.breadcrumbs = worker.breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
            LOGGER.info("Adding noise: " + options.noise)
        }
    })
LOGGER.time(
    "Rendering freehand strokes from breadcrumbs", () => {
        worker.strokes = worker.breadcrumbs.map(weave => freehand.getStroke(weave, options))
        debug(JSON.stringify(worker.strokes, null, 2), 'strokes.json')
    })
LOGGER.time(
    "Rendering svg", () => {
        worker.svg = [
            "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
            "<g>",
            ...worker.strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
            "</g>",
            "</svg>"
        ].join("\n")
        debug(worker.svg, 'output.svg')
    })
LOGGER.time("Writing output file", () => fs.writeFileSync(options.output, worker.svg, { encoding: 'utf8' }))
options.dump && console.log(svg)
exit(0)
