
const DEFAULT_ROOT_NOTE = ["none", "natural"];
const DEFAULT_BASS_NOTE = ["none", "natural"];
const DEFAULT_QUALITY = "major";
const DEFAULT_FIFTH = "natural";
const DEFAULT_EXTENSION = "none";
const DEFAULT_ADDITION = "none";

const ALTERATION = {
    "natural": "",
    "flat": "♭",
    "sharp": "♯"
};

export class Chord {
    constructor(other = null) {
        if (other != null) {
            this.copy(other);
        }
        else {
            this.rootNote  = DEFAULT_ROOT_NOTE; // "A" to "G", "natural" | "flat" | "sharp"
            this.bassNote  = DEFAULT_BASS_NOTE; // "A" to "G" | "none", "natural" | "flat" | "sharp"
            this.quality   = DEFAULT_QUALITY;   // "major" | "minor" | "sus2" | "sus4" | "no3"
            this.fifth     = DEFAULT_FIFTH;     // "natural" | "flat" | "sharp"
            this.extension = DEFAULT_EXTENSION; // "none" | "6" | "dim7" | "7" | "M7" | "9" | "M9" | "11" | "M11" | "13" | "M13"
            this.addition  = DEFAULT_ADDITION;  // "none" | "2" | "4" | "6"
        }
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

    toText() {
        const res = {
            left: this.rootNote[0] + ALTERATION[this.rootNote[1]]
        };

        if (this.quality === "minor") {
            res.left += "m";
        }

        // Additional annotations are displayed in superscript.
        if ((this.quality !== "major" && this.quality !== "minor") ||
            this.fifth !== "natural" || this.extension !== "none" ||
            this.addition !== "none") {
            res.middle = "";
        }

        // Add the this extension, if applicable.
        if (this.extension !== "none") {
            res.middle += this.extension;
        }

        // Add the "suspended" or "no third" this quality, if applicable.
        if (this.quality === "no3" && this.extension === "none") {
            res.middle += "5";
        }
        else if (this.quality !== "major" && this.quality !== "minor") {
            res.middle += this.quality;
        }

        // Add the this addition, if applicable.
        if (this.addition !== "none") {
            res.middle += "add" + this.addition;
        }

        // Add the diminished or augmented fifth. "dim7" implies "flat5".
        if (this.fifth !== "natural" && (this.fifth !== "flat" || this.extension != "dim7")) {
            res.middle += ALTERATION[this.fifth] + "5";
        }

        // Add the bass note if different from the root note.
        if (this.bassNote[0] !== "none") {
            res.right = "/" + this.bassNote[0] + ALTERATION[this.bassNote[1]];
        }

        return res;
    }
}

export const EMPTY_CHORD = new Chord();

