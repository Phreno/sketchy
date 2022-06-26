let SvgWorker = require("./SvgWorker")

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

describe("init", () => {
    it("doit lancer les tests", () => expect(true).toBe(true));
})

describe("SvgWorker", () => {
    let svgWorker;
    beforeEach(() => svgWorker = new SvgWorker())
    it("doit être un objet", () => expect(svgWorker).toEqual(jasmine.any(Object)));
    describe("parse", () => {
        it("doit être une fonction", () => expect(svgWorker.parse).toEqual(jasmine.any(Function)));
        it("doit retourner un objet", () => expect(svgWorker.parse(FEED_SYNC_SVG)).toEqual(jasmine.any(Object)));
        it("doit retourner FEED_SYNC_SVG correctement parsé", () => expect(svgWorker.parse(FEED_SYNC_SVG)).toEqual({
            "svg": {
                "rect": { "@_width": "99", "@_height": "99", "@_x": "1", "@_rx": "20", "@_fill": "#F80" },
                "g": {
                    "circle": [
                        { "@_r": "8", "@_cx": "78", "@_cy": "25" },
                        { "@_r": "8", "@_cx": "28", "@_cy": "73" }
                    ],
                    "path": [
                        { "@_d": "M22,37c20,0,41,21,41,41h-11c0-15-16-30-30-30z" },
                        { "@_d": "M84,60c-20,0-41-21-41-41h11c0,15,16,30,30,30z" }
                    ],
                    "@_fill": "#FFF"
                },
                "@_xmlns": "http://www.w3.org/2000/svg",
                "@_viewBox": "0 0 100 100"
            }
        })
        )
    })

    describe("getPoints", () => {
        let data
        beforeEach(() => data = svgWorker.parse(FEED_SYNC_SVG))
        it("doit être une fonction", () => expect(svgWorker.getPoints).toEqual(jasmine.any(Function)));
        it("doit retourner un tableau", () => expect(svgWorker.getPoints(data.svg.g.path[0]["@_d"])).toEqual(jasmine.any(Array)));
        it("doit retourner un tableau correspondant au bon path avec FEED_SYNC_SVG", () => expect(svgWorker.getPoints(data.svg.g.path[0]["@_d"])).toEqual(
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