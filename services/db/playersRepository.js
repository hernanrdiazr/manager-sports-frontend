// services/db/playersRepository.js - Repositorio para la Gestión de Jugadores y sus Estadísticas en SQLite

import { selectAll, selectOne, run, transaction } from './database.js';
import { eventsRepository } from './eventsRepository.js';

class PlayersRepository {
    /**
     * Registra un jugador manualmente (usado por el administrador)
     * @param {number} teamId ID del equipo
     * @param {Object} player Payload del jugador
     * @param {string} sport Deporte (ej: 'futbol', 'beisbol')
     * @returns {Promise<number>} ID del jugador creado
     */
    async create(teamId, player, sport) {
        return await transaction(async () => {
            const jerseyNumber = player.jersey_number !== undefined ? player.jersey_number : (player.jerseyNumber || 0);
            const isStarter = player.is_starter || player.isStarter ? 1 : 0;

            // 1. Insertar el jugador
            const playerResult = await run(`
                INSERT INTO players (team_id, name, jersey_number, position, is_starter, status)
                VALUES (?, ?, ?, ?, ?, 'active')
            `, [teamId, player.name, jerseyNumber, player.position, isStarter]);

            const playerId = playerResult.lastInsertRowId;

            // 2. Obtener el event_id más reciente asociado al equipo
            const eventTeam = await selectOne(`
                SELECT event_id FROM event_teams 
                WHERE team_id = ? 
                ORDER BY event_id DESC 
                LIMIT 1
            `, [teamId]);

            if (!eventTeam) {
                throw new Error("No se pudo obtener el event_id del equipo");
            }
            const eventId = eventTeam.event_id;

            // 3. Guardar las estadísticas iniciales del jugador para este evento
            // Reutilizamos el método de inserción del eventsRepository
            await eventsRepository._insertPlayerStats(sport, eventId, playerId, player);

            // 4. Registrar asistencia por defecto (present)
            await run(`
                INSERT INTO player_attendance (player_id, event_id, status)
                VALUES (?, ?, 'present')
            `, [playerId, eventId]);

            return playerId;
        });
    }

    /**
     * Obtiene los jugadores de un equipo
     * @param {number} teamId
     * @returns {Promise<Array<Object>>}
     */
    async getByTeam(teamId) {
        return await selectAll(`
            SELECT id, team_id, name, jersey_number AS number, position, is_starter, status, created_at
            FROM players
            WHERE team_id = ?
            ORDER BY jersey_number ASC
        `, [teamId]);
    }

    /**
     * Obtiene todos los jugadores que participan en un evento (de ambos equipos)
     * @param {number} eventId
     * @returns {Promise<Array<Object>>}
     */
    async getByEvent(eventId) {
        return await selectAll(`
            SELECT p.id, p.team_id, p.name, p.jersey_number AS number, p.position, p.is_starter, p.status, p.created_at
            FROM players p
            JOIN event_teams et ON et.team_id = p.team_id
            WHERE et.event_id = ?
            ORDER BY et.team_id, p.jersey_number ASC
        `, [eventId]);
    }

    /**
     * Actualiza el status de un jugador ('active', 'injured', 'suspended')
     * @param {number} playerId
     * @param {string} status
     */
    async updateStatus(playerId, status) {
        await run("UPDATE players SET status = ? WHERE id = ?;", [status, playerId]);
    }

    /**
     * Actualiza las estadísticas de un jugador en un evento, según su deporte
     * @param {number} playerId
     * @param {number} eventId
     * @param {string} sport
     * @param {Object} stats
     */
    async updateStats(playerId, eventId, sport, stats) {
        const sportLower = sport.toLowerCase();

        if (sportLower === 'futbol') {
            await run(`
                UPDATE soccer_player_stats SET
                    minutes_played = ?, goals = ?, assists = ?, shots = ?,
                    shots_on_target = ?, passes = ?, pass_accuracy = ?,
                    fouls_committed = ?, fouls_drawn = ?, yellow_cards = ?,
                    red_cards = ?, offside = ?, saves = ?, goals_conceded = ?
                WHERE player_id = ? AND event_id = ?
            `, [
                stats.minutes_played || stats.minutesPlayed || 0, stats.goals || 0, stats.assists || 0, stats.shots || 0,
                stats.shots_on_target || stats.shotsOnTarget || 0, stats.passes || 0, stats.pass_accuracy || stats.passAccuracy || 0,
                stats.fouls_committed || stats.fouls || 0, stats.fouls_drawn || stats.foulsDrawn || 0, stats.yellow_cards || stats.yellowCards || 0,
                stats.red_cards || stats.redCards || 0, stats.offside || 0, stats.saves || 0, stats.goals_conceded || stats.goalsConceded || 0,
                playerId, eventId
            ]);
        } else if (sportLower === 'beisbol') {
            await run(`
                UPDATE baseball_player_stats SET
                    role = ?, at_bats = ?, hits = ?, doubles = ?, triples = ?,
                    home_runs = ?, rbi = ?, runs = ?, walks = ?, strikeouts = ?,
                    stolen_bases = ?, innings_pitched = ?, earned_runs = ?,
                    strikeouts_pitched = ?, walks_pitched = ?, hits_allowed = ?
                WHERE player_id = ? AND event_id = ?
            `, [
                stats.role || 'batter', stats.at_bats || stats.atBats || 0, stats.hits || 0, stats.doubles || 0, stats.triples || 0,
                stats.home_runs || stats.homeRuns || 0, stats.rbi || 0, stats.runs || 0, stats.walks || 0, stats.strikeouts || 0,
                stats.stolen_bases || stats.stolenBases || 0, stats.innings_pitched || stats.inningsPitched || 0, stats.earned_runs || stats.earnedRuns || 0,
                stats.strikeouts_pitched || stats.strikeoutsPitched || 0, stats.walks_pitched || stats.walksPitched || 0, stats.hits_allowed || stats.hitsAllowed || 0,
                playerId, eventId
            ]);
        } else if (sportLower === 'basquetbol') {
            await run(`
                UPDATE basketball_player_stats SET
                    minutes_played = ?, points = ?, rebounds = ?, off_rebounds = ?,
                    def_rebounds = ?, assists = ?, steals = ?, blocks = ?,
                    turnovers = ?, fouls = ?, fg_made = ?, fg_attempted = ?,
                    three_made = ?, three_attempted = ?, ft_made = ?, ft_attempted = ?
                WHERE player_id = ? AND event_id = ?
            `, [
                stats.minutes_played || stats.minutesPlayed || 0, stats.points || 0, stats.rebounds || 0, stats.off_rebounds || stats.offRebounds || 0,
                stats.def_rebounds || stats.defRebounds || 0, stats.assists || 0, stats.steals || 0, stats.blocks || 0,
                stats.turnovers || 0, stats.fouls || 0, stats.fg_made || stats.fieldGoalsMade || 0, stats.fg_attempted || stats.fieldGoalsAtt || 0,
                stats.three_made || stats.threesMade || 0, stats.three_attempted || stats.threesAtt || 0, stats.ft_made || stats.freeThrowsMade || 0, stats.ft_attempted || stats.freeThrowsAtt || 0,
                playerId, eventId
            ]);
        } else {
            // "otro" deporte
            const extraDataStr = typeof stats.extra_data === 'object' ? JSON.stringify(stats.extra_data) : (stats.extra_data || '{}');
            await run(`
                UPDATE generic_player_stats SET
                    score = ?, score_unit = ?, rank = ?, penalties = ?, extra_data = ?
                WHERE player_id = ? AND event_id = ?
            `, [
                stats.score || 0, stats.score_unit || stats.scoreUnit || 'points', stats.rank || 0, stats.penalties || 0, extraDataStr,
                playerId, eventId
            ]);
        }
    }

    /**
     * Obtiene las estadísticas de un jugador en un evento específico según su deporte
     * @param {number} playerId
     * @param {number} eventId
     * @param {string} sport
     * @returns {Promise<Object|null>} Estadísticas
     */
    async getStats(playerId, eventId, sport) {
        const sportLower = sport.toLowerCase();
        let sql;
        if (sportLower === 'futbol') {
            sql = "SELECT * FROM soccer_player_stats WHERE player_id = ? AND event_id = ?;";
        } else if (sportLower === 'beisbol') {
            sql = "SELECT * FROM baseball_player_stats WHERE player_id = ? AND event_id = ?;";
        } else if (sportLower === 'basquetbol') {
            sql = "SELECT * FROM basketball_player_stats WHERE player_id = ? AND event_id = ?;";
        } else {
            sql = "SELECT * FROM generic_player_stats WHERE player_id = ? AND event_id = ?;";
        }
        const stats = await selectOne(sql, [playerId, eventId]);
        if (stats && (sportLower !== 'futbol' && sportLower !== 'beisbol' && sportLower !== 'basquetbol')) {
            // Deserializar extra_data
            try {
                stats.extra_data = stats.extra_data ? JSON.parse(stats.extra_data) : {};
            } catch (e) {
                stats.extra_data = {};
            }
        }
        return stats;
    }
}

export const playersRepository = new PlayersRepository();
export default playersRepository;
