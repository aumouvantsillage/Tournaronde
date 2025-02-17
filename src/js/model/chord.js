
const DEFAULT_ROOT_NOTE = ["none", "natural"];
const DEFAULT_BASS_NOTE = ["none", "natural"];
const DEFAULT_QUALITY = "major";
const DEFAULT_FIFTH = "natural";
const DEFAULT_EXTENSION = "none";
const DEFAULT_ADDITION = "none";

export class Chord {
    constructor() {
        this.rootNote  = DEFAULT_ROOT_NOTE; // "A" to "G", "natural" | "flat" | "sharp"
        this.bassNote  = DEFAULT_BASS_NOTE; // "A" to "G" | "none", "natural" | "flat" | "sharp"
        this.quality   = DEFAULT_QUALITY;   // "major" | "minor" | "sus2" | "sus4" | "no3"
        this.fifth     = DEFAULT_FIFTH;     // "natural" | "flat" | "sharp"
        this.extension = DEFAULT_EXTENSION; // "none" | "6" | "dim7" | "7" | "M7" | "9" | "M9" | "11" | "M11" | "13" | "M13"
        this.addition  = DEFAULT_ADDITION;  // "none" | "2" | "4" | "6"
    }

    copy(other) {
        this.rootNote  = other.rootNote.slice();
        this.bassNote  = other.bassNote.slice();
        this.quality   = other.quality;
        this.fifth     = other.fifth;
        this.extension = other.extension;
        this.addition  = other.addition;
    }

    equals(other) {
        return this.rootNote[0] === other.rootNote[0] &&
               this.rootNote[1] === other.rootNote[1] &&
               this.bassNote[0] === other.bassNote[0] &&
               this.bassNote[1] === other.bassNote[1] &&
               this.quality     === other.quality     &&
               this.fifth       === other.fifth       &&
               this.extension   === other.extension   &&
               this.addition    === other.addition;
    }

    isEmpty()  {
        return this.rootNote[0] === "none";
    }
}

export const EMPTY_CHORD = new Chord();

