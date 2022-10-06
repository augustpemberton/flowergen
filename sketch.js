
let blurShader;
let unsharpShader;
let scribbleBuffer;
let canvas;

let params = {
  flower: {
    flowerSizeX: 0.1, flowerSizeXMin: 0, flowerSizeXMax: 0.5, flowerSizeXStep: 0.001,
    flowerSizeY: 0.1, flowerSizeYMin: 0, flowerSizeYMax: 0.5, flowerSizeYStep: 0.001,

    nPetals: 5, nPetalsMin: 1, nPetalsMax: 20, nPetalsStep: 1,

    flowerStroke: [255, 255, 255],
    flowerStrokeAlpha: 255, flowerStrokeAlphaMin: 0, flowerStrokeAlphaMax: 255, flowerStrokeAlphaStep: 1,
    flowerFill: [100, 100, 100],
    flowerFillAlpha: 255, flowerFillAlphaMin: 0, flowerFillAlphaMax: 255, flowerFillAlphaStep: 1,

    flowerRandSeed: 1, flowerRandSeedMin: 0, flowerRandSeedMax: 10000, flowerRandSeedStep: 0.001,
  },

  petal: {
    petalOffsetX: 0.1, petalOffsetXMin: 0, petalOffsetXMax: 2, petalOffsetXStep: 0.001,
    petalOffsetY: 0.1, petalOffsetYMin: 0, petalOffsetYMax: 2, petalOffsetYStep: 0.001,
    petalOffsetRand: 0.1, petalOffsetRandMin: 0, petalOffsetRandMax: 2, petalOffsetRandStep: 0.001,

    petalSizeX: 0.1, petalSizeXMin: 0, petalSizeXMax: 2, petalSizeXStep: 0.001,
    petalSizeY: 0.1, petalSizeYMin: 0, petalSizeYMax: 2, petalSizeYStep: 0.001,
    petalSizeRand: 0.1, petalSizeRandMin: 0, petalSizeRandMax: 2, petalSizeRandStep: 0.001,

    petalStroke: 1, petalStrokeMin: 0.001, petalStrokeMax: 15, petalStrokeStep: 0.001,

  },

  centre: {
    showCentres: false,

    centreOffsetX: 0.1, centreOffsetXMin: -1, centreOffsetXMax: 2, centreOffsetXStep: 0.001,
    centreOffsetY: 0.1, centreOffsetYMin: -1, centreOffsetYMax: 2, centreOffsetYStep: 0.001,

    centreSize: 0.1, centreSizeMin: 0.001, centreSizeMax: 0.01, centreSizeStep: 0.0001,
  },

  display: {
    scribbleRoughness: 0.5, scribbleRoughnessMin: 0, scribbleRoughnessMax: 10, scribbleRoughnessStep: 0.1,

    blurRadius: 0.5, blurRadiusMin: 0, blurRadiusMax: 3, blurRadiusStep: 0.01,
    blurIterations: 4, blurIterationsMin: 0, blurIterationsMax: 20, blurIterationsStep: 1,

    unsharpAmount: 40, unsharpAmountMin: 0, unsharpAmountMax: 200, unsharpAmountStep: 1,
    unsharpThreshold: 0.4, unsharpThresholdMin: 0, unsharpThresholdMax: 10, unsharpThresholdStep: 0.1,

    backgroundColor: [0, 0, 0],
    frameRate: 15, frameRateMin: 1, frameRateMax: 120, frameRateStep: 1
  },
}

let presets = [];

let flowerGui;
let petalGui;
let centreGui;
let displayGui;


let flowers = [];

function preload() {
  blurShader = loadShader('shaders/blur.vert', 'shaders/blur.frag');
  unsharpShader = loadShader('shaders/unsharp.vert', 'shaders/unsharp.frag');
}

function setup() {
  let w = windowWidth;
  let h = windowHeight;
  canvas = createCanvas(w, h);
  scribbleBuffer = createGraphics(w, h, WEBGL);

  canvas.mousePressed(mouseDown);

  frameRate(60);

  flowerGui = createGui('flower');
  flowerGui.addObject(params.flower);
  flowerGui.setPosition(width - 230, 20);

  petalGui = createGui('petal');
  petalGui.addObject(params.petal);
  petalGui.setPosition(width - 460, 20);

  centreGui = createGui('centre');
  centreGui.addObject(params.centre);
  centreGui.setPosition(20, 20);

  displayGui = createGui('display');
  displayGui.addObject(params.display);
  displayGui.setPosition(20, height - 450);

  //load default preset
  loadPreset(68);
}

function postProcess() {
  scribbleBuffer.shader(blurShader);
  blurShader.setUniform('texture', scribbleBuffer);
  blurShader.setUniform('resolution', [scribbleBuffer.width, scribbleBuffer.height]);

  let radius = params.display.blurRadius;
  for (pass=0; pass<params.display.blurIterations; pass++) {
    for (i=0; i<2; i++) {
      blurShader.setUniform('direction', i%2==0 ? [radius, 0] : [0, radius]);
      scribbleBuffer.rect(0, 0, width, height);
    }
  }

  scribbleBuffer.resetShader();
  scribbleBuffer.shader(unsharpShader);

  unsharpShader.setUniform('texture', scribbleBuffer);
  unsharpShader.setUniform('resolution', [scribbleBuffer.width, scribbleBuffer.height]);
  unsharpShader.setUniform('amount', params.display.unsharpAmount);
  unsharpShader.setUniform('threshold', params.display.unsharpThreshold);
  scribbleBuffer.rect(0, 0, width, height);
}

function draw() {
  frameRate(params.display.frameRate);

  scribbleBuffer.clear();
  scribbleBuffer.background(params.display.backgroundColor);
  scribbleBuffer.push();
  scribbleBuffer.translate(-scribbleBuffer.width/2, -scribbleBuffer.height/2);

  flowers = [createFlower(new p5.Vector(width/2, height/2))];
  drawFlowers(scribbleBuffer);

  postProcess();

  clear();
  //blend(scribbleBuffer, -width/2, -height/2, width, height, 0, 0, width, height, SCREEN);
  image(scribbleBuffer, 0, 0);

  scribbleBuffer.pop();
}

function generateFlowerPositions() {
  centreX = buffer.width / 2;
  centreY = buffer.height / 2;

  // Generate flower positions
  let nFlowers = random(1, 6);
  //nFlowers = 1;
  for (let i=0; i<nFlowers; i++) {
    cx = centreX + random(-300, 300);
    cy = centreY + random(-300, 300);
    centreXs.push(createVector(cx, cy));
  }
}

function drawFlowers(buffer) {
  let scribble = new Scribble(buffer);
  scribble.numEllipseSteps = 10;
  scribble.bowing = 4;
  scribble.roughness = params.display.scribbleRoughness;

  for (flower of flowers) {
    drawFlower(flower, buffer, scribble);
  }
}

//========================================================

function drawFlower(flower, buffer, scribble) {
  buffer.push();

  angle = TWO_PI / flower.petals.length;

  let flowerPos = new p5.Vector(flower.pos.x * width, flower.pos.y * height);
  let flowerSize = new p5.Vector(flower.size.x * width, flower.size.y * height);

  buffer.translate(flowerPos.x, flowerPos.y);

  for (petal of flower.petals) {
    let petalPos = new p5.Vector(flowerSize.x * petal.pos.x, flowerSize.y * petal.pos.y);
    let petalSize = new p5.Vector(flowerSize.x * petal.size.x, flowerSize.y * petal.size.y);

    buffer.strokeWeight(petal.strokeWeight);

    buffer.stroke(
      red(params.flower.flowerStroke),
      green(params.flower.flowerStroke),
      blue(params.flower.flowerStroke),
      params.flower.flowerStrokeAlpha);
    buffer.fill(
      red(params.flower.flowerFill),
      green(params.flower.flowerFill),
      blue(params.flower.flowerFill),
      params.flower.flowerFillAlpha);

    scribble.scribbleEllipse(petalPos.x, petalPos.y, petalSize.x, petalSize.y);

    if (petal.showCentre) {
      push();
      drawCentre(
        petalPos.x + petalSize.x * petal.centreOffset.x,
        petalPos.y + petalSize.y * petal.centreOffset.y,
        petalSize.x * petal.centreSize, scribble);
      pop();
    }

    buffer.rotate(angle);
  }

  buffer.pop();
}

function windowResized() {
  let w = windowWidth;
  let h = windowHeight;

  resizeCanvas(w, h);
  scribbleBuffer.resizeCanvas(w, h);
}

function drawCentre(x, y, size, scribble) {
  let centreX = x + random(-1, 1);
  let centreY = y + random(-1, 1);

  let xCoords = [];
  let yCoords = [];

  for (j = 0; j < 10; j++) {
    let t = j / 10;
    xCoords.push(centreX + size * cos(t * TWO_PI));
    yCoords.push(centreY + size * sin(t * TWO_PI));
  }

  scribble.scribbleFilling(xCoords, yCoords, 1, 1);
}

function savePreset(keycode) {
  storeItem("preset" + keycode, params);
}

function loadPreset(keycode) {
  let preset = getItem("preset" + keycode);
  if (preset != null) {
    for (type of ["petal", "flower", "display", "centre"]) {
      for (const [key, value] of Object.entries(preset[type])) {
        if (!key.endsWith("Min") && !key.endsWith("Max") && !key.endsWith("Step")) {
          if (type == "petal")
            petalGui.prototype.setValue(key, value);
          else if (type == "flower")
            flowerGui.prototype.setValue(key, value);
          else if (type == "display")
            displayGui.prototype.setValue(key, value);
          else
          centreGui.prototype.setValue(key, value);
        }
      }
    }
  }
}

function keyPressed() {
  if (keyIsDown(ALT)) savePreset(keyCode);
  else if (key == 'c') flowers = [];
  else loadPreset(keyCode);

  draw();
}

function mouseDown() {
  flowers.push(createFlower());
  draw();
}

function createFlower(pos) {
  if (typeof pos === 'undefined') {
    pos = new p5.Vector(mouseX, mouseY);
  }

  let nPetals = params.flower.nPetals;
  let petals = [];
  let petalOffset = new p5.Vector(params.petal.petalOffsetX, params.petal.petalOffsetY);
  let petalSize = new p5.Vector(params.petal.petalSizeX, params.petal.petalSizeY);
  let showCentres = params.centre.showCentres;
  randomSeed(params.flower.flowerRandSeed);

  let pOff = params.petal.petalOffsetRand;
  let sOff = params.petal.petalSizeRand;
  for (i=0; i<nPetals; i++) {
    petals.push(new Petal(
      new p5.Vector(petalOffset.x + random(-pOff, pOff), petalOffset.y + random(-pOff, pOff)),
      new p5.Vector(petalSize.x + random(-sOff,sOff), petalSize.y + random(-sOff, sOff)),
      params.petal.petalStroke, showCentres, params.centre.centreSize, 
      new p5.Vector(params.centre.centreOffsetX, params.centre.centreOffsetY)
      ));
  }

  let f = new Flower(new p5.Vector(pos.x/width, pos.y/height), 
  new p5.Vector(params.flower.flowerSizeX, params.flower.flowerSizeY), petals);

  f.randomSeed = params.flower.flowerRandSeed;

  return f;
}