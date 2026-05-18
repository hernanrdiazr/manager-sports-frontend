// authService.js - Servicio de autenticación
import { api } from './api.js';

class AuthService {
    async login(email, password) {
        try {
            const response = await api.post('/login', { 
                email, 
                password 
            });
            
            // La respuesta debe incluir token y user
            if (response.token && response.user) {
                // Verificar que sea admin
                if (response.user.role !== 'admin') {
                    throw new Error('Acceso denegado. Solo administradores.');
                }
                
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                return response;
            } else {
                throw new Error('Respuesta del servidor incompleta');
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await api.post('/register', userData);
            
            if (response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            return response;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('rememberedEmail');
        window.location.href = '/#/login/admin';
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = this.getCurrentUser();
        return !!(token && user && user.role === 'admin');
    }

    getToken() {
        return localStorage.getItem('token');
    }
}

// ✅ Exportación para módulos ES6
export const authService = new AuthService();
export default authService;