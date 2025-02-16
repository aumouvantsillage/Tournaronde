
import {chordToHTML} from "./chord.js";

export class ScoreView {
    constructor(score, container) {
        this.score                   = score;
        this.controller              = null;
        this.container               = container;

        this.widthInput              = container.querySelector("input[name='score-width']");
        this.heightInput             = container.querySelector("input[name='score-height']");
        this.titleHeading            = container.querySelector(".score-title");
        this.timeSignatureBeatsInput = container.querySelector("input[name='score-time-signature-beats']");
        this.timeSignatureUnitInput  = container.querySelector("input[name='score-time-signature-unit']");
        this.tempoUnitInput          = container.querySelector("select[name='score-tempo-unit']");
        this.tempoBpmInput           = container.querySelector("input[name='score-tempo-bpm']");
        this.chordsTable             = container.querySelector(".score-chords table");
    }

    setController(controller) {
        this.controller = controller;

        this.widthInput.addEventListener("change", (_) => {
            this.controller.setScoreWidth(parseInt(this.widthInput.value));
        });

        this.heightInput.addEventListener("change", (_) => {
            this.controller.setScoreHeight(parseInt(this.heightInput.value));
        });
    }

    redraw() {
        this.widthInput.value              = this.score.width;
        this.heightInput.value             = this.score.height;
        this.titleHeading.innerText        = this.score.title;
        this.timeSignatureBeatsInput.value = this.score.timeSignature.beats;
        this.timeSignatureUnitInput.value  = this.score.timeSignature.unit;
        this.tempoUnitInput.value          = this.score.tempo.unit;
        this.tempoBpmInput.value           = this.score.tempo.bpm;

        this.chordsTable.innerHTML = "";

        for (let row = 0; row < this.score.height; row ++) {
            for (let stepRow = 0; stepRow < 3; stepRow ++) {
                const tr = document.createElement("tr");
                for (let col = 0; col < this.score.width; col++) {
                    for (let stepCol = 0; stepCol < 3; stepCol ++) {
                        const td = document.createElement("td");
                        tr.appendChild(td);

                        if (stepCol === 0 && stepRow === 2 || stepCol === 2 && stepRow === 0) {
                            td.classList.add("disabled");
                            continue;
                        }

                        td.addEventListener("click", (_) => {
                            this.controller.select(col, row, stepCol, stepRow);
                        });

                        const chord = this.controller.getChordAtStep(col, row, stepCol, stepRow, true);
                        if (chord !== null) {
                            td.innerHTML = chordToHTML(chord);
                        }
                        else {
                            td.innerHTML = "&nbsp;";
                        }
                    }
                }
                this.chordsTable.appendChild(tr);
            }
        }
    }

    showSelection() {
        this.chordsTable.querySelectorAll("td").forEach(td => td.classList.remove("selected"));
        const trs = this.chordsTable.querySelectorAll("tr");
        const selectedTr = trs[this.controller.selected.row * 3 + this.controller.selected.stepRow];
        const tds = selectedTr.querySelectorAll("td");
        const selectedTd = tds[this.controller.selected.col * 3 + this.controller.selected.stepCol];
        selectedTd.classList.add("selected");
    }
}
