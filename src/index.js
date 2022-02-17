import "./ui/WordleApp.js";

function hashChange() {
    const lang = location.hash.slice(1);
    if (!lang) {
        location.hash = "#en";
    } else {
        document.getElementById("app").setAttribute("lang", lang);
    }
}

window.addEventListener("hashchange", hashChange, false);

hashChange();
