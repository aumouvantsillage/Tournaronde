
import {Chord} from "./chord.js";

const DEFAULT_WIDTH          = 4
const DEFAULT_HEIGHT         = 4
const DEFAULT_TITLE          = "New Score";
const DEFAULT_TIME_SIGNATURE = {beats: 4, unit: 4};
const DEFAULT_TEMPO          = {unit: 2, bpm: 120};

const TEMPO_COUNT            = 5

const CHORDS_PER_BAR         = 4

export class Score {
    constructor() {
        this.id            = Date.now();
        this.width         = DEFAULT_WIDTH;
        this.height        = DEFAULT_HEIGHT;
        this.title         = DEFAULT_TITLE;
        this.timeSignature = DEFAULT_TIME_SIGNATURE;
        this.tempo         = DEFAULT_TEMPO;
        this.chords        = [];
        this.creationDate  = new Date();
        this.saveDate      = this.creationDate;
        this.resize();
    }

    serialize() {
        this.saveDate = new Date();
        return JSON.stringify(this);
    }

    deserialize(json) {
        const obj = JSON.parse(json);
        this.id            = obj.id;
        this.width         = obj.width;
        this.height        = obj.height;
        this.title         = obj.title;
        this.timeSignature = structuredClone(obj.timeSignature);
        this.tempo         = structuredClone(obj.tempo);
        this.chords        = obj.chords.map(it => new Chord(it));
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

    setTempoUnit(unit) {
        this.tempo.unit = unit % TEMPO_COUNT;
    }

    getChordsInBar(col, row) {
        const left = (row * this.width + col) * CHORDS_PER_BAR;
        const right = left + CHORDS_PER_BAR;
        return this.chords.slice(left, right);
    }
}
