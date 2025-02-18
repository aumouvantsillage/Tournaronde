
import {EMPTY_CHORD} from "./model/chord.js";

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
    constructor(score, scoreView, paletteView) {
        this.score       = score;
        this.scoreView   = scoreView;
        this.paletteView = paletteView;

        scoreView.setController(this);
        paletteView.setController(this);

        this.editable = false;

        scoreView.setEditable(false);
        paletteView.setEditable(false);

        this.selected = {
            col: 0,
            row: 0,
            slotCol: 1,
            slotRow: 1
        };

        this.scoreView.redraw();
        this.paletteView.showSelection();
    }

    save() {
        localStorage.setItem(this.score.id, this.score.serialize());
    }

    load(id) {
        const json = localStorage.getItem(id);
        if (json === null) {
            return;
        }

        this.score.deserialize(json);
        this.scoreView.redraw();
        this.paletteView.showSelection();
    }

    setScoreWidth(width) {
        this.score.setWidth(width);
        this.scoreView.redraw();
        this.save();
    }

    setScoreHeight(height) {
        this.score.setHeight(height);
        this.scoreView.redraw();
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

    updateSelectedChord(rootNote, rootAlt, quality, fifth, extension, addition, bassNote, bassAlt) {
        const chords = this.score.getChordsInBar(this.selected.col, this.selected.row);
        const [eqLeft, eqRight, neLeft, neRight] = CHORD_MAPPING[this.selected.slotRow][this.selected.slotCol];
        for (let i = eqLeft; i < eqRight; i ++) {
            chords[i].copy({
                rootNote: [rootNote, rootAlt],
                quality, fifth, extension, addition,
                bassNote: [bassNote, bassAlt]
            });
        }
        this.scoreView.redraw();
        this.save();
    }

    toggleEditable() {
        this.editable = !this.editable;
        this.scoreView.setEditable(this.editable);
        this.paletteView.setEditable(this.editable);
    }
}
