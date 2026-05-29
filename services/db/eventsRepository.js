// services/db/eventsRepository.js - Repositorio para la Gestión de Eventos Deportivos en SQLite

import { selectAll, selectOne, run, transaction, exec } from './database.js';

class EventsRepository {
    /**
     * Obtiene todos los eventos de la base de datos, marcando automáticamente como finalizados
     * aquellos cuya fecha ya pasó.
     * @returns {Promise<Array<Object>>} Lista de eventos
     */
    async getAll() {
        // Marcar automáticamente como 'finalizado' si la fecha del evento ya pasó
        await exec(`
            UPDATE events SET status = 'finalizado'
            WHERE date(event_date) < date('now', 'localtime') AND status != 'finalizado'
        `);

        return await selectAll(`
            SELECT id, name, sport, event_date, start_time, end_time,
                   location, lat, lon, total_tickets, available_tickets, ticket_price, status, created_at
            FROM events
            ORDER BY start_time ASC
        `);
    }

    /**
     * Obtiene solo los eventos activos futuros
     * @returns {Promise<Array<Object>>} Lista de eventos activos
     */
    async getActive() {
        // Actualizar estados antes de consultar
        await exec(`
            UPDATE events SET status = 'finalizado'
            WHERE date(event_date) < date('now', 'localtime') AND status != 'finalizado'
        `);

        return await selectAll(`
            SELECT id, name, sport, event_date, start_time, end_time,
                   location, lat, lon, total_tickets, available_tickets, ticket_price, status, created_at
            FROM events
            WHERE status != 'finalizado' AND date(event_date) >= date('now', 'localtime')
            ORDER BY event_date ASC
        `);
    }

    /**
     * Busca un evento por su ID
     * @param {number} id ID del evento
     * @returns {Promise<Object|null>} Evento o null
     */
    async getById(id) {
        return await selectOne(`
            SELECT id, name, sport, event_date, start_time, end_time,
                   location, lat, lon, total_tickets, available_tickets, ticket_price, status, created_at
            FROM events WHERE id = ?
        `, [id]);
    }

    /**
     * Actualiza el estado de un evento y cancela sus reservas en cascada si es necesario
     * @param {number} id ID del evento
     * @param {string} status Nuevo estado ('activo', 'pausado', 'finalizado', 'cancelado')
     */
    async updateStatus(id, status) {
        return await transaction(async () => {
            // 1. Actualizar el estado del evento
            await run("UPDATE events SET status = ? WHERE id = ?;", [status, id]);

            // 2. Si el evento se cancela, cancelar automáticamente todas las reservas asociadas
            if (status === "cancelado") {
                await run(`
                    UPDATE reservations SET status = 'cancelada'
                    WHERE event_id = ? AND status != 'cancelada'
                `, [id]);
            }
        });
    }

    /**
     * Elimina un evento (alias para marcar como cancelado)
     * @param {number} id ID del evento
     */
    async softDelete(id) {
        return await this.updateStatus(id, "cancelado");
    }

    /**
     * Inserta estadísticas de equipo basadas en el deporte
     */
    async _insertTeamStats(sport, eventId, teamId, teamPayload) {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol') {
            const s = teamPayload.soccer_stats || teamPayload.soccerStats || {};
            await run(`
                INSERT INTO soccer_team_stats
                    (team_id, event_id, possession, total_shots, shots_on_target, corners, fouls, yellow_cards, red_cards, offsides)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                teamId, eventId, s.possession || 0, s.total_shots || s.totalShots || 0,
                s.shots_on_target || s.shotsOnTarget || 0, s.corners || 0, s.fouls || 0,
                s.yellow_cards || s.yellowCards || 0, s.red_cards || s.redCards || 0, s.offsides || 0
            ]);
        } else if (sportLower === 'beisbol') {
            const s = teamPayload.baseball_stats || teamPayload.baseballStats || {};
            await run(`
                INSERT INTO baseball_team_stats (team_id, event_id, runs, hits, errors, left_on_base)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                teamId, eventId, s.runs || 0, s.hits || 0, s.errors || 0, s.left_on_base || s.leftOnBase || 0
            ]);
        } else if (sportLower === 'basquetbol') {
            const s = teamPayload.basketball_stats || teamPayload.basketballStats || {};
            await run(`
                INSERT INTO basketball_team_stats
                    (team_id, event_id, points, rebounds, assists, turnovers, fouls, fg_pct, three_pct)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                teamId, eventId, s.points || 0, s.rebounds || 0, s.assists || 0,
                s.turnovers || 0, s.fouls || 0, s.fg_pct || s.fieldGoalPct || 0, s.three_pct || s.threePointPct || 0
            ]);
        }
    }

    /**
     * Inserta estadísticas de jugador basadas en el deporte
     */
    async _insertPlayerStats(sport, eventId, playerId, playerPayload) {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol') {
            const s = playerPayload.soccer_stats || playerPayload.soccerStats || {};
            await run(`
                INSERT INTO soccer_player_stats
                    (player_id, event_id, minutes_played, goals, assists, shots, shots_on_target,
                     passes, pass_accuracy, fouls_committed, fouls_drawn, yellow_cards, red_cards,
                     offside, saves, goals_conceded)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                playerId, eventId, s.minutes_played || s.minutesPlayed || 0, s.goals || 0, s.assists || 0,
                s.shots || 0, s.shots_on_target || s.shotsOnTarget || 0, s.passes || 0, s.pass_accuracy || s.passAccuracy || 0,
                s.fouls_committed || s.fouls || 0, s.fouls_drawn || s.foulsDrawn || 0,
                s.yellow_cards || s.yellowCards || 0, s.red_cards || s.redCards || 0, s.offside || 0, s.saves || 0, s.goals_conceded || s.goalsConceded || 0
            ]);
        } else if (sportLower === 'beisbol') {
            const s = playerPayload.baseball_stats || playerPayload.baseballStats || {};
            await run(`
                INSERT INTO baseball_player_stats
                    (player_id, event_id, role, at_bats, hits, doubles, triples, home_runs, rbi,
                     runs, walks, strikeouts, stolen_bases, innings_pitched, earned_runs,
                     strikeouts_pitched, walks_pitched, hits_allowed)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                playerId, eventId, s.role || 'batter', s.at_bats || s.atBats || 0, s.hits || 0, s.doubles || 0, s.triples || 0,
                s.home_runs || s.homeRuns || 0, s.rbi || 0, s.runs || 0, s.walks || 0, s.strikeouts || 0, s.stolen_bases || s.stolenBases || 0,
                s.innings_pitched || s.inningsPitched || 0, s.earned_runs || s.earnedRuns || 0,
                s.strikeouts_pitched || s.strikeoutsPitched || 0, s.walks_pitched || s.walksPitched || 0, s.hits_allowed || s.hitsAllowed || 0
            ]);
        } else if (sportLower === 'basquetbol') {
            const s = playerPayload.basketball_stats || playerPayload.basketballStats || {};
            await run(`
                INSERT INTO basketball_player_stats
                    (player_id, event_id, minutes_played, points, rebounds, off_rebounds, def_rebounds,
                     assists, steals, blocks, turnovers, fouls, fg_made, fg_attempted,
                     three_made, three_attempted, ft_made, ft_attempted)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                playerId, eventId, s.minutes_played || s.minutesPlayed || 0, s.points || 0, s.rebounds || 0,
                s.off_rebounds || s.offRebounds || 0, s.def_rebounds || s.defRebounds || 0, s.assists || 0, s.steals || 0,
                s.blocks || 0, s.turnovers || 0, s.fouls || 0, s.fg_made || s.fieldGoalsMade || 0, s.fg_attempted || s.fieldGoalsAtt || 0,
                s.three_made || s.threesMade || 0, s.three_attempted || s.threesAtt || 0, s.ft_made || s.freeThrowsMade || 0, s.ft_attempted || s.freeThrowsAtt || 0
            ]);
        } else {
            // "otro" deporte
            const s = playerPayload.generic_stats || playerPayload.genericStats || {};
            const extraDataStr = typeof s.extra_data === 'object' ? JSON.stringify(s.extra_data) : (s.extra_data || '{}');
            await run(`
                INSERT INTO generic_player_stats (player_id, event_id, score, score_unit, rank, penalties, extra_data)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                playerId, eventId, s.score || 0, s.score_unit || s.scoreUnit || 'points', s.rank || 0, s.penalties || 0, extraDataStr
            ]);
        }
    }

    /**
     * Crea un evento completo con equipos, jugadores y estadísticas en una sola transacción
     * @param {Object} payload Payload completo del evento
     * @returns {Promise<number>} ID del evento creado
     */
    async createFull(payload) {
        return await transaction(async () => {
            const totalTickets = payload.total_tickets !== undefined ? payload.total_tickets : (payload.totalTickets || 0);
            const ticketPrice = payload.ticket_price !== undefined ? payload.ticket_price : (payload.ticketPrice || 0);

            // 1. Insertar el evento principal
            const eventResult = await run(`
                INSERT INTO events 
                    (name, sport, event_date, start_time, end_time, location, lat, lon, total_tickets, available_tickets, ticket_price, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
            `, [
                payload.name, payload.sport, payload.event_date || payload.eventDate,
                payload.start_time || payload.startTime, payload.end_time || payload.endTime,
                payload.location, payload.lat || 0, payload.lon || 0,
                totalTickets, totalTickets, ticketPrice
            ]);

            const eventId = eventResult.lastInsertRowId;
            let homeTeamId = 0;
            let awayTeamId = 0;
            let homeScore = 0;
            let awayScore = 0;

            const teams = payload.teams || [];

            // 2. Procesar los equipos
            for (const team of teams) {
                let teamId = team.id || team.ID || 0;
                const score = team.score !== undefined ? team.score : (team.Score || 0);
                const isHome = team.is_home || team.isHome ? 1 : 0;

                if (teamId > 0) {
                    // Actualizar el deporte de un equipo existente
                    await run("UPDATE teams SET sport = ? WHERE id = ?;", [payload.sport, teamId]);
                } else {
                    // Crear un equipo nuevo
                    const teamResult = await run(`
                        INSERT INTO teams (event_id, name, is_home, sport)
                        VALUES (?, ?, ?, ?)
                    `, [eventId, team.name, isHome, payload.sport]);
                    teamId = teamResult.lastInsertRowId;
                }

                // Registrar relación en event_teams
                await run(`
                    INSERT INTO event_teams (event_id, team_id, is_home, score)
                    VALUES (?, ?, ?, ?)
                `, [eventId, teamId, isHome, score]);

                // Insertar estadísticas de equipo
                await this._insertTeamStats(payload.sport, eventId, teamId, team);

                // Guardar variables locales de scores y IDs
                if (isHome) {
                    homeTeamId = teamId;
                    homeScore = score;
                } else {
                    awayTeamId = teamId;
                    awayScore = score;
                }

                // 3. Procesar Jugadores
                const players = team.players || team.Players || [];

                if (team.id > 0 || team.ID > 0) {
                    // Cargar jugadores existentes del equipo y asociarlos a este evento
                    const existingPlayers = await selectAll(`
                        SELECT id, name, jersey_number, position, is_starter 
                        FROM players 
                        WHERE team_id = ?
                    `, [teamId]);

                    for (const p of existingPlayers) {
                        await this._insertPlayerStats(payload.sport, eventId, p.id, p);
                        await run(`
                            INSERT INTO player_attendance (player_id, event_id, status)
                            VALUES (?, ?, 'present')
                        `, [p.id, eventId]);
                    }
                } else {
                    // Insertar nuevos jugadores desde cero
                    for (const player of players) {
                        const jerseyNumber = player.jersey_number !== undefined ? player.jersey_number : (player.jerseyNumber || 0);
                        const isStarter = player.is_starter || player.isStarter ? 1 : 0;

                        const playerResult = await run(`
                            INSERT INTO players (team_id, name, jersey_number, position, is_starter, status)
                            VALUES (?, ?, ?, ?, ?, 'active')
                        `, [teamId, player.name, jerseyNumber, player.position, isStarter]);

                        const playerId = playerResult.lastInsertRowId;

                        // Guardar estadísticas del jugador
                        await this._insertPlayerStats(payload.sport, eventId, playerId, player);

                        // Asistencia por defecto
                        await run(`
                            INSERT INTO player_attendance (player_id, event_id, status)
                            VALUES (?, ?, 'present')
                        `, [playerId, eventId]);
                    }
                }
            }

            // 4. Registrar el marcador final oficial en match_results
            await run(`
                INSERT INTO match_results (event_id, home_team_id, away_team_id, home_score, away_score)
                VALUES (?, ?, ?, ?, ?)
            `, [eventId, homeTeamId, awayTeamId, homeScore, awayScore]);

            return eventId;
        });
    }
}

export const eventsRepository = new EventsRepository();
export default eventsRepository;
