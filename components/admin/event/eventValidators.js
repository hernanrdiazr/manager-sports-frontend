import { getStatFields, getFoulTypes, ATTENDANCE_STATUSES, PLAYER_STATUSES } from './eventSportConfig.js';

const VALID_ATTENDANCE = new Set(ATTENDANCE_STATUSES.map(s => s.value));
const VALID_PLAYER_STATUS = new Set(PLAYER_STATUSES.map(s => s.value));

function isInt(n) {
    return Number.isInteger(n) && !Number.isNaN(n);
}

function addError(errors, field, message) {
    errors[field] = message;
}

export function validatePlayerForm(form, existingPlayers, teamOptions, positions) {
    const errors = {};
    const validTeamIds = new Set(teamOptions.map(t => t.id));
    const validPositions = new Set(positions.map(p => p.value));

    if (!form.team_id || !validTeamIds.has(form.team_id)) {
        addError(errors, 'team_id', 'Selecciona un equipo válido');
    }

    const name = (form.name || '').trim();
    if (name.length < 2) addError(errors, 'name', 'El nombre debe tener al menos 2 caracteres');
    if (name.length > 100) addError(errors, 'name', 'El nombre no puede superar 100 caracteres');

    if (!isInt(form.jersey_number) || form.jersey_number < 1 || form.jersey_number > 99) {
        addError(errors, 'jersey_number', 'El dorsal debe ser un número entre 1 y 99');
    } else if (form.team_id) {
        const duplicate = existingPlayers.some(
            p => p.team_id === form.team_id && p.jersey_number === form.jersey_number
        );
        if (duplicate) addError(errors, 'jersey_number', 'Ese dorsal ya está asignado en este equipo');
    }

    if (!form.position || !validPositions.has(form.position)) {
        addError(errors, 'position', 'Selecciona una posición válida');
    }

    return errors;
}

export function validateScoreForm(sport, form) {
    const errors = {};
    const limits = { futbol: 50, beisbol: 50, basquetbol: 200 };
    const max = limits[sport] || 200;

    ['home_score', 'away_score'].forEach(key => {
        const val = form[key];
        if (!isInt(val) || val < 0) addError(errors, key, 'Debe ser un entero mayor o igual a 0');
        else if (val > max) addError(errors, key, `El marcador no puede superar ${max}`);
    });

    return errors;
}

export function validateAttendanceForm(status, note) {
    const errors = {};
    if (!VALID_ATTENDANCE.has(status)) {
        addError(errors, 'status', 'Estado de asistencia no válido');
    }
    const needsNote = ['absent', 'late', 'excused'].includes(status);
    const trimmed = (note || '').trim();
    if (needsNote && trimmed.length < 3) {
        addError(errors, 'note', 'Indica el motivo (mínimo 3 caracteres)');
    }
    if (trimmed.length > 200) {
        addError(errors, 'note', 'La nota no puede superar 200 caracteres');
    }
    return errors;
}

export function validateStatsForm(sport, form, player = null) {
    const errors = {};
    const fields = getStatFields(sport, form, player);

    fields.forEach(field => {
        const val = form[field.key];

        if (field.type === 'select') {
            if (!field.options.includes(val)) addError(errors, field.key, 'Opción no válida');
            return;
        }

        if (field.type === 'float') {
            const n = Number(val);
            if (Number.isNaN(n) || n < (field.min ?? 0)) {
                addError(errors, field.key, `Debe ser ≥ ${field.min ?? 0}`);
            }
            if (field.max != null && n > field.max) addError(errors, field.key, `No puede superar ${field.max}`);
            return;
        }

        if (!isInt(Number(val)) || Number(val) < (field.min ?? 0)) {
            addError(errors, field.key, `Debe ser un entero ≥ ${field.min ?? 0}`);
            return;
        }
        if (field.max != null && Number(val) > field.max) {
            addError(errors, field.key, `No puede superar ${field.max}`);
        }
    });

    // Reglas cruzadas
    if (sport === 'futbol') {
        if (Number(form.shots_on_target) > Number(form.shots)) {
            addError(errors, 'shots_on_target', 'No puede superar los tiros totales');
        }
        if (Number(form.red_cards) > 1) addError(errors, 'red_cards', 'Máximo 1 tarjeta roja');
        if (Number(form.yellow_cards) > 2) addError(errors, 'yellow_cards', 'Máximo 2 tarjetas amarillas');
    }

    if (sport === 'basquetbol') {
        if (Number(form.fg_made) > Number(form.fg_attempted)) {
            addError(errors, 'fg_made', 'No puede superar los intentos');
        }
        if (Number(form.three_made) > Number(form.three_attempted)) {
            addError(errors, 'three_made', 'No puede superar los intentos de 3PT');
        }
        if (Number(form.ft_made) > Number(form.ft_attempted)) {
            addError(errors, 'ft_made', 'No puede superar los intentos de TL');
        }
        const reb = Number(form.rebounds);
        const off = Number(form.offensive_rebounds);
        const def = Number(form.defensive_rebounds);
        if (reb > 0 && off + def > reb) {
            addError(errors, 'rebounds', 'Debe ser ≥ rebotes ofensivos + defensivos');
        }
    }

    if (sport === 'beisbol' && form.role === 'batter') {
        if (Number(form.hits) > Number(form.at_bats)) {
            addError(errors, 'hits', 'No puede superar los turnos al bate');
        }
    }

    return errors;
}

export function validateFoulForm(sport, form) {
    const errors = {};
    const validTypes = new Set(getFoulTypes(sport).map(f => f.value));

    if (!form.player_id) addError(errors, 'player_id', 'Selecciona un jugador');
    if (!form.foul_type || !validTypes.has(form.foul_type)) {
        addError(errors, 'foul_type', 'Selecciona un tipo de falta válido');
    }

    const minute = form.minute;
    if (minute != null && minute !== '') {
        if (!isInt(Number(minute)) || Number(minute) < 0) {
            addError(errors, 'minute', 'El minuto debe ser un entero ≥ 0');
        } else if (sport !== 'beisbol' && Number(minute) > 120) {
            addError(errors, 'minute', 'El minuto no puede superar 120');
        }
    }

    const desc = (form.description || '').trim();
    if (desc.length > 200) addError(errors, 'description', 'Máximo 200 caracteres');

    return errors;
}

export function hasErrors(errors) {
    return Object.keys(errors).length > 0;
}
