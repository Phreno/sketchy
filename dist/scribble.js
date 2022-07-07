#!/opt/nodejs/16.14.2/bin/node
// returns a window with a document and an svg root node
const { createSVGWindow } = require('svgdom')
const window = createSVGWindow()
const document = window.document
const { SVG, registerWindow } = require('@svgdotjs/svg.js')
const { Layer } = require("../tools/cross-hatching/script.js")

// register window and document
registerWindow(window, document)
const draw = SVG(document.documentElement)
fs = require("fs")
const inkjet = require('inkjet');



// document.documentElement.innerHTML = draw.svg();

draw.svg([
  "<g id='layer0'></g>",
  "<g id='layer1'></g>",
  "<g id='layer2'></g>",
  "<g id='layer3'></g>",
])
document.documentElement.innerHTML = draw.svg()


inkjet.decode(fs.readFileSync('./tools/cross-hatching/car.jpg'), function (err, decoded) {
  for (let i = 0; i < 5; i++) {
    let layer = new Layer(document.getElementById("layer" + i), decoded);
    layer.drawPattern((255 / 5) * i, 0.01, Math.cos(i), Math.sin(i));
  }
  console.log(document.getElementsByTagName("svg")[0].outerHTML)
});