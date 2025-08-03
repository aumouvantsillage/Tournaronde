
export class PaletteView {
    constructor(score, container) {
        this.score            = score;
        this.controller       = null;
        this.container        = container;

        this.repeatStartItems = container.querySelectorAll(".palette-repeat-start .palette-item");
        this.repeatEndItems   = container.querySelectorAll(".palette-repeat-end .palette-item");
        this.rootNoteItems    = container.querySelectorAll(".palette-root-note .palette-item");
        this.rootAltItems     = container.querySelectorAll(".palette-root-alt .palette-item");
        this.qualityItems     = container.querySelectorAll(".palette-quality .palette-item");
        this.fifthItems       = container.querySelectorAll(".palette-fifth .palette-item");
        this.extensionItems   = container.querySelectorAll(".palette-extension .palette-item");
        this.additionItems    = container.querySelectorAll(".palette-addition .palette-item");
        this.bassNoteItems    = container.querySelectorAll(".palette-bass-note .palette-item");
        this.bassAltItems     = container.querySelectorAll(".palette-bass-alt .palette-item");
    }

    addClickHandler(items, key, bar=false) {
        items.forEach(elt => {
            elt.addEventListener("click", (_) => {
                if (bar) {
                    this.controller.updateSelectedBar(key, elt.dataset.value);
                }
                else {
                    this.controller.updateSelectedChord(key, elt.dataset.value);
                }
            })
        });
    }

    setController(controller) {
        this.controller = controller;
        this.addClickHandler(this.repeatStartItems, "repeatStart", true);
        this.addClickHandler(this.repeatEndItems,   "repeatEnd", true);
        this.addClickHandler(this.rootNoteItems,    "rootNote");
        this.addClickHandler(this.rootAltItems,     "rootAlt");
        this.addClickHandler(this.qualityItems,     "quality");
        this.addClickHandler(this.fifthItems,       "fifth");
        this.addClickHandler(this.extensionItems,   "extension");
        this.addClickHandler(this.additionItems,    "addition");
        this.addClickHandler(this.bassNoteItems,    "bassNote");
        this.addClickHandler(this.bassAltItems,     "bassAlt");
    }

    updateGroup(items, value) {
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

        this.updateGroup(this.repeatStartItems, chord.repeatStart);
        this.updateGroup(this.repeatEndItems,   chord.repeatEnd);
        this.updateGroup(this.rootNoteItems,    chord.rootNote);
        this.updateGroup(this.rootAltItems,     chord.rootAlt);
        this.updateGroup(this.qualityItems,     chord.quality);
        this.updateGroup(this.fifthItems,       chord.fifth);
        this.updateGroup(this.extensionItems,   chord.extension);
        this.updateGroup(this.additionItems,    chord.addition);
        this.updateGroup(this.bassNoteItems,    chord.bassNote);
        this.updateGroup(this.bassAltItems,     chord.bassAlt);
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
