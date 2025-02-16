
const ALTERATION_TO_HTML = {
    "natural": "",
    "flat": "&flat;",
    "sharp": "&sharp;"
};

export function chordToHTML(chord) {
    let res = chord.rootNote[0] + ALTERATION_TO_HTML[chord.rootNote[1]];

    if (chord.quality === "minor") {
        res += "m";
    }

    // Additional annotations are displayed in superscript.
    if ((chord.quality !== "major" && chord.quality !== "minor") ||
        chord.fifth !== "natural" || chord.extension !== "none" ||
        chord.addition !== "none") {
        res += "<sup>";
    }

    // Add the chord extension, if applicable.
    if (chord.extension !== "none") {
        res += chord.extension;
    }

    // Add the "suspended" or "no third" chord quality, if applicable.
    if (chord.quality === "no3" && chord.extension === "none") {
        res += "5";
    }
    else if (chord.quality !== "major" && chord.quality !== "minor") {
        res += chord.quality;
    }

    // Add the chord addition, if applicable.
    if (chord.addition !== "none") {
        res += "add" + chord.addition;
    }

    // Add the diminished or augmented fifth. "dim7" implies "flat5".
    if (chord.fifth !== "natural" && (chord.fifth !== "flat" || chord.extension != "dim7")) {
        res += ALTERATION_TO_HTML[chord.fifth] + "5";
    }

    // Close the superscript mode, if applicable.
    if ((chord.quality !== "major" && chord.quality !== "minor") ||
        chord.fifth !== "natural" || chord.extension !== "none" ||
        chord.addition !== "none") {
        res += "</sup>";
    }

    // Add the bass note if different from the root note.
    if (chord.bassNote[0] !== "none") {
        res += "/" + chord.bassNote[0] + ALTERATION_TO_HTML[chord.bassNote[1]];
    }

    return res;
}
