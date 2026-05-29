// services/db/attendanceRepository.js - Repositorio para la Asistencia de Jugadores en SQLite

import { selectAll, run } from './database.js';

class AttendanceRepository {
    /**
     * Registra o actualiza la asistencia de un jugador en un evento
     * @param {number} playerId
     * @param {number} eventId
     * @param {string} status ('present', 'absent', 'late', 'excused')
     * @param {string} note Nota opcional
     */
    async upsert(playerId, eventId, status, note) {
        await run(`
            INSERT INTO player_attendance (player_id, event_id, status, note)
            VALUES (?, ?, ?, ?)
            ON CONFLICT (player_id, event_id)
            DO UPDATE SET status = excluded.status, note = excluded.note;
        `, [playerId, eventId, status, note || '']);
    }

    /**
     * Obtiene los registros de asistencia de todos los jugadores para un evento
     * @param {number} eventId
     * @returns {Promise<Array<Object>>} Lista de asistencias
     */
    async getByEvent(eventId) {
        return await selectAll(`
            SELECT id, player_id, event_id, status, COALESCE(note, '') AS note, created_at
            FROM player_attendance
            WHERE event_id = ?
            ORDER BY player_id ASC;
        `, [eventId]);
    }

    /**
     * Obtiene el historial de asistencia de un jugador específico
     * @param {number} playerId
     * @returns {Promise<Array<Object>>} Historial de asistencias
     */
    async getByPlayer(playerId) {
        return await selectAll(`
            SELECT id, player_id, event_id, status, COALESCE(note, '') AS note, created_at
            FROM player_attendance
            WHERE player_id = ?
            ORDER BY created_at DESC;
        `, [playerId]);
    }
}

export const attendanceRepository = new AttendanceRepository();
export default attendanceRepository;
