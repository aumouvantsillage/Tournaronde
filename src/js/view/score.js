
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

const GRID_MARGIN = 1;
const ROW_GAP = 10;
const COLUMN_GAP = 0;
const REPEAT_SIGN_WIDTH = 4;
const REPEAT_SIGN_DOT_SPACING = 4 * REPEAT_SIGN_WIDTH;
const REPEAT_SIGN_TOTAL_WIDTH = 5 * REPEAT_SIGN_WIDTH;

const CHORD_SCALING_FACTOR = 0.85;
const CHORD_TRANSLATION_SCALING_FACTOR = (2 - CHORD_SCALING_FACTOR) / 2;
const CHORD_EXPONENT_SIZE = 1;//0.75;

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

        this.widthInput              = container.querySelector(".score-width");
        this.heightInput             = container.querySelector(".score-height");
        this.titleInput              = container.querySelector(".score-title");
        this.timeSignatureBeatsInput = container.querySelector(".score-time-beats");
        this.timeSignatureUnitInput  = container.querySelector(".score-time-unit");
        this.tempoUnitInput          = container.querySelector(".score-tempo-unit");
        this.tempoBpmInput           = container.querySelector(".score-tempo-bpm");
        this.grid                    = container.querySelector(".score-chords");
    }

    setController(controller) {
        this.controller = controller;

        this.widthInput.addEventListener("change", _ => {
            this.controller.setScoreWidth(parseInt(this.widthInput.value));
        });

        this.heightInput.addEventListener("change", _ => {
            this.controller.setScoreHeight(parseInt(this.heightInput.value));
        });

        this.titleInput.addEventListener("change", _ => {
            this.controller.setTitle(this.titleInput.value);
        });

        this.timeSignatureBeatsInput.addEventListener("change", _ => {
            this.controller.setTimeSignatureBeats(parseInt(this.timeSignatureBeatsInput.value));

        });

        this.timeSignatureUnitInput.addEventListener("change", _ => {
            this.controller.setTimeSignatureUnit(parseInt(this.timeSignatureUnitInput.value));

        });

        this.tempoUnitInput.addEventListener("click", _ => {
            if (this.controller.editable) {
                this.controller.setNextTempoUnit();
            }
        });

        this.tempoBpmInput.addEventListener("change", _ => {
            this.controller.setTempoBpm(parseInt(this.tempoBpmInput.value));
        });
    }

    redrawScoreProperties() {
        this.widthInput.value              = this.score.width;
        this.heightInput.value             = this.score.height;
        this.titleInput.value              = this.score.title;
        this.timeSignatureBeatsInput.value = this.score.timeSignature.beats;
        this.timeSignatureUnitInput.value  = this.score.timeSignature.unit;
        this.tempoUnitInput.innerHTML      = TEMPO_UNIT_TO_HTML[this.score.tempo.unit];
        this.tempoBpmInput.value           = this.score.tempo.bpm;
    }

    redraw() {
        const gridX      = this.grid.x.baseVal.value + GRID_MARGIN;
        const gridY      = this.grid.y.baseVal.value + GRID_MARGIN;
        const gridWidth  = this.grid.width.baseVal.value - 2 * GRID_MARGIN;
        const gridHeight = this.grid.height.baseVal.value - 2 * GRID_MARGIN;
        const barWidth   = Math.floor((gridWidth - (this.score.width - 1) * COLUMN_GAP) / this.score.width);
        const barHeight  = Math.floor((gridHeight - (this.score.height - 1) * ROW_GAP) / this.score.height);

        while (this.grid.firstChild) {
            this.grid.removeChild(this.grid.firstChild);
        }

        const xText = addSVGElement(this.grid, "text", {}, "x");
        const xSize = getTextSize(xText);

        // Add chords.
        for (let row = 0; row < this.score.height; row ++) {
            const cellY = gridY + row * (barHeight + ROW_GAP);

            for (let col = 0; col < this.score.width; col++) {
                const cellX = gridX + col * (barWidth + COLUMN_GAP);

                const chords = this.score.getChordsInBar(col, row);
                const hasRepeatStart = chords.some(c => !c.isEmpty() && c.repeatStart === "true");
                const hasRepeatEnd = chords.some(c => !c.isEmpty() && c.repeatEnd === "true");
                let usableLeftWidth = barWidth / 2;
                let usableRightWidth = barWidth / 2;
                if (hasRepeatStart) {
                    usableLeftWidth -= REPEAT_SIGN_TOTAL_WIDTH;
                }
                if (hasRepeatEnd) {
                    usableRightWidth -= REPEAT_SIGN_TOTAL_WIDTH;
                }
                const usableBarWidth = usableLeftWidth + usableRightWidth;

                let diagonals = {};

                for (let slotRow = 0; slotRow < 3; slotRow ++) {
                    const slotColMin = slotRow === 2 ? 1 : 0;
                    const slotColMax = slotRow === 0 ? 1 : 2;

                    for (let slotCol = slotColMin; slotCol <= slotColMax; slotCol ++) {
                        const chord = this.controller.getChordInSlot(col, row, slotCol, slotRow);
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
                                    usableBarWidth / textSize.width,
                                    barHeight / textSize.height
                                );
                                tx += barWidth / 2;
                                if (hasRepeatStart) {
                                    tx += REPEAT_SIGN_TOTAL_WIDTH;
                                }
                                if (hasRepeatEnd) {
                                    tx -= REPEAT_SIGN_TOTAL_WIDTH;
                                }
                                ty += barHeight / 2;
                            }
                            else {
                                scaling = 1 / (textSize.width / usableBarWidth + textSize.height / barHeight);
                                if (slotCol === 0) {
                                    tx += textSize.width  * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                    if (hasRepeatStart) {
                                        tx += REPEAT_SIGN_TOTAL_WIDTH;
                                    }
                                    ty += textSize.height * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                }
                                else {
                                    tx += barWidth  - textSize.width  * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                    if (hasRepeatEnd) {
                                        tx -= REPEAT_SIGN_TOTAL_WIDTH;
                                    }
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
                            else if (slotRow === 1) {
                                ty += barHeight / 2;
                                if (slotCol === 0) {
                                    scaling = 1 / (textSize.width / usableLeftWidth + textSize.height / barHeight);
                                    tx += textSize.width * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                    if (hasRepeatStart) {
                                        tx += REPEAT_SIGN_TOTAL_WIDTH;
                                    }
                                }
                                else {
                                    scaling = 1 / (textSize.width / usableRightWidth + textSize.height / barHeight);
                                    tx += barWidth - textSize.width * scaling * CHORD_TRANSLATION_SCALING_FACTOR;
                                    if (hasRepeatEnd) {
                                        tx -= REPEAT_SIGN_TOTAL_WIDTH;
                                    }
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

                // Add the current cell's diagonal lines.
                const addDiagonal = (dx1, dy1, dx2, dy2) => {
                    addSVGElement(this.grid, "line", {
                        class: "diagonal",
                        x1: cellX + dx1,
                        y1: cellY + dy1,
                        x2: cellX + dx2,
                        y2: cellY + dy2
                    });
                };

                if (diagonals.primary) {
                    addDiagonal(0, barHeight, barWidth, 0);
                }

                if (diagonals.topLeft) {
                    addDiagonal(0, 0, barWidth / 2, barHeight / 2);
                }

                if (diagonals.bottomRight) {
                    addDiagonal(barWidth, barHeight, barWidth / 2, barHeight / 2);
                }

                // Add the current cell's repeat signs.
                const addRepeatSign = start => {
                    let borderX = start ? cellX : cellX + barWidth;
                    const step = start ? REPEAT_SIGN_WIDTH : -REPEAT_SIGN_WIDTH;
                    const repeatSign = addSVGElement(this.grid, "g", {class: "repeat-sign"});
                    addSVGElement(repeatSign, "rect", {
                        x:      borderX + (start ? 0 : 2 * step),
                        y:      cellY,
                        width:  REPEAT_SIGN_WIDTH * 2,
                        height: barHeight
                    });
                    addSVGElement(repeatSign, "rect", {
                        x:      borderX + (start ? 0 : step),
                        y:      cellY,
                        width:  REPEAT_SIGN_WIDTH,
                        height: barHeight
                    });
                    addSVGElement(this.grid, "circle", {
                        class: "repeat-sign",
                        cx:    borderX + 4 * step,
                        cy:    cellY + (barHeight - REPEAT_SIGN_DOT_SPACING) / 2,
                        r:     REPEAT_SIGN_WIDTH
                    });
                    addSVGElement(this.grid, "circle", {
                        class: "repeat-sign",
                        cx:    borderX + 4 * step,
                        cy:    cellY + (barHeight + REPEAT_SIGN_DOT_SPACING) / 2,
                        r:     REPEAT_SIGN_WIDTH
                    });
                };

                if (hasRepeatStart) {
                    addRepeatSign(true);
                }
                if (hasRepeatEnd) {
                    addRepeatSign(false);
                }

                // Add the current cell's outline.
                addSVGElement(this.grid, "rect", {
                    x:      cellX,
                    y:      cellY,
                    width:  barWidth,
                    height: barHeight
                });
            }
        }

        // Add mouse targets.
        for (let row = 0; row < this.score.height; row ++) {
            const cellY = gridY + row * (barHeight + ROW_GAP);

            for (let slotRow = 0; slotRow < 3; slotRow ++) {
                for (let col = 0; col < this.score.width; col++) {
                    const cellX = gridX + col * (barWidth + COLUMN_GAP);

                    for (let slotCol = 0; slotCol < 3; slotCol ++) {
                        let elt;
                        if (slotCol == 1 && slotRow == 1) {
                            elt = addSVGElement(this.grid, "ellipse", {
                                class: "slot",
                                cx: cellX + barWidth / 2,
                                cy: cellY + barHeight / 2,
                                rx: barWidth / 6,
                                ry: barHeight / 6
                            });
                        }
                        else {
                            const x0 = cellX + slotCol * barWidth  / 2;
                            const y0 = cellY + slotRow * barHeight / 2;
                            let dx1, dy1, dx2, dy2, rx, ry;
                            if (slotCol == 1) {
                                rx = barWidth  / 6;
                                ry = barHeight / 3;
                                dx1 = (slotRow - 1) * rx;
                                dy1 = 0;
                                dx2 = -2 * dx1;
                                dy2 = 0;
                            }
                            else if (slotRow == 1) {
                                rx = barWidth  / 3;
                                ry = barHeight / 6;
                                dx1 = 0;
                                dy1 = (1 - slotCol) * ry;
                                dx2 = 0;
                                dy2 = -2 * dy1;
                            }
                            else {
                                rx = barWidth  / 3;
                                ry = barHeight / 3;
                                dx1 = 0;
                                dy1 = (1 - slotRow) * ry;
                                dx2 = (1 - slotCol) * rx;
                                dy2 = -dy1;
                            }

                            elt = addSVGElement(this.grid, "path", {
                                class: "slot",
                                d: `M ${x0} ${y0} l ${dx1} ${dy1} a ${rx} ${ry} 0 0 0 ${dx2} ${dy2} Z`
                            });
                        }

                        if (slotCol === 0 && slotRow === 2 || slotCol === 2 && slotRow === 0) {
                            elt.classList.add("inactive");
                        }
                        else {
                            elt.addEventListener("click", _ => {
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
            this.titleInput.removeAttribute("disabled");
            this.widthInput.removeAttribute("disabled");
            this.heightInput.removeAttribute("disabled");
            this.timeSignatureBeatsInput.removeAttribute("disabled");
            this.timeSignatureUnitInput.removeAttribute("disabled");
            this.tempoBpmInput.removeAttribute("disabled");
        }
        else {
            this.container.classList.remove("editable");
            this.titleInput.setAttribute("disabled", true);
            this.widthInput.setAttribute("disabled", true);
            this.heightInput.setAttribute("disabled", true);
            this.timeSignatureBeatsInput.setAttribute("disabled", true);
            this.timeSignatureUnitInput.setAttribute("disabled", true);
            this.tempoBpmInput.setAttribute("disabled", true);
        }
    }
}
