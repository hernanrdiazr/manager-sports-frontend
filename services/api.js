import * as localApi from './localApi.js';

function getCurrentUserId() {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user).id : null;
    } catch { return null; }
}

function parseEndpoint(endpoint) {
    const [path, queryStr] = endpoint.split('?');
    const query = {};
    if (queryStr) {
        queryStr.split('&').forEach(part => {
            const [k, v] = part.split('=');
            if (k) query[k] = decodeURIComponent(v ?? '');
        });
    }
    const seg = path.split('/').filter(Boolean);
    return { path, seg, query };
}

function dispatch(method, endpoint, body) {
    const { path, seg, query } = parseEndpoint(endpoint);

    // Auth
    if (method === 'POST' && path === '/login')    return localApi.login(body);
    if (method === 'POST' && path === '/register') return localApi.register(body);

    // Dashboard
    if (method === 'GET' && path === '/admin/stats') return localApi.getAdminStats();

    // Teams
    if (method === 'GET'  && path === '/teams') return localApi.getTeams();
    if (method === 'POST' && path === '/teams') return localApi.createTeam(body);
    if (seg[0] === 'teams' && seg[1] && !isNaN(seg[1]) && seg[2] === 'players' && method === 'GET') {
        return localApi.getTeamPlayers(+seg[1]);
    }

    // Events
    if (method === 'GET'  && path === '/events') return localApi.getEvents();
    if (method === 'POST' && path === '/events') return localApi.createEvent(body);
    if (method === 'GET'  && seg[0] === 'events' && seg[1] && !isNaN(seg[1]) && !seg[2]) {
        return localApi.getEvent(+seg[1]);
    }

    // /events/:id/...
    if (seg[0] === 'events' && seg[1] && !isNaN(seg[1])) {
        const eventId = +seg[1];
        if (method === 'GET'   && seg[2] === 'players')    return localApi.getEventPlayers(eventId);
        if (method === 'GET'   && seg[2] === 'attendance') return localApi.getEventAttendance(eventId);
        if (method === 'GET'   && seg[2] === 'fouls')      return localApi.getEventFouls(eventId);
        if (method === 'GET'   && seg[2] === 'teams')      return localApi.getEventTeams(eventId);
        if (method === 'GET'   && seg[2] === 'result')     return localApi.getEventResult(eventId);
        if (method === 'PATCH' && seg[2] === 'score')      return localApi.updateScore(eventId, body);
        if (method === 'GET'   && seg[2] === 'team-stats') return localApi.getTeamStats(eventId, query.sport);
    }

    // /teams/:id/players
    if (seg[0] === 'teams' && seg[1] && !isNaN(seg[1]) && seg[2] === 'players') {
        return localApi.registerPlayer(+seg[1], query.sport, body);
    }

    // /teams/:id/team-stats
    if (seg[0] === 'teams' && seg[1] && !isNaN(seg[1]) && seg[2] === 'team-stats' && method === 'PATCH') {
        return localApi.updateTeamStats(+query.event_id, +seg[1], query.sport, body);
    }

    // /players/:id/...
    if (seg[0] === 'players' && seg[1] && !isNaN(seg[1])) {
        const playerId = +seg[1];
        if (method === 'PATCH' && seg[2] === 'status')     return localApi.updatePlayerStatus(playerId, body);
        if (method === 'POST'  && seg[2] === 'attendance') return localApi.recordAttendance(playerId, body);
        if (method === 'POST'  && seg[2] === 'fouls')      return localApi.registerFoul(playerId, body);
        if (method === 'GET'   && seg[2] === 'stats') {
            return localApi.getPlayerStats(playerId, query.sport, +query.event_id);
        }
        if (method === 'PATCH' && seg[2] === 'stats') {
            return localApi.updatePlayerStats(playerId, query.sport, +query.event_id, body);
        }
    }

    // User reservations
    if (method === 'GET'  && path === '/my-reservations') return localApi.getUserReservations(getCurrentUserId());
    if (method === 'POST' && path === '/reserve')         return localApi.createReservation(getCurrentUserId(), body);

    // /admin/reservations/...
    if (seg[0] === 'admin' && seg[1] === 'reservations') {
        if (method === 'GET'   && seg[2] === 'pending')  return localApi.getPendingReservations();
        if (method === 'PATCH' && seg[3] === 'approve')  return localApi.approveReservation(+seg[2]);
    }

    // Dashboard stats
    if (method === 'GET' && path === '/stats/byTeam')              return localApi.getStatsByTeam(query.start_date, query.end_date, query.sport);
    if (method === 'GET' && path === '/stats/rankingTeams')         return localApi.getRankingTeams(query.sport);
    if (method === 'GET' && path === '/admin/stats/indicatorsGestion') return localApi.getIndicatorsGestion(query.start_date, query.end_date, query.sport, query.event_id ? +query.event_id : null);
    if (method === 'GET' && path === '/admin/stats/cantUsers')      return localApi.getCantUsers();
    if (method === 'GET' && path === '/admin/stats/funnel')         return localApi.getFunnelData(query.start_date, query.end_date, query.sport, query.event_id ? +query.event_id : null);
    if (method === 'GET' && path === '/admin/stats/eventsList')     return localApi.getEventsList(query.start_date, query.end_date, query.sport, +query.limit || 100, +query.offset || 0);
    if (method === 'GET' && path === '/admin/stats/eventsHistory')  return localApi.getEventsHistory(query.start_date, query.end_date, query.sport, query.event_id ? +query.event_id : null);
    if (method === 'GET' && path === '/admin/stats/ticketsByDay')    return localApi.getTicketsByDay(query.start_date, query.end_date, query.sport, query.event_id ? +query.event_id : null);



    throw new Error(`Ruta no implementada: ${method} ${endpoint}`);
}

class ApiService {
    async get(endpoint) {
        try {
            return await dispatch('GET', endpoint, null);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }

    async post(endpoint, data) {
        try {
            return await dispatch('POST', endpoint, data);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }

    async patch(endpoint, data) {
        try {
            return await dispatch('PATCH', endpoint, data);
        } catch (error) {
            console.error('PATCH Error:', error);
            throw error;
        }
    }

    async put(endpoint, data) {
        try {
            return await dispatch('PUT', endpoint, data);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }

    async delete(endpoint) {
        try {
            return await dispatch('DELETE', endpoint, null);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
}

export const api = new ApiService();
export default api;
