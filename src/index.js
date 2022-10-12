import p5 from "p5";
import * as dat from 'dat.gui';
import { Petal, Flower } from "./flower"
import { params } from './params'

let gui;

const sketch = p5 => {
  window.p5 = p5;

  let blurShader;
  let unsharpShader;
  let scribbleBuffer;
  let canvas;

  let font;

  let showStatusTextCountdown = 0;
  let statusText = "welcome";

  let flowers = [];

  let input;
  let img;
  let imgSize;

  let pos;
  let size;

  let defaultPixelDensity;

  function saveImage() {
    p5.save('flowerpower.png');
  }

  function setupGUI() {
    gui = new dat.GUI();

    params.display['saveFunc'] = saveImage;

    for (const [name, param] of Object.entries(params)) {
      var folder = gui.addFolder(name);
      for (const [key, value] of Object.entries(param)) {
        if (!key.endsWith("Min") && !key.endsWith("Max") && !key.endsWith("Step") && !key.endsWith("Values")) {
          if (key.endsWith("Enum")) {
            folder.add(param, key).options(param[key + "Values"]).listen();
          } else if (value.length !== 'undefined' && value.length >= 3) {
            folder.addColor(param, key).listen();
          } else {
            folder.add(param, key,
              param[key + "Min"], param[key + "Max"], param[key + "Step"]).listen();
          }
        }
      }
    }


    input = p5.createFileInput(handleFile);
    input.position(0, 0);
  };

  function handleFile(file) {
    if (file.type === 'image') {
      img = p5.createImg(file.data, '', '', () => {
        imgSize = p5.createVector(img.width, img.height);
        resized();
        img.hide();
      });
    } else {
      img = null;
    }
  }

  function showMessage(text, time = 2000) {
    statusText = text;
    showStatusTextCountdown = time;
  }

  p5.preload = () => {
    blurShader = p5.loadShader('shaders/blur.vert', 'shaders/blur.frag');
    unsharpShader = p5.loadShader('shaders/unsharp.vert', 'shaders/unsharp.frag');
  }

  p5.setup = () => {
    defaultPixelDensity = p5.pixelDensity();
    size = p5.createVector(p5.windowWidth, p5.windowHeight);
    pos = p5.createVector(0, 0);
    canvas = p5.createCanvas(size.x, size.y);
    scribbleBuffer = p5.createGraphics(size.x, size.y, p5.WEBGL);
    scribbleBuffer.setAttributes('alpha', true);

    let modes = [
      p5.BLEND,
      p5.ADD,
      p5.LIGHTEST,
      p5.DARKEST,
      p5.DIFFERENCE,
      p5.EXCLUSION,
      p5.MULTIPLY,
      p5.SCREEN,
      p5.REPLACE,
      p5.REMOVE,
      p5.OVERLAY,
      p5.HARD_LIGHT,
      p5.SOFT_LIGHT,
      p5.DODGE,
      p5.BURN,
      p5.SUBTRACT
    ]

    params.display.blendModeEnumValues = modes;
    params.display.blendModeEnum = 'lighten';

    canvas.mousePressed(mouseDown);

    let p = p5.getURLParams();
    if (typeof p.state !== 'undefined') {
      loadCompressedState(p.state);
    }


    window.onpopstate = (e) => {
      console.log("pop");
      let p = p5.getURLParams();
      if (typeof p.state !== 'undefined') {
        loadCompressedState(p.state);
      }
    }

    p5.frameRate(15);

    font = p5.loadFont('fonts/msmincho.otf');

    setupGUI();

    setInterval(() => {
      if (showStatusTextCountdown > 0)
        showStatusTextCountdown -= 100;
    }, 100);

    resized();
  }

  function getCompressedState() {
    let strippedParams = [];

    let i = 0;
    for (const [name, param] of Object.entries(params)) {
      strippedParams.push([]);
      for (const [key, value] of Object.entries(param)) {
        if (!key.endsWith("Func") && 
            !key.endsWith("Min") && !key.endsWith("Max") && !key.endsWith("Step") && 
            !key.endsWith("Values")) {
          strippedParams[i].push(value);
        }
      }
      i++;
    }

    return encodeURIComponent(window.btoa(JSON.stringify(strippedParams, (key, val) => {
      if (typeof val !== 'undefined')
        return val.toFixed ? Number(val.toFixed(3)) : val
      else return 0;
    })));
  }

  function loadCompressedState(state) {
    let strippedParams = JSON.parse(window.atob(decodeURIComponent(state)));
    let n = 0;
    for (const [name, param] of Object.entries(params)) {
      let i = 0;
      for (const [key, value] of Object.entries(params[name])) {
        if (!key.endsWith("Func") && 
            !key.endsWith("Min") && !key.endsWith("Max") && !key.endsWith("Step") && 
            !key.endsWith("Values")) {
          params[name][key] = strippedParams[n][i];
          i++;
        }
      }
      n++;
    }
  }

  function postProcess() {
    scribbleBuffer.shader(blurShader);
    blurShader.setUniform('texture', scribbleBuffer);
    blurShader.setUniform('resolution', [scribbleBuffer.width, scribbleBuffer.height]);

    let radius = params.display.blurRadius;
    for (var pass = 0; pass < params.display.blurIterations; pass++) {
      for (var i = 0; i < 2; i++) {
        blurShader.setUniform('direction', i % 2 == 0 ? [radius, 0] : [0, radius]);
        scribbleBuffer.rect(0, 0, size.x, size.y);
      }
    }

    scribbleBuffer.resetShader();
    scribbleBuffer.shader(unsharpShader);

    unsharpShader.setUniform('texture', scribbleBuffer);
    unsharpShader.setUniform('resolution', [scribbleBuffer.width, scribbleBuffer.height]);
    unsharpShader.setUniform('amount', params.display.unsharpAmount);
    unsharpShader.setUniform('threshold', params.display.unsharpThreshold);
    scribbleBuffer.rect(0, 0, size.x, size.y);

    scribbleBuffer.resetShader();
  }

  p5.draw = () => {
    let density = params.display.pixelDensity;
    if (density == 0) density = defaultPixelDensity;
    p5.pixelDensity(density);

    p5.frameRate(params.display.frameRate);

    p5.background(params.display.backgroundColor);

    scribbleBuffer.clear(0,0,0,0);
    if (!img) {
      scribbleBuffer.background(params.display.backgroundColor);
    }

    scribbleBuffer.push();
    scribbleBuffer.translate(-scribbleBuffer.width / 2, -scribbleBuffer.height / 2);

    flowers[0] = createFlower(new p5.createVector(size.x / 2, size.y / 2));
    drawFlowers(scribbleBuffer);

    if (typeof font !== 'undefined' && !img) {
      scribbleBuffer.textFont(font);
      scribbleBuffer.fill(params.flower.flowerStroke);
      drawText(); 
    }

    if (params.display.postProcess) postProcess();

    p5.clear();

    if (img != null) {
      p5.image(img, pos.x, pos.y, size.x, size.y);
      let blend = params.display.blendModeEnum;
      p5.blend(scribbleBuffer, 
        -size.x/2, -size.y/2, size.x, size.y, 
        pos.x, pos.y, size.x, size.y, 
        blend);
    } else {
      p5.image(scribbleBuffer, pos.x, pos.y, size.x, size.y);
    }

    scribbleBuffer.pop();

    let s = getCompressedState();
    if (s != p5.getURLParams().state) {
      window.history.pushState(s, 'flower', '?state=' + s);
    }
  }

  function drawText() {

    let left = size.x / 2 - 140;
    scribbleBuffer.textSize(80);
    scribbleBuffer.text("F", left, 90);
    scribbleBuffer.textSize(40);
    scribbleBuffer.text("lower", left + 30, 90);

    scribbleBuffer.textSize(80);
    scribbleBuffer.text("P", left + 160, 90);
    scribbleBuffer.textSize(40);
    scribbleBuffer.text("ower", left + 190, 90);

    scribbleBuffer.textSize(24);
    scribbleBuffer.text("{letter} to load a flower", size.x - 500, size.y - 100);
    scribbleBuffer.text("[ALT]+{letter} to save a flower", size.x - 500, size.y - 70);
    scribbleBuffer.text("browser back/forward to undo/redo", size.x - 500, size.y - 40);
    if (showStatusTextCountdown > 0)
      scribbleBuffer.text(statusText, 300, size.y - 70);

  }

  function generateFlowerPositions() {
    centreX = buffer.width / 2;
    centreY = buffer.height / 2;

    // Generate flower positions
    let nFlowers = p5.random(1, 6);
    //nFlowers = 1;
    for (let i = 0; i < nFlowers; i++) {
      cx = centreX + p5.random(-300, 300);
      cy = centreY + p5.random(-300, 300);
      centreXs.push(createVector(cx, cy));
    }
  }

  function drawFlowers(buffer) {
    let scribble = new Scribble(buffer);
    scribble.numEllipseSteps = 1;
    scribble.bowing = 1;
    scribble.roughness = params.display.scribbleRoughness;

    for (var flower of flowers) {
      flower.draw(scribble);
    }
  }

  p5.windowResized = () => {
    resized();
  }

  function resized() {
    if (img) {
      let aspect = imgSize.x / imgSize.y;

      size.x = Math.min(imgSize.x, p5.windowWidth);
      size.y = size.x / aspect;

      if (size.y > p5.windowHeight) {
        size.y = p5.windowHeight;
        size.x = size.y * aspect;
      }

    } else {
      size = p5.createVector(p5.windowWidth, p5.windowHeight);
    }

    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    scribbleBuffer.resizeCanvas(size.x, size.y);

    let padding = p5.windowWidth - size.x;
    pos.x = padding / 2;
  }


  function savePreset(keycode) {
    if (keycode == p5.ALT) return;
    p5.storeItem("preset" + keycode, getCompressedState());
    showMessage("saved " + String.fromCharCode(keycode));
  }

  function loadPreset(keycode) {
    if (keycode == p5.ALT) return;
    let preset = p5.getItem("preset" + keycode);
    if (preset != null) {
      loadCompressedState(preset);
      showMessage("loaded " + String.fromCharCode(keycode));
    } else {
      showMessage(String.fromCharCode(keycode) + " is empty");
    }
  }

  p5.keyPressed = () => {
    if (p5.keyIsDown(p5.ALT)) savePreset(p5.keyCode);
    else if (isLetter(p5.key)) loadPreset(p5.keyCode);
    p5.draw();
  }

  function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
  }

  function mouseDown() {
    if (img) {
      flowers.push(createFlower(p5.createVector(p5.mouseX - pos.x, p5.mouseY - pos.y)));
      p5.draw();
    }
  }

  function createFlower(pos) {
    if (typeof pos === 'undefined') {
      pos = p5.createVector(p5.mouseX, p5.mouseY);
    }

    let nPetals = params.flower.nPetals;
    let petals = [];
    let petalOffset = p5.createVector(params.petal.petalOffsetX, params.petal.petalOffsetY);
    let petalSize = p5.createVector(params.petal.petalSizeX, params.petal.petalSizeY);
    let showCentres = params.centre.showCentres;
    p5.randomSeed(params.flower.flowerRandSeed);

    let pOff = params.petal.petalOffsetRand;
    let sOff = params.petal.petalSizeRand;
    for (var i = 0; i < nPetals; i++) {
      petals.push(new Petal(
        p5.createVector(petalOffset.x + p5.random(-pOff, pOff), petalOffset.y + p5.random(-pOff, pOff)),
        p5.createVector(petalSize.x + p5.random(-sOff, sOff), petalSize.y + p5.random(-sOff, sOff)),
        params.petal.petalStroke, showCentres, params.centre.centreSize,
        p5.createVector(params.centre.centreOffsetX, params.centre.centreOffsetY),
        params.centre.centreFill,
        params.centre.centreStroke,
      ));
    }

    let f = new Flower(p5, p5.createVector(pos.x / size.x, pos.y / size.y),
      params.flower.flowerSize, params.flower.rotation,
      petals, 
      params.flower.flowerFill, params.flower.flowerFillAlpha, params.flower.flowerStroke, scribbleBuffer);

    f.randomSeed = params.flower.flowerRandSeed;

    return f;
  };
};

new p5(sketch);
export default sketch;