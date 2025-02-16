
const DEFAULT_WIDTH = 4
const DEFAULT_HEIGHT = 4
const DEFAULT_TITLE = "New Score";
const DEFAULT_TIME_SIGNATURE = [4, 4];
const DEFAULT_TEMPO = [4, 120];

const CHORDS_PER_CELL = 4

export class Score {
    constructor() {
        this.width         = DEFAULT_WIDTH;
        this.height        = DEFAULT_HEIGHT;
        this.title         = DEFAULT_TITLE;
        this.timeSignature = DEFAULT_TIME_SIGNATURE;
        this.tempo         = DEFAULT_TEMPO;
        this.chords        = [];
    }

    setWidth(width) {
        if (width >= 0) {
            this.width = width;
        }
    }

    setHeight(width) {
        if (width >= 0) {
            this.height = width;
        }
    }

    getChords(col, row) {
        const left = (row * this.width + col) * CHORDS_PER_CELL;
        const right = left + CHORDS_PER_CELL;
        return this.chords.slice(left, right);
    }
}
