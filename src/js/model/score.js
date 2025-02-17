
import {Chord} from "./chord.js";

const DEFAULT_WIDTH = 4
const DEFAULT_HEIGHT = 4
const DEFAULT_TITLE = "New Score";
const DEFAULT_TIME_SIGNATURE = {beats: 4, unit: 4};
const DEFAULT_TEMPO = {unit: 4, bpm: 120};

const CHORDS_PER_BAR = 4

export class Score {
    constructor() {
        this.width         = DEFAULT_WIDTH;
        this.height        = DEFAULT_HEIGHT;
        this.title         = DEFAULT_TITLE;
        this.timeSignature = DEFAULT_TIME_SIGNATURE;
        this.tempo         = DEFAULT_TEMPO;
        this.chords        = [];
        this.resize();
    }

    resize() {
        const newLength = this.width * this.height * CHORDS_PER_BAR;
        // If applicable, pad the score with empty chords.
        while (this.chords.length < newLength) {
            this.chords.push(new Chord());
        }
        // If applicable, trim the trailing empty chords.
        while (this.chords.length > newLength &&
               this.chords[this.chords.length - 1].isEmpty()) {
            this.chords.pop();
        }
    }

    setWidth(width) {
        if (width > 0) {
            this.width = width;
            this.resize();
        }
    }

    setHeight(height) {
        if (height > 0) {
            this.height = height;
            this.resize();
        }
    }

    getChordsInBar(col, row) {
        const left = (row * this.width + col) * CHORDS_PER_BAR;
        const right = left + CHORDS_PER_BAR;
        return this.chords.slice(left, right);
    }
}
