export const SPORT_LABELS = {
    futbol: 'Fútbol',
    beisbol: 'Béisbol',
    basquetbol: 'Básquetbol',
    otro: 'Otro'
};

export const ATTENDANCE_STATUSES = [
    { value: 'present', label: 'Presente' },
    { value: 'absent', label: 'Ausente' },
    { value: 'late', label: 'Tarde' },
    { value: 'excused', label: 'Justificado' }
];

export const PLAYER_STATUSES = [
    { value: 'active', label: 'Activo' },
    { value: 'injured', label: 'Lesionado' },
    { value: 'suspended', label: 'Suspendido' }
];

export const PLAYER_POSITIONS = {
    futbol: [
        { value: 'GK', label: 'Portero (GK)' },
        { value: 'DF', label: 'Defensa (DF)' },
        { value: 'MF', label: 'Mediocampo (MF)' },
        { value: 'FW', label: 'Delantero (FW)' }
    ],
    beisbol: [
        { value: 'P', label: 'Pitcher (P)' },
        { value: 'C', label: 'Catcher (C)' },
        { value: '1B', label: 'Primera base (1B)' },
        { value: '2B', label: 'Segunda base (2B)' },
        { value: '3B', label: 'Tercera base (3B)' },
        { value: 'SS', label: 'Shortstop (SS)' },
        { value: 'OF', label: 'Outfield (OF)' },
        { value: 'DH', label: 'Designated hitter (DH)' }
    ],
    basquetbol: [
        { value: 'PG', label: 'Base (PG)' },
        { value: 'SG', label: 'Escolta (SG)' },
        { value: 'SF', label: 'Alero (SF)' },
        { value: 'PF', label: 'Ala-pívot (PF)' },
        { value: 'C', label: 'Pívot (C)' }
    ],
    otro: [
        { value: 'A', label: 'Participante A' },
        { value: 'B', label: 'Participante B' }
    ]
};

export const BASEBALL_ROLES = [
    { value: 'batter', label: 'Bateador' },
    { value: 'pitcher', label: 'Lanzador' }
];

export const FOUL_TYPES = {
    futbol: [
        { value: 'yellow_card', label: 'Tarjeta amarilla' },
        { value: 'red_card', label: 'Tarjeta roja' },
        { value: 'foul', label: 'Falta' }
    ],
    beisbol: [
        { value: 'balk', label: 'Balk' },
        { value: 'interference', label: 'Interferencia' },
        { value: 'ejection', label: 'Expulsión' }
    ],
    basquetbol: [
        { value: 'personal', label: 'Personal' },
        { value: 'technical', label: 'Técnica' },
        { value: 'flagrant', label: 'Flagrante' }
    ],
    otro: [
        { value: 'penalty', label: 'Penalización' },
        { value: 'warning', label: 'Advertencia' }
    ]
};

const STAT_FIELDS_BASE = {
    futbol: [
        { key: 'minutes_played', label: 'Minutos jugados', min: 0, max: 120, group: 'general' },
        { key: 'goals', label: 'Goles', min: 0, max: 20, group: 'ataque' },
        { key: 'assists', label: 'Asistencias', min: 0, max: 20, group: 'ataque' },
        { key: 'shots', label: 'Tiros', min: 0, max: 50, group: 'ataque' },
        { key: 'shots_on_target', label: 'Tiros a puerta', min: 0, max: 50, group: 'ataque' },
        { key: 'passes', label: 'Pases', min: 0, max: 200, group: 'pases' },
        { key: 'pass_accuracy_pct', label: 'Precisión de pases (%)', min: 0, max: 100, group: 'pases' },
        { key: 'fouls_committed', label: 'Faltas cometidas', min: 0, max: 20, group: 'disciplina' },
        { key: 'fouls_drawn', label: 'Faltas recibidas', min: 0, max: 20, group: 'disciplina' },
        { key: 'yellow_cards', label: 'Tarjetas amarillas', min: 0, max: 2, group: 'disciplina' },
        { key: 'red_cards', label: 'Tarjetas rojas', min: 0, max: 1, group: 'disciplina' },
        { key: 'offside', label: 'Fuera de juego', min: 0, max: 20, group: 'disciplina' },
        { key: 'saves', label: 'Atajadas', min: 0, max: 30, group: 'portero', positions: ['GK'] },
        { key: 'goals_conceded', label: 'Goles recibidos', min: 0, max: 20, group: 'portero', positions: ['GK'] }
    ],
    beisbol: [
        { key: 'role', label: 'Rol en el partido', type: 'select', options: ['batter', 'pitcher'], optionLabels: BASEBALL_ROLES, group: 'rol' },
        { key: 'at_bats', label: 'Turnos al bate', min: 0, max: 10, group: 'bateo', roles: ['batter'] },
        { key: 'hits', label: 'Hits', min: 0, max: 10, group: 'bateo', roles: ['batter'] },
        { key: 'doubles', label: 'Dobles', min: 0, max: 5, group: 'bateo', roles: ['batter'] },
        { key: 'triples', label: 'Triples', min: 0, max: 3, group: 'bateo', roles: ['batter'] },
        { key: 'home_runs', label: 'Home runs', min: 0, max: 5, group: 'bateo', roles: ['batter'] },
        { key: 'rbi', label: 'RBI', min: 0, max: 15, group: 'bateo', roles: ['batter'] },
        { key: 'runs', label: 'Carreras anotadas', min: 0, max: 10, group: 'bateo', roles: ['batter'] },
        { key: 'walks', label: 'Bases por bolas (bateo)', min: 0, max: 10, group: 'bateo', roles: ['batter'] },
        { key: 'strikeouts', label: 'Ponches (bateo)', min: 0, max: 10, group: 'bateo', roles: ['batter'] },
        { key: 'stolen_bases', label: 'Bases robadas', min: 0, max: 5, group: 'bateo', roles: ['batter'] },
        { key: 'innings_pitched', label: 'Entradas lanzadas', type: 'float', min: 0, max: 9, group: 'lanzamiento', roles: ['pitcher'] },
        { key: 'earned_runs', label: 'Carreras limpias', min: 0, max: 20, group: 'lanzamiento', roles: ['pitcher'] },
        { key: 'strikeouts_pitched', label: 'Ponches (lanzamiento)', min: 0, max: 20, group: 'lanzamiento', roles: ['pitcher'] },
        { key: 'walks_pitched', label: 'Bases por bolas (lanzamiento)', min: 0, max: 15, group: 'lanzamiento', roles: ['pitcher'] },
        { key: 'hits_allowed', label: 'Hits permitidos', min: 0, max: 20, group: 'lanzamiento', roles: ['pitcher'] }
    ],
    basquetbol: [
        { key: 'minutes_played', label: 'Minutos', min: 0, max: 48, group: 'general' },
        { key: 'points', label: 'Puntos', min: 0, max: 80, group: 'anotacion' },
        { key: 'rebounds', label: 'Rebotes totales', min: 0, max: 30, group: 'rebotes' },
        { key: 'offensive_rebounds', label: 'Rebotes ofensivos', min: 0, max: 20, group: 'rebotes' },
        { key: 'defensive_rebounds', label: 'Rebotes defensivos', min: 0, max: 20, group: 'rebotes' },
        { key: 'assists', label: 'Asistencias', min: 0, max: 30, group: 'general' },
        { key: 'steals', label: 'Robos', min: 0, max: 15, group: 'general' },
        { key: 'blocks', label: 'Bloqueos', min: 0, max: 15, group: 'general' },
        { key: 'turnovers', label: 'Pérdidas', min: 0, max: 15, group: 'general' },
        { key: 'fouls', label: 'Faltas personales', min: 0, max: 6, group: 'disciplina' },
        { key: 'fg_made', label: 'Tiros de campo anotados', min: 0, max: 30, group: 'tiros' },
        { key: 'fg_attempted', label: 'Tiros de campo intentados', min: 0, max: 40, group: 'tiros' },
        { key: 'three_made', label: 'Tripletes anotados', min: 0, max: 20, group: 'tiros' },
        { key: 'three_attempted', label: 'Tripletes intentados', min: 0, max: 25, group: 'tiros' },
        { key: 'ft_made', label: 'Tiros libres anotados', min: 0, max: 20, group: 'tiros' },
        { key: 'ft_attempted', label: 'Tiros libres intentados', min: 0, max: 25, group: 'tiros' }
    ],
    otro: [
        { key: 'score', label: 'Puntuación', type: 'float', min: 0, max: 9999, group: 'general' },
        { key: 'score_unit', label: 'Unidad', type: 'select', options: ['pts', 'time', 'rank'], optionLabels: [
            { value: 'pts', label: 'Puntos' },
            { value: 'time', label: 'Tiempo' },
            { value: 'rank', label: 'Posición' }
        ], group: 'general' },
        { key: 'rank', label: 'Posición final', min: 1, max: 100, group: 'general' },
        { key: 'penalties', label: 'Penalizaciones', min: 0, max: 50, group: 'general' }
    ]
};

const STAT_GROUP_LABELS = {
    general: 'General',
    ataque: 'Ataque',
    pases: 'Pases',
    disciplina: 'Disciplina',
    portero: 'Portero',
    rol: 'Rol',
    bateo: 'Bateo',
    lanzamiento: 'Lanzamiento',
    anotacion: 'Anotación',
    rebotes: 'Rebotes',
    tiros: 'Tiros de campo'
};

export function getSportLabel(sport) {
    return SPORT_LABELS[sport] || sport;
}

export function getPlayerPositions(sport) {
    return PLAYER_POSITIONS[sport] || PLAYER_POSITIONS.otro;
}

export function getFoulTypes(sport) {
    return FOUL_TYPES[sport] || FOUL_TYPES.otro;
}

export function getFoulTypeLabel(sport, value) {
    const found = getFoulTypes(sport).find(f => f.value === value);
    return found?.label || value;
}

export function getPlayerStatusLabel(value) {
    return PLAYER_STATUSES.find(s => s.value === value)?.label || value;
}

export function getAttendanceLabel(value) {
    return ATTENDANCE_STATUSES.find(s => s.value === value)?.label || value;
}

function fieldVisible(field, form, player) {
    if (field.positions && player?.position) {
        return field.positions.includes(player.position);
    }
    if (field.roles && form?.role) {
        return field.roles.includes(form.role);
    }
    if (field.roles && !form?.role) return field.roles.includes('batter');
    return true;
}

export function getStatFields(sport, form = {}, player = null) {
    const all = STAT_FIELDS_BASE[sport] || STAT_FIELDS_BASE.otro;
    return all.filter(f => fieldVisible(f, form, player));
}

export function getStatFieldGroups(sport, form = {}, player = null) {
    const fields = getStatFields(sport, form, player);
    const groups = {};
    fields.forEach(f => {
        const g = f.group || 'general';
        if (!groups[g]) groups[g] = { id: g, label: STAT_GROUP_LABELS[g] || g, fields: [] };
        groups[g].fields.push(f);
    });
    return Object.values(groups);
}

export function getSelectOptionLabel(field, value) {
    if (field.optionLabels) {
        return field.optionLabels.find(o => o.value === value)?.label || value;
    }
    return value;
}

export function getStatsPayloadKey(sport) {
    const map = {
        futbol: 'soccer_stats',
        beisbol: 'baseball_stats',
        basquetbol: 'basketball_stats',
        otro: 'generic_stats'
    };
    return map[sport] || 'generic_stats';
}

export function getDefaultStats(sport, form = {}) {
    const defaults = sport === 'beisbol' && !form.role ? { role: 'batter' } : {};
    const fields = getStatFields(sport, { ...defaults, ...form });
    const stats = {};
    fields.forEach(f => {
        if (f.type === 'select') stats[f.key] = f.options[0];
        else if (f.type === 'float') stats[f.key] = 0;
        else stats[f.key] = f.min ?? 0;
    });
    return stats;
}

export function buildStatsBody(sport, formStats) {
    return { ...formStats };
}

export function attendanceRequiresNote(status) {
    return ['absent', 'late', 'excused'].includes(status);
}

export function getHomeTeamName(teams) {
    return teams.find(t => t.is_home)?.name || 'Local';
}

export function getAwayTeamName(teams) {
    return teams.find(t => !t.is_home)?.name || 'Visitante';
}

// === Estadísticas de equipo por evento (tablas *_team_stats) ===
export const TEAM_STAT_FIELDS = {
    futbol: [
        { key: 'possession',      label: 'Posesión (%)',       min: 0, max: 100 },
        { key: 'total_shots',     label: 'Remates totales',    min: 0, max: 100 },
        { key: 'shots_on_target', label: 'Remates al arco',    min: 0, max: 100 },
        { key: 'corners',         label: 'Tiros de esquina',   min: 0, max: 50 },
        { key: 'fouls',           label: 'Faltas',             min: 0, max: 100 },
        { key: 'yellow_cards',    label: 'Tarjetas amarillas', min: 0, max: 20 },
        { key: 'red_cards',       label: 'Tarjetas rojas',     min: 0, max: 10 },
        { key: 'offsides',        label: 'Fueras de juego',    min: 0, max: 50 }
    ],
    beisbol: [
        { key: 'runs',         label: 'Carreras',        min: 0, max: 100 },
        { key: 'hits',         label: 'Hits',            min: 0, max: 100 },
        { key: 'errors',       label: 'Errores',         min: 0, max: 50 },
        { key: 'left_on_base', label: 'Dejados en base', min: 0, max: 50 }
    ],
    basquetbol: [
        { key: 'points',    label: 'Puntos',           min: 0, max: 300 },
        { key: 'rebounds',  label: 'Rebotes',          min: 0, max: 150 },
        { key: 'assists',   label: 'Asistencias',      min: 0, max: 100 },
        { key: 'turnovers', label: 'Pérdidas',         min: 0, max: 100 },
        { key: 'fouls',     label: 'Faltas',           min: 0, max: 100 },
        { key: 'fg_pct',    label: '% Tiros de campo',  min: 0, max: 100 },
        { key: 'three_pct', label: '% Triples',         min: 0, max: 100 }
    ]
};

export function getTeamStatFields(sport) {
    return TEAM_STAT_FIELDS[sport] || [];
}

export function getDefaultTeamStats(sport) {
    const stats = {};
    getTeamStatFields(sport).forEach(f => { stats[f.key] = 0; });
    return stats;
}
