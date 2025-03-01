
import {ScoreList} from "./score-list.js";
import {DEFAULT_CHORD_PROPERTIES, EMPTY_CHORD} from "./model/chord.js";

const CHORD_MAPPING = [
    [
        [0, 2, 0, 4],
        [1, 2, 0, 2],
        [4, 4, 4, 4] // N/A
    ],
    [
        [0, 1, 0, 2],
        [0, 4, 4, 4],
        [3, 4, 2, 4],
    ],
    [
        [4, 4, 4, 4], // N/A
        [2, 3, 2, 4],
        [2, 4, 0, 4]
    ]
];

export class Controller {
    constructor(score, scoreView, paletteView, menu) {
        this.score       = score;
        this.scoreView   = scoreView;
        this.paletteView = paletteView;
        this.menu        = menu;

        scoreView.setController(this);
        paletteView.setController(this);
        menu.setController(this);

        this.reset();

        this.scoreView.redrawScoreProperties();
        this.scoreView.redraw();
        this.paletteView.showSelection();
    }

    reset() {
        this.editable = false;

        this.scoreView.setEditable(false);
        this.paletteView.setEditable(false);
        this.menu.setEditable(false);

        this.selected = {
            col: 0,
            row: 0,
            slotCol: 1,
            slotRow: 1
        };
    }

    save() {
        const scoreList = new ScoreList();

        const isNew = this.score.id === null;
        if (isNew) {
            this.score.id = scoreList.makeId();
        }

        scoreList.add(this.score.id);
        scoreList.update();

        if (isNew) {
            this.menu.updateNavigationButtons();
        }

        this.score.saveDate = new Date();
        localStorage.setItem(this.score.id, this.score.serialize());
    }

    saveAsFile() {
        const data = new Blob([this.score.serialize()], {type: "application/json"});
        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.score.title.replace(/[\/\?<>\\:\*\|"]/g, "-") + ".json";
        a.click();
        setTimeout(_ => URL.revokeObjectURL(url), 0);
    }

    load(id) {
        const json = localStorage.getItem(id);
        if (json === null) {
            return;
        }

        this.reset();
        this.score.deserialize(json);
        this.scoreView.redrawScoreProperties();
        this.scoreView.redraw();
        this.paletteView.showSelection();
        this.menu.updateNavigationButtons();
    }

    getPreviousId() {
        // Unsaved score: disable access to previous score.
        if (this.score.id === null) {
            return null;
        }

        const scoreList = new ScoreList();
        const loc = scoreList.content.indexOf(this.score.id);
        if (loc < 1) {
            return null;
        }

        return scoreList.content[loc - 1];
    }

    getNextId() {
        // Unsaved score: disable access to next score.
        if (!this.score.id) {
            return null;
        }

        const scoreList = new ScoreList();
        const loc = scoreList.content.indexOf(this.score.id);
        if (loc === scoreList.content.length - 1) {
            return null;
        }
        return scoreList.content[loc + 1];

    }

    setScoreWidth(width) {
        this.score.setWidth(width);
        this.scoreView.redrawScoreProperties();
        this.scoreView.redraw();
        this.save();
    }

    setScoreHeight(height) {
        this.score.setHeight(height);
        this.scoreView.redrawScoreProperties();
        this.scoreView.redraw();
        this.save();
    }

    setTitle(title) {
        this.score.title = title;
        this.scoreView.redrawScoreProperties();
        // FIXME This could require a score redraw if the title height has changed.
        this.save();
    }

    setTimeSignatureBeats(beats) {
        this.score.timeSignature.beats = beats;
        this.scoreView.redrawScoreProperties();
        this.save();
    }

    setTimeSignatureUnit(unit) {
        this.score.timeSignature.unit = unit;
        this.scoreView.redrawScoreProperties();
        this.save();
    }

    setNextTempoUnit() {
        this.score.setTempoUnit(this.score.tempo.unit + 1);
        this.scoreView.redrawScoreProperties();
        this.save();
    }

    setTempoBpm(bpm) {
        this.score.tempo.bpm = bpm;
        this.scoreView.redrawScoreProperties();
        this.save();
    }

    getChordInSlot(col, row, slotCol, slotRow, merge) {
        const chords = this.score.getChordsInBar(col, row);
        const [eqLeft, eqRight, neLeft, neRight] = CHORD_MAPPING[slotRow][slotCol];

        if (chords.slice(eqLeft + 1, eqRight).some(it => !chords[eqLeft].equals(it))) {
            return EMPTY_CHORD;
        }

        if (merge && neLeft < chords.length && chords.slice(neLeft + 1, neRight).every(it => chords[neLeft].equals(it))) {
            return EMPTY_CHORD;
        }

        return chords[eqLeft];
    }

    getSelectedChord() {
        return this.getChordInSlot(this.selected.col, this.selected.row, this.selected.slotCol, this.selected.slotRow, false);
    }

    select(col, row, slotCol, slotRow) {
        this.selected = {col, row, slotCol, slotRow};
        this.scoreView.showSelection();
        this.paletteView.showSelection();
    }

    updateSelectedChord(key, value) {
        // If all selected chords have the same value for this key,
        // toggle the current property, otherwise, set it.
        const chords = this.score.getChordsInBar(this.selected.col, this.selected.row);
        const [eqLeft, eqRight, , ] = CHORD_MAPPING[this.selected.slotRow][this.selected.slotCol];
        const allEq = chords.slice(eqLeft + 1, eqRight).every(it => chords[eqLeft].equals(it));

        if (allEq && chords[eqLeft][key] === value) {
            value = DEFAULT_CHORD_PROPERTIES[key];
        }

        chords.slice(eqLeft, eqRight).forEach(it => {
            it[key] = value;
        });

        this.paletteView.showSelection();
        this.scoreView.redraw();
        this.save();
    }

    toggleEditable() {
        this.editable = !this.editable;
        this.scoreView.setEditable(this.editable);
        this.paletteView.setEditable(this.editable);
        this.menu.setEditable(this.editable);
    }
}
