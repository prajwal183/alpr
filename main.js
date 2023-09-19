const { Canvas, createCanvas, Image, ImageData, loadImage } = require("canvas");
const { JSDOM } = require("jsdom");
const { writeFileSync } = require("fs");
const { licensePlates } = require("./licensePlateSizes");

(async () => {
  //Replicate minimum DOM using JSDOM inorder for the opencv to work properly
  installDOM();
  // load the opencv.js inside the DOM

  await loadOpenCV();

  try {
    const vechicleType = "cab";

    const image = await loadImage("./auto3.jpg");
    const src = cv.imread(image);

    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

    // Apply Gaussian blur to reduce noise
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 50, 200);

    // Apply thresholding
    const threshold = new cv.Mat();
    cv.threshold(edges, threshold, 127, 255, cv.THRESH_BINARY);

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      threshold,
      contours,
      hierarchy,
      cv.RETR_LIST,
      cv.CHAIN_APPROX_SIMPLE
    );

    let matchedContour = null;
    /* 
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour);
      const rect = cv.boundingRect(contour);
      const aspectRatio = rect.width / rect.height;

      // Adjust these thresholds based on your specific case
      // aspectRatio > 2 && aspectRatio < 6
      // area >  4500 && area < 30000
      //(area > 5000 && area < 30000 && aspectRatio > 1 && aspectRatio < 2)
      // area > 9000 && area < 30000 && aspectRatio > 1 && aspectRatio < 2

      if (
        area > licensePlates[vechicleType].area.min &&
        area < licensePlates[vechicleType].area.max &&
        aspectRatio > licensePlates[vechicleType].aspectRatio.min &&
        aspectRatio < licensePlates[vechicleType].aspectRatio.max
      ) {
        matchedContour = contour;
        break;
      }
    }

    // in case matched contour is null for the auto because of the middle line in the licsence plate

    // Get the bounding rectangle of the matched contour
    const rect = cv.boundingRect(matchedContour);

    // Crop the license plate region from the original image
    const dst = src.roi(rect); */

    // code to find all the contours

    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);

    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const rect = cv.boundingRect(contour);
      const aspectRatio = rect.width / rect.height;

      let color = new cv.Scalar(
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255)
      );

      // use of x and y not a good solution
      // if(rect.width >80 && rect.width <150 && rect.height >30 && rect.height <200 && rect.x > 500 && rect.y > 500)
      if (
        rect.width > 80 &&
        rect.width < 165 &&
        rect.height > 40 &&
        rect.height < 155 
      ) {
        console.log(aspectRatio);
        console.log(
          "width-" + rect.width,
          ", height-" + rect.height,
          "x-",
          rect.x,
          "y -",
          rect.y
        );
        cv.drawContours(dst, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
      }
    }

    // let dst = cv.drawContours(src,[cnt],0,(0,255,255),2)

    //let dst = cv.rectangle(edges,(x,y),(x+w,y+h),(0,255,0),2)

    const canvas = createCanvas(300, 300);
    cv.imshow(canvas, dst);
    writeFileSync("output.jpg", canvas.toBuffer("image/jpeg"));
    src.delete();
    edges.delete();
  } catch (e) {
    console.error(e);
  }
})();
// Load opencv.js just like before but using Promise instead of callbacks:
function loadOpenCV() {
  return new Promise((resolve) => {
    global.Module = {
      onRuntimeInitialized: resolve,
    };
    global.cv = require("opencv.js");
  });
}
// Using jsdom and node-canvas we define some global variables to emulate HTML DOM.
// Although a complete emulation can be archived, here we only define those globals used
// by cv.imread() and cv.imshow().
function installDOM() {
  const dom = new JSDOM();
  global.document = dom.window.document;
  // The rest enables DOM image and canvas and is provided by node-canvas
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
}
