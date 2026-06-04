import { getDb, save } from './database.js';

// === Helpers ===

function query(sql, params = []) {
    const db = getDb();
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
}

function queryOne(sql, params = []) {
    return query(sql, params)[0] ?? null;
}

function run(sql, params = []) {
    getDb().run(sql, params);
}

function lastId() {
    const stmt = getDb().prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const id = stmt.getAsObject().id;
    stmt.free();
    return id;
}

function generateToken() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// === Auth ===

export function login({ email, password }) {
    const user = queryOne(
        'SELECT id, name, email, role FROM users WHERE email = ? AND password_hash = ?',
        [email, password]
    );
    if (!user) throw new Error('Credenciales incorrectas');
    return { token: generateToken(), user };
}

export async function register({ name, email, password }) {
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) throw new Error('El email ya está registrado');
    run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, password, 'user']);
    const userId = lastId();
    const user = queryOne('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    await save();
    return { token: generateToken(), user };
}

// === Dashboard ===

export function getAdminStats() {
    const totalUsers    = queryOne("SELECT COUNT(*) as c FROM users WHERE role = 'user'").c;
    const totalEvents   = queryOne("SELECT COUNT(*) as c FROM events WHERE status = 'activo'").c;
    const totalTickets  = queryOne("SELECT COALESCE(SUM(ticket_count), 0) as c FROM reservations WHERE status = 'approved'").c;
    const monthlyRevenue = queryOne("SELECT COALESCE(SUM(total_price), 0) as c FROM reservations WHERE status = 'approved' AND created_at >= date('now', '-30 days')").c;
    return { totalUsers, totalEvents, totalTickets, monthlyRevenue };
}

// === Sports config ===

export function getSports() {
    return query('SELECT id, code, name, min_players, max_players FROM sports ORDER BY id');
}

// === Teams ===

export function getTeams() {
    // Une con sports para exponer los límites por deporte y marcar si el equipo
    // está completo (cumple el mínimo y no excede el máximo de jugadores).
    return query(`
        SELECT t.id, t.name, t.sport, COUNT(p.id) AS player_count,
               COALESCE(s.min_players, 1)   AS min_players,
               COALESCE(s.max_players, 100) AS max_players,
               CASE WHEN COUNT(p.id) >= COALESCE(s.min_players, 1)
                     AND COUNT(p.id) <= COALESCE(s.max_players, 100)
                    THEN 1 ELSE 0 END AS is_complete
        FROM teams t
        LEFT JOIN players p ON p.team_id = t.id
        LEFT JOIN sports s ON s.code = t.sport
        GROUP BY t.id
        ORDER BY t.name
    `);
}

// Lanza un error si el equipo no cumple el rango de jugadores de su deporte.
function assertTeamComplete(teamId) {
    const t = queryOne(`
        SELECT t.name, COUNT(p.id) AS player_count,
               COALESCE(s.min_players, 1)   AS min_players,
               COALESCE(s.max_players, 100) AS max_players
        FROM teams t
        LEFT JOIN players p ON p.team_id = t.id
        LEFT JOIN sports s ON s.code = t.sport
        WHERE t.id = ?
        GROUP BY t.id
    `, [teamId]);
    if (!t) throw new Error('Equipo no encontrado');
    if (t.player_count < t.min_players)
        throw new Error(`El equipo "${t.name}" no está completo: tiene ${t.player_count} jugador(es) y requiere al menos ${t.min_players}.`);
    if (t.player_count > t.max_players)
        throw new Error(`El equipo "${t.name}" excede el máximo de ${t.max_players} jugadores permitidos.`);
}

export async function createTeam({ name, sport }) {
    const existing = queryOne('SELECT id FROM teams WHERE name = ? AND sport = ?', [name, sport]);
    if (existing) throw new Error('Ya existe un equipo con ese nombre y deporte');
    run('INSERT INTO teams (name, sport) VALUES (?, ?)', [name, sport]);
    const id = lastId();
    await save();
    return { id, message: 'Equipo creado' };
}

export function getTeamPlayers(teamId) {
    return query(
        'SELECT id, team_id, name, jersey_number, position, is_starter, status FROM players WHERE team_id = ? ORDER BY jersey_number',
        [teamId]
    );
}

// === Events ===

export function getEvents() {
    return query(`
        SELECT e.id, e.name AS organizer, e.sport, e.event_date, e.location,
               e.available_tickets, e.total_tickets_capacity AS total_tickets,
               e.ticket_price, e.status, '' AS estado_partido,
               e.home_team_id, e.away_team_id, e.home_score, e.away_score,
               e.lat, e.lon, e.description,
               ht.name AS home_team_name, at.name AS away_team_name
        FROM events e
        LEFT JOIN teams ht ON e.home_team_id = ht.id
        LEFT JOIN teams at ON e.away_team_id = at.id
        ORDER BY e.created_at DESC
    `);
}

export function getEvent(id) {
    const event = queryOne(`
        SELECT e.id, e.name, e.name AS organizer, e.sport, e.event_date,
               e.start_time, e.end_time, e.location,
               e.available_tickets, e.total_tickets_capacity AS total_tickets,
               e.ticket_price, e.status, e.lat, e.lon, e.description,
               e.home_score, e.away_score,
               ht.name AS home_team_name, at.name AS away_team_name
        FROM events e
        LEFT JOIN teams ht ON e.home_team_id = ht.id
        LEFT JOIN teams at ON e.away_team_id = at.id
        WHERE e.id = ?
    `, [id]);

    if (!event) throw new Error('Evento no encontrado');

    // Estadísticas de equipo según deporte
    let estadisticas = null;
    if (event.sport === 'futbol') {
        const home = queryOne('SELECT * FROM soccer_team_stats WHERE event_id = ? AND team_id = (SELECT home_team_id FROM events WHERE id = ?)', [id, id]);
        const away = queryOne('SELECT * FROM soccer_team_stats WHERE event_id = ? AND team_id = (SELECT away_team_id FROM events WHERE id = ?)', [id, id]);
        if (home || away) estadisticas = { home, away };
    } else if (event.sport === 'beisbol') {
        const home = queryOne('SELECT * FROM baseball_team_stats WHERE event_id = ? AND team_id = (SELECT home_team_id FROM events WHERE id = ?)', [id, id]);
        const away = queryOne('SELECT * FROM baseball_team_stats WHERE event_id = ? AND team_id = (SELECT away_team_id FROM events WHERE id = ?)', [id, id]);
        if (home || away) estadisticas = { home, away };
    } else if (event.sport === 'basquetbol') {
        const home = queryOne('SELECT * FROM basketball_team_stats WHERE event_id = ? AND team_id = (SELECT home_team_id FROM events WHERE id = ?)', [id, id]);
        const away = queryOne('SELECT * FROM basketball_team_stats WHERE event_id = ? AND team_id = (SELECT away_team_id FROM events WHERE id = ?)', [id, id]);
        if (home || away) estadisticas = { home, away };
    }

    return { evento: event, estadisticas };
}

export async function createEvent(payload) {
    const {
        organizer, sport, description = '', event_date, start_time, end_time,
        location, total_tickets_capacity, ticket_price, home_team_id, away_team_id
    } = payload;

    if (!home_team_id || !away_team_id) throw new Error('Debes seleccionar ambos equipos');
    if (home_team_id === away_team_id) throw new Error('El equipo local y visitante deben ser diferentes');

    // Ambos equipos deben cumplir el mínimo/máximo de jugadores de su deporte.
    assertTeamComplete(home_team_id);
    assertTeamComplete(away_team_id);

    run(
        `INSERT INTO events (name, description, sport, event_date, start_time, end_time, location,
         total_tickets_capacity, available_tickets, ticket_price, status, home_team_id, away_team_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', ?, ?)`,
        [organizer, description, sport, event_date, start_time, end_time, location,
         total_tickets_capacity, total_tickets_capacity, ticket_price, home_team_id, away_team_id]
    );
    const eventId = lastId();
    await save();
    return { id: eventId, message: 'Evento creado exitosamente' };
}

function insertPlayerStats(sport, playerId, eventId, playerData) {
    if (sport === 'futbol') {
        const s = playerData.soccer_stats || {};
        run(
            `INSERT OR IGNORE INTO soccer_player_stats
             (player_id, event_id, minutes_played, goals, assists, shots, shots_on_target,
              passes, pass_accuracy, fouls_committed, fouls_drawn, yellow_cards, red_cards,
              offside, saves, goals_conceded)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [playerId, eventId,
             s.minutes_played||0, s.goals||0, s.assists||0, s.shots||0, s.shots_on_target||0,
             s.passes||0, s.pass_accuracy_pct||0, s.fouls_committed||0, s.fouls_drawn||0,
             s.yellow_cards||0, s.red_cards||0, s.offside||0, s.saves||0, s.goals_conceded||0]
        );
    } else if (sport === 'beisbol') {
        const s = playerData.baseball_stats || {};
        run(
            `INSERT OR IGNORE INTO baseball_player_stats
             (player_id, event_id, role, at_bats, hits, doubles, triples, home_runs, rbi, runs,
              walks, strikeouts, stolen_bases, innings_pitched, earned_runs, strikeouts_pitched,
              walks_pitched, hits_allowed)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [playerId, eventId, s.role||'batter',
             s.at_bats||0, s.hits||0, s.doubles||0, s.triples||0, s.home_runs||0,
             s.rbi||0, s.runs||0, s.walks||0, s.strikeouts||0, s.stolen_bases||0,
             s.innings_pitched||0, s.earned_runs||0, s.strikeouts_pitched||0,
             s.walks_pitched||0, s.hits_allowed||0]
        );
    } else if (sport === 'basquetbol') {
        const s = playerData.basketball_stats || {};
        run(
            `INSERT OR IGNORE INTO basketball_player_stats
             (player_id, event_id, minutes_played, points, rebounds, off_rebounds, def_rebounds,
              assists, steals, blocks, turnovers, fouls, fg_made, fg_attempted,
              three_made, three_attempted, ft_made, ft_attempted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [playerId, eventId,
             s.minutes_played||0, s.points||0, s.rebounds||0,
             s.offensive_rebounds||0, s.defensive_rebounds||0,
             s.assists||0, s.steals||0, s.blocks||0, s.turnovers||0, s.fouls||0,
             s.fg_made||0, s.fg_attempted||0, s.three_made||0, s.three_attempted||0,
             s.ft_made||0, s.ft_attempted||0]
        );
    }
}

export function getEventPlayers(eventId) {
    // Une los jugadores directamente a los dos equipos del evento (local y visitante),
    // incluyendo nombre del equipo e indicador is_home para agrupar en el roster.
    return query(
        `SELECT p.id, p.team_id, p.name, p.jersey_number, p.position, p.is_starter, p.status,
                t.name AS team_name,
                CASE WHEN e.home_team_id = p.team_id THEN 1 ELSE 0 END AS is_home
         FROM events e
         INNER JOIN players p ON p.team_id IN (e.home_team_id, e.away_team_id)
         INNER JOIN teams t ON t.id = p.team_id
         WHERE e.id = ?
         ORDER BY is_home DESC, p.jersey_number`,
        [eventId]
    );
}

export function getEventAttendance(eventId) {
    return query('SELECT player_id, status, note FROM attendance WHERE event_id = ?', [eventId]);
}

export function getEventFouls(eventId) {
    return query(
        'SELECT id, player_id, foul_type, description, minute FROM fouls WHERE event_id = ? ORDER BY created_at',
        [eventId]
    );
}

export function getEventTeams(eventId) {
    return query(
        `SELECT t.id, t.name,
                CASE WHEN e.home_team_id = t.id THEN 1 ELSE 0 END AS is_home
         FROM events e
         INNER JOIN teams t ON t.id IN (e.home_team_id, e.away_team_id)
         WHERE e.id = ?
         ORDER BY is_home DESC`,
        [eventId]
    );
}

export function getEventResult(eventId) {
    const ev = queryOne('SELECT home_score, away_score FROM events WHERE id = ?', [eventId]);
    if (!ev) throw new Error('Evento no encontrado');
    return ev;
}

export async function updateScore(eventId, { home_score, away_score }) {
    run('UPDATE events SET home_score = ?, away_score = ? WHERE id = ?', [home_score, away_score, eventId]);
    await save();
    return { message: 'Marcador actualizado' };
}

// === Players ===

export async function registerPlayer(teamId, sport, payload) {
    const { name, jersey_number, position, is_starter } = payload;

    // Validar el máximo de jugadores permitido para el deporte del equipo.
    const team = queryOne('SELECT sport FROM teams WHERE id = ?', [teamId]);
    if (!team) throw new Error('Equipo no encontrado');
    const limits = queryOne('SELECT max_players FROM sports WHERE code = ?', [team.sport]);
    const maxPlayers = limits?.max_players ?? 100;
    const current = queryOne('SELECT COUNT(*) AS c FROM players WHERE team_id = ?', [teamId]).c;
    if (current >= maxPlayers)
        throw new Error(`Este equipo ya alcanzó el máximo de ${maxPlayers} jugadores permitidos para su deporte.`);

    // Find which event this team belongs to
    const event = queryOne(
        'SELECT id, sport FROM events WHERE home_team_id = ? OR away_team_id = ?',
        [teamId, teamId]
    );

    run(
        'INSERT INTO players (team_id, name, jersey_number, position, is_starter) VALUES (?, ?, ?, ?, ?)',
        [teamId, name, jersey_number, position, is_starter ? 1 : 0]
    );
    const playerId = lastId();

    if (event) {
        insertPlayerStats(sport || event.sport, playerId, event.id, payload);
    }

    await save();
    return { id: playerId, message: 'Jugador registrado' };
}

export async function updatePlayerStatus(playerId, { status }) {
    run('UPDATE players SET status = ? WHERE id = ?', [status, playerId]);
    await save();
    return { message: 'Estado actualizado' };
}

// === Attendance ===

export async function recordAttendance(playerId, { event_id, status, note }) {
    run(
        `INSERT INTO attendance (player_id, event_id, status, note) VALUES (?, ?, ?, ?)
         ON CONFLICT(player_id, event_id) DO UPDATE SET status = excluded.status, note = excluded.note`,
        [playerId, event_id, status, note || '']
    );
    await save();
    return { message: 'Asistencia registrada' };
}

// === Stats ===

export function getPlayerStats(playerId, sport, eventId) {
    let row = null;

    if (sport === 'futbol') {
        row = queryOne(
            'SELECT * FROM soccer_player_stats WHERE player_id = ? AND event_id = ?',
            [playerId, eventId]
        );
        if (row) {
            row.pass_accuracy_pct = row.pass_accuracy;
            delete row.pass_accuracy;
            delete row.id; delete row.player_id; delete row.event_id;
        }
    } else if (sport === 'beisbol') {
        row = queryOne(
            'SELECT * FROM baseball_player_stats WHERE player_id = ? AND event_id = ?',
            [playerId, eventId]
        );
        if (row) { delete row.id; delete row.player_id; delete row.event_id; }
    } else if (sport === 'basquetbol') {
        row = queryOne(
            'SELECT * FROM basketball_player_stats WHERE player_id = ? AND event_id = ?',
            [playerId, eventId]
        );
        if (row) {
            row.offensive_rebounds = row.off_rebounds;
            row.defensive_rebounds = row.def_rebounds;
            delete row.off_rebounds; delete row.def_rebounds;
            delete row.id; delete row.player_id; delete row.event_id;
        }
    } else {
        row = queryOne(
            'SELECT * FROM other_sports_player_stats WHERE player_id = ? AND event_id = ?',
            [playerId, eventId]
        );
        if (row) { delete row.id; delete row.player_id; delete row.event_id; }
    }

    return row;
}

export async function updatePlayerStats(playerId, sport, eventId, body) {
    if (sport === 'futbol') {
        const s = body;
        const passAcc = s.pass_accuracy_pct ?? s.pass_accuracy ?? 0;
        run(
            `INSERT INTO soccer_player_stats
             (player_id, event_id, minutes_played, goals, assists, shots, shots_on_target,
              passes, pass_accuracy, fouls_committed, fouls_drawn, yellow_cards, red_cards,
              offside, saves, goals_conceded)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(player_id, event_id) DO UPDATE SET
             minutes_played=excluded.minutes_played, goals=excluded.goals, assists=excluded.assists,
             shots=excluded.shots, shots_on_target=excluded.shots_on_target, passes=excluded.passes,
             pass_accuracy=excluded.pass_accuracy, fouls_committed=excluded.fouls_committed,
             fouls_drawn=excluded.fouls_drawn, yellow_cards=excluded.yellow_cards,
             red_cards=excluded.red_cards, offside=excluded.offside,
             saves=excluded.saves, goals_conceded=excluded.goals_conceded`,
            [playerId, eventId,
             s.minutes_played||0, s.goals||0, s.assists||0, s.shots||0, s.shots_on_target||0,
             s.passes||0, passAcc, s.fouls_committed||0, s.fouls_drawn||0,
             s.yellow_cards||0, s.red_cards||0, s.offside||0, s.saves||0, s.goals_conceded||0]
        );
    } else if (sport === 'beisbol') {
        const s = body;
        run(
            `INSERT INTO baseball_player_stats
             (player_id, event_id, role, at_bats, hits, doubles, triples, home_runs, rbi, runs,
              walks, strikeouts, stolen_bases, innings_pitched, earned_runs, strikeouts_pitched,
              walks_pitched, hits_allowed)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(player_id, event_id) DO UPDATE SET
             role=excluded.role, at_bats=excluded.at_bats, hits=excluded.hits,
             doubles=excluded.doubles, triples=excluded.triples, home_runs=excluded.home_runs,
             rbi=excluded.rbi, runs=excluded.runs, walks=excluded.walks,
             strikeouts=excluded.strikeouts, stolen_bases=excluded.stolen_bases,
             innings_pitched=excluded.innings_pitched, earned_runs=excluded.earned_runs,
             strikeouts_pitched=excluded.strikeouts_pitched, walks_pitched=excluded.walks_pitched,
             hits_allowed=excluded.hits_allowed`,
            [playerId, eventId, s.role||'batter',
             s.at_bats||0, s.hits||0, s.doubles||0, s.triples||0, s.home_runs||0,
             s.rbi||0, s.runs||0, s.walks||0, s.strikeouts||0, s.stolen_bases||0,
             s.innings_pitched||0, s.earned_runs||0, s.strikeouts_pitched||0,
             s.walks_pitched||0, s.hits_allowed||0]
        );
    } else if (sport === 'basquetbol') {
        const s = body;
        const offReb = s.offensive_rebounds ?? s.off_rebounds ?? 0;
        const defReb = s.defensive_rebounds ?? s.def_rebounds ?? 0;
        run(
            `INSERT INTO basketball_player_stats
             (player_id, event_id, minutes_played, points, rebounds, off_rebounds, def_rebounds,
              assists, steals, blocks, turnovers, fouls, fg_made, fg_attempted,
              three_made, three_attempted, ft_made, ft_attempted)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(player_id, event_id) DO UPDATE SET
             minutes_played=excluded.minutes_played, points=excluded.points,
             rebounds=excluded.rebounds, off_rebounds=excluded.off_rebounds,
             def_rebounds=excluded.def_rebounds, assists=excluded.assists,
             steals=excluded.steals, blocks=excluded.blocks, turnovers=excluded.turnovers,
             fouls=excluded.fouls, fg_made=excluded.fg_made, fg_attempted=excluded.fg_attempted,
             three_made=excluded.three_made, three_attempted=excluded.three_attempted,
             ft_made=excluded.ft_made, ft_attempted=excluded.ft_attempted`,
            [playerId, eventId,
             s.minutes_played||0, s.points||0, s.rebounds||0, offReb, defReb,
             s.assists||0, s.steals||0, s.blocks||0, s.turnovers||0, s.fouls||0,
             s.fg_made||0, s.fg_attempted||0, s.three_made||0, s.three_attempted||0,
             s.ft_made||0, s.ft_attempted||0]
        );
    }

    await save();
    return { message: 'Estadísticas actualizadas' };
}

// === Team stats ===

const TEAM_STATS_TABLES = {
    futbol:     { table: 'soccer_team_stats',     cols: ['possession', 'total_shots', 'shots_on_target', 'corners', 'fouls', 'yellow_cards', 'red_cards', 'offsides'] },
    beisbol:    { table: 'baseball_team_stats',   cols: ['runs', 'hits', 'errors', 'left_on_base'] },
    basquetbol: { table: 'basketball_team_stats', cols: ['points', 'rebounds', 'assists', 'turnovers', 'fouls', 'fg_pct', 'three_pct'] }
};

export function getTeamStats(eventId, sport) {
    const cfg = TEAM_STATS_TABLES[sport];
    const ev = queryOne('SELECT home_team_id, away_team_id FROM events WHERE id = ?', [eventId]);
    if (!ev) throw new Error('Evento no encontrado');
    if (!cfg) return { home: null, away: null, home_team_id: ev.home_team_id, away_team_id: ev.away_team_id };

    const home = queryOne(`SELECT * FROM ${cfg.table} WHERE event_id = ? AND team_id = ?`, [eventId, ev.home_team_id]);
    const away = queryOne(`SELECT * FROM ${cfg.table} WHERE event_id = ? AND team_id = ?`, [eventId, ev.away_team_id]);
    return { home, away, home_team_id: ev.home_team_id, away_team_id: ev.away_team_id };
}

export async function updateTeamStats(eventId, teamId, sport, body) {
    const cfg = TEAM_STATS_TABLES[sport];
    if (!cfg) throw new Error('Este deporte no maneja estadísticas de equipo');

    const cols = cfg.cols;
    const placeholders = cols.map(() => '?').join(', ');
    const updates = cols.map(c => `${c}=excluded.${c}`).join(', ');
    const values = cols.map(c => body[c] ?? 0);

    run(
        `INSERT INTO ${cfg.table} (team_id, event_id, ${cols.join(', ')})
         VALUES (?, ?, ${placeholders})
         ON CONFLICT(team_id, event_id) DO UPDATE SET ${updates}`,
        [teamId, eventId, ...values]
    );
    await save();
    return { message: 'Estadísticas de equipo actualizadas' };
}

// === Fouls ===

export async function registerFoul(playerId, { event_id, foul_type, description, minute }) {
    run(
        'INSERT INTO fouls (player_id, event_id, foul_type, description, minute) VALUES (?, ?, ?, ?, ?)',
        [playerId, event_id, foul_type, description || '', minute || 0]
    );
    await save();
    return { message: 'Infracción registrada' };
}

// === User reservations ===

export function getUserReservations(userId) {
    if (!userId) return [];
    return query(
        `SELECT r.id, e.sport AS evento, r.status AS estado,
                e.name AS evento_nombre, e.event_date AS evento_fecha,
                e.location AS evento_ubicacion, r.ticket_count AS cantidad,
                r.total_price AS total, r.payment_reference AS referencia_pago,
                r.event_id
         FROM reservations r
         INNER JOIN events e ON r.event_id = e.id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
    );
}

export async function createReservation(userId, { event_id, ticket_count, payment_reference }) {
    if (!userId) throw new Error('Debes iniciar sesión para reservar');

    const event = queryOne('SELECT id, available_tickets, ticket_price FROM events WHERE id = ?', [event_id]);
    if (!event) throw new Error('Evento no encontrado');
    if (event.available_tickets < ticket_count) throw new Error('No hay suficientes tickets disponibles');

    const total = event.ticket_price * ticket_count;

    run(
        `INSERT INTO reservations (user_id, event_id, ticket_count, total_price, payment_reference, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [userId, event_id, ticket_count, total, payment_reference || '']
    );

    // Descontar tickets disponibles
    run('UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?', [ticket_count, event_id]);

    await save();
    return { message: 'Reservación creada exitosamente', total };
}

// === Admin reservations ===

export function getPendingReservations() {
    return query(
        `SELECT r.id, u.name AS usuario, e.name AS evento, r.ticket_count AS cantidad,
                r.total_price AS total, r.payment_reference AS referencia_pago,
                r.status AS estado, r.event_id,
                e.name AS event_organizer, e.sport AS event_sport, e.event_date
         FROM reservations r
         INNER JOIN users u ON r.user_id = u.id
         INNER JOIN events e ON r.event_id = e.id
         WHERE r.status = 'pending'
         ORDER BY r.created_at DESC`
    );
}

export async function approveReservation(reservationId) {
    const res = queryOne('SELECT * FROM reservations WHERE id = ?', [reservationId]);
    if (!res) throw new Error('Reservación no encontrada');
    run("UPDATE reservations SET status = 'approved' WHERE id = ?", [reservationId]);
    run(
        'UPDATE events SET available_tickets = available_tickets - ? WHERE id = ? AND available_tickets >= ?',
        [res.ticket_count, res.event_id, res.ticket_count]
    );
    await save();
    return { message: 'Reservación aprobada' };
}



export function getEventsList(startDate, endDate, sport, limit = 100, offset = 0) {
    const { and, params } = buildFilters({ startDate, endDate, sport, alias: 'e' });
    params.push(limit, offset);
    return query(`
        SELECT e.id, e.name AS organizer, e.sport, e.event_date, e.location,
               e.available_tickets, e.total_tickets_capacity, e.ticket_price,
               e.status, e.home_score, e.away_score,
               ht.name AS home_team_name, at.name AS away_team_name
        FROM events e
        LEFT JOIN teams ht ON e.home_team_id = ht.id
        LEFT JOIN teams at ON e.away_team_id = at.id
        WHERE 1=1 ${and}
        ORDER BY e.event_date ASC, e.id ASC
        LIMIT ? OFFSET ?
    `, params);
}

// === Dashboard stats ===

// Victorias por equipo — reemplaza match_results por scores en events, usa parámetros ?
export function getStatsByTeam(startDate, endDate, sport) {
    return query(`
        SELECT t.id AS win_team_id, t.name, COUNT(*) AS wins
        FROM (
            SELECT
                CASE
                    WHEN away_score > home_score THEN away_team_id
                    WHEN away_score < home_score THEN home_team_id
                    ELSE NULL
                END AS win_team_id
            FROM events
            WHERE event_date >= ? AND event_date <= ? AND sport = ?
        ) AS results
        INNER JOIN teams t ON results.win_team_id = t.id
        WHERE results.win_team_id IS NOT NULL
        GROUP BY t.id, t.name
        ORDER BY wins DESC
    `, [startDate, endDate, sport]);
}


// Tabla de posiciones — reemplaza match_results por events, sport se pasa 3 veces como ?
export function getRankingTeams(sport) {
    return query(`
        WITH partidos_equipo AS (
            SELECT home_team_id AS team_id, home_score AS gf, away_score AS gc,
                CASE WHEN home_score > away_score THEN 'win'
                     WHEN home_score = away_score THEN 'draw' ELSE 'loss' END AS resultado
            FROM events WHERE sport = ?
            UNION ALL
            SELECT away_team_id AS team_id, away_score AS gf, home_score AS gc,
                CASE WHEN away_score > home_score THEN 'win'
                     WHEN away_score = home_score THEN 'draw' ELSE 'loss' END AS resultado
            FROM events WHERE sport = ?
        ),
        estadisticas AS (
            SELECT t.name AS club,
                COUNT(*)                                                             AS pj,
                SUM(CASE WHEN resultado = 'win'  THEN 1 ELSE 0 END)                 AS g,
                SUM(CASE WHEN resultado = 'draw' THEN 1 ELSE 0 END)                 AS e,
                SUM(CASE WHEN resultado = 'loss' THEN 1 ELSE 0 END)                 AS p,
                SUM(gf) AS gf, SUM(gc) AS gc, SUM(gf) - SUM(gc) AS dg,
                SUM(CASE WHEN ? = 'futbol'
                    THEN CASE WHEN resultado = 'win' THEN 3 WHEN resultado = 'draw' THEN 1 ELSE 0 END
                    ELSE CASE WHEN resultado = 'win' THEN 2 WHEN resultado = 'draw' THEN 1 ELSE 0 END
                END) AS pts
            FROM partidos_equipo pe
            JOIN teams t ON pe.team_id = t.id
            GROUP BY t.id, t.name
        )
        SELECT club, pj, g, e, p, gf, gc, dg, pts
        FROM estadisticas
        ORDER BY pts DESC, dg DESC, gf DESC
    `, [sport, sport, sport]);
}


// Construye cláusulas WHERE opcionales (fecha, deporte, evento) para queries sobre events.
// Cada filtro se omite si su valor es vacío/null, de modo que sin filtros devuelve todos los eventos.
function buildFilters({ startDate, endDate, sport, eventId, alias = '' }) {
    const col = alias ? `${alias}.` : '';
    const clauses = [];
    const params = [];
    if (startDate) { clauses.push(`${col}event_date >= ?`); params.push(startDate); }
    if (endDate)   { clauses.push(`${col}event_date <= ?`); params.push(endDate); }
    if (sport)     { clauses.push(`${col}sport = ?`);       params.push(sport); }
    if (eventId)   { clauses.push(`${col}id = ?`);          params.push(eventId); }
    return { and: clauses.length ? 'AND ' + clauses.join(' AND ') : '', params };
}

export function getIndicatorsGestion(startDate, endDate, sport, eventId) {
    const { and, params } = buildFilters({ startDate, endDate, sport, eventId });
    return queryOne(`
        SELECT
            COALESCE(SUM(total_tickets_capacity - available_tickets), 0) AS total_asistentes,
            ROUND(SUM(total_tickets_capacity - available_tickets) * 100.0
                / NULLIF(SUM(total_tickets_capacity), 0), 2)              AS porcentaje_ocupacion,
            COALESCE(SUM((total_tickets_capacity - available_tickets) * ticket_price), 0) AS ingresos_totales,
            ROUND(SUM((total_tickets_capacity - available_tickets) * ticket_price) * 1.0
                / NULLIF(COUNT(*), 0), 2)                                 AS promedio_ingreso_por_evento
        FROM events
        WHERE 1=1 ${and}
    `, params);
}

export function getCantUsers() {
    return queryOne(`SELECT COUNT(*) AS cantidad_usuarios FROM users WHERE role = 'user'`);
}

export function getFunnelData(startDate, endDate, sport, eventId) {
    const cap = buildFilters({ startDate, endDate, sport, eventId });
    const capacidad = queryOne(
        `SELECT COALESCE(SUM(total_tickets_capacity), 0) AS v
         FROM events WHERE 1=1 ${cap.and}`,
        cap.params
    )?.v || 0;

    // Para reservaciones: fecha/deporte sobre el evento (alias e), pero eventId sobre r.event_id
    const rClauses = [];
    const rParams = [];
    if (startDate) { rClauses.push('e.event_date >= ?'); rParams.push(startDate); }
    if (endDate)   { rClauses.push('e.event_date <= ?'); rParams.push(endDate); }
    if (sport)     { rClauses.push('e.sport = ?');       rParams.push(sport); }
    if (eventId)   { rClauses.push('r.event_id = ?');    rParams.push(eventId); }
    const rAnd = rClauses.length ? 'AND ' + rClauses.join(' AND ') : '';

    const reservaciones = queryOne(
        `SELECT COALESCE(SUM(r.ticket_count), 0) AS v
         FROM reservations r INNER JOIN events e ON r.event_id = e.id
         WHERE 1=1 ${rAnd}`,
        rParams
    )?.v || 0;

    const confirmados = queryOne(
        `SELECT COALESCE(SUM(r.ticket_count), 0) AS v
         FROM reservations r INNER JOIN events e ON r.event_id = e.id
         WHERE r.status = 'approved' ${rAnd}`,
        rParams
    )?.v || 0;

    return { capacidad, reservaciones, confirmados };
}

export function getEventsHistory(startDate, endDate, sport, eventId) {
    const { and, params } = buildFilters({ startDate, endDate, sport, eventId, alias: 'a' });
    return query(`
        SELECT a.id, a.name AS evento, a.event_date, a.sport, b.ticket_count, b.status
        FROM events a
        INNER JOIN reservations b ON a.id = b.event_id
        WHERE b.status = 'approved' ${and}
        ORDER BY a.event_date ASC
    `, params);
}

// Tickets vendidos agrupados por día (sumando todos los eventos de esa fecha)
export function getTicketsByDay(startDate, endDate, sport, eventId) {
    const { and, params } = buildFilters({ startDate, endDate, sport, eventId, alias: 'a' });
    return query(`
        SELECT a.event_date, SUM(b.ticket_count) AS ticket_count
        FROM events a
        INNER JOIN reservations b ON a.id = b.event_id
        WHERE b.status = 'approved' ${and}
        GROUP BY a.event_date
        ORDER BY a.event_date ASC
    `, params);
}
