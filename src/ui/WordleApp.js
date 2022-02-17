import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";
import FileLoader from "../util/FileLoader.js";
import CustomElement from "./CustomElement.js";
import GameConstants from "../GameConstants.js";
import Toast from "./overlay/message/Toast.js";
import Path from "../util/Path.js";
import "./ScreenKeyboard.js";
import "./FieldRow.js";
import "./overlay/window/WindowLayer.js";
import "./overlay/message/MessageLayer.js";
import Dialog from "./overlay/window/Dialog.js";

const path = new Path(import.meta.url);

const TPL = new Template(`
<div id="game">
    <header>
        <div class="title">
            WORDLE
        </div>
    </header>
    <div id="board-container">
        <div id="board">
            <field-row length="5"></field-row>
            <field-row length="5"></field-row>
            <field-row length="5"></field-row>
            <field-row length="5"></field-row>
            <field-row length="5"></field-row>
            <field-row length="5"></field-row>
        </div>
    </div>
    <screen-keyboard id="keyboard"></screen-keyboard>
    <emc-messagelayer name="main"></emc-messagelayer>
    <emc-windowlayer name="main"></emc-windowlayer>
    <div id="screen-toaster"></div>
</div>
`);
const STYLE = new GlobalStyle(`
#game {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    margin: auto;
}

header {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: var(--header-height);
    color: var(--color-tone-1);
    border-bottom: 1px solid var(--color-tone-4);
}

header .title {
    font-weight: 700;
    font-size: 17px;
    letter-spacing: 0.2rem;
    text-transform: uppercase;
    text-align: center;
}

#board-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 2;
    overflow: hidden;
}

#board {
    display: grid;
    grid-template-rows: repeat(6, 1fr);
    grid-gap: 5px;
    padding: 10px;
    box-sizing: border-box;
}

emc-messagelayer {
    position: absolute;
}
`);

async function loadConfig(lang) {
    const [
        keyboard,
        words,
        translations
    ] = await Promise.all([
        FileLoader.json(path.getAbsolute(`../config/${lang}/keyboard.json`)),
        FileLoader.json(path.getAbsolute(`../config/${lang}/words.json`)),
        FileLoader.json(path.getAbsolute(`../config/${lang}/translations.json`))
    ]);
    return {
        keyboard,
        words,
        translations
    }
}

const MAX_ROWS = 6;
const MAX_TILES = 5;

export default class WordleApp extends CustomElement {

    #config;

    #tileIndex = 0;

    #rowIndex = 0;

    #solution;

    #boardState = [];

    #evaluations = [];

    #canInput = true;

    #gameStatus = GameConstants.statusInProgress;

    #letterEvaluations = {};

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        // ---
        const keyboardEl = this.shadowRoot.getElementById("keyboard");
        keyboardEl.addEventListener("key", (event) => {
            const key = event.key;
            if (key == "←" || key == "Backspace") {
                this.removeLetter();
            } else if (key == "↵" || key == "Enter") {
                this.submitGuess();
            } else {
                const lcKey = key.toLowerCase();
                if (GameConstants.acceptedChars.includes(lcKey)) {
                    this.addLetter(lcKey);
                }
            }
        });
    }

    connectedCallback() {
        this.#newGame();
    }

    #isWordValid(word) {
        return this.#config.words.solution.includes(word) || this.#config.words.possible.includes(word);
    }

    addLetter(key) {
        if (this.#gameStatus == GameConstants.statusInProgress && this.#canInput && this.#rowIndex <= 6 && this.#tileIndex <= MAX_TILES) {
            const boardEl = this.shadowRoot.getElementById("board");
            const rowCollection = boardEl.children;
            const rowEl = rowCollection[this.#rowIndex];
            this.#boardState[this.#rowIndex] = (this.#boardState[this.#rowIndex] ?? "") + key;
            rowEl.letters = this.#boardState[this.#rowIndex];
            this.#tileIndex++;
        }
    }

    removeLetter() {
        if (this.#gameStatus == GameConstants.statusInProgress && this.#canInput && this.#tileIndex > 0) {
            const boardEl = this.shadowRoot.getElementById("board");
            const rowCollection = boardEl.children;
            const rowEl = rowCollection[this.#rowIndex];
            this.#boardState[this.#rowIndex] = (this.#boardState[this.#rowIndex] ?? "").slice(0, -1);
            rowEl.letters = this.#boardState[this.#rowIndex];
            this.#tileIndex--;
        }
    }

    submitGuess() {
        if (this.#gameStatus === GameConstants.statusInProgress && this.#canInput) {
            const keyboardEl = this.shadowRoot.getElementById("keyboard");
            const boardEl = this.shadowRoot.getElementById("board");
            const rowCollection = boardEl.children;
            const rowEl = rowCollection[this.#rowIndex];
            let guess = this.#boardState[this.#rowIndex];
            if (this.#tileIndex != MAX_TILES) {
                rowEl.setAttribute("invalid", "");
                Toast.error(this.#config.translations["missing_letters"]);
            } else if (!this.#isWordValid(guess)) {
                rowEl.setAttribute("invalid", "");
                Toast.error(this.#config.translations["not_in_list"]);
            } else {
                const res = (new Array(MAX_TILES)).fill("a"); // absent
                const solution = this.#solution.split("");
                guess = guess.split("");
                for (let i = 0; i < MAX_TILES; ++i) {
                    const letter = guess[i];
                    if (solution[i] == letter) {
                        res[i] = "c"; // correct
                        solution[i] = "";
                        guess[i] = "";
                        this.#letterEvaluations[letter] = "c";
                    }
                }
                for (let i = 0; i < MAX_TILES; ++i) {
                    const letter = guess[i];
                    if (letter) {
                        const j = solution.indexOf(letter);
                        if (j >= 0) {
                            res[i] = "p"; // present
                            solution[j] = "";
                            guess[i] = "";
                            if (!this.#letterEvaluations[letter]) {
                                this.#letterEvaluations[letter] = "p";
                            }
                        }
                    }
                }
                for (let i = 0; i < MAX_TILES; ++i) {
                    const letter = guess[i];
                    if (letter && !this.#letterEvaluations[letter]) {
                        this.#letterEvaluations[letter] = "a";
                    }
                }
                this.#evaluations[this.#rowIndex] = res;
                const evaluated = res.join("");
                rowEl.evaluation = evaluated;
                keyboardEl.evaluation = this.#letterEvaluations;
                if (evaluated == "ccccc") {
                    rowEl.win = "";
                    this.#canInput = false;
                    this.#gameStatus = GameConstants.statusWin;
                    setTimeout(async () => {
                        await Dialog.alert(
                            this.#config.translations["win_game_title"],
                            this.#config.translations["win_game_message"] + this.#solution.toUpperCase()
                        );
                        this.#newGame();
                    }, 2000);
                } else {
                    this.#rowIndex++;
                    this.#tileIndex = 0;
                    if (this.#rowIndex >= MAX_ROWS) {
                        setTimeout(async () => {
                            await Dialog.alert(
                                this.#config.translations["lose_game_title"],
                                this.#config.translations["lose_game_message"] + this.#solution.toUpperCase()
                            );
                            this.#newGame();
                        }, 0);
                    }
                }
            }
        }
    }

    #newGame() {
        const solutions = this.#config?.words.solution ?? [];
        const choice = parseInt(Math.random() * solutions.length);
        const keyboardEl = this.shadowRoot.getElementById("keyboard");
        const boardEl = this.shadowRoot.getElementById("board");
        const rowCollection = boardEl.children;
        // reset elements
        keyboardEl.removeAttribute("evaluation");
        for (let i = 0; i < rowCollection.length; ++i) {
            const rowEl = rowCollection[i];
            rowEl.removeAttribute("evaluation");
            rowEl.removeAttribute("letters");
            rowEl.removeAttribute("win");
        }
        // reset values
        this.#canInput = true;
        this.#gameStatus = GameConstants.statusInProgress;
        this.#rowIndex = 0;
        this.#tileIndex = 0;
        this.#letterEvaluations = {};
        this.#boardState = [];
        this.#evaluations = [];
        // new word
        this.#solution = solutions[choice] ?? "";
        // console.log("solution: ", this.#solution);
    }

    get lang() {
        return this.getAttribute("lang");
    }

    set lang(val) {
        this.setAttribute("lang", val);
    }

    static get observedAttributes() {
        return ["lang"];
    }

    async attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "lang": {
                if (oldValue != newValue) {
                    this.#config = await loadConfig(newValue);
                    const keyboardEl = this.shadowRoot.getElementById("keyboard");
                    keyboardEl.layout = this.#config.keyboard;
                    this.#newGame();
                }
                break;
            }
        }
    }

}

customElements.define("wordle-app", WordleApp);
