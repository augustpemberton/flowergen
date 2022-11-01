import p5 from "p5";
import { Petal, Flower } from "./flower"
import { params } from './params'
import Controls from "./controls"

const sketch = p5 => {
  window.p5 = p5;

  let flowers = [];
  let flowerPos = p5.createVector(0.5, 0.5);

  let controls;

  // Post Process
  let blurShader;
  let unsharpShader;
  let scribbleBuffer;
  let canvas;
  let defaultPixelDensity;

  // Text
  let font;
  let showStatusTextCountdown = 0;
  let statusText = "";

  // Background Image Unput
  let input;
  let img;
  let imgSize;

  // Canvas 
  let pos;
  let size;

  function setupGUI() {
    params.display['saveFunc'] = () => { p5.save('flowerpower.png'); };
    controls = new Controls(params);

    input = p5.createFileInput((file) => {
      if (file.type === 'image') {
        img = p5.createImg(file.data, '', '', () => {
          imgSize = p5.createVector(img.width, img.height);
          resized();
        });
      }
    });
    input.position(0, 0);
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

    params.display.blendMode.setChoices(modes);

    canvas.mousePressed(mouseDown);

    p5.frameRate(15);

    font = p5.loadFont('fonts/msmincho.otf');

    setupGUI();

    setInterval(() => {
      if (showStatusTextCountdown > 0)
        showStatusTextCountdown -= 100;
    }, 100);

    resized();
  }

  function postProcess() {
    scribbleBuffer.shader(blurShader);
    blurShader.setUniform('texture', scribbleBuffer);
    blurShader.setUniform('resolution', [scribbleBuffer.width, scribbleBuffer.height]);

    let radius = params.display.blurRadius.get();
    for (var pass = 0; pass < params.display.blurIterations.get(); pass++) {
      for (var i = 0; i < 2; i++) {
        blurShader.setUniform('direction', i % 2 == 0 ? [radius, 0] : [0, radius]);
        scribbleBuffer.rect(0, 0, size.x, size.y);
      }
    }

    scribbleBuffer.resetShader();
    scribbleBuffer.shader(unsharpShader);

    unsharpShader.setUniform('texture', scribbleBuffer);
    unsharpShader.setUniform('resolution', [scribbleBuffer.width, scribbleBuffer.height]);
    unsharpShader.setUniform('amount', params.display.unsharpAmount.get());
    unsharpShader.setUniform('threshold', params.display.unsharpThreshold.get());
    scribbleBuffer.rect(0, 0, size.x, size.y);

    scribbleBuffer.resetShader();
  }

  p5.draw = () => {
    let density = params.display.pixelDensity.get();
    if (density == 0) density = defaultPixelDensity;
    p5.pixelDensity(density);

    p5.frameRate(params.display.frameRate.get());
    p5.background(params.display.backgroundColor.get());

    scribbleBuffer.clear(0,0,0,0);
    if (!img) {
      scribbleBuffer.background(params.display.backgroundColor.get());
    }

    scribbleBuffer.push();
    scribbleBuffer.translate(-scribbleBuffer.width / 2, -scribbleBuffer.height / 2);

    flowers[0] = createFlower();
    drawFlowers(scribbleBuffer);

    if (typeof font !== 'undefined' && !img) {
      scribbleBuffer.textFont(font);
      scribbleBuffer.fill(params.flower.flowerStroke.get());
    }

    if (params.display.showText.get()) drawText();

    if (params.display.postProcess.get()) postProcess();

    p5.clear();

    if (img != null) {
      p5.image(img, pos.x, pos.y, size.x, size.y);
      let blend = params.display.blendMode.get();
      p5.blend(scribbleBuffer, 
        -size.x/2, -size.y/2, size.x, size.y, 
        pos.x, pos.y, size.x, size.y, 
        blend);
    } else {
      p5.image(scribbleBuffer, pos.x, pos.y, size.x, size.y);
    }

    scribbleBuffer.pop();
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
    scribble.roughness = params.display.scribbleRoughness.get();

    for (var flower of flowers) {
      flower.draw(scribble);
    }

    if (params.display.showText.get()) {
      buffer.push();
      buffer.textAlign(p5.CENTER, p5.CENTER);
      buffer.stroke(params.flower.flowerStroke.get());
      buffer.fill(params.flower.flowerStroke.get());
      buffer.textFont(font);
      buffer.textSize(150);
      buffer.text("imagiro", pos.x + size.x/2, pos.y + size.y/2);
      buffer.pop();
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
    p5.storeItem("preset" + keycode, controls.getState());
    showMessage("saved " + String.fromCharCode(keycode));
  }

  function loadPreset(keycode) {
    if (keycode == p5.ALT) return;
    let preset = p5.getItem("preset" + keycode);
    if (preset != null) {
      controls.loadState(preset);
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
    flowerPos = p5.createVector((p5.mouseX - pos.x) / size.x, (p5.mouseY - pos.y) / size.y);
    p5.draw();
  }

  function createFlower(pos) {
    if (typeof pos === 'undefined') {
      pos = p5.createVector(flowerPos.x * size.x, flowerPos.y * size.y);
    }

    let nPetals = params.flower.nPetals.get();
    let petals = [];
    let petalOffset = p5.createVector(params.petal.petalOffset.get()[0], params.petal.petalOffset.get()[1]);
    let petalSize = p5.createVector(params.petal.petalSize.get()[0], params.petal.petalSize.get()[1]);
    let showCentres = params.centre.showCentres.get();
    p5.randomSeed(params.flower.flowerRandSeed.get());

    let pOff = params.petal.petalOffsetRand.get();
    let sOff = params.petal.petalSizeRand.get();
    for (var i = 0; i < nPetals; i++) {
      petals.push(new Petal(
        p5.createVector(petalOffset.x + p5.random(-pOff, pOff), petalOffset.y + p5.random(-pOff, pOff)),
        p5.createVector(petalSize.x + p5.random(-sOff, sOff), petalSize.y + p5.random(-sOff, sOff)),
        params.petal.petalStroke.get(), showCentres, params.centre.centreSize.get(),
        p5.createVector(params.centre.centreOffset.get()[0], params.centre.centreOffset.get()[1]),
        params.centre.centreFill.get(),
        params.centre.centreStroke.get(),
      ));
    }

    let f = new Flower(p5, p5.createVector(pos.x / size.x, pos.y / size.y),
      params.flower.flowerSize.get(), params.flower.rotation.get(),
      petals, 
      params.flower.flowerFill.get(), params.flower.flowerFillAlpha.get(),
      params.flower.flowerStroke.get(), scribbleBuffer);

    f.randomSeed = params.flower.flowerRandSeed.get();

    return f;
  };
};

new p5(sketch);
export default sketch;