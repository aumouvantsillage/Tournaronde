
export class ScoreList {
    constructor() {
        const item = localStorage.getItem("index");
        this.content = item ? JSON.parse(item) : [];
        this.lastId = this.content.reduce((acc, id) => Math.max(acc, id), 0);
    }

    makeId() {
        this.lastId ++;
        return this.lastId;
    }

    add(id) {
        if (this.content.includes(id)) {
            return;
        }
        this.content.push(id);
    }

    update() {
        localStorage.setItem("index", JSON.stringify(this.content));
    }
}

