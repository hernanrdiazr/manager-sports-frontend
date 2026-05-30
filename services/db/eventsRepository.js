import { selectAll, selectOne, run, transaction, exec } from './database.js';

class EventsRepository {
    async _syncStatuses() {
        await exec(`
            UPDATE events SET status = 'finalizado'
            WHERE status NOT IN ('cancelado')
              AND datetime(end_time) < datetime('now', 'localtime')
        `);
        await exec(`
            UPDATE events SET status = 'en curso'
            WHERE status = 'próximo'
              AND datetime(start_time) <= datetime('now', 'localtime')
              AND datetime(end_time) >= datetime('now', 'localtime')
        `);
    }

    async getAll() {
        await this._syncStatuses();
        return await selectAll(`
            SELECT id, name, sport, event_date, start_time, end_time,
                   location, lat, lon, total_tickets, available_tickets, ticket_price, status, created_at
            FROM events
            ORDER BY start_time ASC
        `);
    }

    async getActive() {
        await this._syncStatuses();
        return await selectAll(`
            SELECT id, name, sport, event_date, start_time, end_time,
                   location, lat, lon, total_tickets, available_tickets, ticket_price, status, created_at
            FROM events
            WHERE status NOT IN ('finalizado', 'cancelado')
            ORDER BY event_date ASC
        `);
    }

    async getById(id) {
        return await selectOne(`
            SELECT id, name, sport, event_date, start_time, end_time,
                   location, lat, lon, total_tickets, available_tickets, ticket_price, status, created_at
            FROM events WHERE id = ?
        `, [id]);
    }

    async getTeamsByEvent(eventId) {
        return await selectAll(`
            SELECT t.id, t.name, et.is_home, et.score
            FROM teams t
            JOIN event_teams et ON t.id = et.team_id
            WHERE et.event_id = ?
        `, [eventId]);
    }

    async updateStatus(id, status) {
        const validTransitions = {
            'próximo': ['en curso', 'cancelado'],
            'en curso': ['finalizado', 'cancelado'],
            'finalizado': [],
            'cancelado': []
        };

        const current = await selectOne("SELECT status FROM events WHERE id = ?", [id]);
        if (!current) throw new Error("Evento no encontrado");
        const allowed = validTransitions[current.status] || [];
        if (!allowed.includes(status)) {
            throw new Error(`No se puede cambiar de "${current.status}" a "${status}"`);
        }

        return await transaction(async () => {
            if (status === "cancelado") {
                await run(`
                    UPDATE events SET status = 'cancelado',
                        available_tickets = available_tickets + (
                            SELECT COALESCE(SUM(ticket_count), 0) FROM reservations
                            WHERE event_id = ? AND status IN ('pendiente', 'aprobado')
                        )
                    WHERE id = ?
                `, [id, id]);
                await run(`
                    UPDATE reservations SET status = 'cancelada'
                    WHERE event_id = ? AND status IN ('pendiente', 'aprobado')
                `, [id]);
            } else {
                await run("UPDATE events SET status = ? WHERE id = ?;", [status, id]);
            }
        });
    }

    async updateStartTime(id) {
        await run(`
            UPDATE events SET start_time = strftime('%Y-%m-%dT%H:%M:%S', 'now', 'localtime')
            WHERE id = ?
        `, [id]);
    }

    async softDelete(id) {
        return await this.updateStatus(id, "cancelado");
    }

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
        }
    }

    async createFull(payload) {
        return await transaction(async () => {
            const totalTickets = payload.total_tickets !== undefined ? payload.total_tickets : (payload.totalTickets || 0);
            const ticketPrice = payload.ticket_price !== undefined ? payload.ticket_price : (payload.ticketPrice || 0);

            const eventResult = await run(`
                INSERT INTO events 
                    (name, sport, event_date, start_time, end_time, location, lat, lon, total_tickets, available_tickets, ticket_price, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'próximo')
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

            for (const team of teams) {
                let teamId = team.id || team.ID || 0;
                const score = team.score !== undefined ? team.score : (team.Score || 0);
                const isHome = team.is_home || team.isHome ? 1 : 0;

                if (teamId > 0) {
                    await run("UPDATE teams SET sport = ? WHERE id = ?;", [payload.sport, teamId]);
                } else {
                    const teamResult = await run(`
                        INSERT INTO teams (event_id, name, is_home, sport)
                        VALUES (?, ?, ?, ?)
                    `, [eventId, team.name, isHome, payload.sport]);
                    teamId = teamResult.lastInsertRowId;
                }

                await run(`
                    INSERT INTO event_teams (event_id, team_id, is_home, score)
                    VALUES (?, ?, ?, ?)
                `, [eventId, teamId, isHome, score]);

                await this._insertTeamStats(payload.sport, eventId, teamId, team);

                if (isHome) {
                    homeTeamId = teamId;
                    homeScore = score;
                } else {
                    awayTeamId = teamId;
                    awayScore = score;
                }

                const players = team.players || team.Players || [];

                if (team.id > 0 || team.ID > 0) {
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
                    for (const player of players) {
                        const jerseyNumber = player.jersey_number !== undefined ? player.jersey_number : (player.jerseyNumber || 0);
                        const isStarter = player.is_starter || player.isStarter ? 1 : 0;

                        const playerResult = await run(`
                            INSERT INTO players (team_id, name, jersey_number, position, is_starter, status)
                            VALUES (?, ?, ?, ?, ?, 'active')
                        `, [teamId, player.name, jerseyNumber, player.position, isStarter]);

                        const playerId = playerResult.lastInsertRowId;

                        await this._insertPlayerStats(payload.sport, eventId, playerId, player);

                        await run(`
                            INSERT INTO player_attendance (player_id, event_id, status)
                            VALUES (?, ?, 'present')
                        `, [playerId, eventId]);
                    }
                }
            }

            await run(`
                INSERT INTO match_results (event_id, home_team_id, away_team_id, home_score, away_score)
                VALUES (?, ?, ?, ?, ?)
            `, [eventId, homeTeamId, awayTeamId, homeScore, awayScore]);

            return eventId;
        });
    }
    async getReservationSummary(eventId) {
        return await selectOne(`
            SELECT 
                COUNT(*) as total_reservations,
                COALESCE(SUM(ticket_count), 0) as total_tickets,
                COUNT(CASE WHEN status = 'pendiente' THEN 1 END) as pending_reservations,
                COALESCE(SUM(CASE WHEN status = 'pendiente' THEN ticket_count END), 0) as pending_tickets,
                COUNT(CASE WHEN status = 'aprobado' THEN 1 END) as approved_reservations,
                COALESCE(SUM(CASE WHEN status = 'aprobado' THEN ticket_count END), 0) as approved_tickets,
                COALESCE(SUM(CASE WHEN status IN ('pendiente', 'aprobado') THEN total_price END), 0) as total_revenue
            FROM reservations WHERE event_id = ?
        `, [eventId]);
    }
}

export const eventsRepository = new EventsRepository();
export default eventsRepository;
