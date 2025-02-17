
import {Score} from "./model/score.js";
import {Chord} from "./model/chord.js";
import {Controller} from "./controller.js";
import {ScoreView} from "./view/score.js";
import {PaletteView} from "./view/palette.js";

function onLoad() {
    const score = new Score();
    const scoreView = new ScoreView(score, document.querySelector(".score-view"));
    const paletteView = new PaletteView(score, document.querySelector(".palette-view"));
    const controller = new Controller(score, scoreView, paletteView);

    const C = new Chord();
    C.rootNote = ["C", "natural"];

    const Dbm = new Chord();
    Dbm.rootNote = ["D", "flat"];
    Dbm.quality = "minor";

    const A7 = new Chord();
    A7.rootNote = ["A", "natural"];
    A7.bassNote = ["G", "natural"];
    A7.extension = "7";

    const Gsm7b5 = new Chord();
    Gsm7b5.rootNote = ["G", "sharp"];
    Gsm7b5.quality = "minor";
    Gsm7b5.extension = "7";
    Gsm7b5.fifth = "flat";

    [
        C, C, C, C,
        C, C, A7, A7,
        C, A7, Dbm, Gsm7b5,
        C, A7, A7, Dbm,
        C, C, A7, Dbm,
        C, A7, Dbm, Dbm,
        C, C, C, A7,
        C, A7, A7, A7,
        C
    ].forEach((c, i) => score.chords[i].copy(c));

    scoreView.redraw();
}

window.addEventListener("load", onLoad);

