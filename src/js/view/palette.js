
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
    }

    showSelection() {
        const chord = this.controller.getSelectedChord();

        if (chord === null) {
            this.rootNoteInput.value  = "none";
            this.rootAltInput.value   = "natural";
            this.qualityInput.value   = "major";
            this.fifthInput.value     = "natural";
            this.extensionInput.value = "none";
            this.additionInput.value  = "none";
            this.bassNoteInput.value  = "none";
            this.bassAltInput.value   = "natural";
            return;
        }

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
