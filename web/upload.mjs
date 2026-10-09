export const MAX_PHOTOS = 8;
export const MAX_BYTES = 20 * 1024 * 1024;
const EXTENSIONS = /\.(png|jpe?g|webp|bmp)$/i;

export function validatePhotos(files) {
    if (!files.length) throw new Error("Choose at least one photo.");
    if (files.length > MAX_PHOTOS) throw new Error("Choose up to 8 photos of the same character.");
    for (const file of files) {
        if (!EXTENSIONS.test(file.name)) throw new Error("Use PNG, JPG, WebP or BMP photos. ZIPs and videos are not supported.");
        if (!file.size) throw new Error(`${file.name} is empty.`);
        if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 20 MB.`);
    }
}

export async function uploadPhotos(files, {fetchApi, folder, signal, onProgress = () => {}}) {
    validatePhotos(files);
    for (let i = 0; i < files.length; i++) {
        onProgress(i, files.length);
        const extension = files[i].name.match(EXTENSIONS)[1].toLowerCase();
        const name = `${String(i + 1).padStart(2, "0")}.${extension}`;
        const body = new FormData();
        body.append("image", files[i], name);
        body.append("subfolder", folder);
        body.append("type", "input");
        const response = await fetchApi("/upload/image", {method: "POST", body, signal});
        if (!response.ok) throw new Error(`Photo ${i + 1} failed to upload (HTTP ${response.status}). Try again.`);
        const saved = await response.json();
        if (saved.type !== "input" || saved.subfolder !== folder || saved.name !== name) {
            throw new Error("The server returned an unexpected upload location. The previous dataset was kept.");
        }
    }
    onProgress(files.length, files.length);
    return folder;
}
