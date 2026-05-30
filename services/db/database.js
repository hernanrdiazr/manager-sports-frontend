// services/db/database.js - Conector y manejador de base de datos SQLite WASM + OPFS

import sqlite3Worker1Promiser from './sqlite3/sqlite3-worker1-promiser-esm.js';
import { SCHEMA_SQL } from './schema.js';
import { seedDatabase } from './seed.js';

let dbPromiser = null;
let initPromise = null;

/**
 * Inicializa la base de datos SQLite con persistencia en OPFS
 * @returns {Promise<Function>} Promesa con la función dbPromiser
 */
export async function initDb() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            console.log("⚡ [SQLite] Inicializando SQLite WASM local...");

            // Verificar aislamiento de origen cruzado requerido por OPFS/SharedArrayBuffer en navegadores
            if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
                console.warn("⚠️ [SQLite] La página no es 'crossOriginIsolated'.");
                if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
                    throw new Error("El Service Worker aún no controla la página. Por favor, recarga la aplicación para activar el almacenamiento local.");
                } else {
                    throw new Error("El aislamiento de origen cruzado (COOP/COEP) no está activo. Verifique que el Service Worker esté funcionando correctamente.");
                }
            }

            // Instanciar el promiser apuntando al worker no-module local para máxima compatibilidad.
            // Especificamos explícitamente el worker pasándole un objeto Worker.
            // Envolvemos la inicialización en un timeout de 4 segundos para evitar cuelgues permanentes.
            const promiserPromise = sqlite3Worker1Promiser({
                worker: () => {
                    const workerUrl = new URL('./sqlite3/sqlite3-worker1.js', import.meta.url);
                    return new Worker(workerUrl);
                }
            });

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Tiempo de espera agotado al conectar con el worker de SQLite. Verifique que el Service Worker esté activo y las cabeceras COOP/COEP inyectadas.")), 4000)
            );

            dbPromiser = await Promise.race([promiserPromise, timeoutPromise]);

            console.log("💾 [SQLite] Abriendo base de datos persistente en OPFS...");

            // Abrir la base de datos persistente usando OPFS
            const openResponse = await dbPromiser('open', {
                filename: 'file:manager_sports.sqlite3?vfs=opfs',
            });

            const dbId = openResponse.dbId;
            console.log("📂 [SQLite] Base de datos abierta con dbId:", dbId);

            // Habilitar claves foráneas para integridad referencial
            await dbPromiser('exec', { sql: 'PRAGMA foreign_keys = ON;' });

            // Verificar si el esquema ya existe comprobando si existe la tabla 'users'
            const checkUserTable = await dbPromiser('exec', {
                sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='users';",
                rowMode: 'object'
            });

            const tableExists = checkUserTable.result.resultRows && checkUserTable.result.resultRows.length > 0;

            if (!tableExists) {
                console.log("⚙️ [SQLite] Base de datos vacía. Creando tablas...");
                // Crear tablas
                await dbPromiser('exec', { sql: SCHEMA_SQL });

                // Poblar con datos semilla
                await seedDatabase(async (sql) => {
                    await dbPromiser('exec', { sql });
                });
            } else {
                console.log("ℹ️ [SQLite] Base de datos ya configurada. Esquema detectado.");
            }

            return dbPromiser;
        } catch (error) {
            console.error("❌ [SQLite] Error inicializando base de datos:", error);
            initPromise = null; // Re-intentar si falla
            throw error;
        }
    })();

    return initPromise;
}

/**
 * Ejecuta una sentencia SQL (puede contener múltiples comandos)
 * @param {string} sql Código SQL a ejecutar
 * @param {Array} params Parámetros de vinculación (bind)
 * @returns {Promise<Object>} Resultado de la ejecución
 */
export async function exec(sql, params = []) {
    const promiser = await initDb();
    const result = await promiser('exec', {
        sql,
        bind: params,
        countChanges: true,
        lastInsertRowId: true
    });
    return result.result;
}

/**
 * Realiza una consulta SQL y retorna todas las filas resultantes como objetos
 * @param {string} sql Consulta SELECT
 * @param {Array} params Parámetros de vinculación
 * @returns {Promise<Array<Object>>} Lista de registros
 */
export async function selectAll(sql, params = []) {
    const promiser = await initDb();
    const result = await promiser('exec', {
        sql,
        bind: params,
        rowMode: 'object'
    });
    return result.result.resultRows || [];
}

/**
 * Realiza una consulta SQL y retorna la primera fila resultante o null
 * @param {string} sql Consulta SELECT
 * @param {Array} params Parámetros de vinculación
 * @returns {Promise<Object|null>} Registro o null
 */
export async function selectOne(sql, params = []) {
    const rows = await selectAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Ejecuta un comando INSERT, UPDATE o DELETE y retorna información del cambio
 * @param {string} sql Sentencia de modificación
 * @param {Array} params Parámetros de vinculación
 * @returns {Promise<{changes: number, lastInsertRowId: number|null}>}
 */
export async function run(sql, params = []) {
    const result = await exec(sql, params);
    return {
        changes: result.changeCount || 0,
        lastInsertRowId: result.lastInsertRowId !== undefined ? Number(result.lastInsertRowId) : null
    };
}

/**
 * Ejecuta operaciones en una transacción atómica SQLite
 * @param {Function} callback Función asíncrona que ejecuta las consultas
 */
export async function transaction(callback) {
    await exec('BEGIN TRANSACTION;');
    try {
        const result = await callback();
        await exec('COMMIT;');
        return result;
    } catch (error) {
        await exec('ROLLBACK;');
        throw error;
    }
}

/**
 * Reinicia la base de datos eliminando todas las tablas.
 * @param {boolean} includeSeed Si es true, vuelve a insertar los datos de prueba. Si es false, la deja vacía.
 */
export async function resetDatabase(includeSeed = false) {
    const promiser = await initDb();
    console.warn("⚠️ [SQLite] Iniciando reinicio de la base de datos...");

    try {
        // Deshabilitar claves foráneas para poder borrar tablas en cualquier orden
        await promiser('exec', { sql: 'PRAGMA foreign_keys = OFF;' });

        // Obtener la lista de todas las tablas existentes
        const tablesResult = await promiser('exec', {
            sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
            rowMode: 'object'
        });

        const rows = tablesResult.result.resultRows || [];
        for (const row of rows) {
            // El valor puede venir como array [name] o como objeto {name} según la configuración del rowMode
            const tableName = Array.isArray(row) ? row[0] : row.name;
            if (tableName) {
                console.log(`🗑️ [SQLite] Borrando tabla: ${tableName}`);
                await promiser('exec', { sql: `DROP TABLE IF EXISTS ${tableName};` });
            }
        }

        // Re-habilitar claves foráneas
        await promiser('exec', { sql: 'PRAGMA foreign_keys = ON;' });

        // Recrear esquema vacío
        console.log("⚙️ [SQLite] Creando esquema de tablas vacío...");
        await promiser('exec', { sql: SCHEMA_SQL });

        if (includeSeed) {
            // Recargar datos semilla
            await seedDatabase(async (sql) => {
                await promiser('exec', { sql });
            });
            console.log("✅ [SQLite] Base de datos reiniciada con datos semilla.");
        } else {
            console.log("✅ [SQLite] Base de datos vaciada con éxito (solo esquema).");
        }

        // Limpiar sesión local del navegador para evitar inconsistencias
        localStorage.clear();
        console.log("🧹 [SQLite] LocalStorage limpiado.");

        // Recargar el navegador para refrescar el estado de la aplicación
        setTimeout(() => {
            window.location.reload();
        }, 1000);

        return true;
    } catch (error) {
        console.error("❌ [SQLite] Error al reiniciar la base de datos:", error);
        throw error;
    }
}

// Exponer la función globalmente para fácil acceso desde la Consola de Desarrollador (F12)
if (typeof window !== 'undefined') {
    window.resetDb = resetDatabase;
    console.log("🛠️ [SQLite] Comando global registrado. Ejecuta 'window.resetDb(true)' para restablecer con datos semilla, o 'window.resetDb(false)' para vaciarla.");
}

