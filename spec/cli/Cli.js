const freehand = require('perfect-freehand')
const Sketchy = require('../../spec/Sketchy')
const fxParser = require('fast-xml-parser')
const pathSplitter = require('../../tools/PathSplitter')
const { LOGGER } = require('../../tools/Logger')
const { exit } = require('process')
const fs = require('fs')
const parser = new fxParser.XMLParser({ ignoreAttributes: false })

const sketchy = new Sketchy()
function Cli (options) {
  const debug = (data, file) => options.log === 'debug' && fs.writeFileSync('./debug/' + file, data, 'utf8')
  if (!options.input) {
    LOGGER.error('No input file provided')
    exit(1)
  } else if (!fs.existsSync(options.input)) {
    LOGGER.error('Input file does not exist')
    exit(1)
  }
  const data = {
    svgString: null,
    svgDocument: null,
    paths: [],
    points: [],
    breadcrumbs: [],
    strokes: [],
    svg: null
  }
  const self = {}
  self.readInputFile = () => {
    LOGGER.level = options.log
    data.svgString = fs.readFileSync(options.input, 'utf8')
    debug(data.svgString, 'svgString.svg')
  }
  self.parseSvgData = () => {
    data.svgDocument = parser.parse(data.svgString)
    debug(JSON.stringify(data.svgDocument, null, 2), 'svgDocument.json')
  }
  self.extractPaths = () => {
    data.paths = sketchy.getPathsFromSvg(data.svgDocument)
    LOGGER.info(data.paths.length + ' paths found')
    debug(JSON.stringify(data.paths, null, 2), 'extracted-paths.json')
  }
  self.renderGridFromPaths = () => {
    console.log('TODO')
  }
  self.splitPaths = () => {
    data.paths = data.paths.map(path => pathSplitter(path)).flat()
    LOGGER.info(data.paths.length + ' paths found')
    debug(JSON.stringify(data.paths, null, 2), 'splitted-paths.json')
  }
  self.renderPointsFromPaths = () => {
    data.paths = data.paths.map(path => sketchy.getPointsFromSvgPath(path, options.stepSize))
    debug(JSON.stringify(data.paths, null, 2), 'parsed-paths.json')
  }
  self.extractPoints = () => {
    data.points = sketchy.getPointsFromSvg(data.svgDocument)
    LOGGER.info(data.points.length + ' points found')
    debug(JSON.stringify(data.points, null, 2), 'extracted-points.json')
  }
  self.renderPointsFromPoints = () => {
    data.points = data.points.map(point => sketchy.getPointsFromSvgPoints(point))
    debug(JSON.stringify(data.points, null, 2), 'parsed-points.json')
  }
  self.extractBreadcrumbs = () => {
    data.breadcrumbs = [...data.paths, ...data.points]
    LOGGER.info(data.breadcrumbs.length + ' breadcrumbs found')
    if (options.noise) {
      data.breadcrumbs = data.breadcrumbs.map(breadcrumb => sketchy.randomize(breadcrumb, { noise: options.noise }))
      LOGGER.info('Adding noise: ' + options.noise)
    }
  }
  self.renderFreehand = () => {
    data.strokes = data.breadcrumbs.map(weave => freehand.getStroke(weave, options))
    debug(JSON.stringify(data.strokes, null, 2), 'strokes.json')
  }
  self.renderSvg = () => {
    data.svg = [
      "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>",
      '<g>',
      ...data.strokes.map(stroke => `<path d='${sketchy.getSvgPathFromStroke(stroke)}'/>`),
      '</g>',
      '</svg>'
    ].join('\n')
    debug(data.svg, 'output.svg')
  }
  self.writeOutputFile = () => fs.writeFileSync(options.output, data.svg, { encoding: 'utf8' })
  return self
}
exports.Cli = Cli
