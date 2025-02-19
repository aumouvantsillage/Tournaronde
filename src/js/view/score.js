
const SVG_NS = "http://www.w3.org/2000/svg";

const TEXT_LOCATION =  [
    [
        {x: 1/4, y: 1/4},
        {x: 1/2, y: 1/6},
        {x: 0, y: 0} // Inactive
    ],
    [
        {x: 1/6, y: 1/2},
        {x: 1/2, y: 1/2},
        {x: 5/6, y: 1/2}
    ],
    [
        {x: 0, y: 0}, // Inactive
        {x: 1/2, y: 5/6},
        {x: 0.75, y: 0.75}
    ]
];

export class ScoreView {
    constructor(score, container) {
        this.score                   = score;
        this.controller              = null;
        this.container               = container;

        this.editButton              = container.querySelector("button[name='score-editable']");
        this.widthInput              = container.querySelector("input[name='score-width']");
        this.heightInput             = container.querySelector("input[name='score-height']");
        this.titleHeading            = container.querySelector(".score-title");
        this.timeSignatureBeatsInput = container.querySelector("input[name='score-time-signature-beats']");
        this.timeSignatureUnitInput  = container.querySelector("input[name='score-time-signature-unit']");
        this.tempoUnitInput          = container.querySelector("select[name='score-tempo-unit']");
        this.tempoBpmInput           = container.querySelector("input[name='score-tempo-bpm']");
        this.grid                    = container.querySelector(".score-chords svg");
    }

    setController(controller) {
        this.controller = controller;

        this.editButton.addEventListener("click", (_) => {
            this.controller.toggleEditable();
        });

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
        this.titleHeading.innerHTML        = this.score.title;
        this.timeSignatureBeatsInput.value = this.score.timeSignature.beats;
        this.timeSignatureUnitInput.value  = this.score.timeSignature.unit;
        this.tempoUnitInput.value          = this.score.tempo.unit;
        this.tempoBpmInput.value           = this.score.tempo.bpm;

        const gridOutline = this.grid.querySelector("rect:first-child");
        const gridX       = gridOutline.x.baseVal.value;
        const gridY       = gridOutline.y.baseVal.value;
        const gridWidth   = gridOutline.width.baseVal.value;
        const gridHeight  = gridOutline.height.baseVal.value;
        const barWidth    = gridWidth / this.score.width;
        const barHeight   = gridHeight / this.score.height;

        while (gridOutline.nextSibling) {
            this.grid.removeChild(gridOutline.nextSibling);
        }

        // Add vertical lines.
        for (let row = 1; row < this.score.height; row ++) {
            const line = document.createElementNS(SVG_NS,"line");
            line.setAttribute("x1", gridX);
            line.setAttribute("y1", gridY + row * barHeight);
            line.setAttribute("x2", gridX + gridWidth);
            line.setAttribute("y2", gridY + row * barHeight);
            this.grid.appendChild(line);
        }

        // Add horizontal lines.
        for (let col = 1; col < this.score.width; col ++) {
            const line = document.createElementNS(SVG_NS,"line");
            line.setAttribute("x1", gridX + col * barWidth);
            line.setAttribute("y1", gridY);
            line.setAttribute("x2", gridX + col * barWidth);
            line.setAttribute("y2", gridY + gridHeight);
            this.grid.appendChild(line);
        }

        // Add chords.
        for (let row = 0; row < this.score.height; row ++) {
            for (let slotRow = 0; slotRow < 3; slotRow ++) {
                for (let col = 0; col < this.score.width; col++) {
                    for (let slotCol = 0; slotCol < 3; slotCol ++) {
                        if (slotCol === 0 && slotRow === 2 || slotCol === 2 && slotRow === 0) {
                            continue;
                        }

                        const chord = this.controller.getChordInSlot(col, row, slotCol, slotRow, true);
                        if (chord.isEmpty()) {
                            continue;
                        }

                        const chordText = chord.toText();

                        const text = document.createElementNS(SVG_NS,"text");
                        text.classList.add("chord");
                        text.innerHTML = chordText.left;

                        if (chordText.middle) {
                            const tspan = document.createElementNS(SVG_NS, "tspan");
                            tspan.classList.add("sup");
                            tspan.setAttribute("dy", "-1ex")
                            tspan.innerHTML = chordText.middle;
                            text.appendChild(tspan);
                        }

                        if (chordText.right) {
                            const tspan = document.createElementNS(SVG_NS, "tspan");
                            tspan.setAttribute("dy", "1.25ex")
                            tspan.innerHTML += chordText.right;
                            text.appendChild(tspan);
                        }

                        const loc = TEXT_LOCATION[slotRow][slotCol];
                        text.setAttribute("x", gridX + (col + loc.x) * barWidth);
                        text.setAttribute("y", gridY + (row + loc.y) * barHeight);
                        this.grid.appendChild(text);
                    }
                }
            }
        }

        // Add mouse targets.
        for (let row = 0; row < this.score.height; row ++) {
            for (let slotRow = 0; slotRow < 3; slotRow ++) {
                for (let col = 0; col < this.score.width; col++) {
                    for (let slotCol = 0; slotCol < 3; slotCol ++) {
                        const rect = document.createElementNS(SVG_NS,"rect");
                        rect.setAttribute("x", gridX + col * barWidth + slotCol * barWidth / 3);
                        rect.setAttribute("y", gridY + row * barHeight + slotRow * barHeight / 3);
                        rect.setAttribute("width", barWidth / 3);
                        rect.setAttribute("height", barHeight / 3);
                        this.grid.appendChild(rect);

                        rect.classList.add("slot");
                        if (slotCol === 0 && slotRow === 2 || slotCol === 2 && slotRow === 0) {
                            rect.classList.add("inactive");
                        }
                        else {
                            rect.addEventListener("click", (_) => {
                                this.controller.select(col, row, slotCol, slotRow);
                            });
                        }
                    }
                }
            }
        }

        this.showSelection();
    }

    showSelection() {
        const slotIndex = (this.controller.selected.row * 3 + this.controller.selected.slotRow) * this.score.width * 3 +
                          (this.controller.selected.col * 3 + this.controller.selected.slotCol);

        this.grid.querySelectorAll("rect.slot").forEach((rect, index) => {
            if (index === slotIndex) {
                rect.classList.add("selected");
            }
            else {
                rect.classList.remove("selected");
            }
        });
    }

    setEditable(editable) {
        if (editable) {
            this.container.classList.add("editable");
            this.titleHeading.setAttribute("contenteditable", true);
            this.widthInput.removeAttribute("disabled");
            this.heightInput.removeAttribute("disabled");
            this.timeSignatureBeatsInput.removeAttribute("disabled");
            this.timeSignatureUnitInput.removeAttribute("disabled");
            this.tempoUnitInput.removeAttribute("disabled");
            this.tempoBpmInput.removeAttribute("disabled");
        }
        else {
            this.container.classList.remove("editable");
            this.titleHeading.setAttribute("contenteditable", false);
            this.widthInput.removeAttribute("disabled");
            this.heightInput.setAttribute("disabled", true);
            this.timeSignatureBeatsInput.setAttribute("disabled", true);
            this.timeSignatureUnitInput.setAttribute("disabled", true);
            this.tempoUnitInput.setAttribute("disabled", true);
            this.tempoBpmInput.setAttribute("disabled", true);
        }
    }
}
