
export class EditorMenu {
    constructor(container) {
        this.controller       = null;
        this.container        = container;

        this.fullscreenButton = container.querySelector(".score-fullscreen-btn");
        this.editButton       = container.querySelector(".score-edit-btn");
        this.saveButton       = container.querySelector(".score-save-btn");
    
        this.fullscreen       = false;

        this.fullscreenButton.addEventListener("click", _ => {
            this.toggleFullscreen();
        });

        this.saveButton.addEventListener("click", _ => {
            this.controller.saveAsFile();
        });
    }

    setController(controller) {
        this.controller = controller;

        this.editButton.addEventListener("click", _ => {
            this.controller.toggleEditable();
            if (this.controller.editable) {
                this.editButton.classList.add("active");
            }
            else {
                this.editButton.classList.remove("active");
            }
        });
    }

    toggleFullscreen() {
        if (this.fullscreen) {
            document.exitFullscreen().then(_ => {
                this.fullscreen = false;
                this.fullscreenButton.classList.remove("active");
            });
        }
        else {
            document.querySelector("html").requestFullscreen().then(_ => {
                this.fullscreen = true;
                this.fullscreenButton.classList.add("active");
            });
        }
    }
}
