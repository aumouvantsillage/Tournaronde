
export const DEFAULT_CHORD_PROPERTIES = {
    repeatStart: "false",
    repeatEnd: "false",
    rootNote: "none",
    rootAlt: "natural",
    bassNote: "none",
    bassAlt: "natural",
    quality: "major",
    fifth: "natural",
    extension: "none",
    addition: "none"
};

const ALTERATION = {
    "natural": "",
    "flat": "♭",
    "sharp": "♯"
};

export class Chord {
    constructor(other = {}) {
        for (const [k, v] of Object.entries(DEFAULT_CHORD_PROPERTIES)) {
            if (k in other) {
                this[k] = other[k];
            }
            else {
                this[k] = v;
            }
        }
    }

    equals(other) {
        for (const [k, v] of Object.entries(other)) {
            if (this[k] != v) {
                return false;
            }
        }
        return true;
    }

    isEmpty()  {
        return this.rootNote === "none";
    }

    merge(other) {
        const res = new Chord();
        for (const k of Object.keys(DEFAULT_CHORD_PROPERTIES)) {
            if (k in this && k in other && this[k] == other[k]) {
                res[k] = this[k];
            }
        }
        return res;
    }

    toText() {
        const res = {
            left: this.rootNote + ALTERATION[this.rootAlt]
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
        if (this.bassNote !== "none") {
            res.right = "/" + this.bassNote + ALTERATION[this.bassAlt];
        }

        return res;
    }
}

export const EMPTY_CHORD = new Chord();

