import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";
import CustomElement from "./CustomElement.js";
import GameConstants from "../GameConstants.js";

const TPL = new Template(`
<div id="keyboard"></div>
`);
const STYLE = new GlobalStyle(`
:host {
    --key-size: 50px;
    --key-space: 2px;
    margin: 0 8px 8px;
}

#keyboard {
    margin: 0 8px;
    user-select: none;
}

.row {
    display: flex;
    width: 100%;
    touch-action: manipulation;
}


.key,
.backspace,
.enter,
.spacer {
    margin: var(--key-space);
    height: var(--key-size);
    flex-shrink: 0;
}

.key,
.backspace,
.enter {
    font-family: inherit;
    font-weight: bold;
    border: 0;
    padding: 0;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    background-color: var(--key-bg);
    color: var(--key-text-color);
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.3);
    font-size: 1.5rem;
}


.enter,
.backspace {
    font-size: 3rem;
}

.spacer {
    width: calc(var(--key-size) * 0.25);
}

.key {
    width: var(--key-size);
}

.backspace {
    width: calc(var(--key-size) * 1.5);
    padding-bottom: 0.2em;
}

.enter {
    width: calc(var(--key-size) * 2.25);
}

.key:focus {
    outline: none;
}

.key.fade {
    transition: background-color 0.1s ease, color 0.1s ease;
}

.key[data-state='correct'] {
    background-color: var(--key-bg-correct);
    color: var(--key-evaluated-text-color);
}

.key[data-state='present'] {
    background-color: var(--key-bg-present);
    color: var(--key-evaluated-text-color);
}

.key[data-state='absent'] {
    background-color: var(--key-bg-absent);
    color: var(--key-evaluated-text-color);
}
`);

export default class ScreenKeyboard extends CustomElement {

    constructor(e) {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
    }

    connectedCallback() {
        window.addEventListener("keydown", (event) => {
            if (!event.repeat) {
                const key = event.key;
                if (key == "Backspace" || key == "Enter" || GameConstants.acceptedChars.includes(key)) {
                    const ev = new Event("key");
                    ev.key = key;
                    this.dispatchEvent(ev);
                }
            }
        });
        const keyboardEl = this.shadowRoot.getElementById("keyboard");
        keyboardEl.addEventListener("click", (event) => {
            const keyEl = event.target.closest("button");
            if (keyEl != null && keyboardEl.contains(keyEl)) {
                const ev = new Event("key");
                ev.key = keyEl.dataset.key;
                this.dispatchEvent(ev);
            }
        });
    }

    get layout() {
        return JSON.parse(this.getAttribute("layout"));
    }

    set layout(val) {
        this.setAttribute("layout", JSON.stringify(val));
    }

    get evaluation() {
        return JSON.parse(this.getAttribute("evaluation"));
    }

    set evaluation(val) {
        this.setAttribute("evaluation", JSON.stringify(val));
    }

    static get observedAttributes() {
        return ["layout", "evaluation"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "layout": {
                if (oldValue != newValue) {
                    const keyboardEl = this.shadowRoot.getElementById("keyboard");
                    keyboardEl.innerHTML = "";
                    const layout = JSON.parse(newValue);
                    for (const row of layout) {
                        const rowEl = document.createElement("div");
                        rowEl.classList.add("row");
                        for (const key of row) {
                            if (key >= "a" && key <= "z" || key == "←" || key == "↵") {
                                const keyEl = document.createElement("button");
                                keyEl.textContent = key;
                                if (key == "←") {
                                    keyEl.classList.add("backspace");
                                    keyEl.dataset.key = "Backspace";
                                } else if (key == "↵") {
                                    keyEl.classList.add("enter");
                                    keyEl.dataset.key = "Enter";
                                } else {
                                    keyEl.classList.add("key");
                                    keyEl.dataset.key = key;
                                }
                                rowEl.appendChild(keyEl);
                            } else {
                                const spaceEl = document.createElement("div");
                                spaceEl.classList.add("spacer");
                                rowEl.appendChild(spaceEl);
                            }
                        }
                        keyboardEl.appendChild(rowEl);
                    }
                }
                break;
            }
            case "evaluation": {
                if (oldValue != newValue) {
                    const keyboardEl = this.shadowRoot.getElementById("keyboard");
                    const evaluated = JSON.parse(newValue);
                    if (evaluated != null) {
                        for (const [letter, state] of Object.entries(evaluated)) {
                            const keyEl = keyboardEl.querySelector(`[data-key="${letter}"]`);
                            switch (state) {
                                case "a": {
                                    keyEl.dataset.state = "absent";
                                    break;
                                }
                                case "p": {
                                    keyEl.dataset.state = "present";
                                    break;
                                }
                                case "c": {
                                    keyEl.dataset.state = "correct";
                                    break;
                                }
                                default: {
                                    keyEl.dataset.state = "";
                                    break;
                                }
                            }
                            keyEl.classList.add("fade")
                        }
                    } else {
                        const keyCollection = keyboardEl.querySelectorAll(`[data-key]`);
                        for (let i = 0; i < keyCollection.length; ++i) {
                            const keyEl = keyCollection[i];
                            keyEl.dataset.state = "";
                        }
                    }
                }
                break;
            }
        }
    }

}

customElements.define("screen-keyboard", ScreenKeyboard);
