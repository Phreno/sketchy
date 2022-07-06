const Sketchy = require("./Sketchy")
const fxParser = require("fast-xml-parser")
const parser = new fxParser.XMLParser({
    ignoreAttributes: false
})
const fs = require("fs")

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

const file = {
    FEED_SYNC: fs.readFileSync("rsc/feed_sync.svg", "utf8"),
    WATER: fs.readFileSync("rsc/water.svg", "utf8"),
    MAP: fs.readFileSync("rsc/map.svg", "utf8"),
    STREAMLINES: fs.readFileSync("rsc/streamlines.svg", "utf8")
}

const rsc = {
    FEED_SYNC: parser.parse(file.FEED_SYNC),
    WATER: parser.parse(file.WATER),
    MAP: parser.parse(file.MAP),
    STREAMLINES: parser.parse(file.STREAMLINES)
}

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
        it("doit être une fonction", () => expect(sketchy.getPointsFromSvgPath).toEqual(jasmine.any(Function)));
        it("doit retourner un tableau", () => expect(sketchy.getPointsFromSvgPath(rsc.FEED_SYNC.svg.g.path[0]["@_d"])).toEqual(jasmine.any(Array)));
        it("doit retourner un tableau correspondant au bon path avec FEED_SYNC_SVG", () => expect(sketchy.getPointsFromSvgPath(rsc.FEED_SYNC.svg.g.path[0]["@_d"])).toEqual(
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
    describe("getPointsFromSvgPoints", () => {
        let data
        beforeEach(() => data = sketchy.getPointsFromSvg(rsc.STREAMLINES))
        it("doit être une fonction", () => expect(sketchy.getPointsFromSvgPoints).toEqual(jasmine.any(Function)));
        it("doit retourner un tableau", () => expect(sketchy.getPointsFromSvgPoints(data[0])).toEqual(jasmine.any(Array)));
        it("doit parser correctement ['1,2 3,4', '5,6 7,8']", () => expect(sketchy.getPointsFromSvgPoints("1,2 3,4")).toEqual([[1, 2], [3, 4]]))
    })
    describe("getPointsFromSvg", () => {
        it("doit être une fonction", () => expect(sketchy.getPointsFromSvg).toEqual(jasmine.any(Function)));
        it("doit retourner un tableau", () => expect(sketchy.getPointsFromSvg(rsc.STREAMLINES)).toEqual(jasmine.any(Array)));
        it("doit retourner tous les points de streamlines", () => expect(sketchy.getPointsFromSvg(rsc.STREAMLINES).length).toEqual(409))
        it("doit retourner une ligne de points valide avec streamlines", () => expect(sketchy.getPointsFromSvg(rsc.STREAMLINES)[0]).toEqual('80.96,521.9 78,521.52 66,521.26 36,521.12 0,521.08'))
    })
    describe("getPathsFromSvg", () => {
        describe("FEED SYNC", () => {
            it("doit pouvoir retourner tous les chemins de FEED SYNC", () => expect(sketchy.getPathsFromSvg(rsc.FEED_SYNC)).toEqual(jasmine.any(Array)))
            it("doit retourner 2 chemins", () => expect(sketchy.getPathsFromSvg(rsc.FEED_SYNC)).toEqual(
                [
                    'M22,37c20,0,41,21,41,41h-11c0-15-16-30-30-30z',
                    'M84,60c-20,0-41-21-41-41h11c0,15,16,30,30,30z'
                ]
            ))
        })
        describe("WATER", () => {
            it("doit pouvoir retourner tous les chemins de WATER", () => expect(sketchy.getPathsFromSvg(rsc.WATER)).toEqual(jasmine.any(Array)))
            it("doit retourner 1 chemin", () => expect(sketchy.getPathsFromSvg(rsc.WATER)).toEqual([
                'M.036 3.314a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 3.964a.5.5 0 0 1-.278-.65zm0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 6.964a.5.5 0 0 1-.278-.65zm0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0L.314 9.964a.5.5 0 0 1-.278-.65zm0 3a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.757-.703a.5.5 0 0 1-.278-.65z'
            ]))
        })
        describe("MAP", () => {
            it("doit pouvoir retourner tous les chemins de MAP", () => expect(sketchy.getPathsFromSvg(rsc.MAP)).toEqual(jasmine.any(Array)))
            it("doit retourner 1 chemin", () => expect(sketchy.getPathsFromSvg(rsc.MAP)).toEqual([
                'm 538.86719,321.73114 -30.03711,7.92187 c -16.52072,4.35768 -36.62684,9.0453 -36.82422,9.21289 l -3.10157,1.66797 -3.10156,1.66797 -4.45703,8.05859 c -4.00082,7.23397 -4.90062,9.39049 -8.79687,21.07227 -2.38717,7.15725 -4.14514,13.19229 -3.90625,13.41211 0.2389,0.21981 4.62728,1.927 9.75195,3.79297 5.12466,1.86597 20.64955,8.285 34.5,14.26367 22.45714,9.69384 27.88072,11.8077 50.11328,19.52929 13.53387,4.70044 24.78736,8.54703 25.375,8.67579 1.94351,0.87782 6.67089,2.26351 8.94141,3.07031 4.03421,1.43351 15.90431,7.90376 18.0625,9.8457 0.69252,0.62313 9.05092,4.91082 18.57226,9.52734 16.00606,7.76074 17.62927,8.66761 21.53321,12.03321 2.32229,2.00206 4.32214,3.98097 4.44531,4.39648 0.60502,2.04096 3.30113,16.80075 3.33203,18.24219 0.0523,2.43968 0.29534,2.81906 5.49805,8.59766 2.62744,2.91827 4.9203,5.21777 5.0957,5.10937 0.17539,-0.1084 0.4771,-1.38624 0.66992,-2.83984 0.40204,-3.03068 0.9742,-3.93157 2.48828,-3.91797 0.58935,0.005 3.88884,0.90682 7.33399,2.0039 3.44515,1.09713 6.29483,1.94251 6.33203,1.87891 0.76979,-1.31702 12.25233,-41.40889 11.91992,-41.61914 -0.25988,-0.16437 -1.57551,-4.01383 -2.92383,-8.55469 l -4.90234,-15.59375 c -0.0414,-0.71591 -2.03774,-10.7331 -4.59961,-23.04492 -4.76094,-22.8801 -4.85729,-23.24328 -9.42969,-36.0625 l -4.61914,-12.95117 -5.06445,-5.03906 -5.06446,-5.04102 -19.62304,-6.05859 c -10.79286,-3.33246 -24.76763,-7.75977 -24.97657,-7.75977 -0.002,0 -0.0238,0.0548 -0.0273,0.0586 l -6.17969,-1.91407 c -3.63503,-1.12613 -7.74191,-2.39868 -9.12695,-2.82812 -1.38505,-0.42944 -2.75312,-1.07104 -3.03906,-1.42578 -0.28853,-0.35794 -10.23101,-2.59131 -22.3418,-5.01758 z m -3.27344,104.01953 c -0.10288,0.10288 2.25972,2.23784 5.25,4.74414 2.99027,2.5063 8.26315,7.40257 11.7168,10.88086 3.54067,3.56597 6.32744,6.0125 6.69531,5.88671 0.37706,0.36528 10.104,6.0493 17.37109,9.58399 12.29846,5.98193 13.80183,6.58752 17.25,6.95508 2.07757,0.22146 3.91459,0.4338 4.08203,0.4707 0.16743,0.0368 -1.21761,-3.48035 -3.07617,-7.81445 -2.65299,-6.18668 -3.66505,-8.03013 -4.71094,-8.57813 -0.7327,-0.3839 -1.33484,-0.97313 -1.33984,-1.31054 -0.0167,-1.21016 -20.06859,-10.08183 -23.06055,-10.48438 -10e-4,-0.002 10e-4,-0.0104 0,-0.0117 -0.52802,-0.47066 -29.9616,-10.53839 -30.17773,-10.32226 z m 64.00976,27.15234 c -0.15507,0.15507 1.18504,3.51716 2.97657,7.4707 l 3.25781,7.1875 15.55078,9.69727 c 8.55298,5.33327 15.74785,9.7074 15.99023,9.7207 0.24235,0.0133 0.31713,-0.59956 0.16602,-1.36133 -0.1511,-0.76178 -0.79415,-4.05876 -1.42969,-7.32617 l -1.15625,-5.93945 -3.29101,-2.91016 c -2.75453,-2.43397 -5.61574,-4.0432 -17.53711,-9.86523 -7.83486,-3.82631 -14.37229,-6.82889 -14.52735,-6.67383 z',
                'm 582.29823,574.23781 c -8.36697,-1.43388 -57.99645,-14.51946 -59.21952,-15.61415 -0.46111,-0.4127 35.1267,-101.64665 36.08611,-102.65142 0.49688,-0.52037 7.09532,2.13739 15.63027,6.29566 11.28307,5.49718 15.78689,7.19621 19.0758,7.19621 3.78362,0 6.87981,1.61756 25.54726,13.34681 20.61202,12.95107 21.53621,13.67533 31.17004,24.42717 l 9.9282,11.08036 -12.02245,18.6522 -12.02246,18.65221 -19.90707,10.30784 c -10.94889,5.66931 -20.75811,10.2655 -21.79827,10.21376 -1.04016,-0.0517 -6.65072,-0.90973 -12.46791,-1.90665 z',
                'm 487.61147,541.38597 c -29.38251,-14.94049 -54.66746,-28.84924 -55.09797,-30.3083 -0.13269,-0.44972 10.51024,-8.79233 23.65096,-18.53913 l 23.89222,-17.72146 7.67118,-15.51964 c 4.3807,-8.86262 9.75075,-21.83305 12.51932,-30.23827 l 4.84815,-14.71865 7.45776,3.1129 c 5.71301,2.38463 10.44304,5.62395 20.21811,13.84618 7.0182,5.9033 14.89113,12.93904 17.49538,15.63497 l 4.73504,4.90169 -18.2751,52.12808 c -10.0513,28.67045 -18.75473,52.10359 -19.34096,52.07367 -0.58623,-0.0299 -13.98457,-6.62335 -29.77409,-14.65204 z',
                'm 410.22298,512.98352 c -1.96747,-0.20223 -7.10873,-2.81162 -12.44974,-6.31871 -5.00402,-3.28581 -9.66742,-5.97421 -10.3631,-5.97421 -0.69568,0 -2.46358,0.9429 -3.92866,2.09532 -1.46507,1.15244 -3.06823,1.9457 -3.56255,1.76279 -0.49433,-0.1829 -19.56164,-19.24624 -42.37181,-42.36299 -28.09488,-28.4725 -41.22152,-42.44455 -40.69335,-43.31416 0.42883,-0.70603 5.98355,-7.40308 12.34383,-14.88233 6.36028,-7.47924 11.62136,-13.69976 11.6913,-13.82337 0.0699,-0.1236 13.15165,-2.50336 29.07048,-5.28835 28.05871,-4.90886 29.53934,-5.06362 48.44374,-5.06362 h 19.50043 l 24.52907,8.96061 c 20.11541,7.34827 56.47993,22.15082 57.89645,23.56733 1.08998,1.08998 -10.72437,32.37822 -16.9199,44.80941 l -7.26406,14.57518 -24.51166,18.23026 c -13.48141,10.02664 -25.29336,18.24341 -26.24878,18.25949 -0.95542,0.0161 -4.00356,1.17281 -6.77365,2.57053 -3.22343,1.62646 -6.24304,2.4173 -8.38804,2.19682 z',
                'm 430.77241,378.2472 -12.01394,-4.47714 -20.21984,0.0446 c -17.56202,0.0387 -22.31395,0.4157 -36.15111,2.8679 l -15.93127,2.82332 -3.94498,-7.84619 c -2.16974,-4.31544 -7.07235,-16.37157 -10.89469,-26.79146 -3.82234,-10.41987 -9.2592,-24.0616 -12.08191,-30.31496 l -5.1322,-11.36972 6.18936,-12.42564 6.18937,-12.42564 70.09025,-22.12536 70.09025,-22.12536 0.30127,31.31479 c 0.28037,29.14282 0.14447,32.0915 -1.9593,42.51301 l -2.26057,11.19822 4.22574,6.73964 c 2.32416,3.7068 4.22574,7.07642 4.22574,7.48804 0,0.41163 -1.98271,1.71169 -4.40604,2.88903 -3.78528,1.83903 -5.12513,3.43286 -9.51016,11.31286 -2.80728,5.04474 -7.04422,15.05069 -9.41544,22.23545 -2.37122,7.18476 -4.55099,13.03812 -4.84395,13.00746 -0.29294,-0.0306 -5.9389,-2.07045 -12.54658,-4.53287 z',
                'm 472.87911,325.66771 -4.76185,-7.64007 1.91825,-8.13998 c 1.65383,-7.01797 1.96212,-12.9996 2.23663,-43.39568 l 0.31839,-35.25571 8.09721,-3.41579 8.09721,-3.41579 14.77467,5.78788 c 8.12608,3.18333 17.29641,6.7308 20.37853,7.88326 l 5.60384,2.09539 24.9897,-7.28291 c 13.74433,-4.0056 25.18545,-7.08717 25.42467,-6.84793 0.57524,0.57524 2.52462,98.5247 1.97183,99.07749 -0.23523,0.23524 -10.10721,-1.48862 -21.93774,-3.83079 l -21.51003,-4.25849 -27.19726,7.20827 c -14.95849,3.96454 -28.64737,7.62736 -30.41973,8.13959 -3.20229,0.92549 -3.25231,0.88347 -7.98432,-6.70874 z',
                'm 616.90151,337.30582 -29.36065,-9.11524 -0.59308,-17.25067 c -0.3262,-9.48787 -0.71254,-32.87982 -0.85854,-51.98211 l -0.26544,-34.73144 16.62054,-2.68928 c 10.42231,-1.68637 23.94575,-3.02433 36.26302,-3.58771 l 19.64246,-0.89844 10.57671,3.1938 10.57671,3.19379 0.69459,6.41714 c 0.38202,3.52943 2.44988,15.02961 4.59524,25.55595 l 3.90065,19.13882 14.70797,18.63515 14.70796,18.63516 -34.41279,17.32137 c -18.92703,9.52675 -35.09272,17.31182 -35.92375,17.30016 -0.83103,-0.0117 -14.72325,-4.12306 -30.8716,-9.13645 z',
                'm 764.68543,475.01297 -52.81871,-10.37319 -13.244,-6.40176 -13.24399,-6.40176 -3.2019,-11.08036 c -1.76104,-6.0942 -5.23476,-20.82605 -7.71938,-32.73744 -5.77792,-27.69961 -12.30199,-46.98431 -17.98284,-53.15599 -2.17774,-2.36591 -3.77994,-4.46882 -3.56043,-4.67314 0.9098,-0.84683 69.63981,-34.93319 69.86465,-34.64908 0.13481,0.17034 10.47799,15.28803 22.98485,33.59486 l 22.73975,33.28514 4.8872,17.03229 4.8872,17.03229 4.69909,1.05517 c 14.04019,3.15268 36.74036,42.88237 37.00579,64.76726 0.0245,2.01839 -0.44313,3.23639 -1.21943,3.17632 -0.69252,-0.0536 -25.02755,-4.76535 -54.07785,-10.47061 z',
                'm 687.58008,374.51172 c -0.0894,0.14199 -3.03954,10.00267 -6.55469,21.91406 -3.51515,11.91139 -6.77991,22.10012 -7.25586,22.64063 -0.5559,0.63131 -3.25401,0.35733 -7.54297,-0.76758 -3.67215,-0.96313 -6.79661,-1.63112 -6.94336,-1.48438 -0.14674,0.14675 -0.55235,1.40633 -0.90234,2.80078 -0.56534,2.25251 4.83878,8.6032 48.43164,56.91211 26.98689,29.90644 55.81824,62.43186 64.07031,72.2793 9.49366,11.32906 15.44583,17.64738 16.20703,17.20508 0.66165,-0.38445 5.96211,-3.71279 11.7793,-7.39649 5.81719,-3.6837 16.31082,-10.02041 23.31836,-14.08203 l 12.74023,-7.38476 v -0.002 c 0.78468,-0.28985 5.80303,-1.63147 7.59766,-0.14843 0.62703,0.51816 3.20082,0.84243 6.12695,0.86133 l 5.02735,0.0312 11.39648,9.55469 c 8.4044,7.04601 13.82767,10.94128 20.65625,14.83594 l 9.25977,5.28125 17.80664,4.06445 c 17.2642,3.94131 18.01891,4.05009 24.75195,3.57422 3.81956,-0.26994 6.94317,-0.37652 6.94336,-0.23633 1.8e-4,0.1402 1.1232,9.02777 2.49414,19.74805 1.37094,10.72027 2.49219,19.77442 2.49219,20.12109 0,0.35505 12.47869,0.63086 28.57617,0.63086 h 19.58789 l 1.67383,3.55664 19.58784,12.46485 2.8497,5.51953 8.0117,-2.13672 17.8086,6.23242 39.8867,-2.31445 12.6426,4.63086 17.0937,1.7793 22.4375,-10.50586 19.4102,-56.80274 -7.6582,-8.01367 3.0273,-24.92969 10.3281,-42.73633 -1.7812,-16.56054 -7.3008,-19.94336 -12.998,-11.39649 -84.0489,-18.69726 -21.8261,-3.32617 -31.9219,33.95703 -35.34962,-11.17969 c -33.62739,-10.63621 -36.02404,-11.28745 -49.17383,-13.35547 -7.60293,-1.19567 -13.62132,-2.06062 -13.66992,-2.17383 -1.80256,-4.20245 1.18097,-16.37627 -0.17774,-20.34765 0.11344,-0.55291 0.16329,-0.92461 0.10743,-0.98047 -0.25567,-0.25566 -18.36643,-2.54861 -40.24805,-5.0957 -21.88164,-2.54711 -42.27906,-5.28461 -45.32617,-6.08204 -3.0471,-0.79744 -29.03225,-6.02056 -57.74414,-11.60742 l -52.20313,-10.1582 -11.66992,-5.50391 c -6.41861,-3.02758 -11.74263,-5.38809 -11.83203,-5.24609 z',
                'm 561.31415,731.13142 c 0.007,-8.15255 -2.80677,-23.49335 -8.28326,-45.16769 -4.05746,-16.05824 -4.98106,-21.3215 -4.98106,-28.38501 0,-6.15281 -1.0145,-13.30977 -3.49286,-24.64115 -3.22041,-14.72411 -3.4099,-16.51715 -2.4294,-22.98759 0.82535,-5.44657 9.38788,-36.07816 10.493,-37.53765 0.12521,-0.16536 4.31263,0.84789 9.30539,2.25167 4.99276,1.40377 15.00584,3.49636 22.2513,4.6502 l 13.17357,2.0979 21.43374,-11.20936 21.43374,-11.20935 11.52106,-18.07103 c 6.33656,-9.93907 11.8392,-18.07103 12.22807,-18.07103 1.96996,0 116.77005,129.24407 116.77005,131.46189 0,0.91462 -23.17527,14.74667 -41.90511,25.01086 -13.72023,7.51885 -29.03054,17.05012 -43.18795,26.88617 -12.06293,8.3809 -22.89597,15.6315 -24.07342,16.11247 -1.17746,0.48096 -12.11315,2.04261 -24.30155,3.47034 l -22.16073,2.59587 -13.95259,-3.48535 -13.95259,-3.48535 -11.23006,6.84453 c -9.98594,6.08624 -11.97418,6.9183 -17.94684,7.51056 l -6.71678,0.66605 0.004,-5.30795 z',
                'm 505.74298,731.48256 c -11.35738,-4.88816 -24.82054,-11.42439 -29.91814,-14.52498 -5.09761,-3.10058 -10.57483,-6.31302 -12.1716,-7.13875 -1.59679,-0.82572 -19.86376,-6.27095 -40.59328,-12.1005 -20.72952,-5.82955 -46.12148,-13.23243 -56.42659,-16.45085 l -18.73655,-5.85166 3.4341,-4.5117 c 1.88876,-2.48144 6.76686,-7.91136 10.84022,-12.0665 12.58053,-12.83309 36.00991,-42.59328 55.2076,-70.12517 l 18.34385,-26.30736 7.50854,-3.91181 7.50853,-3.91182 3.32741,-10.07306 c 1.83006,-5.54018 3.53573,-10.63031 3.79037,-11.3114 0.30464,-0.81482 10.89788,4.04893 30.97358,14.22112 27.81771,14.09501 31.75527,15.79578 44.61287,19.26988 7.75626,2.09573 14.20621,3.88378 14.33323,3.97345 0.12703,0.0897 -1.81917,6.70733 -4.32487,14.70591 -2.5057,7.99858 -5.17607,18.39581 -5.93417,23.10497 -1.35613,8.42405 -1.32423,8.81383 1.978,24.17534 1.97477,9.18639 3.5929,20.07191 3.93104,26.44502 0.43089,8.12132 1.73371,15.43106 5.20644,29.21187 5.23467,20.77267 8.73275,41.03623 7.88304,45.66463 l -0.5708,3.10919 -11.25096,1.2427 c -6.18802,0.68347 -12.83746,1.42412 -14.77652,1.64586 -2.75105,0.3146 -8.06202,-1.54929 -24.17534,-8.48438 z',
                'm 332.49014,671.00408 c -6.05007,-1.94152 -17.60546,-7.74141 -37.77397,-18.95955 -15.98158,-8.88928 -37.89654,-20.81139 -48.6999,-26.49358 -19.13716,-10.06547 -19.85942,-10.56134 -28.07625,-19.27578 -4.63858,-4.91949 -9.22121,-9.36595 -10.18362,-9.88101 -1.24624,-0.66697 -4.47206,0.0309 -11.20868,2.42499 l -9.45884,3.36148 -9.06575,-3.32316 c -4.98617,-1.82773 -8.98629,-3.71018 -8.88918,-4.18321 0.0971,-0.47302 16.21504,-25.55248 35.8176,-55.73213 19.60256,-30.17964 37.7141,-58.08934 40.24786,-62.02155 3.84585,-5.96845 43.93673,-51.71632 46.04741,-52.54488 0.3689,-0.14482 20.10492,19.23323 43.85781,43.06233 23.75289,23.82909 43.59898,43.32563 44.10241,43.32563 0.50344,0 2.37835,-1.1159 4.16648,-2.47977 l 3.25114,-2.47977 8.95645,5.70628 c 11.50283,7.32862 16.36993,8.2021 23.61776,4.23861 l 4.95977,-2.71227 14.52549,8.18104 14.52548,8.18103 -3.67597,10.98983 -3.67598,10.98983 -7.05941,3.49084 -7.05941,3.49083 -18.32093,26.35984 c -18.8026,27.05286 -45.81663,61.33854 -59.58854,75.6286 -4.27143,4.43215 -8.5711,9.30499 -9.55484,10.82854 -0.98372,1.52355 -2.07643,2.73726 -2.42822,2.69713 -0.35179,-0.0401 -4.56207,-1.3317 -9.35617,-2.87017 z',
                'm 129.89258,265.47137 c -0.1849,7.5e-4 -0.28781,0.0123 -0.30664,0.0332 -0.26862,0.29797 -3.12041,8.47411 -6.33594,18.16992 -4.18089,12.60669 -6.15125,17.62891 -6.91602,17.62891 -0.58819,0 -9.5657,-1.62648 -19.951168,-3.61328 -10.38546,-1.9868 -18.95848,-3.50879 -19.05078,-3.38281 -0.0923,0.12599 -5.974997,7.92222 -13.072266,17.32422 l -12.904297,17.09375 -18.1875,9.25976 -18.189453,9.25977 L 7.94336,358.99676 0.908203,370.74871 0.455078,412.06121 0,453.37371 l 50.748047,23.12696 50.748043,23.12695 4.58594,6.0625 -6.164058,8.26172 c -3.38971,4.54384 -6.16407,8.90633 -6.16407,9.69531 0,0.78897 0.93927,8.52486 2.08594,17.19141 2.40824,18.20156 0.1675,14.56223 21.238278,34.51367 l 13.75391,13.02344 14.77734,1.89453 c 8.12676,1.04285 15.05421,2.1753 15.39453,2.51562 0.34031,0.34023 1.09885,0.46119 1.6875,0.26758 1.08032,-0.35533 5.05792,-6.37758 56.01563,-84.80859 l 28.14258,-43.31446 19.26367,-21.15234 c 10.59554,-11.63438 25.83386,-28.85903 33.86328,-38.27734 8.02941,-9.41831 15.62746,-18.07365 16.88281,-19.23438 1.67623,-1.5499 5.24403,-2.58833 13.43555,-3.90625 l 11.1543,-1.79492 -3.5293,-7.00586 c -1.94059,-3.85348 -6.9242,-16.27526 -11.07617,-27.60547 -4.15198,-11.33021 -9.4534,-24.53074 -11.78125,-29.33398 l -4.23242,-8.73438 -29.20899,-12.33594 c -17.3753,-7.33916 -24.90532,-10.62959 -28.29101,-11.58007 -1.71659,-1.48646 -6.1932,-3.64568 -5.79102,-4.82813 0.96422,-2.83492 1.75391,-5.2575 1.75391,-5.38476 0,-0.52684 -5.03596,-0.15146 -16.07813,1.19921 -7.69262,0.94095 -12.12721,1.20079 -12.94726,0.75977 -1.67779,-0.90233 -84.64335,-10.26751 -90.375,-10.24414 z',
                'm 282.12107,290.62604 c -14.68148,-6.3074 -27.04354,-11.60146 -27.47123,-11.76458 -0.4277,-0.16312 -0.0329,-2.48221 0.8773,-5.15354 2.44664,-7.18048 1.95746,-7.36612 -14.43398,-5.47733 -7.62864,0.87904 -14.06237,1.41084 -14.29717,1.18176 -0.2348,-0.22908 0.65668,-3.92625 1.98109,-8.21593 1.54001,-4.98804 5.80019,-13.60891 11.81873,-23.91631 l 9.41073,-16.1169 21.84927,-21.94707 21.84928,-21.94707 26.18995,-16.93089 c 48.18246,-31.14828 63.33018,-39.88831 91.19164,-52.61633 l 25.71674,-11.74824 18.50656,-0.748472 18.50657,-0.748473 -0.59191,3.647536 c -0.32556,2.006149 -3.84135,26.060849 -7.81288,53.454899 l -7.22096,49.80736 4.13362,10.93838 c 2.2735,6.01611 4.13128,12.27903 4.12842,13.9176 l -0.005,2.97922 -71.34615,22.52493 -71.34616,22.52494 -6.93794,13.9899 c -3.81602,7.69445 -7.17767,13.95452 -7.47048,13.91126 -0.29282,-0.0433 -12.54452,-5.23924 -27.226,-11.54665 z',
                'm 508.7649,227.10683 c -10.24934,-4.0979 -19.1616,-7.4516 -19.80503,-7.45265 -0.64343,-0.001 -4.83634,1.56739 -9.31758,3.48544 -7.00005,2.99615 -8.1466,3.24445 -8.13981,1.76278 0.004,-0.94852 -1.86717,-6.79534 -4.15892,-12.99294 l -4.16682,-11.26837 7.6402,-52.56732 c 4.20211,-28.91203 7.92375,-52.851674 8.27032,-53.199211 0.34657,-0.347537 16.79818,-0.926104 36.55913,-1.285704 31.9031,-0.580557 39.54085,-1.060193 68.16279,-4.280492 30.04875,-3.380829 34.31878,-3.62671 62.99135,-3.627231 l 30.75756,-5.58e-4 2.17746,28.817366 2.17747,28.81735 -14.15585,33.88743 c -7.78571,18.63809 -14.47409,34.23153 -14.86305,34.65209 -0.38897,0.42056 -7.93303,1.0316 -16.76457,1.35789 -24.56707,0.90762 -50.62285,5.55498 -80.69852,14.39354 -13.39192,3.93558 -25.1774,7.10964 -26.18996,7.05347 -1.01256,-0.0562 -10.22684,-3.45497 -20.47617,-7.55288 z',
                'm 708.0604,291.34871 -14.757,-18.8853 -4.13339,-20.61357 c -2.27337,-11.33746 -4.13187,-22.97738 -4.12999,-25.86649 0.004,-6.26007 0.49664,-5.91527 -14.85436,-10.39772 -6.2327,-1.81994 -11.33219,-3.62591 -11.33219,-4.01328 0,-0.38737 6.28998,-15.70428 13.97773,-34.03759 l 13.97774,-33.33328 -2.26456,-29.00863 c -1.2455,-15.954741 -2.09551,-29.198009 -1.88891,-29.429481 0.2066,-0.231472 10.49876,-0.797593 22.87147,-1.258046 18.74185,-0.697482 26.21944,-0.518851 44.80953,1.070446 l 22.31369,1.907634 12.85759,10.241751 c 12.6696,10.092006 12.96475,10.420756 20.18668,22.484866 6.12433,10.23059 8.16067,14.85926 12.38801,28.1583 l 5.05892,15.91519 0.9528,22.89967 c 0.52404,12.59482 1.38887,26.29933 1.92187,30.45446 0.53298,4.15514 0.98897,8.32144 1.0133,9.25844 0.0244,0.93701 5.19754,6.25659 11.49604,11.82129 l 11.45179,10.11765 10.45711,1.56949 c 5.7514,0.86321 11.43684,1.77489 12.6343,2.02595 1.4782,0.30993 3.50967,2.92676 6.32739,8.15064 2.28259,4.23179 4.02258,7.81365 3.86662,7.95971 -1.38611,1.29811 -26.90841,12.22531 -36.04291,15.43153 -10.73825,3.76914 -12.72396,4.13118 -27.19725,4.95875 -15.08014,0.86225 -15.83681,0.81095 -22.16073,-1.50251 l -6.54749,-2.39524 -33.6361,12.63822 c -18.49986,6.95103 -33.91164,12.62118 -34.2484,12.60035 -0.33677,-0.0208 -7.25295,-8.53627 -15.3693,-18.9232 z',
                'm 863.84022,492.06301 c -19.94465,-2.40438 -36.82962,-4.39316 -37.52214,-4.41949 -0.74804,-0.0285 -1.25913,-1.42205 -1.25913,-3.43321 0,-1.86192 -0.96041,-8.09462 -2.13423,-13.85046 -1.73561,-8.5105 -3.44889,-13.09911 -9.17296,-24.56742 -6.15171,-12.32512 -8.07248,-15.18128 -15.2418,-22.66439 -6.22915,-6.50179 -9.17263,-8.82317 -12.23229,-9.64704 l -4.02923,-1.08493 -4.673,-16.10199 -4.673,-16.10198 -22.27243,-32.44926 c -12.24984,-17.8471 -22.27243,-32.78 -22.27243,-33.18422 0,-0.40423 14.23314,-6.06975 31.62919,-12.59005 l 31.6292,-11.85508 5.3893,2.14804 c 5.04377,2.01033 6.4789,2.10326 22.38471,1.44956 16.72683,-0.68745 17.19644,-0.76914 29.71552,-5.16927 6.99606,-2.45894 18.04103,-7.03365 24.54438,-10.16603 6.50335,-3.13238 12.03286,-5.48665 12.2878,-5.23171 1.64603,1.64603 10.04916,53.7112 13.16939,81.59657 2.00799,17.94542 4.53671,39.42735 5.61938,47.73762 2.49146,19.12396 4.3748,63.38084 3.43998,80.8363 l -0.71479,13.3468 -3.6742,-0.11337 c -2.02081,-0.0624 -19.99256,-2.0806 -39.93722,-4.48499 z'
            ]))
        })
    })
    describe("renderGridFromPaths", () => {
        it("doit etre une fonction", () => expect(sketchy.renderGridFromPaths).toEqual(jasmine.any(Function)))
        it("doit retourner un tableau", () => expect(sketchy.renderGridFromPaths("")).toEqual([]))
    })
})