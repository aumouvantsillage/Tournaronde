
export class PaletteView {
    constructor(score, container) {
        this.score          = score;
        this.controller     = null;
        this.container      = container;

        this.rootNoteItems  = container.querySelectorAll(".palette-root-note .palette-item");
        this.rootAltItems   = container.querySelectorAll(".palette-root-alt .palette-item");
        this.qualityItems   = container.querySelectorAll(".palette-quality .palette-item");
        this.fifthItems     = container.querySelectorAll(".palette-fifth .palette-item");
        this.extensionItems = container.querySelectorAll(".palette-extension .palette-item");
        this.additionItems  = container.querySelectorAll(".palette-addition .palette-item");
        this.bassNoteItems  = container.querySelectorAll(".palette-bass-note .palette-item");
        this.bassAltItems   = container.querySelectorAll(".palette-bass-alt .palette-item");
    }

    addClickHandler(items, key) {
        items.forEach(elt => {
            elt.addEventListener("click", (_) => {
                this.controller.updateSelectedChord(key, elt.dataset.value);
            })
        });
    }

    setController(controller) {
        this.controller = controller;
        this.addClickHandler(this.rootNoteItems, "rootNote");
        this.addClickHandler(this.rootAltItems, "rootAlt");
        this.addClickHandler(this.qualityItems, "quality");
        this.addClickHandler(this.fifthItems, "fifth");
        this.addClickHandler(this.extensionItems, "extension");
        this.addClickHandler(this.additionItems, "addition");
        this.addClickHandler(this.bassNoteItems, "bassNote");
        this.addClickHandler(this.bassAltItems, "bassAlt");
    }

    updateRow(items, value) {
        items.forEach(it => {
            if (it.dataset.value === value) {
                it.classList.add("active");
            }
            else {
                it.classList.remove("active");
            }
        });
    }

    showSelection() {
        const chord = this.controller.getSelectedChord();

        this.updateRow(this.rootNoteItems, chord.rootNote[0]);
        this.updateRow(this.rootAltItems, chord.rootNote[1]);
        this.updateRow(this.qualityItems, chord.quality);
        this.updateRow(this.fifthItems, chord.fifth);
        this.updateRow(this.extensionItems, chord.extension);
        this.updateRow(this.additionItems, chord.addition);
        this.updateRow(this.bassNoteItems, chord.bassNote[0]);
        this.updateRow(this.bassAltItems, chord.bassNote[1]);
    }

    setEditable(editable) {
        if (editable) {
            this.container.classList.add("editable");
        }
        else {
            this.container.classList.remove("editable");
        }
    }
}
