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
    constructor(pos, size, petals) {
        this.pos = pos;
        this.size = size;
        this.petals = petals;

        this.seed = random(0, 100);
    }
}