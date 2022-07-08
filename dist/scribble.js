#!/opt/nodejs/16.14.2/bin/node
// returns a window with a document and an svg root node
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
const { SVG, registerWindow } = require('@svgdotjs/svg.js')
const { Layer } = require("../tools/Layer.js")

// register window and document
registerWindow(window, document)

fs = require("fs")
const inkjet = require('inkjet');
const { exit } = require('process')

const div = document.createElement("svg")
div.id = "svg-container"


const draw = SVG(div)

inkjet.decode(fs.readFileSync('./rsc/jeff.jpg'), function (err, imageData) {
  if (err) {
    console.log(err)
    exit(1)
  } else {
    for (let i = 0; i < 5; i++) {
      let layer = new Layer(div, imageData);
      layer.drawPattern((255 / 5) * i, 0.01, Math.cos(i), Math.sin(i));
    }
  }
})


console.log(draw.svg())
