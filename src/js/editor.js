
import {Score} from "./model/score.js";
import {Controller} from "./controller.js";
import {ScoreView} from "./view/score.js";
import {PaletteView} from "./view/palette.js";

function onLoad() {
    const score = new Score();
    const scoreView = new ScoreView(score, document.querySelector(".score-view"));
    const paletteView = new PaletteView(score, document.querySelector(".palette-view"));
    const controller = new Controller(score, scoreView, paletteView);

    if (location.hash.startsWith("#")) {
        controller.load(location.hash.slice(1));
    }
}

window.addEventListener("load", onLoad);

