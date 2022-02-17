import Template from "../util/Template.js";
import GlobalStyle from "../util/GlobalStyle.js";
import CustomElement from "./CustomElement.js";

const TPL = new Template(`
<div id="tile" data-state="empty" data-animation="idle"></div>
`);
const STYLE = new GlobalStyle(`
:host {
    --key-size: 50px;
    display: inline-block;
}

#tile {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: var(--key-size);
    height: var(--key-size);
    font-size: 2rem;
    line-height: 2rem;
    font-weight: bold;
    vertical-align: middle;
    box-sizing: border-box;
    color: var(--tile-text-color);
    text-transform: uppercase;
    user-select: none;
}

#tile::before {
    content: '';
    display: inline-block;
    padding-bottom: 100%;
}

#tile[data-state='empty'] {
    border: 2px solid var(--color-tone-4);
}

#tile[data-state='tbd'] {
    background-color: var(--color-tone-7);
    border: 2px solid var(--color-tone-3);
    color: var(--color-tone-1);
}

#tile[data-state='correct'] {
    background-color: var(--color-correct);
}

#tile[data-state='present'] {
    background-color: var(--color-present);
}

#tile[data-state='absent'] {
    background-color: var(--color-absent);
}

#tile[data-animation='pop'] {
    animation-name: PopIn;
    animation-duration: 100ms;
}

@keyframes PopIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }

    40% {
        transform: scale(1.1);
        opacity: 1;
    }
}

#tile[data-animation='flip-in'] {
    animation-name: FlipIn;
    animation-duration: 250ms;
    animation-timing-function: ease-in;
}

@keyframes FlipIn {
    0% {
        transform: rotateX(0);
    }

    100% {
        transform: rotateX(-90deg);
    }
}

#tile[data-animation='flip-out'] {
    animation-name: FlipOut;
    animation-duration: 250ms;
    animation-timing-function: ease-in;
}

@keyframes FlipOut {
    0% {
        transform: rotateX(-90deg);
    }

    100% {
        transform: rotateX(0);
    }
}
`);

export default class FieldTile extends CustomElement {

    constructor(e) {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
    }

    get letter() {
        return this.getAttribute("letter");
    }

    set letter(val) {
        this.setAttribute("letter", val);
    }

    get evaluation() {
        return this.getAttribute("evaluation");
    }

    set evaluation(val) {
        this.setAttribute("evaluation", val);
    }

    static get observedAttributes() {
        return ["letter", "evaluation"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "letter": {
                if (oldValue != newValue) {
                    const tileEl = this.shadowRoot.getElementById("tile");
                    if (newValue) {
                        if (!this.evaluation) {
                            tileEl.dataset.state = "tbd";
                        }
                        tileEl.textContent = newValue;
                    } else {
                        tileEl.dataset.state = "empty";
                        tileEl.textContent = "";
                    }
                }
                break;
            }
            case "evaluation": {
                if (oldValue != newValue) {
                    const tileEl = this.shadowRoot.getElementById("tile");
                    if (this.letter) {
                        switch (newValue) {
                            case "a": {
                                tileEl.dataset.state = "absent";
                                break;
                            }
                            case "p": {
                                tileEl.dataset.state = "present";
                                break;
                            }
                            case "c": {
                                tileEl.dataset.state = "correct";
                                break;
                            }
                            default: {
                                tileEl.dataset.state = "";
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
    }

}

customElements.define("field-tile", FieldTile);

