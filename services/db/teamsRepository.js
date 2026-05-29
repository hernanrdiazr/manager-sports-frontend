// services/db/teamsRepository.js - Repositorio para Equipos en SQLite

import { selectAll } from './database.js';

class TeamsRepository {
    /**
     * Obtiene todos los equipos filtrados opcionalmente por deporte
     * @param {string} sport Deporte a filtrar (ej: 'futbol', 'beisbol')
     * @returns {Promise<Array<Object>>} Lista de equipos
     */
    async getTeams(sport) {
        let sql;
        let params = [];

        if (sport) {
            sql = `
                SELECT DISTINCT id, name, sport, created_at 
                FROM teams 
                WHERE LOWER(sport) = LOWER(?) 
                ORDER BY name ASC;
            `;
            params.push(sport.trim());
        } else {
            sql = `
                SELECT DISTINCT id, name, sport, created_at 
                FROM teams 
                ORDER BY name ASC;
            `;
        }

        return await selectAll(sql, params);
    }
}

export const teamsRepository = new TeamsRepository();
export default teamsRepository;
