
const SVG_NS = "http://www.w3.org/2000/svg";

const DIAGONALS = [
    [
        {primary: true, topLeft: false},
        {primary: true, topLeft: true},
        null
    ],
    [
        {primary: true, topLeft: true},
        {primary: false, topLeft: false, bottomRight: false},
        {primary: true, bottomRight: true}
    ],
    [
        null,
        {primary: true, bottomRight: true},
        {primary: true, bottomRight: false}
    ]
];

const CHORD_SCALING_FACTOR = 0.85;
const CHORD_TRANSLATION_SCALING_FACTOR = (2 - CHORD_SCALING_FACTOR) / 2;
const CHORD_EXPONENT_SIZE = 0.75;

const TEMPO_UNIT_TO_HTML = ["&#119133;", "&#119134;", "&#119135;", "&#119136;", "&#119137;" ]

function addSVGElement(parent, eltType, attrs, content=null) {
    const elt = document.createElementNS(SVG_NS, eltType);
    for (const [key, val] of Object.entries(attrs)) {
        elt.setAttribute(key, val);   
    }
    if (content !== null) {
        elt.innerHTML = content;
    }
    parent.appendChild(elt);
    return elt;
}

// Based on https://stackoverflow.com/a/77729969
function getTextSize(text) {
    const textStyle = window.getComputedStyle(text);
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.font = `${textStyle.fontSize} ${textStyle.fontFamily}`;
    const metrics = ctx.measureText(text.textContent);
    return {
        width: metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
    };
}

export class ScoreView {
    constructor(score, container) {
        this.score                   = score;
        this.controller              = null;
        this.container               = container;

        this.editButton              = container.querySelector(".score-edit-btn");
        this.widthInput              = container.querySelector(".score-width");
        this.heightInput             = container.querySelector(".score-height");
        this.titleHeading            = container.querySelector(".score-title");
        this.timeSignatureBeatsInput = container.querySelector(".score-time-beats");
        this.timeSignatureUnitInput  = container.querySelector(".score-time-unit");
        this.tempoUnitInput          = container.querySelector(".score-tempo-unit");
        this.tempoBpmInput           = container.querySelector(".score-tempo-bpm");
        this.grid                    = container.querySelector(".score-chords svg");

        this.titleEdit               = false;
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

        this.titleHeading.addEventListener("input", (_) => {
            this.titleEdit = true;
        });

        this.titleHeading.addEventListener("focusout", (_) => {
            this.titleEdit = false;
            this.controller.setTitle(this.titleHeading.innerText);
        });

        this.timeSignatureBeatsInput.addEventListener("change", (_) => {
            this.controller.setTimeSignatureBeats(parseInt(this.timeSignatureBeatsInput.value));

        });

        this.timeSignatureUnitInput.addEventListener("change", (_) => {
            this.controller.setTimeSignatureUnit(parseInt(this.timeSignatureUnitInput.value));

        });

        this.tempoUnitInput.addEventListener("click", (_) => {
            if (this.controller.editable) {
                this.controller.setNextTempoUnit();
            }
        });

        this.tempoBpmInput.addEventListener("change", (_) => {
            this.controller.setTempoBpm(parseInt(this.tempoBpmInput.value));

        });
    }

    redrawScoreProperties() {
        this.widthInput.value              = this.score.width;
        this.heightInput.value             = this.score.height;
        this.titleHeading.innerHTML        = this.score.title;
        this.timeSignatureBeatsInput.value = this.score.timeSignature.beats;
        this.timeSignatureUnitInput.value  = this.score.timeSignature.unit;
        this.tempoUnitInput.innerHTML      = TEMPO_UNIT_TO_HTML[this.score.tempo.unit];
        this.tempoBpmInput.value           = this.score.tempo.bpm;
    }

    redraw() {
        const gridOutline = this.grid.querySelector(".outline");
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
            addSVGElement(this.grid, "line", {
                x1: gridX,
                y1: gridY + row * barHeight,
                x2: gridX + gridWidth,
                y2: gridY + row * barHeight
            });
        }

        // Add horizontal lines.
        for (let col = 1; col < this.score.width; col ++) {
            addSVGElement(this.grid, "line", {
                x1: gridX + col * barWidth,
                y1: gridY,
                x2: gridX + col * barWidth,
                y2: gridY + gridHeight
            });
        }

        const xText = addSVGElement(this.grid, "text", {}, "x");
        const xSize = getTextSize(xText);

        // Add chords.
        for (let row = 0; row < this.score.height; row ++) {
            const cellY = gridY + row * barHeight;

            for (let col = 0; col < this.score.width; col++) {
                const cellX = gridX + col * barWidth;

                let diagonals = {};

                for (let slotRow = 0; slotRow < 3; slotRow ++) {
                    const slotColMin = slotRow === 2 ? 1 : 0;
                    const slotColMax = slotRow === 0 ? 1 : 2;

                    for (let slotCol = slotColMin; slotCol <= slotColMax; slotCol ++) {
                        const chord = this.controller.getChordInSlot(col, row, slotCol, slotRow, true);
                        if (chord.isEmpty()) {
                            continue;
                        }

                        diagonals = {...diagonals, ...DIAGONALS[slotRow][slotCol]};

                        const chordText = chord.toText();

                        const text = addSVGElement(this.grid, "text", {class: "chord", x: 0, y: 0});
                        const tspan = addSVGElement(text, "tspan", {}, chordText.left);
                        let textSize = getTextSize(tspan);

                        if (chordText.middle) {
                            const tspan = addSVGElement(text, "tspan", {class: "sup", dy: "-1ex"}, chordText.middle);
                            const tspanSize = getTextSize(tspan);
                            textSize.width += tspanSize.width * CHORD_EXPONENT_SIZE;
                            textSize.height = Math.max(textSize.height, tspanSize.height * CHORD_EXPONENT_SIZE + xSize.height);
                        }

                        if (chordText.right) {
                            const dy = chordText.middle ? "1.5ex" : "0.5ex";
                            const tspan = addSVGElement(text, "tspan", {dy}, chordText.right);
                            const tspanSize = getTextSize(tspan);
                            textSize.width += tspanSize.width;
                            textSize.height += xSize.height;
                        }

                        let tx = cellX;
                        let ty = cellY;
                        if (chordText.right) {
                            ty -= xSize.height / 2;
                        }
                        let scaling;
                        if (slotCol === slotRow) {
                            if (slotCol === 1) {
                                scaling = Math.min(
                                    barWidth / textSize.width,
                                    barHeight / textSize.height
                                );
                                tx += barWidth / 2;
                                ty += barHeight / 2;
                            }
                            else {
                                scaling = 1 / (textSize.width / barWidth + textSize.height / barHeight);
                                if (slotCol === 0) {
                                    tx += textSize.width  * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                    ty += textSize.height * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                }
                                else {
                                    tx += barWidth  - textSize.width  * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                    ty += barHeight - textSize.height * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                }
                            }
                        }
                        else {
                            if (slotCol === 1) {
                                scaling = 1 / (textSize.width / barWidth + textSize.height / barHeight * 2);
                                tx += barWidth / 2;
                                if (slotRow === 0) {
                                    ty += textSize.height * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                }
                                else {
                                    ty += barHeight - textSize.height * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                }
                            }
                            if (slotRow === 1) {
                                scaling = 1 / (textSize.width / barWidth * 2 + textSize.height / barHeight);
                                ty += barHeight / 2;
                                if (slotCol === 0) {
                                    tx += textSize.width * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                }
                                else {
                                    tx += barWidth - textSize.width * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                }
                            }
                        }

                        text.setAttribute("transform", `translate(${tx}, ${ty}) scale(${scaling * CHORD_SCALING_FACTOR})`);

                        const rectDebug = addSVGElement(this.grid, "rect", {
                            class: "debug",
                            x: -textSize.width / 2,
                            y: -textSize.height / 2,
                            width: textSize.width,
                            height: textSize.height
                        });
                        if (chordText.right) {
                            ty += xSize.height / 2;
                        }
                        rectDebug.setAttribute("transform", `translate(${tx}, ${ty}) scale(${scaling * CHORD_SCALING_FACTOR})`);
                    }
                }

                if (diagonals.primary) {
                    addSVGElement(this.grid, "line", {
                        class: "diagonal",
                        x1: cellX,
                        y1: cellY + barHeight,
                        x2: cellX + barWidth,
                        y2: cellY
                    });
                }

                if (diagonals.topLeft) {
                    addSVGElement(this.grid, "line", {
                        class: "diagonal",
                        x1: cellX,
                        y1: cellY,
                        x2: cellX + barWidth / 2,
                        y2: cellY + barHeight / 2
                    });
                }

                if (diagonals.bottomRight) {
                    addSVGElement(this.grid, "line", {
                        class: "diagonal",
                        x1: cellX + barWidth,
                        y1: cellY + barHeight,
                        x2: cellX + barWidth / 2,
                        y2: cellY + barHeight / 2
                    });
                }
            }
        }

        // Add mouse targets.
        for (let row = 0; row < this.score.height; row ++) {
            for (let slotRow = 0; slotRow < 3; slotRow ++) {
                for (let col = 0; col < this.score.width; col++) {
                    for (let slotCol = 0; slotCol < 3; slotCol ++) {
                        const circ = addSVGElement(this.grid, "circle", {
                            class: "slot",
                            cx: gridX + col * barWidth + slotCol * barWidth / 3 + barWidth / 6,
                            cy: gridY + row * barHeight + slotRow * barHeight / 3 + barWidth / 6,
                            r: barWidth / 6
                        });

                        if (slotCol === 0 && slotRow === 2 || slotCol === 2 && slotRow === 0) {
                            circ.classList.add("inactive");
                        }
                        else {
                            circ.addEventListener("click", (_) => {
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

        this.grid.querySelectorAll(".slot").forEach((slot, index) => {
            if (index === slotIndex) {
                slot.classList.add("selected");
            }
            else {
                slot.classList.remove("selected");
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
            this.tempoBpmInput.removeAttribute("disabled");
        }
        else {
            this.container.classList.remove("editable");
            this.titleHeading.setAttribute("contenteditable", false);
            this.widthInput.removeAttribute("disabled");
            this.heightInput.setAttribute("disabled", true);
            this.timeSignatureBeatsInput.setAttribute("disabled", true);
            this.timeSignatureUnitInput.setAttribute("disabled", true);
            this.tempoBpmInput.setAttribute("disabled", true);
        }
    }
}
