import * as dat from 'dat.gui';
import { ParamTypes } from "./param"

class Controls {
    constructor(params) {
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

                else {
                    console.log("unknown param type")
                    console.log(param);
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
        console.log("loading state: ");
        console.log(state);
        for (const [key, value] of Object.entries(state)) {
            this.getParam(key).setValue(value);
        }
    }

    getState() {
        let s = {};
        for (const p of this.getAllParams()) {
            if (p.param.paramType !== undefined) {
                s[p.id] = p.param.get();
            }
        }

        console.log(s);

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
        console.log(s);
        window.history.pushState(s, 'flower', '?state=' + s);
    }

    loadFromURL() {
        let stateStr = window.p5.getURLParams().state;
        if (typeof stateStr === 'undefined') return;

        this.loadURLState(stateStr);
    }
}

export default Controls;