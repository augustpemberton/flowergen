let params = {
  flower: {
    flowerSizeX: 0.21, flowerSizeXMin: 0, flowerSizeXMax: 0.5, flowerSizeXStep: 0.001,
    flowerSizeY: 0.17, flowerSizeYMin: 0, flowerSizeYMax: 0.5, flowerSizeYStep: 0.001,

    nPetals: 9, nPetalsMin: 1, nPetalsMax: 20, nPetalsStep: 1,

    flowerStroke: [84, 109, 115],
    flowerFill: [108, 157, 141],
    flowerFillAlpha: 10, flowerFillAlphaMin: 0, flowerFillAlphaMax: 255, flowerFillAlphaStep: 1,
    flowerRandSeed: 146, flowerRandSeedMin: 0, flowerRandSeedMax: 10000, flowerRandSeedStep: 0.001,
  },

  petal: {
    petalOffsetX: 0.286, petalOffsetXMin: 0, petalOffsetXMax: 2, petalOffsetXStep: 0.001,
    petalOffsetY: 0, petalOffsetYMin: 0, petalOffsetYMax: 2, petalOffsetYStep: 0.001,
    petalOffsetRand: 0.075, petalOffsetRandMin: 0, petalOffsetRandMax: 2, petalOffsetRandStep: 0.001,

    petalSizeX: 0.726, petalSizeXMin: 0, petalSizeXMax: 2, petalSizeXStep: 0.001,
    petalSizeY: 0.592, petalSizeYMin: 0, petalSizeYMax: 2, petalSizeYStep: 0.001,
    petalSizeRand: 0.15, petalSizeRandMin: 0, petalSizeRandMax: 2, petalSizeRandStep: 0.001,

    petalStroke: 1, petalStrokeMin: 0.001, petalStrokeMax: 15, petalStrokeStep: 0.001,

  },

  centre: {
    showCentres: true,

    centreOffsetX: 0.04, centreOffsetXMin: -1, centreOffsetXMax: 2, centreOffsetXStep: 0.001,
    centreOffsetY: 0.05, centreOffsetYMin: -1, centreOffsetYMax: 2, centreOffsetYStep: 0.001,

    centreSize: 0.01, centreSizeMin: 0.001, centreSizeMax: 0.1, centreSizeStep: 0.0001,
  },

  display: {
    scribbleRoughness: 1.3, scribbleRoughnessMin: 0, scribbleRoughnessMax: 10, scribbleRoughnessStep: 0.1,

    blurRadius: 0.5, blurRadiusMin: 0, blurRadiusMax: 3, blurRadiusStep: 0.01,
    blurIterations: 3, blurIterationsMin: 0, blurIterationsMax: 20, blurIterationsStep: 1,

    unsharpAmount: 50, unsharpAmountMin: 0, unsharpAmountMax: 200, unsharpAmountStep: 1,
    unsharpThreshold: 0.4, unsharpThresholdMin: 0, unsharpThresholdMax: 10, unsharpThresholdStep: 0.1,

    backgroundColor: [222, 222, 222],
    frameRate: 15, frameRateMin: 1, frameRateMax: 120, frameRateStep: 1
  },
}

export {params};
