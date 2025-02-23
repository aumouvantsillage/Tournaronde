
import {Score} from "./model/score.js";
import {Controller} from "./controller.js";
import {ScoreView} from "./view/score.js";
import {PaletteView} from "./view/palette.js";
import {EditorMenu} from "./view/menu.js";

function onLoad() {
    const score = new Score();
    const scoreView = new ScoreView(score, document.querySelector(".score-view"));
    const paletteView = new PaletteView(score, document.querySelector(".palette-view"));
    const menu        = new EditorMenu(document.querySelector(".menu"));
    const controller = new Controller(score, scoreView, paletteView, menu);

    if (location.hash.startsWith("#")) {
        controller.load(location.hash.slice(1));
    }
}

window.addEventListener("load", onLoad);

