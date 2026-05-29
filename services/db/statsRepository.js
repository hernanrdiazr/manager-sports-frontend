// services/db/statsRepository.js - Repositorio para Estadísticas Generales en SQLite

import { selectAll } from './database.js';

class StatsRepository {
    /**
     * Calcula la cantidad de victorias de cada equipo en un rango de fechas y para un deporte determinado
     * @param {string} startDate Fecha inicial (YYYY-MM-DD)
     * @param {string} endDate Fecha final (YYYY-MM-DD)
     * @param {string} sport Deporte (ej: 'futbol', 'beisbol', 'basquetbol')
     * @returns {Promise<Array<Object>>} Lista de estadísticas por equipo (id, name, wins)
     */
    async getStatsByTeam(startDate, endDate, sport) {
        const query = `
            SELECT results.win_team_id AS id, teams.name, sum(1) AS wins 
            FROM (
                SELECT 
                    a.id, 
                    a.sport, 
                    a.event_date, 
                    b.home_team_id, 
                    b.away_team_id, 
                    b.home_score, 
                    b.away_score,
                    CASE 
                        WHEN b.away_score > b.home_score THEN b.away_team_id
                        WHEN b.away_score < b.home_score THEN b.home_team_id
                        ELSE NULL 
                    END AS win_team_id
                FROM events as a
                INNER JOIN match_results as b ON a.id = b.event_id
                INNER JOIN teams as c ON b.home_team_id = c.id
                INNER JOIN teams as d ON b.away_team_id = d.id
                WHERE a.event_date >= ? AND a.event_date <= ? AND a.sport = ?
            ) as results
            INNER JOIN teams ON results.win_team_id = teams.id
            WHERE win_team_id IS NOT NULL
            GROUP BY win_team_id, teams.name
            ORDER BY wins DESC;
        `;

        return await selectAll(query, [startDate, endDate, sport]);
    }
}

export const statsRepository = new StatsRepository();
export default statsRepository;
