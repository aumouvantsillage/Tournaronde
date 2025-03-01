
import {ScoreList} from "./score-list.js";

function addScore(scoreList, obj) {
    obj.id = scoreList.makeId();
    obj.saveDate = new Date();
    localStorage.setItem(obj.id, JSON.stringify(obj));
    scoreList.add(obj.id);
    return obj.id;
}

function loadScores(scoreList, files) {
    let firstId;
    for (const [i, file] of files.entries()) {
        const reader = new FileReader();
        reader.addEventListener("load", _ => {
            const id = addScore(scoreList, JSON.parse(reader.result));
            if (i === 0) {
                firstId = id;
            }
            if (i === files.length - 1) {
                scoreList.update();
                window.location = "editor.html#" + firstId;
            }
        });
        reader.readAsText(file);
    }
}

function onLoad() {
    const scoreList = new ScoreList();

    const openScoreButton = document.querySelector(".open-score-btn");
    const openScoreInput = document.querySelector(".open-score-file");

    openScoreButton.addEventListener("click", _ => {
        openScoreInput.click();
    });

    openScoreInput.addEventListener("change", _ => {
        loadScores(scoreList, Array.from(openScoreInput.files));
    });

    const container = document.querySelector(".score-list");

    for (const id of scoreList.content) {
        const score = JSON.parse(localStorage.getItem(id));

        const item = document.createElement("div");
        item.innerHTML = `<a class="score-title" href="editor.html#${id}">${score.title}</a>`;
        container.appendChild(item);

        // TODO Add reorder, delete options
    }
}

window.addEventListener("load", onLoad);

