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

const div = document.createElementNS('http://www.w3.org/2000/svg','svg')



const draw = SVG(div)
draw.viewbox(0,0,1,1)
draw.css({
  stroke: "black",
  "stroke-width": "0.0002"
})

inkjet.decode(fs.readFileSync('./rsc/jeff.jpg'), function (err, imageData) {
  if (err) {
    console.log(err)
    exit(1)
  } else {
    for (let i = 0; i < 5; i++) {
      let layer = new Layer(div, imageData);
      layer.drawPattern((255 / 5) * i, 0.005, Math.cos(i), Math.sin(i));
    }
  }
})


console.log(draw.svg())
