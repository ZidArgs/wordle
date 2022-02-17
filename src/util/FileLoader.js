async function getFile(file, contentType) {
    const r = await fetch(new Request(file, {
        method: "GET",
        headers: new Headers({
            "Content-Type": contentType,
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        }),
        mode: "cors",
        cache: "default"
    }));
    if (r.status < 200 || r.status >= 300) {
        throw new Error(`error loading file "${file}" - status: ${r.status}`);
    }
    return r;
}

function getText(input) {
    return input.text();
}

function getJSON(input) {
    return input.json();
}

class FileLoader {

    text(file) {
        return getFile(file, "text/plain").then(getText);
    }

    json(file) {
        return getFile(file, "application/json").then(getJSON);
    }

}

export default new FileLoader;
