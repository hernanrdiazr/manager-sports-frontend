// Datos de prueba completos — reemplazar con API cuando el backend tenga eventos reales
export const USE_MOCK_EVENTS = false;

const store = {
    events: [
        {
            id: 9001,
            organizer: 'Liga MX — Clásico Regio',
            sport: 'futbol',
            description: 'Tigres vs Rayados — Jornada 12',
            event_date: '2026-06-15',
            start_time: '2026-06-15T20:00:00Z',
            end_time: '2026-06-15T22:00:00Z',
            location: 'Estadio Universitario, Monterrey',
            total_tickets: 5000,
            available_tickets: 1200,
            ticket_price: 350,
            status: 'activo',
            estado_partido: 'Por comenzar'
        },
        {
            id: 9002,
            organizer: 'Serie del Caribe',
            sport: 'beisbol',
            description: 'Dominicana vs México — Semifinal',
            event_date: '2026-07-20',
            start_time: '2026-07-20T19:00:00Z',
            end_time: '2026-07-20T23:00:00Z',
            location: 'Estadio Monumental, Santo Domingo',
            total_tickets: 8000,
            available_tickets: 2100,
            ticket_price: 180,
            status: 'activo',
            estado_partido: 'Por comenzar'
        },
        {
            id: 9003,
            organizer: 'Liga Nacional de Básquetbol',
            sport: 'basquetbol',
            description: 'Capitanes vs Abejas — Playoffs',
            event_date: '2026-08-10',
            start_time: '2026-08-10T21:00:00Z',
            end_time: '2026-08-10T23:30:00Z',
            location: 'Arena CDMX',
            total_tickets: 12000,
            available_tickets: 4500,
            ticket_price: 220,
            status: 'activo',
            estado_partido: 'En curso'
        }
    ],

    details: {
        9001: {
            teams: [
                { id: 9101, name: 'Tigres UANL', is_home: true },
                { id: 9102, name: 'Rayados MTY', is_home: false }
            ],
            score: { home_score: 2, away_score: 1 },
            players: [
                { id: 901, team_id: 9101, name: 'André-Pierre Gignac', jersey_number: 10, position: 'FW', is_starter: true, status: 'active' },
                { id: 902, team_id: 9101, name: 'Guido Pizarro', jersey_number: 19, position: 'MF', is_starter: true, status: 'active' },
                { id: 903, team_id: 9101, name: 'Nahuel Guzmán', jersey_number: 1, position: 'GK', is_starter: true, status: 'active' },
                { id: 904, team_id: 9102, name: 'Germán Berterame', jersey_number: 7, position: 'FW', is_starter: true, status: 'active' },
                { id: 905, team_id: 9102, name: 'Sergio Canales', jersey_number: 8, position: 'MF', is_starter: true, status: 'active' },
                { id: 906, team_id: 9102, name: 'Esteban Andrada', jersey_number: 25, position: 'GK', is_starter: true, status: 'injured' }
            ],
            attendance: [
                { id: 1, player_id: 901, event_id: 9001, status: 'present', note: '' },
                { id: 2, player_id: 902, event_id: 9001, status: 'present', note: '' },
                { id: 3, player_id: 903, event_id: 9001, status: 'present', note: '' },
                { id: 4, player_id: 904, event_id: 9001, status: 'late', note: 'Llegó al min 15' },
                { id: 5, player_id: 905, event_id: 9001, status: 'present', note: '' },
                { id: 6, player_id: 906, event_id: 9001, status: 'absent', note: 'Lesión previa' }
            ],
            fouls: [
                { id: 1, player_id: 902, event_id: 9001, foul_type: 'yellow_card', description: 'Entrada fuerte', minute: 34 },
                { id: 2, player_id: 905, event_id: 9001, foul_type: 'yellow_card', description: 'Protesta', minute: 67 },
                { id: 3, player_id: 904, event_id: 9001, foul_type: 'foul', description: 'Falta táctica', minute: 78 }
            ],
            reservations: [
                { id: 501, usuario: 'Carlos Méndez', evento: 'futbol', cantidad: 4, total: 1400, referencia_pago: 'PAY-FUT-001', estado: 'pendiente' },
                { id: 502, usuario: 'Ana Torres', evento: 'futbol', cantidad: 2, total: 700, referencia_pago: 'PAY-FUT-002', estado: 'pendiente' }
            ],
            stats: {
                901: { minutes_played: 90, goals: 2, assists: 0, shots: 5, shots_on_target: 3, passes: 42, pass_accuracy_pct: 78, fouls_committed: 1, fouls_drawn: 2, yellow_cards: 0, red_cards: 0, offside: 1, saves: 0, goals_conceded: 0 },
                902: { minutes_played: 90, goals: 0, assists: 1, shots: 2, shots_on_target: 1, passes: 68, pass_accuracy_pct: 85, fouls_committed: 2, fouls_drawn: 1, yellow_cards: 1, red_cards: 0, offside: 0, saves: 0, goals_conceded: 0 },
                903: { minutes_played: 90, goals: 0, assists: 0, shots: 0, shots_on_target: 0, passes: 22, pass_accuracy_pct: 70, fouls_committed: 0, fouls_drawn: 0, yellow_cards: 0, red_cards: 0, offside: 0, saves: 6, goals_conceded: 1 },
                904: { minutes_played: 75, goals: 1, assists: 0, shots: 4, shots_on_target: 2, passes: 28, pass_accuracy_pct: 72, fouls_committed: 2, fouls_drawn: 3, yellow_cards: 0, red_cards: 0, offside: 2, saves: 0, goals_conceded: 0 },
                905: { minutes_played: 90, goals: 0, assists: 1, shots: 3, shots_on_target: 1, passes: 55, pass_accuracy_pct: 80, fouls_committed: 1, fouls_drawn: 2, yellow_cards: 1, red_cards: 0, offside: 0, saves: 0, goals_conceded: 0 },
                906: { minutes_played: 0, goals: 0, assists: 0, shots: 0, shots_on_target: 0, passes: 0, pass_accuracy_pct: 0, fouls_committed: 0, fouls_drawn: 0, yellow_cards: 0, red_cards: 0, offside: 0, saves: 0, goals_conceded: 0 }
            }
        },

        9002: {
            teams: [
                { id: 9201, name: 'Rep. Dominicana', is_home: true },
                { id: 9202, name: 'México', is_home: false }
            ],
            score: { home_score: 5, away_score: 3 },
            players: [
                { id: 911, team_id: 9201, name: 'Juan Soto', jersey_number: 22, position: 'OF', is_starter: true, status: 'active' },
                { id: 912, team_id: 9201, name: 'Fernando Tatís Jr.', jersey_number: 23, position: 'SS', is_starter: true, status: 'active' },
                { id: 913, team_id: 9201, name: 'Sandy Alcántara', jersey_number: 20, position: 'P', is_starter: true, status: 'active' },
                { id: 914, team_id: 9202, name: 'Randy Arozarena', jersey_number: 56, position: 'OF', is_starter: true, status: 'active' },
                { id: 915, team_id: 9202, name: 'Joey Meneses', jersey_number: 48, position: '1B', is_starter: true, status: 'active' },
                { id: 916, team_id: 9202, name: 'Patrick Sandoval', jersey_number: 43, position: 'P', is_starter: true, status: 'active' }
            ],
            attendance: [
                { id: 11, player_id: 911, event_id: 9002, status: 'present', note: '' },
                { id: 12, player_id: 912, event_id: 9002, status: 'present', note: '' },
                { id: 13, player_id: 913, event_id: 9002, status: 'present', note: '' },
                { id: 14, player_id: 914, event_id: 9002, status: 'present', note: '' },
                { id: 15, player_id: 915, event_id: 9002, status: 'excused', note: 'Reposo médico' },
                { id: 16, player_id: 916, event_id: 9002, status: 'present', note: '' }
            ],
            fouls: [
                { id: 11, player_id: 912, event_id: 9002, foul_type: 'ejection', description: 'Discusión con árbitro', minute: 0 },
                { id: 12, player_id: 914, event_id: 9002, foul_type: 'interference', description: 'Interferencia en home', minute: 0 }
            ],
            reservations: [
                { id: 503, usuario: 'Luis Ramírez', evento: 'beisbol', cantidad: 3, total: 540, referencia_pago: 'PAY-BEI-001', estado: 'pendiente' }
            ],
            stats: {
                911: { role: 'batter', at_bats: 4, hits: 2, doubles: 1, triples: 0, home_runs: 1, rbi: 3, runs: 2, walks: 1, strikeouts: 0, stolen_bases: 0, innings_pitched: 0, earned_runs: 0, strikeouts_pitched: 0, walks_pitched: 0, hits_allowed: 0 },
                912: { role: 'batter', at_bats: 5, hits: 3, doubles: 0, triples: 1, home_runs: 0, rbi: 2, runs: 2, walks: 0, strikeouts: 1, stolen_bases: 1, innings_pitched: 0, earned_runs: 0, strikeouts_pitched: 0, walks_pitched: 0, hits_allowed: 0 },
                913: { role: 'pitcher', at_bats: 0, hits: 0, doubles: 0, triples: 0, home_runs: 0, rbi: 0, runs: 0, walks: 0, strikeouts: 0, stolen_bases: 0, innings_pitched: 6.0, earned_runs: 2, strikeouts_pitched: 8, walks_pitched: 2, hits_allowed: 5 },
                914: { role: 'batter', at_bats: 4, hits: 1, doubles: 0, triples: 0, home_runs: 1, rbi: 2, runs: 1, walks: 0, strikeouts: 2, stolen_bases: 0, innings_pitched: 0, earned_runs: 0, strikeouts_pitched: 0, walks_pitched: 0, hits_allowed: 0 },
                915: { role: 'batter', at_bats: 0, hits: 0, doubles: 0, triples: 0, home_runs: 0, rbi: 0, runs: 0, walks: 0, strikeouts: 0, stolen_bases: 0, innings_pitched: 0, earned_runs: 0, strikeouts_pitched: 0, walks_pitched: 0, hits_allowed: 0 },
                916: { role: 'pitcher', at_bats: 0, hits: 0, doubles: 0, triples: 0, home_runs: 0, rbi: 0, runs: 0, walks: 0, strikeouts: 0, stolen_bases: 0, innings_pitched: 5.1, earned_runs: 4, strikeouts_pitched: 5, walks_pitched: 3, hits_allowed: 8 }
            }
        },

        9003: {
            teams: [
                { id: 9301, name: 'Capitanes CDMX', is_home: true },
                { id: 9302, name: 'Abejas de León', is_home: false }
            ],
            score: { home_score: 78, away_score: 72 },
            players: [
                { id: 921, team_id: 9301, name: 'Devin Robinson', jersey_number: 0, position: 'SF', is_starter: true, status: 'active' },
                { id: 922, team_id: 9301, name: 'Aaron Harrison', jersey_number: 5, position: 'SG', is_starter: true, status: 'active' },
                { id: 923, team_id: 9301, name: 'William McDowell-White', jersey_number: 3, position: 'PG', is_starter: true, status: 'active' },
                { id: 924, team_id: 9302, name: 'Terrence Rencher', jersey_number: 12, position: 'PG', is_starter: true, status: 'active' },
                { id: 925, team_id: 9302, name: 'Jeffery Taylor', jersey_number: 21, position: 'PF', is_starter: true, status: 'active' },
                { id: 926, team_id: 9302, name: 'Josh Robinson', jersey_number: 55, position: 'C', is_starter: true, status: 'suspended' }
            ],
            attendance: [
                { id: 21, player_id: 921, event_id: 9003, status: 'present', note: '' },
                { id: 22, player_id: 922, event_id: 9003, status: 'present', note: '' },
                { id: 23, player_id: 923, event_id: 9003, status: 'late', note: 'Calentamiento extendido' },
                { id: 24, player_id: 924, event_id: 9003, status: 'present', note: '' },
                { id: 25, player_id: 925, event_id: 9003, status: 'present', note: '' },
                { id: 26, player_id: 926, event_id: 9003, status: 'absent', note: 'Suspendido' }
            ],
            fouls: [
                { id: 21, player_id: 922, event_id: 9003, foul_type: 'personal', description: 'Falta sobre el tirador', minute: 12 },
                { id: 22, player_id: 925, event_id: 9003, foul_type: 'technical', description: 'Técnica por protesta', minute: 28 },
                { id: 23, player_id: 921, event_id: 9003, foul_type: 'flagrant', description: 'Contacto excesivo', minute: 35 }
            ],
            reservations: [
                { id: 504, usuario: 'María González', evento: 'basquetbol', cantidad: 2, total: 440, referencia_pago: 'PAY-BAS-001', estado: 'pendiente' },
                { id: 505, usuario: 'Pedro Sánchez', evento: 'basquetbol', cantidad: 6, total: 1320, referencia_pago: 'PAY-BAS-002', estado: 'pendiente' }
            ],
            stats: {
                921: { minutes_played: 32, points: 24, rebounds: 8, offensive_rebounds: 2, defensive_rebounds: 6, assists: 3, steals: 1, blocks: 2, turnovers: 2, fouls: 3, fg_made: 9, fg_attempted: 16, three_made: 2, three_attempted: 5, ft_made: 4, ft_attempted: 5 },
                922: { minutes_played: 28, points: 18, rebounds: 4, offensive_rebounds: 1, defensive_rebounds: 3, assists: 5, steals: 2, blocks: 0, turnovers: 1, fouls: 4, fg_made: 7, fg_attempted: 14, three_made: 3, three_attempted: 7, ft_made: 1, ft_attempted: 2 },
                923: { minutes_played: 30, points: 12, rebounds: 3, offensive_rebounds: 0, defensive_rebounds: 3, assists: 9, steals: 1, blocks: 0, turnovers: 3, fouls: 2, fg_made: 4, fg_attempted: 10, three_made: 2, three_attempted: 4, ft_made: 2, ft_attempted: 2 },
                924: { minutes_played: 34, points: 20, rebounds: 2, offensive_rebounds: 0, defensive_rebounds: 2, assists: 7, steals: 0, blocks: 0, turnovers: 4, fouls: 3, fg_made: 8, fg_attempted: 18, three_made: 2, three_attempted: 6, ft_made: 2, ft_attempted: 3 },
                925: { minutes_played: 31, points: 16, rebounds: 10, offensive_rebounds: 3, defensive_rebounds: 7, assists: 2, steals: 1, blocks: 1, turnovers: 2, fouls: 5, fg_made: 6, fg_attempted: 12, three_made: 1, three_attempted: 3, ft_made: 3, ft_attempted: 4 },
                926: { minutes_played: 0, points: 0, rebounds: 0, offensive_rebounds: 0, defensive_rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, fouls: 0, fg_made: 0, fg_attempted: 0, three_made: 0, three_attempted: 0, ft_made: 0, ft_attempted: 0 }
            }
        }
    },

    nextPlayerId: 1000,
    nextFoulId: 100,
    nextReservationId: 600,
    nextAttendanceId: 100
};

export function isMockEvent(eventId) {
    return USE_MOCK_EVENTS && store.details[eventId] != null;
}

export function getMockEvents() {
    return store.events.map(e => ({ ...e }));
}

export function getMockEventDetail(eventId) {
    const d = store.details[eventId];
    if (!d) return null;
    return {
        players: d.players.map(p => ({ ...p })),
        attendance: d.attendance.map(a => ({ ...a })),
        fouls: d.fouls.map(f => ({ ...f })),
        reservations: d.reservations.map(r => ({ ...r })),
        score: { ...d.score },
        stats: { ...d.stats },
        teams: d.teams.map(t => ({ ...t }))
    };
}

export function getMockPlayerStats(eventId, playerId) {
    const d = store.details[eventId];
    if (!d?.stats[playerId]) return null;
    return { ...d.stats[playerId] };
}

export function mockUpdateScore(eventId, home, away) {
    if (!store.details[eventId]) return;
    store.details[eventId].score = { home_score: home, away_score: away };
}

export function mockUpdatePlayerStatus(eventId, playerId, status) {
    const p = store.details[eventId]?.players.find(x => x.id === playerId);
    if (p) p.status = status;
}

export function mockSaveAttendance(eventId, playerId, status, note) {
    const d = store.details[eventId];
    if (!d) return;
    const existing = d.attendance.find(a => a.player_id === playerId);
    if (existing) {
        existing.status = status;
        existing.note = note;
    } else {
        d.attendance.push({ id: ++store.nextAttendanceId, player_id: playerId, event_id: eventId, status, note });
    }
}

export function mockSavePlayerStats(eventId, playerId, stats) {
    if (!store.details[eventId]) return;
    store.details[eventId].stats[playerId] = { ...stats };
}

export function mockRegisterPlayer(eventId, teamId, player) {
    const d = store.details[eventId];
    if (!d) return null;
    const id = ++store.nextPlayerId;
    d.players.push({ id, team_id: teamId, ...player, status: 'active' });
    d.attendance.push({ id: ++store.nextAttendanceId, player_id: id, event_id: eventId, status: 'present', note: '' });
    d.stats[id] = player.initialStats || {};
    return id;
}

export function mockRegisterFoul(eventId, foul) {
    const d = store.details[eventId];
    if (!d) return;
    d.fouls.push({ id: ++store.nextFoulId, event_id: eventId, ...foul });
}

export function mockApproveReservation(eventId, reservationId) {
    const d = store.details[eventId];
    if (!d) return;
    d.reservations = d.reservations.filter(r => r.id !== reservationId);
}

export function mockApproveReservationById(reservationId) {
    for (const eventId of Object.keys(store.details)) {
        const d = store.details[eventId];
        const before = d.reservations.length;
        d.reservations = d.reservations.filter(r => r.id !== reservationId);
        if (d.reservations.length < before) return true;
    }
    return false;
}

export function getMockPendingReservations() {
    const list = [];
    store.events.forEach(event => {
        const d = store.details[event.id];
        if (!d?.reservations) return;
        d.reservations.forEach(r => {
            list.push({
                ...r,
                event_id: event.id,
                event_organizer: event.organizer,
                event_sport: event.sport,
                event_date: event.event_date
            });
        });
    });
    return list;
}

export function getMockTeams(eventId) {
    return store.details[eventId]?.teams || [];
}
