
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

        this.selected = {
            col: 0,
            row: 0,
            stepCol: 1,
            stepRow: 1
        };
    }

    setScoreWidth(width) {
        this.score.setWidth(width);
        this.scoreView.redraw();
    }

    setScoreHeight(height) {
        this.score.setHeight(height);
        this.scoreView.redraw();
    }

    getChordAtStep(col, row, stepCol, stepRow, merge) {
        const chords = this.score.getChords(col, row);
        const [eqLeft, eqRight, neLeft, neRight] = CHORD_MAPPING[stepRow][stepCol];

        if (eqLeft >= chords.length || chords.slice(eqLeft + 1, eqRight).some(it => !chords[eqLeft].equals(it))) {
            return null;
        }

        if (merge && neLeft < chords.length && chords.slice(neLeft + 1, neRight).every(it => chords[neLeft].equals(it))) {
            return null;
        }

        return chords[eqLeft];
    }

    getSelectedChord() {
        return this.getChordAtStep(this.selected.col, this.selected.row, this.selected.stepCol, this.selected.stepRow, false);
    }

    select(col, row, stepCol, stepRow) {
        this.selected = {col, row, stepCol, stepRow};
        this.scoreView.showSelection();
        this.paletteView.showSelection();
    }
}
