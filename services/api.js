// services/api.js - Router de API local que intercepta peticiones y despacha a SQLite WASM

import { initDb, selectOne } from './db/database.js';
import { authRepository } from './db/authRepository.js';
import { eventsRepository } from './db/eventsRepository.js';
import { teamsRepository } from './db/teamsRepository.js';
import { playersRepository } from './db/playersRepository.js';
import { reservationsRepository } from './db/reservationsRepository.js';
import { scoreRepository } from './db/scoreRepository.js';
import { attendanceRepository } from './db/attendanceRepository.js';
import { foulsRepository } from './db/foulsRepository.js';
import { statsRepository } from './db/statsRepository.js';

class ApiService {
    // Obtener ID del usuario logueado actualmente desde localStorage
    getUserId() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return 0;
        try {
            const user = JSON.parse(userStr);
            return user.id || 0;
        } catch (e) {
            return 0;
        }
    }

    // Ruta de logs para depuración cómoda
    logRequest(method, endpoint, data) {
        console.log(`🔌 [Mock API Router] ${method} ${endpoint}`, data ? data : '');
    }

    async get(endpoint) {
        this.logRequest('GET', endpoint);
        await initDb(); // Garantizar que la DB esté lista

        try {
            const url = new URL(endpoint, 'http://localhost');
            const path = url.pathname;
            const params = url.searchParams;

            // 1. GET /events/active
            if (path === '/events/active') {
                return await eventsRepository.getActive();
            }

            // 2. GET /events
            if (path === '/events') {
                return await eventsRepository.getAll();
            }

            // 3. GET /results
            if (path === '/results') {
                return await scoreRepository.getAllResults();
            }

            // 4. GET /my-reservations
            if (path === '/my-reservations') {
                const userId = this.getUserId();
                return await reservationsRepository.getByUser(userId);
            }

            // 5. GET /teams
            if (path === '/teams') {
                const sport = params.get('sport');
                return await teamsRepository.getTeams(sport);
            }

            // 6. GET /admin/reservations/pending
            if (path === '/admin/reservations/pending') {
                return await reservationsRepository.getPending();
            }

            // 7. GET /admin/stats
            if (path === '/admin/stats') {
                const totalUsers = await selectOne("SELECT count(*) as count FROM users;");
                const totalEvents = await selectOne("SELECT count(*) as count FROM events WHERE status != 'cancelado';");
                
                // Entradas totales de reservas aprobadas para eventos no cancelados
                const totalTickets = await selectOne(`
                    SELECT sum(r.ticket_count) as sum 
                    FROM reservations r
                    JOIN events e ON r.event_id = e.id
                    WHERE r.status = 'aprobado' AND e.status != 'cancelado';
                `);
                
                // Ingresos mensuales de reservas aprobadas del mes actual para eventos no cancelados
                const monthlyRevenue = await selectOne(`
                    SELECT sum(r.total_price) as sum 
                    FROM reservations r
                    JOIN events e ON r.event_id = e.id
                    WHERE r.status = 'aprobado' 
                      AND e.status != 'cancelado'
                      AND strftime('%Y-%m', r.created_at) = strftime('%Y-%m', 'now');
                `);

                return {
                    totalUsers: totalUsers?.count || 0,
                    totalEvents: totalEvents?.count || 0,
                    totalTickets: totalTickets?.sum || 0,
                    monthlyRevenue: monthlyRevenue?.sum || 0
                };
            }

            // 8. GET /stats/byTeam
            if (path === '/stats/byTeam') {
                const startDate = params.get('start_date');
                const endDate = params.get('end_date');
                const sport = params.get('sport');
                return await statsRepository.getStatsByTeam(startDate, endDate, sport);
            }

            // 9. GET /events/{id} o /events/{eventID}/result o /events/{eventID}/players o /events/{eventID}/attendance o /events/{eventID}/fouls
            let match = path.match(/^\/events\/(\d+)\/?$/);
            if (match) {
                const id = parseInt(match[1], 10);
                
                // Recuperar detalle formateado exactamente como lo hacía Go
                const event = await eventsRepository.getById(id);
                if (!event) throw new Error("Evento no encontrado");

                const now = new Date();
                const startTime = new Date(event.start_time);
                const endTime = new Date(event.end_time);

                if (now < startTime) {
                    event.status = "Próximo";
                } else if (now > endTime) {
                    event.status = "Finalizado";
                } else {
                    event.status = "En curso";
                    event.available_tickets = 0;
                }

                const stats = await scoreRepository.getFullMatchStats(id);

                if (event.status !== "Finalizado") {
                    return {
                        mensaje: "El partido aún no ha finalizado. Las estadísticas detalladas están ocultas.",
                        evento: event,
                        estadisticas: stats
                    };
                }

                return {
                    mensaje: "¡Partido finalizado! (Estadísticas en construcción para la Fase 4)",
                    evento: event,
                    estadisticas: stats
                };
            }

            match = path.match(/^\/events\/(\d+)\/result\/?$/);
            if (match) {
                const eventId = parseInt(match[1], 10);
                return await scoreRepository.getMatchResult(eventId);
            }

            match = path.match(/^\/events\/(\d+)\/players\/?$/);
            if (match) {
                const eventId = parseInt(match[1], 10);
                return await playersRepository.getByEvent(eventId);
            }

            match = path.match(/^\/events\/(\d+)\/attendance\/?$/);
            if (match) {
                const eventId = parseInt(match[1], 10);
                return await attendanceRepository.getByEvent(eventId);
            }

            match = path.match(/^\/events\/(\d+)\/fouls\/?$/);
            if (match) {
                const eventId = parseInt(match[1], 10);
                return await foulsRepository.getByEvent(eventId);
            }

            // 10. GET /teams/{teamID}/players
            match = path.match(/^\/teams\/(\d+)\/players\/?$/);
            if (match) {
                const teamId = parseInt(match[1], 10);
                return await playersRepository.getByTeam(teamId);
            }

            // 11. GET /players/{playerID}/attendance o /players/{playerID}/fouls o /players/{playerID}/stats
            match = path.match(/^\/players\/(\d+)\/attendance\/?$/);
            if (match) {
                const playerId = parseInt(match[1], 10);
                return await attendanceRepository.getByPlayer(playerId);
            }

            match = path.match(/^\/players\/(\d+)\/fouls\/?$/);
            if (match) {
                const playerId = parseInt(match[1], 10);
                const eventId = parseInt(params.get('event_id') || '0', 10);
                return await foulsRepository.getByPlayer(playerId, eventId);
            }

            match = path.match(/^\/players\/(\d+)\/stats\/?$/);
            if (match) {
                const playerId = parseInt(match[1], 10);
                const eventId = parseInt(params.get('event_id') || '0', 10);
                const sport = params.get('sport') || '';
                return await playersRepository.getStats(playerId, eventId, sport);
            }

            throw new Error(`Ruta GET no soportada: ${endpoint}`);
        } catch (error) {
            console.error("Error en Mock Router GET:", error);
            throw error;
        }
    }

    async post(endpoint, data) {
        this.logRequest('POST', endpoint, data);
        await initDb();

        try {
            const url = new URL(endpoint, 'http://localhost');
            const path = url.pathname;
            const params = url.searchParams;

            // 1. POST /login
            if (path === '/login') {
                return await authRepository.login(data.email, data.password);
            }

            // 2. POST /register
            if (path === '/register') {
                return await authRepository.register(data.name, data.email, data.password);
            }

            // 3. POST /events (Crear evento completo)
            if (path === '/events') {
                const newId = await eventsRepository.createFull(data);
                return {
                    mensaje: "Evento, equipos, jugadores y estadísticas registrados exitosamente",
                    event_id: newId
                };
            }

            // 4. POST /reserve
            if (path === '/reserve') {
                const userId = this.getUserId();
                if (!userId) throw new Error("Debes iniciar sesión para reservar entradas");
                const newId = await reservationsRepository.create(userId, data.event_id, data.ticket_count, data.payment_reference);
                return {
                    mensaje: "¡Tu reserva ha sido registrada con éxito!",
                    reservation_id: newId
                };
            }

            // 5. POST /teams/{teamID}/players
            let match = path.match(/^\/teams\/(\d+)\/players\/?$/);
            if (match) {
                const teamId = parseInt(match[1], 10);
                const sport = params.get('sport');
                const newId = await playersRepository.create(teamId, data, sport);
                return {
                    message: "Jugador registrado correctamente",
                    player_id: newId
                };
            }

            // 6. POST /players/{playerID}/attendance
            match = path.match(/^\/players\/(\d+)\/attendance\/?$/);
            if (match) {
                const playerId = parseInt(match[1], 10);
                await attendanceRepository.upsert(playerId, data.event_id, data.status, data.note);
                return {
                    message: "Asistencia registrada correctamente"
                };
            }

            // 7. POST /players/{playerID}/fouls
            match = path.match(/^\/players\/(\d+)\/fouls\/?$/);
            if (match) {
                const playerId = parseInt(match[1], 10);
                await foulsRepository.create(playerId, data.event_id, data.foul_type, data.description, data.minute);
                return {
                    message: "Falta registrada correctamente"
                };
            }

            throw new Error(`Ruta POST no soportada: ${endpoint}`);
        } catch (error) {
            console.error("Error en Mock Router POST:", error);
            throw error;
        }
    }

    async put(endpoint, data) {
        this.logRequest('PUT', endpoint, data);
        await initDb();

        try {
            const url = new URL(endpoint, 'http://localhost');
            const path = url.pathname;

            // 1. PUT /events/{id}/status
            let match = path.match(/^\/events\/(\d+)\/status\/?$/);
            if (match) {
                const id = parseInt(match[1], 10);
                await eventsRepository.updateStatus(id, data.status);
                return {
                    mensaje: `Estado del evento actualizado a ${data.status}`
                };
            }

            throw new Error(`Ruta PUT no soportada: ${endpoint}`);
        } catch (error) {
            console.error("Error en Mock Router PUT:", error);
            throw error;
        }
    }

    async patch(endpoint, data) {
        this.logRequest('PATCH', endpoint, data);
        await initDb();

        try {
            const url = new URL(endpoint, 'http://localhost');
            const path = url.pathname;
            const params = url.searchParams;

            // 1. PATCH /admin/reservations/{id}/approve
            let match = path.match(/^\/admin\/reservations\/(\d+)\/approve\/?$/);
            if (match) {
                const id = parseInt(match[1], 10);
                await reservationsRepository.approve(id);
                return {
                    mensaje: "Reserva aprobada correctamente"
                };
            }

            // 2. PATCH /players/{playerID}/status
            match = path.match(/^\/players\/(\d+)\/status\/?$/);
            if (match) {
                const playerId = parseInt(match[1], 10);
                await playersRepository.updateStatus(playerId, data.status);
                return {
                    message: "Status actualizado correctamente"
                };
            }

            // 3. PATCH /players/{playerID}/stats
            match = path.match(/^\/players\/(\d+)\/stats\/?$/);
            if (match) {
                const playerId = parseInt(match[1], 10);
                const eventId = parseInt(params.get('event_id'), 10);
                const sport = params.get('sport');
                await playersRepository.updateStats(playerId, eventId, sport, data);
                return {
                    message: "Stats actualizadas correctamente"
                };
            }

            // 4. PATCH /events/{eventID}/score
            match = path.match(/^\/events\/(\d+)\/score\/?$/);
            if (match) {
                const eventId = parseInt(match[1], 10);
                await scoreRepository.updateScore(eventId, data.home_score, data.away_score);
                return {
                    message: "Score actualizado correctamente"
                };
            }

            throw new Error(`Ruta PATCH no soportada: ${endpoint}`);
        } catch (error) {
            console.error("Error en Mock Router PATCH:", error);
            throw error;
        }
    }

    async delete(endpoint) {
        this.logRequest('DELETE', endpoint);
        await initDb();

        try {
            const url = new URL(endpoint, 'http://localhost');
            const path = url.pathname;

            // 1. DELETE /events/{id}
            let match = path.match(/^\/events\/(\d+)\/?$/);
            if (match) {
                const id = parseInt(match[1], 10);
                await eventsRepository.softDelete(id);
                return {
                    mensaje: "Evento cancelado exitosamente"
                };
            }

            throw new Error(`Ruta DELETE no soportada: ${endpoint}`);
        } catch (error) {
            console.error("Error en Mock Router DELETE:", error);
            throw error;
        }
    }
}

export const api = new ApiService();
export default api;