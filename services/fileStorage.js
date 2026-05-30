const IDB_NAME = 'sports-manager';
const IDB_STORE = 'handles';
const HANDLE_KEY = 'db';

function openIdb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function idbGet(key) {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
        const req = idb.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(key);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
    });
}

async function idbSet(key, value) {
    const idb = await openIdb();
    return new Promise((resolve, reject) => {
        const req = idb.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function readHandle(handle) {
    const file = await handle.getFile();
    if (file.size === 0) return null;
    const buffer = await file.arrayBuffer();
    return new Uint8Array(buffer);
}

// Chequea si hay un handle guardado. Retorna { handle, filename, hasPermission } o null.
export async function checkStoredHandle() {
    const handle = await idbGet(HANDLE_KEY);
    if (!handle) return null;
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    return { handle, filename: handle.name, hasPermission: perm === 'granted' };
}

// Requiere gesto del usuario (click)
export async function requestPermissionAndRead(handle) {
    const perm = await handle.requestPermission({ mode: 'readwrite' });
    if (perm !== 'granted') throw new Error('Permiso denegado para acceder al archivo');
    return await readHandle(handle);
}

// Requiere gesto del usuario (click)
export async function pickExistingFile() {
    const [handle] = await window.showOpenFilePicker({
        types: [{ description: 'SQLite Database', accept: { 'application/octet-stream': ['.db', '.sqlite', '.dat'] } }],
        multiple: false
    });
    await idbSet(HANDLE_KEY, handle);
    return { handle, data: await readHandle(handle) };
}

// Requiere gesto del usuario (click)
export async function createNewFile() {
    const handle = await window.showSaveFilePicker({
        suggestedName: 'sports-manager.db',
        types: [{ description: 'SQLite Database', accept: { 'application/octet-stream': ['.db'] } }]
    });
    await idbSet(HANDLE_KEY, handle);
    return { handle, data: null };
}

export async function saveToFile(db) {
    const handle = await idbGet(HANDLE_KEY);
    if (!handle) return;
    const data = db.export();
    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
}
