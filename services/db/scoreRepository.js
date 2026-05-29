// services/db/scoreRepository.js - Repositorio para Marcadores y Estadísticas del Partido en SQLite

import { selectAll, selectOne, run, transaction } from './database.js';

class ScoreRepository {
    /**
     * Obtiene el marcador oficial básico de un evento
     * @param {number} eventId ID del evento
     * @returns {Promise<Object|null>} Marcador
     */
    async getMatchResult(eventId) {
        const result = await selectOne(`
            SELECT id, event_id, home_team_id, away_team_id, home_score, away_score, created_at
            FROM match_results
            WHERE event_id = ?
        `, [eventId]);

        if (!result) {
            throw new Error("resultado no encontrado");
        }
        return result;
    }

    /**
     * Actualiza el marcador oficial de un evento (tanto en match_results como en event_teams para consistencia)
     * @param {number} eventId ID del evento
     * @param {number} homeScore Goles/puntos local
     * @param {number} awayScore Goles/puntos visitante
     */
    async updateScore(eventId, homeScore, awayScore) {
        return await transaction(async () => {
            // 1. Actualizar el marcador central en match_results
            await run(`
                UPDATE match_results
                SET home_score = ?, away_score = ?
                WHERE event_id = ?;
            `, [homeScore, awayScore, eventId]);

            // 2. Obtener los IDs de los equipos para actualizar event_teams y mantener consistencia
            const match = await selectOne(`
                SELECT home_team_id, away_team_id FROM match_results WHERE event_id = ?;
            `, [eventId]);

            if (match) {
                // Actualizar score en event_teams para el local
                await run(`
                    UPDATE event_teams
                    SET score = ?
                    WHERE event_id = ? AND team_id = ?;
                `, [homeScore, eventId, match.home_team_id]);

                // Actualizar score en event_teams para el visitante
                await run(`
                    UPDATE event_teams
                    SET score = ?
                    WHERE event_id = ? AND team_id = ?;
                `, [awayScore, eventId, match.away_team_id]);
            }
        });
    }

    /**
     * Obtiene todos los resultados históricos de partidos finalizados
     * @returns {Promise<Array<Object>>} Lista de marcadores
     */
    async getAllResults() {
        return await selectAll(`
            SELECT mr.id, mr.event_id, mr.home_team_id, mr.away_team_id, mr.home_score, mr.away_score, mr.created_at
            FROM match_results mr
            JOIN events e ON e.id = mr.event_id
            ORDER BY e.start_time DESC;
        `);
    }

    /**
     * Construye el Mega-JSON de estadísticas detalladas del partido para renderizar en el frontend
     * @param {number} eventId ID del evento
     * @returns {Promise<Object>} JSON con el deporte, marcador, equipos, stats de equipos y stats de jugadores
     */
    async getFullMatchStats(eventId) {
        // 1. Identificar el deporte
        const event = await selectOne("SELECT sport FROM events WHERE id = ?;", [eventId]);
        if (!event) {
            throw new Error("error al identificar deporte");
        }
        const sport = event.sport;

        // 2. Traer el resultado oficial básico
        let resultado = null;
        try {
            resultado = await this.getMatchResult(eventId);
        } catch (e) {
            resultado = { event_id: eventId, home_score: 0, away_score: 0 }; // Estructura vacía
        }

        const fullStats = {
            deporte: sport,
            marcador: resultado,
            equipo_local: null,
            equipo_visitante: null,
            stats_equipos: null,
            jugadores_local: [],
            jugadores_visitante: []
        };

        // 3. Obtener equipos
        const teams = await selectAll(`
            SELECT t.id, t.name, et.is_home, et.score
            FROM teams t
            JOIN event_teams et ON t.id = et.team_id
            WHERE et.event_id = ?;
        `, [eventId]);

        let homeTeam = null;
        let awayTeam = null;

        for (const t of teams) {
            const teamData = {
                id: t.id,
                name: t.name,
                score: t.score
            };
            if (t.is_home) {
                homeTeam = teamData;
                fullStats.equipo_local = teamData;
            } else {
                awayTeam = teamData;
                fullStats.equipo_visitante = teamData;
            }
        }

        // 4. Obtener estadísticas de equipo según el deporte
        if (homeTeam && awayTeam) {
            const homeId = homeTeam.id;
            const awayId = awayTeam.id;

            const sportLower = sport.toLowerCase();
            if (sportLower === 'futbol') {
                const homeStats = await selectOne(`
                    SELECT possession, total_shots, shots_on_target, corners, fouls, yellow_cards, red_cards, offsides
                    FROM soccer_team_stats WHERE event_id = ? AND team_id = ?;
                `, [eventId, homeId]) || {};

                const awayStats = await selectOne(`
                    SELECT possession, total_shots, shots_on_target, corners, fouls, yellow_cards, red_cards, offsides
                    FROM soccer_team_stats WHERE event_id = ? AND team_id = ?;
                `, [eventId, awayId]) || {};

                fullStats.stats_equipos = {
                    local: {
                        posesion: homeStats.possession || 0,
                        remates: homeStats.total_shots || 0,
                        remates_arco: homeStats.shots_on_target || 0,
                        tiros_esquina: homeStats.corners || 0,
                        faltas: homeStats.fouls || 0,
                        amarillas: homeStats.yellow_cards || 0,
                        rojas: homeStats.red_cards || 0,
                        fueras_juego: homeStats.offsides || 0
                    },
                    visitante: {
                        posesion: awayStats.possession || 0,
                        remates: awayStats.total_shots || 0,
                        remates_arco: awayStats.shots_on_target || 0,
                        tiros_esquina: awayStats.corners || 0,
                        faltas: awayStats.fouls || 0,
                        amarillas: awayStats.yellow_cards || 0,
                        rojas: awayStats.red_cards || 0,
                        fueras_juego: awayStats.offsides || 0
                    }
                };
            } else if (sportLower === 'beisbol') {
                const homeStats = await selectOne(`
                    SELECT runs, hits, errors, left_on_base FROM baseball_team_stats 
                    WHERE event_id = ? AND team_id = ?;
                `, [eventId, homeId]) || {};

                const awayStats = await selectOne(`
                    SELECT runs, hits, errors, left_on_base FROM baseball_team_stats 
                    WHERE event_id = ? AND team_id = ?;
                `, [eventId, awayId]) || {};

                fullStats.stats_equipos = {
                    local: {
                        carreras: homeStats.runs || 0,
                        hits: homeStats.hits || 0,
                        errores: homeStats.errors || 0,
                        dejados_base: homeStats.left_on_base || 0
                    },
                    visitante: {
                        carreras: awayStats.runs || 0,
                        hits: awayStats.hits || 0,
                        errores: awayStats.errors || 0,
                        dejados_base: awayStats.left_on_base || 0
                    }
                };
            } else if (sportLower === 'basquetbol') {
                const homeStats = await selectOne(`
                    SELECT points, rebounds, assists, turnovers, fouls, fg_pct, three_pct FROM basketball_team_stats 
                    WHERE event_id = ? AND team_id = ?;
                `, [eventId, homeId]) || {};

                const awayStats = await selectOne(`
                    SELECT points, rebounds, assists, turnovers, fouls, fg_pct, three_pct FROM basketball_team_stats 
                    WHERE event_id = ? AND team_id = ?;
                `, [eventId, awayId]) || {};

                fullStats.stats_equipos = {
                    local: {
                        puntos: homeStats.points || 0,
                        rebotes: homeStats.rebounds || 0,
                        asistencias: homeStats.assists || 0,
                        perdidas: homeStats.turnovers || 0,
                        faltas: homeStats.fouls || 0,
                        porcentaje_tiros: homeStats.fg_pct || 0,
                        porcentaje_triples: homeStats.three_pct || 0
                    },
                    visitante: {
                        puntos: awayStats.points || 0,
                        rebotes: awayStats.rebounds || 0,
                        asistencias: awayStats.assists || 0,
                        perdidas: awayStats.turnovers || 0,
                        faltas: awayStats.fouls || 0,
                        porcentaje_tiros: awayStats.fg_pct || 0,
                        porcentaje_triples: awayStats.three_pct || 0
                    }
                };
            }
        }

        // 5. Obtener estadísticas de los jugadores según el deporte
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol') {
            const players = await selectAll(`
                SELECT p.name, p.jersey_number, p.position, p.is_starter, p.team_id,
                       s.minutes_played, s.goals, s.assists, s.shots, s.shots_on_target,
                       s.passes, s.pass_accuracy, s.fouls_committed, s.fouls_drawn,
                       s.yellow_cards, s.red_cards, s.offside, s.saves, s.goals_conceded
                FROM players p
                JOIN soccer_player_stats s ON p.id = s.player_id
                WHERE s.event_id = ?
                ORDER BY p.jersey_number ASC;
            `, [eventId]);

            for (const p of players) {
                const pData = {
                    nombre: p.name,
                    numero: p.jersey_number,
                    posicion: p.position,
                    titular: !!p.is_starter,
                    minutos: p.minutes_played,
                    goles: p.goals,
                    asistencias: p.assists,
                    remates: p.shots,
                    remates_arco: p.shots_on_target,
                    pases: p.passes,
                    precision_pases: p.pass_accuracy,
                    faltas_cometidas: p.fouls_committed,
                    faltas_recibidas: p.fouls_drawn,
                    amarillas: p.yellow_cards,
                    rojas: p.red_cards,
                    fueras_juego: p.offside,
                    atajadas: p.saves,
                    goles_concedidos: p.goals_conceded
                };

                if (homeTeam && p.team_id === homeTeam.id) {
                    fullStats.jugadores_local.push(pData);
                } else {
                    fullStats.jugadores_visitante.push(pData);
                }
            }
        } else if (sportLower === 'beisbol') {
            const players = await selectAll(`
                SELECT p.name, p.jersey_number, p.position, p.team_id,
                       b.role, b.at_bats, b.hits, b.doubles, b.triples, b.home_runs, b.rbi,
                       b.runs, b.walks, b.strikeouts, b.stolen_bases, b.innings_pitched, b.earned_runs,
                       b.strikeouts_pitched, b.walks_pitched, b.hits_allowed
                FROM players p
                JOIN baseball_player_stats b ON p.id = b.player_id
                WHERE b.event_id = ?
                ORDER BY p.jersey_number ASC;
            `, [eventId]);

            for (const p of players) {
                const pData = {
                    nombre: p.name,
                    numero: p.jersey_number,
                    posicion: p.position,
                    rol: p.role,
                    turnos_bateo: p.at_bats,
                    hits: p.hits,
                    dobles: p.doubles,
                    triples: p.triples,
                    home_runs: p.home_runs,
                    carreras_impulsadas: p.rbi,
                    carreras: p.runs,
                    boletos: p.walks,
                    ponches: p.strikeouts,
                    bases_robadas: p.stolen_bases,
                    entradas_lanzadas: p.innings_pitched,
                    carreras_limpias: p.earned_runs,
                    ponches_recetados: p.strikeouts_pitched,
                    boletos_otorgados: p.walks_pitched,
                    hits_permitidos: p.hits_allowed
                };

                if (homeTeam && p.team_id === homeTeam.id) {
                    fullStats.jugadores_local.push(pData);
                } else {
                    fullStats.jugadores_visitante.push(pData);
                }
            }
        } else if (sportLower === 'basquetbol') {
            const players = await selectAll(`
                SELECT p.name, p.jersey_number, p.position, p.team_id,
                       b.minutes_played, b.points, b.rebounds, b.off_rebounds, b.def_rebounds,
                       b.assists, b.steals, b.blocks, b.turnovers, b.fouls, b.fg_made, b.fg_attempted,
                       b.three_made, b.three_attempted, b.ft_made, b.ft_attempted
                FROM players p
                JOIN basketball_player_stats b ON p.id = b.player_id
                WHERE b.event_id = ?
                ORDER BY p.jersey_number ASC;
            `, [eventId]);

            for (const p of players) {
                const pData = {
                    nombre: p.name,
                    numero: p.jersey_number,
                    posicion: p.position,
                    minutos: p.minutes_played,
                    puntos: p.points,
                    rebotes: p.rebounds,
                    rebotes_ofensivos: p.off_rebounds,
                    rebotes_defensivos: p.def_rebounds,
                    asistencias: p.assists,
                    robos: p.steals,
                    bloqueos: p.blocks,
                    perdidas: p.turnovers,
                    faltas: p.fouls,
                    tiros_convertidos: p.fg_made,
                    tiros_intentados: p.fg_attempted,
                    triples_convertidos: p.three_made,
                    triples_intentados: p.three_attempted,
                    libres_convertidos: p.ft_made,
                    libres_intentados: p.ft_attempted
                };

                if (homeTeam && p.team_id === homeTeam.id) {
                    fullStats.jugadores_local.push(pData);
                } else {
                    fullStats.jugadores_visitante.push(pData);
                }
            }
        } else {
            // "otro" deporte / Rankings genéricos
            const players = await selectAll(`
                SELECT p.name, p.jersey_number, p.position,
                       g.score, g.score_unit, g.rank, g.penalties, g.extra_data
                FROM players p
                JOIN generic_player_stats g ON p.id = g.player_id
                WHERE g.event_id = ?
                ORDER BY g.rank ASC, g.score DESC;
            `, [eventId]);

            const rankings = [];
            for (const p of players) {
                let parsedExtraData = {};
                try {
                    parsedExtraData = p.extra_data ? JSON.parse(p.extra_data) : {};
                } catch (e) {
                    parsedExtraData = {};
                }

                rankings.push({
                    nombre: p.name,
                    numero: p.jersey_number,
                    posicion: p.position,
                    puntaje: p.score,
                    unidad: p.score_unit,
                    puesto: p.rank,
                    penalizaciones: p.penalties,
                    extra_data: parsedExtraData
                });
            }
            fullStats.rankings = rankings;
        }

        return fullStats;
    }
}

export const scoreRepository = new ScoreRepository();
export default scoreRepository;
