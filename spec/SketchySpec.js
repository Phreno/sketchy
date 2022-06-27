let Sketchy = require("./Sketchy")

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

describe("Sketchy", () => {
    let sketchy
    beforeEach(() => sketchy = new Sketchy())
    it("doit être un objet", () => expect(sketchy).toEqual(jasmine.any(Object)));
    it("doit pouvoir retourner une stroke", () => expect(sketchy.getStroke).toEqual(jasmine.any(Function)));
    describe("getStroke", () => {
        it("doit retourner un tableau de point", () => expect(sketchy.getStroke(POINTS)).toEqual(jasmine.any(Array)))
    })
    it("doit pouvoir «randomiser» les points", () => expect(sketchy.randomize).toEqual(jasmine.any(Function)))
    describe("randomize", () => {
        it("doit retourner un tableau de point", () => expect(sketchy.randomize(POINTS)).toEqual(jasmine.any(Array)))
        it("doit retourner un tableau de point différent", () => expect(sketchy.randomize(POINTS)).not.toEqual(POINTS))
        it("doit retourner un tableau de taille identique", () => expect(sketchy.randomize(POINTS).length).toEqual(POINTS.length))
        it("doit retourner un tableau de point sensiblement identique", () => sketchy.randomize(POINTS).forEach((point, index) =>
        console.log(point, POINTS[index])
            || expect(point).toEqual(jasmine.any(Array))
            && expect(Math.abs(point[0] - POINTS[index][0]) <= 5).toBeTruthy()
            && expect(Math.abs(point[1] - POINTS[index][1]) <= 5).toBeTruthy()))
    })
})