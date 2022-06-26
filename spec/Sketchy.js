const freehand =  require('perfect-freehand')
module.exports = function Sketchy(){
    const self = {}
    self.getStroke = (points, options) => options ? freehand.getStroke(points, options) : freehand.getStroke(points)
    self.randomize = (points) => points.map(point=>[point[0] + Math.random() * 10 - 5, point[1] + Math.random() * 10 - 5])
    return self
}