// services/db/foulsRepository.js - Repositorio para la Gestión de Faltas/Infracciones en SQLite

import { selectAll, run } from './database.js';

class FoulsRepository {
    /**
     * Registra una falta cometida por un jugador
     * @param {number} playerId
     * @param {number} eventId
     * @param {string} foulType Tipo de falta ('yellow_card', 'red_card', 'technical', 'flagrant')
     * @param {string} description Descripción de la infracción
     * @param {number} minute Minuto del encuentro
     */
    async create(playerId, eventId, foulType, description, minute) {
        await run(`
            INSERT INTO player_fouls (player_id, event_id, foul_type, description, minute)
            VALUES (?, ?, ?, ?, ?);
        `, [playerId, eventId, foulType, description || '', parseInt(minute, 10) || 0]);
    }

    /**
     * Obtiene las faltas de un jugador, opcionalmente filtradas por evento
     * @param {number} playerId
     * @param {number} eventId Opcional (si es 0 o falsy, trae todo el historial)
     * @returns {Promise<Array<Object>>} Lista de faltas
     */
    async getByPlayer(playerId, eventId = 0) {
        const targetEventId = parseInt(eventId, 10) || 0;
        return await selectAll(`
            SELECT id, player_id, event_id, foul_type, COALESCE(description, '') AS description, minute, created_at
            FROM player_fouls
            WHERE player_id = ? AND (? = 0 OR event_id = ?)
            ORDER BY event_id DESC, minute ASC;
        `, [playerId, targetEventId, targetEventId]);
    }

    /**
     * Obtiene todas las faltas registradas en un evento
     * @param {number} eventId
     * @returns {Promise<Array<Object>>} Lista de faltas del evento
     */
    async getByEvent(eventId) {
        return await selectAll(`
            SELECT id, player_id, event_id, foul_type, COALESCE(description, '') AS description, minute, created_at
            FROM player_fouls
            WHERE event_id = ?
            ORDER BY minute ASC;
        `, [eventId]);
    }
}

export const foulsRepository = new FoulsRepository();
export default foulsRepository;
