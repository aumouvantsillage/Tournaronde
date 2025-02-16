
import {chordToHTML} from "./chord.js";

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

export class ScoreView {
    constructor(score, container) {
        this.container = container;
        this.score = score;

        this.widthInput = container.querySelector("input[name='score-width']");
        this.heightInput = container.querySelector("input[name='score-height']");
        this.titleHeading = container.querySelector(".score-title");
        this.timeSignatureInputs = container.querySelectorAll(".score-time-signature input");
        this.tempoInputs = container.querySelectorAll(".score-tempo > *");
        this.chordsTable = container.querySelector(".score-chords table");

        this.widthInput.addEventListener("change", (_) => {
            this.score.setWidth(parseInt(this.widthInput.value));
            this.redraw();
        });

        this.heightInput.addEventListener("change", (_) => {
            this.score.setHeight(parseInt(this.heightInput.value));
            this.redraw();
        });
    }

    redraw() {
        this.widthInput.value = this.score.width;
        this.heightInput.value = this.score.height;
        this.titleHeading.innerText = this.score.title;
        this.score.timeSignature.forEach((v, i) => this.timeSignatureInputs[i].value = v);
        this.score.tempo.forEach((v, i) => this.tempoInputs[i].value = v);

        this.chordsTable.innerHTML = "";

        function chordAtStep(chords, col, row) {
            const [eqLeft, eqRight, neLeft, neRight] = CHORD_MAPPING[row][col];

            if (eqLeft >= chords.length || chords.slice(eqLeft + 1, eqRight).some(it => !chords[eqLeft].equals(it))) {
                return null;
            }

            if (neLeft < chords.length && chords.slice(neLeft + 1, neRight).every(it => chords[neLeft].equals(it))) {
                return null;
            }

            return chords[eqLeft];
        }

        for (let row = 0; row < this.score.height; row ++) {
            for (let stepRow = 0; stepRow < 3; stepRow ++) {
                const tr = document.createElement("tr");
                for (let col = 0; col < this.score.width; col++) {
                    const chords = this.score.getChords(col, row);
                    for (let stepCol = 0; stepCol < 3; stepCol ++) {
                        const td = document.createElement("td");
                        const chord = chordAtStep(chords, stepCol, stepRow);
                        if (chord !== null) {
                            td.innerHTML = chordToHTML(chord);
                        }
                        else {
                            td.innerHTML = "&nbsp;";
                        }
                        tr.appendChild(td);
                    }
                }
                this.chordsTable.appendChild(tr);
            }
        }
    }
}
