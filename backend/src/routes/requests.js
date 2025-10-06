const express = require('express');
const RequestController = require('../controllers/RequestController');
const { validatePagination, validateUserExists, requestLogger } = require('../middleware/errorHandler');

const router = express.Router();
const requestController = new RequestController();

// Middleware de logging para todas las rutas
router.use(requestLogger);

// Middleware de validación de paginación para rutas GET
router.get('/', validatePagination);

/**
 * @swagger
 * components:
 *   schemas:
 *     Request:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la solicitud
 *         wp_user_id:
 *           type: integer
 *           description: ID del usuario de WordPress
 *         request_type:
 *           type: string
 *           enum: [Mudanza - Entrada, Mudanza - Salida, Sugerencias, Reclamos]
 *           description: Tipo de solicitud
 *         details:
 *           type: string
 *           description: Detalles de la solicitud
 *         move_date:
 *           type: string
 *           format: date
 *           description: Fecha de mudanza
 *         transporter_name:
 *           type: string
 *           description: Nombre del transportista
 *         transporter_id_card:
 *           type: string
 *           description: Cédula del transportista
 *         vehicle_brand:
 *           type: string
 *           description: Marca del vehículo
 *         vehicle_model:
 *           type: string
 *           description: Modelo del vehículo
 *         vehicle_plate:
 *           type: string
 *           description: Placa del vehículo
 *         vehicle_color:
 *           type: string
 *           description: Color del vehículo
 *         driver_name:
 *           type: string
 *           description: Nombre del chofer
 *         driver_id_card:
 *           type: string
 *           description: Cédula del chofer
 *         status:
 *           type: string
 *           enum: [Recibida, Aprobado, Rechazado, Atendido]
 *           description: Estado de la solicitud
 *         response:
 *           type: string
 *           description: Respuesta de la administración
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         display_name:
 *           type: string
 *           description: Nombre para mostrar del usuario
 *         user_email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         user_nicename:
 *           type: string
 *           description: Nombre de usuario
 */

// Rutas de la API

/**
 * POST /api/requests
 * Crear una nueva solicitud
 */
router.post('/', validateUserExists, (req, res, next) => {
  requestController.createRequest(req, res, next);
});

/**
 * GET /api/requests
 * Obtener solicitudes (con filtros opcionales)
 */
router.get('/', (req, res, next) => {
  requestController.getRequests(req, res, next);
});

/**
 * GET /api/requests/stats
 * Obtener estadísticas de solicitudes
 */
router.get('/stats', (req, res, next) => {
  requestController.getStats(req, res, next);
});

/**
 * GET /api/requests/:id
 * Obtener una solicitud por ID
 */
router.get('/:id', (req, res, next) => {
  requestController.getRequestById(req, res, next);
});

/**
 * PUT /api/requests/:id
 * Actualizar una solicitud
 */
router.put('/:id', (req, res, next) => {
  requestController.updateRequest(req, res, next);
});

module.exports = router;
