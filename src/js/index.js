
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
    for (const [idx, file] of files.entries()) {
        const reader = new FileReader();
        reader.addEventListener("load", _ => {
            const id = addScore(scoreList, JSON.parse(reader.result));
            if (idx === 0) {
                firstId = id;
            }
            if (idx === files.length - 1) {
                scoreList.update();
                window.location = "editor.html#" + firstId;
            }
        });
        reader.readAsText(file);
    }
}

function moveScore(scoreList, container, offset) {
    const id = parseInt(container.dataset.id);

    const srcIdx = scoreList.content.indexOf(id);
    const destIdx = srcIdx + offset;
    if (destIdx < 0 || destIdx >= scoreList.content.length) {
        return;
    }

    scoreList.content[srcIdx]  = scoreList.content[destIdx];
    scoreList.content[destIdx] = id;
    scoreList.update();

    const parentElt = container.parentElement;
    parentElt.removeChild(container);
    parentElt.insertBefore(container, parentElt.children[destIdx]);
}

function deleteScore(scoreList, container) {
    const id = parseInt(container.dataset.id);
    const title = container.querySelector("a").innerText;

    if (!confirm(`Delete score '${title}'?`)) {
        return;
    }
    
    const idx = scoreList.content.indexOf(id);
    scoreList.content.splice(idx, 1);
    scoreList.update();

    container.parentElement.removeChild(container);
}

function onLoad() {
    const scoreList = new ScoreList();

    const openScoreButton = document.querySelector(".open-score-btn");
    const openScoreInput = document.querySelector(".open-score-file");
    const editButton = document.querySelector(".list-edit-btn");
    const container = document.querySelector(".score-list");

    openScoreButton.addEventListener("click", _ => {
        openScoreInput.click();
    });

    openScoreInput.addEventListener("change", _ => {
        loadScores(scoreList, Array.from(openScoreInput.files));
    });

    let editable = false;

    editButton.addEventListener("click", _ => {
        editable = !editable;
        if (editable) {
            editButton.classList.add("active");
            container.classList.add("editable");
        }
        else {
            editButton.classList.remove("active");
            container.classList.remove("editable");
        }
    });

    for (const id of scoreList.content) {
        const score = JSON.parse(localStorage.getItem(id));

        const div = document.createElement("div");
        div.classList.add("score-item");
        div.setAttribute("data-id", id);
        div.innerHTML = `
            <span class="score-action score-action-up">&#xe5d8;</span>
            <span class="score-action score-action-down">&#xe5db;</span>
            <span class="score-action score-action-delete">&#xe872;</span>
            <a class="score-title" href="editor.html#${id}">${score.title}</a>
        `;
        container.appendChild(div);
    }

    for (const btn of document.querySelectorAll(".score-action-up")) {
        btn.addEventListener("click", _ => moveScore(scoreList, btn.parentElement, -1));
    }

    for (const btn of document.querySelectorAll(".score-action-down")) {
        btn.addEventListener("click", _ => moveScore(scoreList, btn.parentElement, 1));
    }

    for (const btn of document.querySelectorAll(".score-action-delete")) {
        btn.addEventListener("click", _ => deleteScore(scoreList, btn.parentElement));
    }
}

window.addEventListener("load", onLoad);

