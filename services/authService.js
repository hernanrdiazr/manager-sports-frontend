// authService.js - Servicio de autenticación adaptado para consumir authRepository

import { authRepository } from './db/authRepository.js';

class AuthService {
    /**
     * Inicia sesión del usuario
     * @param {string} email
     * @param {string} password
     * @param {boolean} requireAdmin
     */
    async login(email, password, requireAdmin = false) {
        try {
            const response = await authRepository.login(email, password);

            if (response.token && response.user) {
                // Verificar si se requiere admin
                if (requireAdmin && response.user.role !== 'admin') {
                    // Limpiar sesión si no es admin
                    authRepository.logout();
                    throw new Error('Acceso denegado. Solo administradores.');
                }

                // El repositorio de autenticación ya guarda en localStorage
                // Pero guardamos la clave 'user' que espera el frontend original para compatibilidad
                localStorage.setItem('user', JSON.stringify(response.user));

                return response;
            } else {
                throw new Error('Respuesta de autenticación incompleta');
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Registra un nuevo usuario
     * @param {Object} userData ({ name, email, password })
     */
    async register(userData) {
        try {
            const response = await authRepository.register(userData.name, userData.email, userData.password);
            
            // Iniciar sesión automáticamente tras el registro
            const loginResponse = await authRepository.login(userData.email, userData.password);
            
            // Guardar clave 'user' esperada por el frontend
            localStorage.setItem('user', JSON.stringify(loginResponse.user));

            return loginResponse;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    /**
     * Cierra la sesión
     */
    logout() {
        const user = this.getCurrentUser();
        const redirect = (user && user.role === 'admin') ? '/#/login/admin' : '/#/login';
        
        authRepository.logout();
        localStorage.removeItem('user');
        localStorage.removeItem('rememberedEmail');
        
        window.location.href = redirect;
    }

    /**
     * Retorna el usuario actual
     */
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = this.getCurrentUser();
        return !!(token && user);
    }

    /**
     * Retorna el token de sesión
     */
    getToken() {
        return localStorage.getItem('token');
    }
}

export const authService = new AuthService();
export default authService;