// services/db/reservationsRepository.js - Repositorio para la Compra de Entradas y Reservas en SQLite

import { selectAll, selectOne, run, transaction } from './database.js';

class ReservationsRepository {
    /**
     * Crea una reserva en estado pendiente y descuenta la cantidad de entradas del evento
     * @param {number} userId ID del usuario
     * @param {number} eventId ID del evento
     * @param {number} ticketCount Cantidad de boletos a reservar
     * @param {string} paymentReference Referencia de pago reportada
     * @returns {Promise<number>} ID de la reservación creada
     */
    async create(userId, eventId, ticketCount, paymentReference) {
        return await transaction(async () => {
            const count = parseInt(ticketCount, 10);
            if (isNaN(count) || count <= 0) {
                throw new Error("Cantidad de entradas inválida");
            }

            // 1. Obtener entradas disponibles y precio del evento
            const event = await selectOne(
                "SELECT available_tickets, ticket_price FROM events WHERE id = ?;", 
                [eventId]
            );

            if (!event) {
                throw new Error("evento no encontrado");
            }

            if (event.available_tickets < count) {
                throw new Error("no hay suficientes entradas disponibles");
            }

            const totalPrice = event.ticket_price * count;
            const status = "pendiente";
            const now = new Date().toISOString();

            // 2. Insertar la reservación
            const resResult = await run(`
                INSERT INTO reservations (user_id, event_id, ticket_count, total_price, payment_reference, payment_date, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?);
            `, [userId, eventId, count, totalPrice, paymentReference, now, status]);

            const resId = resResult.lastInsertRowId;

            // 3. Actualizar la cantidad de entradas disponibles en el evento
            await run(
                "UPDATE events SET available_tickets = available_tickets - ? WHERE id = ?;",
                [count, eventId]
            );

            return resId;
        });
    }

    /**
     * Obtiene las reservas pendientes para revisión del administrador (con detalles del usuario y evento)
     * @returns {Promise<Array<Object>>} Lista de reservas pendientes
     */
    async getPending() {
        const rows = await selectAll(`
            SELECT 
                r.id, 
                u.name as user_name, 
                e.name as event_name,
                e.sport, 
                r.ticket_count, 
                r.total_price, 
                r.payment_reference, 
                r.status,
                r.payment_date
            FROM reservations r
            JOIN users u ON r.user_id = u.id
            JOIN events e ON r.event_id = e.id
            WHERE r.status = 'pendiente'
            ORDER BY r.payment_date ASC
        `);

        return rows.map(r => ({
            id: r.id,
            usuario: r.user_name,
            evento_nombre: r.event_name,
            evento: r.sport,
            cantidad: r.ticket_count,
            total: r.total_price,
            referencia_pago: r.payment_reference,
            estado: r.status,
            fecha_pago: r.payment_date
        }));
    }

    /**
     * Aprueba una reserva cambiando su estado a 'aprobada'
     * @param {number} id ID de la reserva
     */
    async approve(id) {
        const result = await run("UPDATE reservations SET status = 'aprobado' WHERE id = ?;", [id]);
        if (result.changes === 0) {
            throw new Error("no se encontró la reserva con ese ID");
        }
        return true;
    }

    /**
     * Actualiza el estado de una reserva (aprobar/cancelar)
     * @param {number} id ID de la reserva
     * @param {string} status Estado a establecer ('aprobado', 'cancelado')
     */
    async updateStatus(id, status) {
        const result = await run("UPDATE reservations SET status = ? WHERE id = ?;", [status, id]);
        if (result.changes === 0) {
            throw new Error("no se encontró la reserva con ese ID");
        }
        return true;
    }

    /**
     * Obtiene el historial de reservas de un usuario
     * @param {number} userId ID del usuario
     * @returns {Promise<Array<Object>>} Lista de reservas del usuario
     */
    async getByUser(userId) {
        const rows = await selectAll(`
            SELECT r.id, r.event_id, e.name, e.sport, e.event_date, e.location, r.ticket_count, r.total_price, r.status, r.payment_reference, r.payment_date
            FROM reservations r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `, [userId]);

        return rows.map(r => ({
            id: r.id,
            event_id: r.event_id,
            evento_nombre: r.name,
            evento: r.sport,
            evento_fecha: r.event_date,
            evento_ubicacion: r.location,
            cantidad_tickets: r.ticket_count,
            total_pagado: r.total_price,
            estado: r.status,
            referencia: r.payment_reference,
            fecha_reportada: r.payment_date
        }));
    }
}

export const reservationsRepository = new ReservationsRepository();
export default reservationsRepository;
