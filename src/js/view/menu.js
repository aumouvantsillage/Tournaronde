
export class EditorMenu {
    constructor(container) {
        this.controller       = null;
        this.container        = container;

        this.prevButton       = container.querySelector(".score-prev-btn");
        this.nextButton       = container.querySelector(".score-next-btn");
        this.editButton       = container.querySelector(".score-edit-btn");
        this.fullscreenButton = container.querySelector(".score-fullscreen-btn");
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

    setEditable(editable) {
        if (editable) {
            this.editButton.classList.add("active");
        }
        else {
            this.editButton.classList.remove("active");
        }
    }

    updateNavigationButtons() {
        const prevId = this.controller.getPreviousId();
        if (prevId === null) {
            this.prevButton.classList.add("disabled");
        }
        else {
            this.prevButton.href = "#" + prevId;
            this.prevButton.classList.remove("disabled");
        }

        const nextId = this.controller.getNextId();
        if (nextId === null) {
            this.nextButton.classList.add("disabled");
        }
        else {
            this.nextButton.href = "#" + nextId;
            this.nextButton.classList.remove("disabled");
        }
    }
}
