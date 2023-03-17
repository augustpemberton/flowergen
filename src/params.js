import {Param, RangedParam, RangedArrayParam, BoolParam, ColorParam, ChoiceParam} from './param.js';

let params = {
  flower: {
    flowerSize: new RangedParam("flower size", 0.21, 0, 1),
    rotation: new RangedParam("rotation", 0, 0, 360, 1),
    nPetals: new RangedParam("num petals", 10, 1, 40, 1),

    flowerStroke: new ColorParam("flower stroke", [84, 109, 115]),
    flowerFill: new ColorParam("flower fill", [108, 157, 141]),
    flowerFillAlpha: new RangedParam("flowerFillAlpha", 0, 0, 255),
    flowerRandSeed: new RangedParam("rand seed", 146, 0, 1000, 1),
  },

  petal: {
    petalOffset: new RangedArrayParam("petal offset", [0.286, 0], [0], [2], [0]),
    petalOffsetRand: new RangedParam("petal offset rand", 0, 0, 1),

    petalSize: new RangedArrayParam("petal size", [0.726, 0.592], [0], [2], [0]), 
    petalSizeRand: new RangedParam("petal size rand", 0.15, 0, 1),

    petalStroke: new RangedParam("petal stroke", 1, 0, 15),
  },

  centre: {
    showCentres: new BoolParam("show centres", false),
    centreOffset: new RangedArrayParam("centre offset", [0.04, 0.05], [-1], [2], [0]), 
    centreSize: new RangedParam("centre size", 0.01, 0.001, 1),

    centreStroke: new ColorParam("centreStroke", [84, 109, 115]),
    centreFill: new ColorParam("centreFill", [84, 109, 115]),
  },

  display: {
    postProcess: new BoolParam("post process", true),
    scribbleRoughness: new RangedParam("scribble roughness", 1.3, 0, 10, 0.1),

    blurRadius: new RangedParam("blur radius", 0.5, 0, 2, 0.01),
    blurIterations: new RangedParam("blur iterations", 1, 0, 5, 1),

    unsharpAmount: new RangedParam("unsharp amnt", 20, 0, 200, 1),
    unsharpThreshold: new RangedParam("unsharp thresh", 0.4, 0, 10, 0.1),

    backgroundColor: new ColorParam("bg color", [222, 222, 222]),
    background: new BoolParam("background on", true),

    frameRate: new RangedParam("fps", 12, 0, 120, 1),
    pixelDensity: new RangedParam("pixel density", 0, 0, 5, 0.001),

    // to be filled by p5 instance
    blendMode: new ChoiceParam("blend mode", []),
  },

  text: {
    showText: new BoolParam("show text", false),
    showExtraText: new BoolParam("show extra text", false),
    textValue: new Param("text", "imagiro"),
    textSize: new RangedParam("text size", 0, 0, 250, 1),
    textColor: new ColorParam("text color", [0,0,0])
  }
}

export {params};
