// returns a window with a document and an svg root node
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
const { SVG, registerWindow } = require('@svgdotjs/svg.js')

// register window and document
registerWindow(window, document)
const draw = SVG(document.documentElement)


const X = 0
const Y = 1
const DEFAULT_RANDOM = {
    noise: 0.5
}

const EMPTY = ''
const SPACE = ' '
const SVG_PATH_IDENTIFIER = 'path'
const SVG_PATH_ATTRIBUTE = '@_d'
const SVG_ABSOLUTE_MOVE = 'M'
const SVG_QUADRATIC_CURVE = 'Q'
const SVG_CLOSE_PATH = 'Z'

/**
 * Recursively looks for a given tag in an SVG tree
 * @param {Object} source The SVG tree
 * @param {String} search The tag to look for
 * @returns An array of all the value found
 */
function* getValues(source, search) {
    const [key] = Object.keys(source)
    if (key === undefined) return
    const { [key]: value, ...rest } = source
    if (key === search) yield value
    if (typeof value === 'object') yield* getValues(value, search)
    yield* getValues(rest, search)
}

module.exports = function Sketchy() {
    const self = {}
    /**
     * Modifie légèrement les points passés en paramètre de facon à rendre un tracé irrégulier
     * @param {Array} points Liste de points à transformer sous la forme [[x,y],[x,y],...]
     * @param {Object} options Options de génération de points
     * @param {Number} options.noise Coefficient de bruit
     * @returns Un tableau de points transformés en fonction des options
     */
    self.randomize = (points, options = DEFAULT_RANDOM) => options.noise === 0
        ? points
        : points.map(point => [point[X] + Math.random() * options.noise, point[Y] + Math.random() * options.noise])
    /**
     * Récupère un tableun de points à partir d'un tracé SVG
     * @param {String} svgPath Tracé SVG à transformer
     * @returns un tableau de points sous la forme [[x,y],[x,y],...]
     */
    self.getPointsFromSvgPath = (svgPath, stepSize = 10) => {
        const path = draw.path(svgPath)
        const length = path.length()
        const arr = [...Array(Math.ceil(length / stepSize)).keys()].map(i => {
            const point = path.pointAt(i * stepSize)
            return [point.x, point.y]
        })
        return arr
    }
    /**
     * Get all the points tags in an SVG tree
     * @param {Object} source The SVG tree
     * @returns An array of all the value found
     */
    self.getPointsFromSvg = (source) => [...getValues(source, "@_points")]
    /**
     * Parse SVG points to an array of points
     * @param {Array} points
     * @returns An array of points
     */
    self.getPointsFromSvgPoints = (points) =>
        points.split(/\s+/)                         // '1,2 3,4' => ['1,2', '3,4']
                .map(el => el.split(',')            // ['1,2', '3,4'] => [["1","2"], ["3","4"]]
                    .map(el => parseFloat(el)))     // [["1","2"], ["3","4"]] => [[1,2], [3,4]]
    /**
     * Récupère tous les chemins d'un fichier SVG récursivement
     * @param {Object} source Le fichier SVG parsé via fast-xml-parser
     * @returns tous les paths du fichier SVG
     */
    self.getPathsFromSvg = (source) =>
        [...getValues(source, SVG_PATH_IDENTIFIER)]
            .flat()
            .map(path => path[SVG_PATH_ATTRIBUTE])
    /**
     * cf. https://github.com/steveruizok/perfect-freehand #rendering
     * @param {*} stroke
     * @returns
     */
    self.getSvgPathFromStroke = (stroke) => {
        if (!stroke.length) return EMPTY
        const d = stroke.reduce(
            (acc, [x0, y0], i, arr) => {
                const [x1, y1] = arr[(i + 1) % arr.length]
                acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
                return acc
            },
            [SVG_ABSOLUTE_MOVE, ...stroke[0], SVG_QUADRATIC_CURVE]
        )

        d.push(SVG_CLOSE_PATH)
        return d.join(SPACE)
    }
    self.renderGridFromPaths = ()=>[]
    return self
}