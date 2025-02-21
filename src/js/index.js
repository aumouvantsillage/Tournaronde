
function onLoad() {
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

