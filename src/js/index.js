
function openScore(obj) {
    obj.id = obj.saveDate = Date.now();
    localStorage.setItem(obj.id, JSON.stringify(obj));
    window.location = "editor.html#" + obj.id;
}

function onLoad() {
    const openScoreButton = document.querySelector(".open-score-btn");
    const openScoreInput = document.querySelector(".open-score-file");

    openScoreButton.addEventListener("click", _ => {
        openScoreInput.click();
    });

    openScoreInput.addEventListener("change", _ => {
        if (openScoreInput.files.length < 1) {
            return;
        }
        const reader = new FileReader();
        reader.addEventListener("load", _ => {
            openScore(JSON.parse(reader.result));
        });
        reader.readAsText(openScoreInput.files[0]);
    });

    const container = document.querySelector(".score-list");

    for (const [id, json] of Object.entries(localStorage)) {
        const item = document.createElement("div");
        const score = JSON.parse(json);
        item.innerHTML = `<a class="score-title" href="editor.html#${id}">${score.title}</a>`;
        container.appendChild(item);

        // TODO Add reorder, delete options
    }
}

window.addEventListener("load", onLoad);

