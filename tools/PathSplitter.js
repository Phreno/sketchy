const jsdom = require('jsdom')
const { JSDOM } = jsdom
const { window } = new JSDOM('<html><body></body></html>', { runScripts: 'dangerously' })
global.window = window
// loading snapsvg
const Snap = require('snapsvg')

/**
 * This script was taken from a discussion on Google Groups.
 * I'm not taking credit for it but sharing it because it is very useful for splitting
 * discontinuous absolute paths into continuous subpaths. Where this is particularly
 * useful is for importing SVG files into applications like Figma, Sketch, InVision, XD, etc.
 */
/**
 * Split discontinuous absolute paths into continuous sub-paths.
 *
 *     Example:
 *
 *     console.log(PathSplitter(
 *         "M.75,17.25a16.5,16.5,0,0,1,27-12.73" +
 *         "m4.88,6.73a16.63,16.63,0,0,1,1.12,6v12a16.5,16.5,0,0,1-16.5,16.5,16.82,16.82,0,0,1-3-.27" +
 *         "M6.75,42a16.49,16.49,0,0,1-6-12.73v-4.5" +
 *         "m24,4.5v-12a7.5,7.5,0,0,0-12-6" +
 *         "m-3,6v12a7.51,7.51,0,0,0,10.5,6.88" +
 *         "-3-17.38v9"
 *     ));
 *
 *     Returns:
 *
 *     [
 *         M 0.75 17.25 a 16.5 16.5 0 0 1 27 -12.73,
 *         M 32.63 11.25 a 16.63 16.63 0 0 1 1.12 6 v 12 a 16.5 16.5 0 0 1 -16.5 16.5 a 16.82 16.82 0 0 1 -3 -0.27,
 *         M 6.75 42 a 16.49 16.49 0 0 1 -6 -12.73 v -4.5,
 *         M 24.75 29.27 v -12 a 7.5 7.5 0 0 0 -12 -6,
 *         M 9.75 17.27 v 12 a 7.51 7.51 0 0 0 10.5 6.88,
 *         M 17.25 18.77 v 9
 *     ]
 * @requires {@link http://snapsvg.io}
 * @param   {string}    pathData    The SVG path data string.
 * @returns {Array}
 * @constructor
 */
/**
 * NB: This class requires http://snapsvg.io/
 */
module.exports = function (pathData) {
  function pathToAbsoluteSubPaths (pathString) {
    const pathCommands = Snap.parsePathString(pathString)
    let endPoint = [0, 0]
    const subPaths = []
    let command = []
    let i = 0

    while (i < pathCommands.length) {
      command = pathCommands[i]
      endPoint = getNextEndPoint(endPoint, command)
      if (command[0] === 'm') {
        command = ['M', endPoint[0], endPoint[1]]
      }
      const subPath = [command.join(' ')]

      i++

      while (!endSubPath(pathCommands, i)) {
        command = pathCommands[i]
        subPath.push(command.join(' '))
        endPoint = getNextEndPoint(endPoint, command)
        i++
      }

      subPaths.push(subPath.join(' '))
    };

    return subPaths
  };

  function getNextEndPoint (endPoint, command) {
    let x = endPoint[0]; let y = endPoint[1]
    if (isRelative(command)) {
      switch (command[0]) {
        case 'h':
          x += command[1]
          break
        case 'v':
          y += command[1]
          break
        case 'z':
          // back to [0,0]?
          x = 0
          y = 0
          break
        default:
          x += command[command.length - 2]
          y += command[command.length - 1]
      };
    } else {
      switch (command[0]) {
        case 'H':
          x = command[1]
          break
        case 'V':
          y = command[1]
          break
        case 'Z':
          // back to [0,0]?
          x = 0
          y = 0
          break
        default:
          x = command[command.length - 2]
          y = command[command.length - 1]
      };
    }
    return [x, y]
  }

  function isRelative (command) {
    return command[0] === command[0].toLowerCase()
  }

  function endSubPath (commands, index) {
    if (index >= commands.length) {
      return true
    } else {
      return commands[index][0].toLowerCase() === 'm'
    }
  }

  return pathToAbsoluteSubPaths(pathData)
}
