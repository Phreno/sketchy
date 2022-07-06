#!/opt/nodejs/16.14.2/bin/node
const program = require('commander')
const { exit } = require('process')
const fs = require('fs')
const package = require('../package.json')
const { LOGGER } = require('../tools/Logger')
const { Cli } = require('../spec/cli/Cli')



program
    .name("sketchy")
    .version(package.version)
    .description("A tool to generate a sketchy stroke")
    .option('-i, --input             <file>', 'input file')
    .option('-o, --output            <file>', 'output file', 'out.svg')
    .option('-l, --log               <none / info / debug>', 'log level', 'info')
    .option('-d, --dump', 'display result on stdout')
    // perfect-freehand options
    .option('-C, --last', 'whether the stroke is complete')
    .option('-L, --streamline        <number>', 'how much to streamline the stroke')
    .option('-M, --smoothing         <number>', 'how much to soften the stroke\'s edges')
    .option('-N, --noise             <number>', 'add a random zigzag to the stroke')
    .option('-P, --simulate-pressure', 'whether to simulate pressure based on velocity')
    .option('-S, --size              <number>', 'the base size (diameter) of the stroke')
    .option('-Z, --step-size         <number>', 'distance between breadcrumbs points when working with a path')
    .option('-T, --thinning          <number>', 'the effect of pressure on the stroke\'s size')
    .parse(process.argv)


// LOGGER.deleteLogFiles()
const options = program.opts()


cli = new Cli(options)


const main = () => {
    LOGGER.time("Reading input file " + options.input, cli.readInputFile)
    LOGGER.time("Parsing svg data", cli.parseSvgData)
    LOGGER.time("Extracting paths", cli.extractPaths)
    LOGGER.time("Splitting paths", cli.splitPaths)
    LOGGER.time("Rendering (x,y) coords from svg paths", cli.renderPointsFromPaths)
    LOGGER.time("Extracting points", cli.extractPoints)
    LOGGER.time("Rendering (x,y) coords from svg points", cli.renderPointsFromPoints)
    LOGGER.time("Extracting breadcrumbs", cli.extractBreadcrumbs)
    LOGGER.time("Rendering freehand strokes from breadcrumbs", cli.renderFreehand)
    LOGGER.time("Rendering svg", cli.renderSvg)
    LOGGER.time("Writing output file", cli.writeOutputFile)
    options.dump && console.log(svg)
    exit(0)
}

main()



