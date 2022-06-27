const package = require('./package.json');
const sketchy = require('./spec/Sketchy')
const svg = require('./spec/sketchy')

const program = require('commander')

program
    .name("sketchy")
    .version(package.version)
    .description("A tool to generate a sketchy stroke")
    .option('--input <file>', 'input file')
    .option('--output <file>', 'output file', 'output.svg')
    .option('--noise <number>', 'noise', 0.5)
    .parse()



// check if input file is provided
if (!program.input) {
    console.error("No input file provided")
    process.exit(1)
}
// check if file exists
else if (!fs.existsSync(program.input)) {
    console.error("Input file does not exist")
    process.exit(1)
}

// retrieve the svg from the file
const svgString = fs.readFileSync(program.input, 'utf8')
// parse the svg
const svgDocument = svg.parse(svgString)
// get the paths from the svg
const paths = svg.getPaths(svgDocument)
// get the points from the paths
const points = paths.map(path => svg.getPoints(path))
// randomize the points
const randomizedPoints = points.map(path => sketchy.randomize(path, { noise: program.noise }))
// get the stroke from the points
const stroke = sketchy.getStroke(randomizedPoints, { noise: program.noise })

