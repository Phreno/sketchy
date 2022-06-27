const X = 0
const Y = 1
const DEFAULT_RANDOM = {
    noise: 0.5
}
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const SVG = require("svg.js")(window)

const document = window.document
const draw = SVG(document.documentElement)



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
    self.getPointsFromSvgPath = function getPoints(svgPath) {
        const path = draw.path(svgPath)
        const step = 10
        const length = path.length()
        return [...Array(Math.ceil(length / step)).keys()].map(i => {
            const point = path.pointAt(i * step)
            return [point.x, point.y]
        })
    }
    return self
}