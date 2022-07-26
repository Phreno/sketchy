const fxParser = require('fast-xml-parser')
const Sketchy = require('./Sketchy')

const parser = new fxParser.XMLParser({
  ignoreAttributes: false
})
const fs = require('fs')

const POINTS = [[22, 37], [31.470_852_067_168_09, 38.486_799_420_560_374], [40.570_470_341_169_276, 42.599_794_182_318_085], [48.777_749_572_118_36, 48.817_879_035_387_96], [55.571_584_510_130_236, 56.619_948_729_884_9], [60.430_869_905_319_74, 65.484_898_015_923_7], [62.834_500_507_801_735, 74.891_621_643_619_26], [56.272_669_936_205_894, 78], [51.297_920_137_853_48, 72.455_200_755_632_65], [47.156_120_339_988_44, 63.285_713_583_166_6], [40.242_746_879_632_165, 55.547_555_762_102_8], [31.649_908_344_011_934, 50.150_817_781_797_4], [22.469_713_320_355_04, 48.005_590_131_606_44], [22, 38.516_377_327_224_26]]

const file = {
  SQUARE: fs.readFileSync('spec/rsc/square.svg', 'utf8'),
  ONE_PATH: fs.readFileSync('spec/rsc/one-path.svg', 'utf8'),
  ONE_POLYLINE: fs.readFileSync('spec/rsc/one-polyline.svg', 'utf8'),
  ONE_LINE: fs.readFileSync('spec/rsc/one-line.svg', 'utf8')
}

const rsc = {
  SQUARE: parser.parse(file.SQUARE),
  ONE_PATH: parser.parse(file.ONE_PATH),
  ONE_POLYLINE: parser.parse(file.ONE_POLYLINE),
  ONE_LINE: parser.parse(file.ONE_LINE)
}

describe('Sketchy', () => {
  let sketchy
  beforeEach(() => {
    sketchy = new Sketchy()
  }
  )
  it('doit être un objet', () => expect(sketchy).toEqual(jasmine.any(Object)))
  it('doit pouvoir «randomiser» les points', () => expect(sketchy.addNoiseToCoords).toEqual(jasmine.any(Function)))
  describe('addNoiseToCoords', () => {
    it('doit retourner un tableau de point', () => expect(sketchy.addNoiseToCoords(POINTS)).toEqual(jasmine.any(Array)))
    it('doit retourner un tableau de point différent', () => expect(sketchy.addNoiseToCoords(POINTS)).not.toEqual(POINTS))
    it('doit retourner un tableau de taille identique', () => expect(sketchy.addNoiseToCoords(POINTS).length).toEqual(POINTS.length))
    it('doit retourner un tableau de point sensiblement identique', () => sketchy.addNoiseToCoords(POINTS).forEach((point, index) => expect(point).toEqual(jasmine.any(Array)) && expect(Math.abs(point[0] - POINTS[index][0]) <= 0.5).toBeTruthy() && expect(Math.abs(point[1] - POINTS[index][1]) <= 0.5).toBeTruthy()))
    it('doit pouvoir paramétrer la force du bruit', () => expect(sketchy.addNoiseToCoords(POINTS, {
      noise: 0.5
    })).not.toEqual(POINTS))
    it('doit retourner un tableau identique si le bruit est nul', () => expect(sketchy.addNoiseToCoords(POINTS, {
      noise: 0
    })).toEqual(POINTS))
    it('ne doit pas retourner le meme tableau lorsque appelé deux fois de suite', () => expect(sketchy.addNoiseToCoords(POINTS)).not.toEqual(sketchy.addNoiseToCoords(POINTS)))
  }
  )
  describe('getCoordsFromSvgPath', () => {
    it('doit être une fonction', () => expect(sketchy.getCoordsFromSvgPath).toEqual(jasmine.any(Function)))
    it('doit retourner un tableau', () => expect(sketchy.getCoordsFromSvgPath(rsc.SQUARE.svg.g.g.path['@_d'])).toEqual(jasmine.any(Array)))
    it('doit retourner un tableau correspondant au bon path avec SQUARE_SVG', () => {
      expect(sketchy.getCoordsFromSvgPath(rsc.ONE_PATH.svg.path['@_d'])).toEqual([[0, 0]])
    }
    )
  }
  )
  describe('getSvgPointsFromSvgObjectPoints', () => {
    let data
    beforeEach(() => {
      data = sketchy.getSvgPointsFromSvgObject(rsc.ONE_POLYLINE)
    })
    it('doit être une fonction', () => expect(sketchy.getSvgPointsFromSvgObjectPoints).toEqual(jasmine.any(Function)))
    it('doit retourner un tableau', () => expect(sketchy.getSvgPointsFromSvgObjectPoints(data[0])).toEqual(jasmine.any(Array)))
    it('doit parser correctement [\'1,2 3,4\', \'5,6 7,8\']', () => expect(sketchy.getSvgPointsFromSvgObjectPoints('1,2 3,4')).toEqual([[1, 2], [3, 4]]))
  }
  )
  describe('getSvgPointsFromSvgObject', () => {
    it('doit être une fonction', () => expect(sketchy.getSvgPointsFromSvgObject).toEqual(jasmine.any(Function)))
    it('doit retourner un tableau', () => expect(sketchy.getSvgPointsFromSvgObject(rsc.SQUARE)).toEqual(jasmine.any(Array)))
    it('doit retourner tous les points de streamlines', () => expect(sketchy.getSvgPointsFromSvgObject(rsc.ONE_POLYLINE).length).toEqual(1))
    it('doit retourner une ligne de points valide avec streamlines', () => expect(sketchy.getSvgPointsFromSvgObject(rsc.ONE_POLYLINE)[0]).toEqual('20,20 40,25 60,40 80,120 120,140 200,180'))
  }
  )
  describe('getLinesFromSvg', () => {
    it('doit être un fonction', () => expect(sketchy.getLinesFromSvg).toEqual(jasmine.any(Function)))
    it('doit retourner un tableau', () => expect(sketchy.getLinesFromSvg(rsc.SQUARE)).toEqual(jasmine.any(Array)))
    it('doit retourner toutes les lignes', () => expect(sketchy.getLinesFromSvg(rsc.ONE_LINE).length).toEqual(1))
  }
  )
  describe('getSvgPathsFromSvgObject', () => {
    describe('FEED SYNC', () => {
      it('doit pouvoir retourner un array', () => expect(sketchy.getSvgPathsFromSvgObject(rsc.ONE_PATH)).toEqual(jasmine.any(Array)))
      it('doit retourner 1 chemins', () => expect(sketchy.getSvgPathsFromSvgObject(rsc.ONE_PATH)).toEqual(['M 0,0 l 1,1']))
    }
    )
    describe('SQUARE', () => {
      it('doit pouvoir retourner tous les chemins de SQUARE', () => expect(sketchy.getSvgPathsFromSvgObject(rsc.ONE_PATH)).toEqual(jasmine.any(Array)))
      it('doit retourner 1 chemin', () => expect(sketchy.getSvgPathsFromSvgObject(rsc.ONE_PATH)).toEqual(['M 0,0 l 1,1']))
    }
    )
    describe('MAP', () => {
      it('doit pouvoir retourner tous les chemins de MAP', () => expect(sketchy.getSvgPathsFromSvgObject(rsc.ONE_PATH)).toEqual(jasmine.any(Array)))
      it('doit retourner 1 chemin', () => expect(sketchy.getSvgPathsFromSvgObject(rsc.ONE_PATH)).toEqual(['M 0,0 l 1,1']))
    }
    )
  }
  )
}
)
