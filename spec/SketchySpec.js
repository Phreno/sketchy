let Sketchy = require("./Sketchy")
const fxParser = require("fast-xml-parser")
const parser = new fxParser.XMLParser({
    ignoreAttributes: false
})
const POINTS = [
    [22, 37],
    [31.47085206716809, 38.486799420560374],
    [40.570470341169276, 42.599794182318085],
    [48.77774957211836, 48.81787903538796],
    [55.571584510130236, 56.6199487298849],
    [60.43086990531974, 65.4848980159237],
    [62.834500507801735, 74.89162164361926],
    [56.272669936205894, 78],
    [51.29792013785348, 72.45520075563265],
    [47.15612033998844, 63.2857135831666],
    [40.242746879632165, 55.5475557621028],
    [31.649908344011934, 50.1508177817974],
    [22.46971332035504, 48.00559013160644],
    [22, 38.51637732722426]
]

const FEED_SYNC_SVG = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">',
    '<rect width="99" height="99" x="1" rx="20" fill="#F80"/>',
    '<g fill="#FFF">',
    '<circle r="8" cx="78" cy="25"/>',
    '<circle r="8" cx="28" cy="73"/>',
    '<path d="M22,37c20,0,41,21,41,41h-11c0-15-16-30-30-30z"/>',
    '<path d="M84,60c-20,0-41-21-41-41h11c0,15,16,30,30,30z"/>',
    '</g>',
    '</svg>'
].join("")

describe("Sketchy", () => {
    let sketchy
    beforeEach(() => sketchy = new Sketchy())
    it("doit être un objet", () => expect(sketchy).toEqual(jasmine.any(Object)));
    it("doit pouvoir «randomiser» les points", () => expect(sketchy.randomize).toEqual(jasmine.any(Function)))
    describe("randomize", () => {
        it("doit retourner un tableau de point", () => expect(sketchy.randomize(POINTS)).toEqual(jasmine.any(Array)))
        it("doit retourner un tableau de point différent", () => expect(sketchy.randomize(POINTS)).not.toEqual(POINTS))
        it("doit retourner un tableau de taille identique", () => expect(sketchy.randomize(POINTS).length).toEqual(POINTS.length))
        it("doit retourner un tableau de point sensiblement identique", () => sketchy.randomize(POINTS).forEach((point, index) =>
            expect(point).toEqual(jasmine.any(Array))
            && expect(Math.abs(point[0] - POINTS[index][0]) <= 0.5).toBeTruthy()
            && expect(Math.abs(point[1] - POINTS[index][1]) <= 0.5).toBeTruthy()))
        it("doit pouvoir paramétrer la force du bruit", () => expect(sketchy.randomize(POINTS, { noise: 0.5 })).not.toEqual(POINTS))
        it("doit retourner un tableau identique si le bruit est nul", () => expect(sketchy.randomize(POINTS, { noise: 0 })).toEqual(POINTS))
        it("ne doit pas retourner le meme tableau lorsque appelé deux fois de suite", () => expect(sketchy.randomize(POINTS)).not.toEqual(sketchy.randomize(POINTS)))
    })
    describe("getPointsFromSvgPath", () => {
        let data
        beforeEach(() => data = parser.parse(FEED_SYNC_SVG))
        it("doit être une fonction", () => expect(sketchy.getPointsFromSvgPath).toEqual(jasmine.any(Function)));
        it("doit retourner un tableau", () => expect(sketchy.getPointsFromSvgPath(data.svg.g.path[0]["@_d"])).toEqual(jasmine.any(Array)));
        it("doit retourner un tableau correspondant au bon path avec FEED_SYNC_SVG", () => expect(sketchy.getPointsFromSvgPath(data.svg.g.path[0]["@_d"])).toEqual(
            [[22, 37],
            [31.47085206716809, 38.486799420560374],
            [40.570470341169276, 42.599794182318085],
            [48.77774957211836, 48.81787903538796],
            [55.571584510130236, 56.6199487298849],
            [60.43086990531974, 65.4848980159237],
            [62.834500507801735, 74.89162164361926],
            [56.272669936205894, 78],
            [51.29792013785348, 72.45520075563265],
            [47.15612033998844, 63.2857135831666],
            [40.242746879632165, 55.5475557621028],
            [31.649908344011934, 50.1508177817974],
            [22.46971332035504, 48.00559013160644],
            [22, 38.51637732722426]]
        ))
    })
})