
function onLoad() {
    const container = document.querySelector(".score-list");
    for (const [id, json] of Object.entries(localStorage)) {
        const item = document.createElement("div");
        const score = JSON.parse(json);
        item.innerHTML = `<a href="editor.html#${id}">${score.title}</a>`;
        container.appendChild(item);
    }
}

window.addEventListener("load", onLoad);

