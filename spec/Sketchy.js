const freehand = require('perfect-freehand')
const X = 0
const Y = 1
const DEFAULT_RANDOM = {
    noise: 0.5
}


module.exports = function Sketchy() {
    const self = {}
    self.getStroke = (points, options) => options ? freehand.getStroke(points, options) : freehand.getStroke(points)
    self.randomize = (points, options = DEFAULT_RANDOM) => options.noise === 0
        ? points
        : points.map(point => [point[X] + Math.random() * options.noise, point[Y] + Math.random() * options.noise])
    return self
}