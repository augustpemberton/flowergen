import p5 from "p5";

class Petal {
    flower = null;
    constructor(pos, size, strokeWeight, showCentre, centreSize, centreOffset, centreFill, centreStroke) {
        this.pos = pos;
        this.size = size;
        this.strokeWeight = strokeWeight;
        this.showCentre = showCentre;
        this.centreSize = centreSize;
        this.centreOffset = centreOffset;
        this.centreFill = centreFill;
        this.centreStroke = centreStroke;
    }

    drawCentre(scribble) {
        let s = {
            x: this.flower.canvas.width,
            y: this.flower.canvas.height
        };

        this.flower.canvas.fill(this.centreFill);
        this.flower.canvas.stroke(this.centreStroke);

        scribble.scribbleEllipse(
            (this.pos.x + this.centreOffset.x) * s.x + this.flower.p5.random(-1, 1),
            (this.pos.y + this.centreOffset.y) * s.y + this.flower.p5.random(-1, 1),
            this.centreSize * s.x, 
            this.centreSize * s.x
            );
    }

    draw(scribble = new Scribble()) {
        this.flower.canvas.strokeWeight(this.strokeWeight);
        this.flower.canvas.stroke(this.flower.stroke);
        this.flower.canvas.fill(
            this.flower.p5.red(this.flower.fill),
            this.flower.p5.green(this.flower.fill),
            this.flower.p5.blue(this.flower.fill),
            this.flower.fillAlpha);

        let s = {
            x: this.flower.canvas.width,
            y: this.flower.canvas.height,
        }

        scribble.scribbleEllipse(
            this.pos.x * s.x,
            this.pos.y * s.y,
            this.size.x * s.x,
            this.size.y * s.y);

        if (this.showCentre)
            this.drawCentre(scribble);

    }
}

class Flower {
    constructor(p5, pos, scale, rotation, petals, fill, fillAlpha, stroke, canvas) {
        this.p5 = p5;
        this.pos = pos;
        this.scale = scale;
        this.rotation = rotation;

        this.petals = petals;
        this.fill = fill;
        this.fillAlpha = fillAlpha;
        this.stroke = stroke;

        this.canvas = canvas;

        this.seed = p5.random(0, 100);

        for (var petal of this.petals) {
            petal.flower = this;
        }
    }

    draw(scribble = new Scribble()) {
        this.canvas.push();

        var angle = this.p5.TWO_PI / this.petals.length;
        this.canvas.translate(this.canvas.width * this.pos.x, this.canvas.height * this.pos.y);
        this.canvas.scale(this.scale, this.scale);

        this.canvas.rotate(this.rotation * (3.14159*2)/360);

        for (var petal of this.petals) {
            petal.draw(scribble);
            this.canvas.rotate(angle);
        }

        this.canvas.pop();
    }
}

export { Petal, Flower };