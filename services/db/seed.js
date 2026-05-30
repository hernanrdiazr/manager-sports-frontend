// services/db/seed.js - Datos semilla para poblar la base de datos local

// Función auxiliar para generar hash SHA-256
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function seedDatabase(dbExec) {
    // 1. Hashes de contraseñas para los usuarios semilla
    const adminHash = await hashPassword('admin1234');
    const userHash = await hashPassword('user1234');

    console.log("🌱 Iniciando inserción de datos semilla...");

    // Insertar usuarios
    await dbExec(`
        INSERT INTO users (name, email, password_hash, role) VALUES 
        ('Super Admin', 'admin@deportes.com', '${adminHash}', 'admin'),
        ('Juan Perez', 'juan@gmail.com', '${userHash}', 'user'),
        ('Maria Gomez', 'maria@gmail.com', '${userHash}', 'user');
    `);

    // Obtener los IDs de los usuarios insertados (admin=1, juan=2, maria=3 de forma determinista)
    
    // Insertar eventos
    // Nota: Usamos fechas relativas o fijas futuras/pasadas para simular estados de eventos (próximo, en curso, finalizado)
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    const pastDate = new Date(today); pastDate.setDate(today.getDate() - 2);
    const futureDate1 = new Date(today); futureDate1.setDate(today.getDate() + 5);
    const futureDate2 = new Date(today); futureDate2.setDate(today.getDate() + 10);
    
    // Evento 1: Fútbol (Finalizado)
    // Evento 2: Béisbol (Activo/Próximo)
    // Evento 3: Básquetbol (Activo/Próximo)

    await dbExec(`
        INSERT INTO events (id, name, sport, event_date, start_time, end_time, location, lat, lon, total_tickets, available_tickets, ticket_price, status) VALUES 
        (1, 'Gran Clásico de Fútbol: Real Madrid vs Barcelona', 'futbol', '${formatDate(pastDate)}', '${pastDate.toISOString().replace('T', ' ').substring(0, 19)}', '${pastDate.toISOString().replace('T', ' ').substring(0, 19)}', 'Estadio Metropolitano, Madrid', 40.4362, -3.5995, 100, 0, 45.00, 'finalizado'),
        (2, 'Serie del Caribe: Yankees vs Red Sox', 'beisbol', '${formatDate(futureDate1)}', '${futureDate1.toISOString().replace('T', ' ').substring(0, 19)}', '${futureDate1.toISOString().replace('T', ' ').substring(0, 19)}', 'Yankee Stadium, New York', 40.8296, -73.9262, 120, 115, 60.00, 'próximo'),
        (3, 'Finales NBA: Lakers vs Celtics', 'basquetbol', '${formatDate(futureDate2)}', '${futureDate2.toISOString().replace('T', ' ').substring(0, 19)}', '${futureDate2.toISOString().replace('T', ' ').substring(0, 19)}', 'Crypto.com Arena, Los Angeles', 34.0430, -118.2673, 150, 140, 85.00, 'próximo');
    `);

    // Insertar Equipos
    await dbExec(`
        INSERT INTO teams (id, event_id, name, sport, is_home, score) VALUES 
        (1, 1, 'Real Madrid', 'futbol', 1, 3),
        (2, 1, 'Barcelona', 'futbol', 0, 2),
        (3, 2, 'Yankees', 'beisbol', 1, 0),
        (4, 2, 'Red Sox', 'beisbol', 0, 0),
        (5, 3, 'Lakers', 'basquetbol', 1, 0),
        (6, 3, 'Celtics', 'basquetbol', 0, 0);
    `);

    // Relación many-to-many event_teams
    await dbExec(`
        INSERT INTO event_teams (event_id, team_id, is_home, score) VALUES 
        (1, 1, 1, 3),
        (1, 2, 0, 2),
        (2, 3, 1, 0),
        (2, 4, 0, 0),
        (3, 5, 1, 0),
        (3, 6, 0, 0);
    `);

    // Insertar Jugadores
    // Fútbol (Real Madrid id=1, Barcelona id=2)
    await dbExec(`
        INSERT INTO players (id, team_id, name, jersey_number, position, is_starter, status) VALUES 
        -- Real Madrid (Fútbol)
        (1, 1, 'Vinicius Jr', 7, 'Delantero', 1, 'active'),
        (2, 1, 'Jude Bellingham', 5, 'Mediocampista', 1, 'active'),
        (3, 1, 'Federico Valverde', 8, 'Mediocampista', 1, 'active'),
        (4, 1, 'Thibaut Courtois', 1, 'Portero', 1, 'active'),
        -- Barcelona (Fútbol)
        (5, 2, 'Robert Lewandowski', 9, 'Delantero', 1, 'active'),
        (6, 2, 'Lamine Yamal', 19, 'Delantero', 1, 'active'),
        (7, 2, 'Pedri Gonzalez', 8, 'Mediocampista', 1, 'active'),
        (8, 2, 'Marc-André ter Stegen', 1, 'Portero', 1, 'active');
    `);

    // Béisbol (Yankees id=3, Red Sox id=4)
    await dbExec(`
        INSERT INTO players (id, team_id, name, jersey_number, position, is_starter, status) VALUES 
        -- Yankees
        (9, 3, 'Aaron Judge', 99, 'Jardinero', 1, 'active'),
        (10, 3, 'Gerrit Cole', 45, 'Lanzador', 1, 'active'),
        -- Red Sox
        (11, 4, 'Rafael Devers', 11, 'Tercera Base', 1, 'active'),
        (12, 4, 'Brayan Bello', 66, 'Lanzador', 1, 'active');
    `);

    // Básquetbol (Lakers id=5, Celtics id=6)
    await dbExec(`
        INSERT INTO players (id, team_id, name, jersey_number, position, is_starter, status) VALUES 
        -- Lakers
        (13, 5, 'LeBron James', 23, 'Alero', 1, 'active'),
        (14, 5, 'Anthony Davis', 3, 'Pívot', 1, 'active'),
        -- Celtics
        (15, 6, 'Jayson Tatum', 0, 'Alero', 1, 'active'),
        (16, 6, 'Jaylen Brown', 7, 'Escolta', 1, 'active');
    `);

    // Stats de fútbol por jugador por evento (Evento 1)
    await dbExec(`
        INSERT INTO soccer_player_stats (player_id, event_id, minutes_played, goals, assists, shots, shots_on_target, passes, pass_accuracy, fouls_committed, yellow_cards, red_cards, saves, goals_conceded) VALUES 
        -- Real Madrid
        (1, 1, 90, 2, 0, 4, 3, 35, 82, 1, 0, 0, 0, 0),
        (2, 1, 85, 1, 1, 2, 1, 50, 88, 2, 1, 0, 0, 0),
        (3, 1, 90, 0, 1, 1, 0, 45, 90, 0, 0, 0, 0, 0),
        (4, 1, 90, 0, 0, 0, 0, 20, 75, 0, 0, 0, 4, 2),
        -- Barcelona
        (5, 1, 90, 1, 0, 3, 2, 18, 70, 1, 0, 0, 0, 0),
        (6, 1, 75, 1, 1, 2, 2, 28, 78, 0, 0, 0, 0, 0),
        (7, 1, 90, 0, 0, 0, 0, 62, 91, 1, 1, 0, 0, 0),
        (8, 1, 90, 0, 0, 0, 0, 25, 80, 0, 0, 0, 2, 3);
    `);

    // Stats de béisbol por jugador por evento (Evento 2 - vacío al inicio ya que es próximo, pero agregamos iniciales)
    await dbExec(`
        INSERT INTO baseball_player_stats (player_id, event_id, role, at_bats, hits, home_runs, rbi, runs, strikeouts, innings_pitched, earned_runs, strikeouts_pitched) VALUES 
        (9, 2, 'batter', 0, 0, 0, 0, 0, 0, 0, 0, 0),
        (10, 2, 'pitcher', 0, 0, 0, 0, 0, 0, 0.0, 0, 0),
        (11, 2, 'batter', 0, 0, 0, 0, 0, 0, 0, 0, 0),
        (12, 2, 'pitcher', 0, 0, 0, 0, 0, 0, 0.0, 0, 0);
    `);

    // Stats de básquetbol por jugador por evento (Evento 3 - iniciales)
    await dbExec(`
        INSERT INTO basketball_player_stats (player_id, event_id, minutes_played, points, rebounds, assists, steals, blocks, turnovers, fg_made, fg_attempted) VALUES 
        (13, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        (14, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        (15, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0),
        (16, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    `);

    // Stats de equipos por evento
    // Evento 1: Fútbol
    await dbExec(`
        INSERT INTO soccer_team_stats (team_id, event_id, possession, total_shots, shots_on_target, corners, fouls, yellow_cards, red_cards, offsides) VALUES 
        (1, 1, 52, 14, 7, 5, 12, 1, 0, 2),
        (2, 1, 48, 11, 6, 4, 15, 2, 0, 1);
    `);
    
    // Evento 2: Béisbol
    await dbExec(`
        INSERT INTO baseball_team_stats (team_id, event_id, runs, hits, errors, left_on_base) VALUES 
        (3, 2, 0, 0, 0, 0),
        (4, 2, 0, 0, 0, 0);
    `);

    // Evento 3: Básquetbol
    await dbExec(`
        INSERT INTO basketball_team_stats (team_id, event_id, points, rebounds, assists, turnovers, fouls, fg_pct, three_pct) VALUES 
        (5, 3, 0, 0, 0, 0, 0, 0, 0),
        (6, 3, 0, 0, 0, 0, 0, 0, 0);
    `);

    // Asistencia de jugadores (Evento 1)
    await dbExec(`
        INSERT INTO player_attendance (player_id, event_id, status, note) VALUES 
        (1, 1, 'present', 'Titular indiscutido'),
        (2, 1, 'present', 'Amonestado en min 72'),
        (3, 1, 'present', 'Jugó todo el partido'),
        (4, 1, 'present', 'Portero titular'),
        (5, 1, 'present', 'Gol en min 40'),
        (6, 1, 'present', 'Gol en min 65, sustituido al 75'),
        (7, 1, 'present', 'Gran desgaste en mediocampo'),
        (8, 1, 'present', 'Portero titular');
    `);

    // Asistencia de jugadores (Evento 2 y 3 por defecto a present)
    await dbExec(`
        INSERT INTO player_attendance (player_id, event_id, status, note) VALUES 
        (9, 2, 'present', ''), (10, 2, 'present', ''), (11, 2, 'present', ''), (12, 2, 'present', ''),
        (13, 3, 'present', ''), (14, 3, 'present', ''), (15, 3, 'present', ''), (16, 3, 'present', '');
    `);

    // Faltas del partido (Evento 1)
    await dbExec(`
        INSERT INTO player_fouls (player_id, event_id, foul_type, description, minute) VALUES 
        (2, 1, 'yellow_card', 'Falta táctica en medio campo sobre Pedri', 72),
        (7, 1, 'yellow_card', 'Entrada tardía sobre Bellingham', 55);
    `);

    // Resultado oficial del partido (Evento 1)
    await dbExec(`
        INSERT INTO match_results (event_id, home_team_id, away_team_id, home_score, away_score) VALUES 
        (1, 1, 2, 3, 2);
    `);

    // Reservas de ejemplo
    // Juan Perez (user_id=2) reserva 5 entradas para Evento 2 (Yankees vs Red Sox)
    // Maria Gomez (user_id=3) reserva 10 entradas para Evento 3 (Lakers vs Celtics)
    await dbExec(`
        INSERT INTO reservations (user_id, event_id, ticket_count, total_price, payment_reference, status) VALUES 
        (2, 2, 5, 300.00, 'REF-YANKEES-001', 'aprobado'),
        (3, 3, 10, 850.00, 'REF-LAKERS-100', 'pendiente');
    `);

    console.log("🎉 Datos semilla insertados correctamente.");
}
