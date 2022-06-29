const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const SVG = require("svg.js")(window)

const document = window.document
const draw = SVG(document.documentElement)

const X = 0
const Y = 1
const DEFAULT_RANDOM = {
    noise: 0.5
}
const SVG_PATH_IDENTIFIER = 'path'
const SVG_PATH_ATTRIBUTE = '@_d'

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
    self.getPointsFromSvgPath = (svgPath) => {
        const path = draw.path(svgPath)
        const step = 10
        const length = path.length()
        return [...Array(Math.ceil(length / step)).keys()].map(i => {
            const point = path.pointAt(i * step)
            return [point.x, point.y]
        })
    }
    /**
     * Récupère tous les chemins d'un fichier SVG récursivement
     * @param {Object} source Le fichier SVG parsé via fast-xml-parser
     * @returns tous les paths du fichier SVG
     */
    self.getPathsFromSvg = (source) => {
        function* getValues(source, search) {
            const [key] = Object.keys(source)
            if (key === undefined) return
            const { [key]: value, ...rest } = source
            if (key === search) yield value
            if (typeof value === 'object') yield* getValues(value, search)
            yield* getValues(rest, search)
        }
        const pathIterator = getValues(source, SVG_PATH_IDENTIFIER)
        const paths = []
        for (const path of pathIterator) paths.push(path)
        return paths.flat().map(path => path[SVG_PATH_ATTRIBUTE])
    }
    return self
}