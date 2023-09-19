/* import {Canvas, createCanvas, Image,ImageData, loadImage} from "canvas";
import {JSDOM} from "jsdom";
import {writeFileSync} from "fs";

export default async (poeId, url) => {
  installDOM();

  await loadOpenCV();
  
};


function installDOM(){
  const dom = new JSDOM();
  global.document = dom.window.document;
  // The rest enables DOM image and canvas and is provided by node-canvas
  global.Image = Image;
  global.HTMLCanvasElement = Canvas;
  global.ImageData = ImageData;
  global.HTMLImageElement = Image;
}

function loadOpenCV() {
  return new Promise((resolve) => {
    global.Module = {
      onRuntimeInitialized: resolve,
    };
    global.cv = require("opencv.js");
  });
} */

import { createWorker } from "tesseract.js";

let worker;

(async () => {
  worker = await createWorker({
    logger: (m) => console.log(m),
  });
})();

export default async (poeId, url) => {
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(url);
  console.log(text);
  await worker.terminate();
};
