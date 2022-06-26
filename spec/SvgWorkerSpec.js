let SvgWorker = require("./SvgWorker")

describe("init", ()=>{
    it("doit lancer les tests", ()=> expect(true).toBe(true));
})

describe("SvgWorker", ()=>{
    let svgWorker;
    beforeEach(()=> svgWorker = new SvgWorker())
    it("doit être un objet", ()=> expect(svgWorker).toEqual(jasmine.any(Object)));
    describe("parse", ()=>{
        it("doit être une fonction", ()=> expect(svgWorker.parse).toEqual(jasmine.any(Function)));
        it("doit retourner un objet", ()=> expect(svgWorker.parse("<svg></svg>")).toEqual(jasmine.any(Object)));
    })
})