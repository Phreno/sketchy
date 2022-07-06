const fs = require("fs")

// read an image
const img = fs.readFileSync("../rsc/face-00.jpeg")

	// Get the pixel data from the source image.
    const inkjet = require('inkjet');
inkjet.decode(fs.readFileSync('./image.jpg'), function(err, decoded) {
  // decoded: { width: number, height: number, data: Uint8Array }
});