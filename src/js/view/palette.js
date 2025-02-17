
export class PaletteView {
    constructor(score, container) {
        this.score          = score;
        this.controller     = null;
        this.container      = container;

        this.rootNoteInput  = container.querySelector("select[name = 'palette-root-note']");
        this.rootAltInput   = container.querySelector("select[name = 'palette-root-alt']");
        this.qualityInput   = container.querySelector("select[name = 'palette-quality']");
        this.fifthInput     = container.querySelector("select[name = 'palette-fifth']");
        this.extensionInput = container.querySelector("select[name = 'palette-extension']");
        this.additionInput  = container.querySelector("select[name = 'palette-addition']");
        this.bassNoteInput  = container.querySelector("select[name = 'palette-bass-note']");
        this.bassAltInput   = container.querySelector("select[name = 'palette-bass-alt']");
    }

    setController(controller) {
        this.controller = controller;

        const updateSelectedChord = (_) => this.controller.updateSelectedChord(
            this.rootNoteInput.value,
            this.rootAltInput.value,
            this.qualityInput.value,
            this.fifthInput.value,
            this.extensionInput.value,
            this.additionInput.value,
            this.bassNoteInput.value,
            this.bassAltInput.value
        );

        this.rootNoteInput.addEventListener("change", updateSelectedChord);
        this.rootAltInput.addEventListener("change", updateSelectedChord);
        this.qualityInput.addEventListener("change", updateSelectedChord);
        this.fifthInput.addEventListener("change", updateSelectedChord);
        this.extensionInput.addEventListener("change", updateSelectedChord);
        this.additionInput.addEventListener("change", updateSelectedChord);
        this.bassNoteInput.addEventListener("change", updateSelectedChord);
        this.bassAltInput.addEventListener("change", updateSelectedChord);
    }

    showSelection() {
        const chord = this.controller.getSelectedChord();
        this.rootNoteInput.value  = chord.rootNote[0];
        this.rootAltInput.value   = chord.rootNote[1];
        this.qualityInput.value   = chord.quality;
        this.fifthInput.value     = chord.fifth;
        this.extensionInput.value = chord.extension;
        this.additionInput.value  = chord.addition;
        this.bassNoteInput.value  = chord.bassNote[0];
        this.bassAltInput.value   = chord.bassNote[1];
    }
}
