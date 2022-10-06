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

  function setupGUI() {
    gui = new dat.GUI();

    for (const [name, param] of Object.entries(params)) {
      var folder = gui.addFolder(name);
      for (const [key, value] of Object.entries(param)) {
        if (!key.endsWith("Min") && !key.endsWith("Max") && !key.endsWith("Step")) {
          if (value.length !== 'undefined' && value.length >= 3) {
            folder.addColor(param, key).listen();
          } else {
            folder.add(param, key,
              param[key + "Min"], param[key + "Max"], param[key + "Step"]).listen();
          }
        }
      }
    }
  };

  function showMessage(text, time = 2000) {
    statusText = text;
    showStatusTextCountdown = time;
  }

  p5.preload = () => {
    blurShader = p5.loadShader('shaders/blur.vert', 'shaders/blur.frag');
    unsharpShader = p5.loadShader('shaders/unsharp.vert', 'shaders/unsharp.frag');
  }

  p5.setup = () => {
    let w = p5.windowWidth;
    let h = p5.windowHeight;
    canvas = p5.createCanvas(w, h);
    scribbleBuffer = p5.createGraphics(w, h, p5.WEBGL);

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
  }

  function getCompressedState() {
    let strippedParams = [];

    let i = 0;
    for (const [name, param] of Object.entries(params)) {
      strippedParams.push([]);
      for (const [key, value] of Object.entries(param)) {
        if (!key.endsWith("Min") && !key.endsWith("Max") && !key.endsWith("Step")) {
          strippedParams[i].push(value);
        }
      }
      i++;
    }

    return encodeURIComponent(window.btoa(JSON.stringify(strippedParams, (key, val) => {
      return val.toFixed ? Number(val.toFixed(3)) : val
    })));
  }

  function loadCompressedState(state) {
    let strippedParams = JSON.parse(window.atob(decodeURIComponent(state)));
    let n = 0;
    for (const [name, param] of Object.entries(params)) {
      let i = 0;
      for (const [key, value] of Object.entries(params[name])) {
        if (!key.endsWith("Min") && !key.endsWith("Max") && !key.endsWith("Step")) {
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
        scribbleBuffer.rect(0, 0, p5.width, p5.height);
      }
    }

    scribbleBuffer.resetShader();
    scribbleBuffer.shader(unsharpShader);

    unsharpShader.setUniform('texture', scribbleBuffer);
    unsharpShader.setUniform('resolution', [scribbleBuffer.width, scribbleBuffer.height]);
    unsharpShader.setUniform('amount', params.display.unsharpAmount);
    unsharpShader.setUniform('threshold', params.display.unsharpThreshold);
    scribbleBuffer.rect(0, 0, p5.width, p5.height);

    scribbleBuffer.resetShader();
  }

  p5.draw = () => {
    p5.frameRate(params.display.frameRate);

    scribbleBuffer.clear();
    scribbleBuffer.background(params.display.backgroundColor);

    scribbleBuffer.push();
    scribbleBuffer.translate(-scribbleBuffer.width / 2, -scribbleBuffer.height / 2);

    flowers[0] = createFlower(new p5.createVector(p5.width / 2, p5.height / 2));
    drawFlowers(scribbleBuffer);

    if (typeof font !== 'undefined') {
      scribbleBuffer.textFont(font);

      scribbleBuffer.fill(params.flower.flowerStroke);

      let left = p5.width / 2 - 140;

      scribbleBuffer.textSize(80);
      scribbleBuffer.text("F", left, 90);
      scribbleBuffer.textSize(40);
      scribbleBuffer.text("lower", left + 30, 90);

      scribbleBuffer.textSize(80);
      scribbleBuffer.text("P", left + 160, 90);
      scribbleBuffer.textSize(40);
      scribbleBuffer.text("ower", left + 190, 90);

      scribbleBuffer.textSize(24);
      scribbleBuffer.text("[ALT]+{letter} to save a flower", p5.width - 500, p5.height - 40);
      scribbleBuffer.text("{letter} to load a flower", p5.width - 500, p5.height - 70);
      if (showStatusTextCountdown > 0)
        scribbleBuffer.text(statusText, 300, p5.height - 70);

    }

    if (params.display.postProcess) postProcess();

    p5.clear();
    //blend(scribbleBuffer, -width/2, -height/2, width, height, 0, 0, width, height, SCREEN);
    p5.image(scribbleBuffer, 0, 0);

    scribbleBuffer.pop();

    let s = getCompressedState();
    if (s != p5.getURLParams().state) {
      console.log('newstate');
      window.history.pushState(s, 'flower', '?state=' + s);
    }
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
      drawFlower(flower, buffer, scribble);
    }
  }

  //========================================================
  function drawFlower(flower, buffer, scribble) {
    buffer.push();

    var angle = p5.TWO_PI / flower.petals.length;

    let flowerPos = p5.createVector(flower.pos.x * p5.width, flower.pos.y * p5.height);
    let flowerSize = p5.createVector(flower.size.x * p5.width, flower.size.y * p5.height);

    buffer.translate(flowerPos.x, flowerPos.y);

    for (var petal of flower.petals) {
      let petalPos = p5.createVector(flowerSize.x * petal.pos.x, flowerSize.y * petal.pos.y);
      let petalSize = p5.createVector(flowerSize.x * petal.size.x, flowerSize.y * petal.size.y);

      buffer.strokeWeight(petal.strokeWeight);

      buffer.stroke(flower.stroke);
      buffer.fill(
        p5.red(flower.fill),
        p5.green(flower.fill),
        p5.blue(flower.fill),
        flower.fillAlpha);

      scribble.scribbleEllipse(petalPos.x, petalPos.y, petalSize.x, petalSize.y);
      //scribbleBuffer.ellipse(petalPos.x, petalPos.y, petalSize.x, petalSize.y);

      if (petal.showCentre) {
        p5.push();
        drawCentre(
          petalPos.x + petalSize.x * petal.centreOffset.x,
          petalPos.y + petalSize.y * petal.centreOffset.y,
          petalSize.x * petal.centreSize, scribble);
        p5.pop();
      }

      buffer.rotate(angle);
    }

    buffer.pop();
  }

  p5.windowResized = () => {
    let w = p5.windowWidth;
    let h = p5.windowHeight;

    p5.resizeCanvas(w, h);
    scribbleBuffer.resizeCanvas(w, h);
  }

  function drawCentre(x, y, size, scribble) {
    let centreX = x + p5.random(-1, 1);
    let centreY = y + p5.random(-1, 1);

    let xCoords = [];
    let yCoords = [];

    for (var j = 0; j < 10; j++) {
      let t = j / 10;
      xCoords.push(centreX + size * p5.cos(t * p5.TWO_PI));
      yCoords.push(centreY + size * p5.sin(t * p5.TWO_PI));
    }

    scribble.scribbleFilling(xCoords, yCoords, 1, 1);
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
    //flowers.push(createFlower());
    //p5.draw();
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
        p5.createVector(params.centre.centreOffsetX, params.centre.centreOffsetY)
      ));
    }

    let f = new Flower(p5.createVector(pos.x / p5.width, pos.y / p5.height),
      p5.createVector(params.flower.flowerSizeX, params.flower.flowerSizeY), petals,
      params.flower.flowerFill, params.flower.flowerFillAlpha, params.flower.flowerStroke);

    f.randomSeed = params.flower.flowerRandSeed;

    return f;
  };
};

new p5(sketch);
export default sketch;