// services/db/authRepository.js - Repositorio para Autenticación de Usuarios en SQLite

import { selectOne, run } from './database.js';

// Función auxiliar para encriptar contraseñas con SHA-256
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class AuthRepository {
    /**
     * Inicia sesión de un usuario buscando sus credenciales en SQLite
     * @param {string} email Correo electrónico
     * @param {string} password Contraseña
     * @returns {Promise<Object>} Datos del login (token, user)
     */
    async login(email, password) {
        if (!email || !password) {
            throw new Error("Todos los campos son obligatorios");
        }

        // Buscar usuario por correo
        const user = await selectOne("SELECT id, name, email, password_hash, role FROM users WHERE email = ?;", [email.trim()]);
        if (!user) {
            throw new Error("Credenciales incorrectas");
        }

        // Comparar contraseña hasheada
        const inputHash = await hashPassword(password);
        if (user.password_hash !== inputHash) {
            throw new Error("Credenciales incorrectas");
        }

        // Generar un token único (UUID v4 aproximado en frontend)
        const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);

        const loginData = {
            token: token,
            mensaje: "Login exitoso",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            }
        };

        // Guardar la sesión localmente
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('currentUser', JSON.stringify(loginData.user));

        return loginData;
    }

    /**
     * Registra un nuevo usuario en la base de datos SQLite
     * @param {string} name Nombre
     * @param {string} email Correo
     * @param {string} password Contraseña
     * @returns {Promise<Object>} Mensaje y user_id creado
     */
    async register(name, email, password) {
        const trimmedName = name ? name.trim() : '';
        const trimmedEmail = email ? email.trim() : '';

        if (!trimmedName || !trimmedEmail || !password) {
            throw new Error("Todos los campos son obligatorios");
        }

        // Validar formato del correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            throw new Error("El formato del correo electrónico es inválido");
        }

        // Validar longitud de contraseña
        if (password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        // Verificar si el correo ya existe
        const existingUser = await selectOne("SELECT id FROM users WHERE email = ?;", [trimmedEmail]);
        if (existingUser) {
            throw new Error("Error al crear el usuario. ¿Quizás el email ya existe?");
        }

        // Hashear la contraseña
        const hashedPassword = await hashPassword(password);

        try {
            // Insertar el usuario
            const result = await run(
                "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'user');",
                [trimmedName, trimmedEmail, hashedPassword]
            );

            return {
                mensaje: "Usuario registrado exitosamente",
                user_id: result.lastInsertRowId
            };
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            throw new Error("Error al registrar usuario en la base de datos");
        }
    }

    /**
     * Devuelve el usuario actualmente autenticado desde localStorage
     * @returns {Object|null}
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }

    /**
     * Verifica si hay un token de sesión en localStorage
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    /**
     * Limpia la sesión del usuario del localStorage
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    }
}

export const authRepository = new AuthRepository();
export default authRepository;
