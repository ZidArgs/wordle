import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";
import CustomElement from "./CustomElement.js";
import "./FieldTile.js";

const TPL = new Template(`
<div id="row"></div>
`);
const STYLE = new GlobalStyle(`
:host {
    display: block;
}

:host([invalid]) {
    animation-name: Shake;
    animation-duration: 600ms;
}

#row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 5px;
}

.win {
    animation-name: Bounce;
    animation-duration: 1000ms;
}

@keyframes Bounce {
    0%, 20% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-30px);
    }

    50% {
        transform: translateY(5px);
    }

    60% {
        transform: translateY(-15px);
    }

    80% {
        transform: translateY(2px);
    }

    100% {
        transform: translateY(0);
    }
}

@keyframes Shake {

    10%,
    90% {
        transform: translateX(-1px);
    }

    20%,
    80% {
        transform: translateX(2px);
    }

    30%,
    50%,
    70% {
        transform: translateX(-4px);
    }

    40%,
    60% {
        transform: translateX(4px);
    }
}
`);

export default class FieldRow extends CustomElement {

    constructor(e) {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        this.addEventListener("animationend", (event) => {
            if (event.animationName == "Shake") {
                this.removeAttribute("invalid");
            }
        });
    }

    get letters() {
        return this.getAttribute("letters");
    }

    set letters(val) {
        this.setAttribute("letters", val);
    }

    get length() {
        return this.getAttribute("length");
    }

    set length(val) {
        this.setAttribute("length", val);
    }

    get invalid() {
        return this.getAttribute("invalid");
    }

    set invalid(val) {
        this.setAttribute("invalid", val);
    }

    get win() {
        return this.getAttribute("win");
    }

    set win(val) {
        this.setAttribute("win", val);
    }

    get evaluation() {
        return this.getAttribute("evaluation");
    }

    set evaluation(val) {
        this.setAttribute("evaluation", val);
    }

    static get observedAttributes() {
        return ["length", "letters", "win", "evaluation"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "length": {
                if (oldValue != newValue) {
                    const length = parseInt(newValue) || 5;
                    const rowEl = this.shadowRoot.getElementById("row");
                    rowEl.innerHTML = "";
                    for (let i = 0; i < length; ++i) {
                        const tileEl = document.createElement("field-tile");
                        rowEl.append(tileEl);
                    }
                }
                break;
            }
            case "letters": {
                if (oldValue != newValue) {
                    const rowEl = this.shadowRoot.getElementById("row");
                    const tileCollection = rowEl.children;
                    for (let i = 0; i < tileCollection.length; ++i) {
                        const tileEl = tileCollection[i];
                        const letter = newValue?.[i];
                        if (letter != null) {
                            tileEl.letter = letter;
                        } else {
                            tileEl.letter = "";
                        }
                    }
                }
                break;
            }
            case "win": {
                if (oldValue != newValue) {
                    const rowEl = this.shadowRoot.getElementById("row");
                    const tileCollection = rowEl.children;
                    for (let i = 0; i < tileCollection.length; ++i) {
                        const tileEl = tileCollection[i];
                        if (newValue != null) {
                            tileEl.classList.add("win");
                            tileEl.style.animationDelay = `${100 * i}ms`;
                        } else {
                            tileEl.classList.remove("win");
                        }
                    }
                }
                break;
            }
            case "evaluation": {
                if (oldValue != newValue) {
                    const rowEl = this.shadowRoot.getElementById("row");
                    const tileCollection = rowEl.children;
                    for (let i = 0; i < tileCollection.length; ++i) {
                        const tileEl = tileCollection[i];
                        if (newValue) {
                            tileEl.evaluation = newValue[i];
                        } else {
                            tileEl.evaluation = "";
                        }
                    }
                }
                break;
            }
        }
    }

}

customElements.define("field-row", FieldRow);
