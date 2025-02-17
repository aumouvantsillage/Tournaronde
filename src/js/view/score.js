
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
            for (let slotRow = 0; slotRow < 3; slotRow ++) {
                const tr = document.createElement("tr");
                for (let col = 0; col < this.score.width; col++) {
                    for (let slotCol = 0; slotCol < 3; slotCol ++) {
                        const td = document.createElement("td");
                        tr.appendChild(td);

                        if (slotCol === 0 && slotRow === 2 || slotCol === 2 && slotRow === 0) {
                            td.classList.add("disabled");
                            continue;
                        }

                        td.addEventListener("click", (_) => {
                            this.controller.select(col, row, slotCol, slotRow);
                        });

                        const chord = this.controller.getChordInSlot(col, row, slotCol, slotRow, true);
                        if (!chord.isEmpty()) {
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

        this.showSelection();
    }

    showSelection() {
        this.chordsTable.querySelectorAll("td").forEach(td => td.classList.remove("selected"));
        const trs = this.chordsTable.querySelectorAll("tr");
        const selectedTr = trs[this.controller.selected.row * 3 + this.controller.selected.slotRow];
        const tds = selectedTr.querySelectorAll("td");
        const selectedTd = tds[this.controller.selected.col * 3 + this.controller.selected.slotCol];
        selectedTd.classList.add("selected");
    }
}
