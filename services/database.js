import { saveToFile } from './fileStorage.js';

let _db = null;

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    min_players INTEGER NOT NULL DEFAULT 1,
    max_players INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sport TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT DEFAULT '',
    sport TEXT,
    event_date TEXT,
    start_time TEXT,
    end_time TEXT,
    location TEXT NOT NULL,
    lat REAL DEFAULT 0,
    lon REAL DEFAULT 0,
    total_tickets_capacity INTEGER NOT NULL DEFAULT 0,
    available_tickets INTEGER NOT NULL DEFAULT 0,
    ticket_price REAL NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'activo',
    home_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    jersey_number INTEGER DEFAULT 0,
    position TEXT,
    is_starter INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS soccer_player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    minutes_played INTEGER DEFAULT 0,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    pass_accuracy INTEGER DEFAULT 0,
    fouls_committed INTEGER DEFAULT 0,
    fouls_drawn INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    offside INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    goals_conceded INTEGER DEFAULT 0,
    UNIQUE(player_id, event_id)
);

CREATE TABLE IF NOT EXISTS baseball_player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'batter',
    at_bats INTEGER DEFAULT 0,
    hits INTEGER DEFAULT 0,
    doubles INTEGER DEFAULT 0,
    triples INTEGER DEFAULT 0,
    home_runs INTEGER DEFAULT 0,
    rbi INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    walks INTEGER DEFAULT 0,
    strikeouts INTEGER DEFAULT 0,
    stolen_bases INTEGER DEFAULT 0,
    innings_pitched REAL DEFAULT 0,
    earned_runs INTEGER DEFAULT 0,
    strikeouts_pitched INTEGER DEFAULT 0,
    walks_pitched INTEGER DEFAULT 0,
    hits_allowed INTEGER DEFAULT 0,
    UNIQUE(player_id, event_id)
);

CREATE TABLE IF NOT EXISTS basketball_player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    minutes_played INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    off_rebounds INTEGER DEFAULT 0,
    def_rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    steals INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    fg_made INTEGER DEFAULT 0,
    fg_attempted INTEGER DEFAULT 0,
    three_made INTEGER DEFAULT 0,
    three_attempted INTEGER DEFAULT 0,
    ft_made INTEGER DEFAULT 0,
    ft_attempted INTEGER DEFAULT 0,
    UNIQUE(player_id, event_id)
);

CREATE TABLE IF NOT EXISTS other_sports_player_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    score REAL DEFAULT 0,
    score_unit TEXT DEFAULT 'points',
    rank INTEGER DEFAULT 0,
    penalties INTEGER DEFAULT 0,
    extra_data TEXT DEFAULT '{}',
    UNIQUE(player_id, event_id)
);

CREATE TABLE IF NOT EXISTS soccer_team_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    possession INTEGER DEFAULT 0,
    total_shots INTEGER DEFAULT 0,
    shots_on_target INTEGER DEFAULT 0,
    corners INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    yellow_cards INTEGER DEFAULT 0,
    red_cards INTEGER DEFAULT 0,
    offsides INTEGER DEFAULT 0,
    UNIQUE(team_id, event_id)
);

CREATE TABLE IF NOT EXISTS baseball_team_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    runs INTEGER DEFAULT 0,
    hits INTEGER DEFAULT 0,
    errors INTEGER DEFAULT 0,
    left_on_base INTEGER DEFAULT 0,
    UNIQUE(team_id, event_id)
);

CREATE TABLE IF NOT EXISTS basketball_team_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    turnovers INTEGER DEFAULT 0,
    fouls INTEGER DEFAULT 0,
    fg_pct INTEGER DEFAULT 0,
    three_pct INTEGER DEFAULT 0,
    UNIQUE(team_id, event_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'present',
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(player_id, event_id)
);

CREATE TABLE IF NOT EXISTS fouls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    foul_type TEXT NOT NULL,
    description TEXT,
    minute INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_count INTEGER NOT NULL DEFAULT 1,
    total_price REAL NOT NULL DEFAULT 0,
    payment_reference TEXT,
    payment_date TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

// Parámetros por deporte (mínimo/máximo de jugadores por equipo).
// La tabla sports es reutilizable para otras configuraciones futuras.
const SPORTS_SEED = [
    ['futbol',     'Fútbol',     11, 23],
    ['beisbol',    'Béisbol',     9, 25],
    ['basquetbol', 'Básquetbol',  5, 15],
    ['otro',       'Otro',        1, 50]
];

// Se ejecuta en cada arranque con INSERT OR IGNORE: garantiza que la tabla
// sports exista poblada incluso en bases de datos creadas antes de esta función,
// sin sobrescribir valores que el admin pudiera haber ajustado.
function seedSports() {
    SPORTS_SEED.forEach(([code, name, min, max]) => {
        _db.run(
            `INSERT OR IGNORE INTO sports (code, name, min_players, max_players) VALUES (?, ?, ?, ?)`,
            [code, name, min, max]
        );
    });
}

function seedDatabase() {
    _db.run(
        `INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
        ['Administrador', 'admin@demo.com', 'admin123', 'admin']
    );
}

export async function initDatabase(fileData, isNew) {
    const SQL = await window.initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.10.3/dist/${file}`
    });

    _db = fileData && fileData.length > 0
        ? new SQL.Database(fileData)
        : new SQL.Database();

    _db.run('PRAGMA foreign_keys = ON;');
    _db.run(SCHEMA);
    seedSports();

    if (isNew) {
        seedDatabase();
        await save();
    }
}

export function getDb() {
    if (!_db) throw new Error('Base de datos no inicializada');
    return _db;
}

export async function save() {
    await saveToFile(_db);
}
