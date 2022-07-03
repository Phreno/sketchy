#!/opt/nodejs/16.14.2/bin/node
// vendor
const program = require('commander')
const fxParser = require('fast-xml-parser')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })
const { exit } = require('process')
const freehand = require('perfect-freehand')
const fs = require('fs')
const pointInSvgPolygon = require("point-in-svg-polygon");
// lib
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
    .option('-l, --log               <none / info / debug>', 'log level', 'none')
    .option('-d, --dump', 'display result on stdout')

    // perfect-freehand options
    .option('-C, --last', 'whether the stroke is complete')
    .option('-L, --streamline        <number>', 'how much to streamline the stroke')
    .option('-M, --smoothing         <number>', 'how much to soften the stroke\'s edges')
    .option('-N, --noise             <number>', 'add a random zigzag to the stroke')
    .option('-P, --simulate-pressure', 'whether to simulate pressure based on velocity')
    .option('-S, --size              <number>', 'the base size (diameter) of the stroke')
    .option('-Z, --step-size         <number>', 'distance between breadcrumbs points when working with a path', 10)
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

let paths = []

startTimer()
paths = sketchy.getPathsFromSvg(svgDocument)
LOGGER.info(stopTimer() + "*** Extracting paths: " + paths.length)

// render a grid of points over the SVG document
// assume a 1024x1024 grid
startTimer()
const points = [], range = [...Array(103).keys()].map(e => e * 10)
range.forEach(x => range.forEach(y => points.push([x, y])))
LOGGER.info(stopTimer() + "*** Generating grid of " + points.length + " points spaced by " + options.stepSize + "px")


const scribbles = []
startTimer()
paths.forEach(path => {
    let matchs = []
    points.forEach(point => pointInSvgPolygon.isInside(point, path) && matchs.push(point))
    //matchs.sort(() => Math.random() - 0.5)
    const chunks = matchs.reduce((acc, cur, i) => {
            if (i % 2 === 0) acc.push([cur])
            else acc[acc.length - 1].push(cur)
        return acc
    }, [])
    scribbles.push(chunks.map(chunk => freehand.getStroke(chunk, options)))
})
LOGGER.info(stopTimer() + "*** Generating scribbles: " + scribbles.length)

startTimer()
const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
    '<g>',
    ...scribbles.map(scribble => {
        return `<path d='${sketchy.getSvgPathFromStroke(scribble.flat())}'/>`
    }),
    "</g>",
    "</svg>"
].join('')


startTimer()
fs.writeFileSync(options.output, svg, { encoding: 'utf8' })
LOGGER.info(stopTimer() + "Writing output file " + options.output)

options.dump && console.log(svg)

exit(0)