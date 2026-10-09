import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { validatePhotos, uploadPhotos } from "./upload.mjs";

function checkImage(file) {
    const url = URL.createObjectURL(file);
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => { URL.revokeObjectURL(url); resolve(); };
        image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`${file.name} cannot be read as an image.`)); };
        image.src = url;
    });
}

function addUpload(node) {
    const folder = node.widgets?.find(w => w.name === "folder");
    if (!folder || node._refmodPilotUpload) return;
    node._refmodPilotUpload = true;
    folder.label = "Photo folder (automatic after upload)";
    const root = document.createElement("div");
    root.style.cssText = "box-sizing:border-box;padding:12px;border:2px dashed #63b9de;border-radius:8px;background:#15364b;color:#fff;font:13px sans-serif;text-align:center;overflow:auto;";
    root.setAttribute("aria-label", "RefMod photo upload");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Upload photos";
    button.style.cssText = "padding:8px 14px;border:0;border-radius:5px;background:#267dab;color:white;cursor:pointer;font:600 14px sans-serif";
    const hint = document.createElement("div");
    hint.textContent = "or drop 1–8 photos here · PNG / JPG / WebP / BMP";
    hint.style.marginTop = "8px";
    const status = document.createElement("div");
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.cssText = "margin-top:8px;overflow-wrap:anywhere";
    const picker = document.createElement("input");
    picker.type = "file";
    picker.accept = ".png,.jpg,.jpeg,.webp,.bmp";
    picker.multiple = true;
    picker.hidden = true;
    root.append(button, hint, status, picker);
    let controller;
    let removed = false;
    const setFolder = value => {
        folder.value = value;
        folder.callback?.(value);
        node.graph?.setDirtyCanvas?.(true, true);
    };
    async function select(files) {
        if (controller || removed || !files.length) return;
        const previous = folder.value;
        controller = new AbortController();
        button.disabled = true;
        try {
            validatePhotos(files);
            status.textContent = "Checking photos…";
            // Fail validation if Run is pressed while a new dataset is incomplete.
            setFolder("SET_PHOTOS_UPLOAD_IN_PROGRESS");
            for (const file of files) await checkImage(file);
            if (removed) return;
            const destination = `refmod-pilot/${crypto.randomUUID()}`;
            await uploadPhotos(files, {
                fetchApi: api.fetchApi.bind(api), folder: destination,
                signal: controller.signal,
                onProgress: (done, total) => { status.textContent = `Uploading ${done} / ${total} photos…`; },
            });
            if (removed) return;
            setFolder(destination);
            const count = node.widgets.find(w => w.name === "max_items");
            if (count) { count.value = files.length; count.callback?.(files.length); }
            status.textContent = `${files.length} photos ready. Set the RefMod name, then Run.`;
        } catch (error) {
            if (!removed) {
                setFolder(previous);
                status.textContent = `Upload not applied: ${error.message} Your previous folder is unchanged.`;
            }
        } finally {
            controller = undefined;
            button.disabled = false;
            picker.value = "";
        }
    }
    button.addEventListener("click", () => picker.click());
    picker.addEventListener("change", () => void select([...picker.files]));
    for (const name of ["dragenter", "dragover"]) root.addEventListener(name, event => {
        event.preventDefault(); event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    });
    root.addEventListener("drop", event => {
        event.preventDefault(); event.stopPropagation();
        void select([...event.dataTransfer.files]);
    });
    const widget = node.addDOMWidget("refmod_pilot_upload", "refmod_pilot_upload", root, {serialize: false});
    widget.computeSize = width => [width, 140];
    widget.options.getMinHeight = () => 140;
    widget.options.getMaxHeight = () => 140;
    const removedHook = node.onRemoved;
    node.onRemoved = function (...args) {
        removed = true;
        controller?.abort();
        root.remove();
        return removedHook?.apply(this, args);
    };
    node.setSize([Math.max(node.size[0], 420), Math.max(node.size[1], node.computeSize()[1])]);
}

app.registerExtension({
    name: "RefModPilot.PhotoUpload",
    beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "MiniMaxH3RefModFolderLoader") return;
        const created = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function (...args) {
            const result = created?.apply(this, args);
            addUpload(this);
            return result;
        };
    },
});
