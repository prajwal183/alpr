const cv = require("opencv.js");
//const image = require('./image.jpeg');
const path = require("path");
const fs = require("fs");
const image = path.join(__dirname + "/image.jpg");
const Jimp = require('jimp')

export default async function tempFn() {
  const jimpSrc = await Jimp.read(image)
  const src = cv.matFromImageData(jimpSrc.bitmap);

  //converting image to grayscale
  const gray = new cv.Mat();
  cv.cvtColor(src, gray, cv.COLOR_BGR2GRAY );

 /*  let dst = new cv.Mat();
  let M = cv.Mat.ones(5, 5, cv.CV_8U);
  let anchor = new cv.Point(-1, -1);
 cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue()); */
  // Now that we are finish, we want to write `dst` to file `output.png`. For this we create a `Jimp`
  // image which accepts the image data as a [`Buffer`](https://nodejs.org/docs/latest-v10.x/api/buffer.html).
  // `write('output.png')` will write it to disk and Jimp infers the output format from given file name:
  new Jimp({
  width: gray.cols,
  height: gray.rows,
  data: Buffer.from(gray.data)
  })
  .write('output.png');
  //src.delete();
 // dst.delete();
}
