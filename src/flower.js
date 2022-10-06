class Petal {
    constructor(pos, size, strokeWeight, showCentre, centreSize, centreOffset) {
        this.pos= pos;
        this.size = size;
        this.strokeWeight = strokeWeight;
        this.showCentre = showCentre;
        this.centreSize = centreSize;
        this.centreOffset = centreOffset;
    }
}

class Flower {
    constructor(pos, size, petals, fill, fillAlpha, stroke) {
        this.pos = pos;
        this.size = size;
        this.petals = petals;
        this.fill = fill;
        this.fillAlpha = fillAlpha;
        this.stroke = stroke;

        this.seed = p5.random(0, 100);
    }
}

export {Petal, Flower};