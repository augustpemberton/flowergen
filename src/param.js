function clamp(val, min = 0, max = 1, step = 0) {
    if (step > 0)
        val = Math.round(val / step) * step;

    return Math.min(max, Math.max(min, val));
}

const ParamTypes = {
    Generic: 0,
    Ranged: 1,
    RangedArray: 2,
    Bool: 3,
    Color: 4,
    Choice: 5
}

class Param {
    paramType = ParamTypes.Generic;

    name;
    value;

    constructor(name, defaultVal) {
        this.name = name;
        this.value = defaultVal;
        this.paramType = ParamTypes.Generic;
    }

    setValue(newVal) { this.value = newVal; }
    get() { return this.value; }

    setName(newName) { this.name = newName; }
    getName() { return this.name; }

    randomize() { 
        //
    }
}

class RangedParam extends Param {
    paramType = ParamTypes.Ranged;

    min;
    max;
    step;

    constructor(name, defaultVal, min = 0, max = 1, step = 0) {
        super(name, defaultVal);
        this.paramType = ParamTypes.Ranged;

        this.min = min;
        this.max = max;
        this.step = step;

        this.setValue(this.value);
    }

    setValue(newVal) {
        super.setValue(clamp(newVal, this.min, this.max, this.step));
    }

    setMin(newVal) { this.min = newVal; }
    setMax(newVal) { this.max = newVal; }
    setStep(newVal) { this.step = newVal; }
}

class RangedArrayParam extends RangedParam {

    values = {};

    constructor(name, defaultVal, min = [], max = [], step = []) {
        super(name, defaultVal, min, max, step);
        this.paramType = ParamTypes.RangedArray;

        this.values = {};
        for (let i=0; i<defaultVal.length; i++) {
            this.values[i] = defaultVal[i];
        }
    }

    setValue(newVal) {
        if (typeof this.values === 'undefined') this.values = {};
        for (let i=0; i<newVal.length; i++) {
            this.values[i] = clamp(newVal[i], this.getMin(i), this.getMax(i), this.getStep(i));
        }
    }

    getMin(i) { return this.min[ i % this.min.length]; }
    getMax(i) { return this.max[ i % this.max.length]; }
    getStep(i) { return this.step[ i % this.step.length]; }

    get() { return this.values; }
}

class ChoiceParam extends Param {
    paramType = ParamTypes.Choice;

    choices = [];
    constructor (name, choices, defaultVal = 0) {
        super(name, defaultVal);

        this.choices = choices;
        this.setValue(defaultVal);
    }

    setChoices(choices) { 
        this.choices = choices; 
        if (this.choices.length > 0) this.value = this.choices[0];
    }

    setValue(newVal) {
        if (this.choices.includes(newVal)) this.value = newVal;
    }

    get() { 
        return this.value;
    }
}

class BoolParam extends Param {
    paramType = ParamTypes.Bool;
}
class ColorParam extends Param { 
    paramType = ParamTypes.Color;
}

export {ParamTypes, Param, RangedParam, RangedArrayParam, BoolParam, ColorParam, ChoiceParam};