import * as dat from 'dat.gui';
import { ParamTypes } from "./param"

class Controls {
    constructor(p5, params) {
        this.p5 = p5;
        this.gui = new dat.GUI();
        this.params = params;

        for (const [name, category] of Object.entries(params)) {
            var folder = this.gui.addFolder(name);
            for (const [id, param] of Object.entries(category)) {

                let p;

                if (param.paramType == ParamTypes.Ranged) {
                    p = folder.add(param, "value").name(param.name).min(param.min).max(param.max);
                    p.step(Math.max(param.step, 0.0001));
                }

                else if (param.paramType == ParamTypes.Color) {
                    p = folder.addColor(param, "value").name(param.name);
                }

                else if (param.paramType == ParamTypes.RangedArray) {
                    let suffixes = [];
                    if (param.value.length == 2) suffixes = ['x', 'y'];
                    else if (param.value.length == 3) suffixes = ['x', 'y'];
                    else {
                        for (let i = 0; i < param.value.length; i++)
                            suffixes.push(String.fromCharCode('a'.charCodeAt(0) + i));
                    }

                    for (let i = 0; i < param.value.length; i++) {
                        p = folder.add(param.values, i).name(param.name + " " + suffixes[i])
                            .min(param.getMin(i)).max(param.getMax(i));
                        p.step(Math.max(param.step, 0.0001));
                    }
                }

                else if (param.paramType == ParamTypes.Bool) {
                    p = folder.add(param, "value").name(param.name);
                }

                else if (param.paramType == ParamTypes.Choice) {
                    p = folder.add(param, "value").name(param.name).options(param.choices).listen();
                }

                else if (param.paramType == ParamTypes.Generic) {
                    p = folder.add(param, "value").name(param.name).listen();
                }

                else {
                    p = folder.add(category, id);
                }

                if (p) {
                    let ctx = this;
                    p.onFinishChange(() => {ctx.updateURL();});
                    p.listen();
                }
            }
        }

        this.loadFromURL();
    }

    getParam(paramID) {
        for (const [name, folder] of Object.entries(this.params)) {
            for (const [id, param] of Object.entries(folder)) {
                if (id == paramID) return param;
            }
        }

        return null;
    }

    getAllParams() {
        let params = [];
        for (const [name, folder] of Object.entries(this.params)) {
            for (const [id, param] of Object.entries(folder)) {
                params.push({id: id, param: param});
            }
        }

        return params;
    }

    loadState(state) {
        if (state.constructor != Object) {
            console.log(state);
            console.log(this.params);
            const flowerSettings = state[0];
            const petalSettings = state[1];
            const centreSettings = state[2];
            const displaySettings = state[3];

            const flowerSettingsArr = ['flowerSize', 'rotation', 'nPetals', 'flowerStroke', 'flowerFill', 'flowerFillAlpha', 'flowerRandSeed'];
            for (let i=0; i<flowerSettingsArr.length; i++) {
                this.getParam(flowerSettingsArr[i]).setValue(flowerSettings[i]);
            }

            this.getParam('petalOffset').setValue([petalSettings[0], petalSettings[1]]);
            this.getParam('petalOffsetRand').setValue(petalSettings[2]);
            this.getParam('petalSize').setValue([petalSettings[3] * 0.8, petalSettings[4] * 0.8]);
            this.getParam('petalStroke').setValue(petalSettings[5]);

            this.getParam('showCentres').setValue(centreSettings[0]);
            this.getParam('centreOffset').setValue([centreSettings[1], centreSettings[2]]);
            this.getParam('centreSize').setValue(centreSettings[3]);
            // this.getParam('centreStroke').setValue(centreSettings[4]);
            // this.getParam('centreFill').setValue(centreSettings[5]);

            this.getParam('backgroundColor').setValue(displaySettings[6])
            return;
        }

        for (const [key, value] of Object.entries(state)) {
            const param = this.getParam(key);
            if (param) param.setValue(value);
            else console.log("cant find parameter", key)
        }
    }

    getState() {
        let s = {};
        for (const p of this.getAllParams()) {
            if (p.param.paramType !== undefined) {
                s[p.id] = p.param.get();
            }
        }

        return s;
    }

    getURLState() { 
        return encodeURIComponent(window.btoa(
            JSON.stringify(this.getState()))); 
    }
    loadURLState(str) { this.loadState(JSON.parse(
        window.atob(decodeURIComponent(str)))); }

    updateURL() {
        let s = this.getURLState();
        window.history.pushState(s, 'flower', '?state=' + s);
    }

    loadFromURL() {
        let stateStr = this.p5.getURLParams().state;
        if (typeof stateStr === 'undefined') return;

        this.loadURLState(stateStr);
    }
}

export default Controls;