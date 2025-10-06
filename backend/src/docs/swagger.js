/**
 * @swagger
 * tags:
 *   name: Solicitudes
 *   description: API para gestión de solicitudes de Condominio360
 */

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Crear una nueva solicitud
 *     tags: [Solicitudes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - wp_user_id
 *               - request_type
 *               - details
 *             properties:
 *               wp_user_id:
 *                 type: integer
 *                 description: ID del usuario de WordPress
 *                 example: 123
 *               request_type:
 *                 type: string
 *                 enum: [Mudanza - Entrada, Mudanza - Salida, Sugerencias, Reclamos, Carta de Residencia]
 *                 description: Tipo de solicitud
 *                 example: "Mudanza - Entrada"
 *               details:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Detalles de la solicitud
 *                 example: "Solicito autorización para mudanza de entrada el próximo sábado"
 *               move_date:
 *                 type: string
 *                 format: date
 *                 description: Fecha de mudanza (requerido para mudanzas, debe ser sábado)
 *                 example: "2024-01-20"
 *               transporter_name:
 *                 type: string
 *                 description: Nombre del transportista (requerido para mudanzas)
 *                 example: "Juan Pérez"
 *               transporter_id_card:
 *                 type: string
 *                 description: Cédula del transportista (requerido para mudanzas)
 *                 example: "12345678"
 *               vehicle_brand:
 *                 type: string
 *                 description: Marca del vehículo (requerido para mudanzas)
 *                 example: "Toyota"
 *               vehicle_model:
 *                 type: string
 *                 description: Modelo del vehículo (requerido para mudanzas)
 *                 example: "Hilux"
 *               vehicle_plate:
 *                 type: string
 *                 description: Placa del vehículo (requerido para mudanzas)
 *                 example: "ABC-123"
 *               vehicle_color:
 *                 type: string
 *                 description: Color del vehículo (requerido para mudanzas)
 *                 example: "Blanco"
 *               driver_name:
 *                 type: string
 *                 description: Nombre del chofer (requerido para mudanzas)
 *                 example: "Carlos López"
 *               driver_id_card:
 *                 type: string
 *                 description: Cédula del chofer (requerido para mudanzas)
 *                 example: "87654321"
 *     responses:
 *       201:
 *         description: Solicitud creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Solicitud creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Request'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Obtener solicitudes
 *     tags: [Solicitudes]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: ID del usuario para filtrar sus solicitudes
 *         example: 123
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de resultados por página
 *         example: 20
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Request'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 */

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Obtener una solicitud por ID
 *     tags: [Solicitudes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *         example: 1
 *     responses:
 *       200:
 *         description: Solicitud obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Request'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Actualizar una solicitud
 *     tags: [Solicitudes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la solicitud
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - response
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Recibida, Aprobado, Rechazado, Atendido]
 *                 description: Nuevo estado de la solicitud
 *                 example: "Aprobado"
 *               response:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Respuesta de la junta de condominio
 *                 example: "Solicitud aprobada. Puede proceder con la mudanza el día programado."
 *     responses:
 *       200:
 *         description: Solicitud actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Solicitud actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Request'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Solicitud no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/requests/stats:
 *   get:
 *     summary: Obtener estadísticas de solicitudes
 *     tags: [Solicitudes]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     byType:
 *                       type: object
 *                       properties:
 *                         "Mudanza - Entrada":
 *                           type: integer
 *                           example: 30
 *                         "Mudanza - Salida":
 *                           type: integer
 *                           example: 25
 *                         "Sugerencias":
 *                           type: integer
 *                           example: 30
 *                         "Reclamos":
 *                           type: integer
 *                           example: 15
 *                     byStatus:
 *                       type: object
 *                       properties:
 *                         "Recibida":
 *                           type: integer
 *                           example: 20
 *                         "Aprobado":
 *                           type: integer
 *                           example: 40
 *                         "Rechazado":
 *                           type: integer
 *                           example: 10
 *                         "Atendido":
 *                           type: integer
 *                           example: 30
 *                     thisMonth:
 *                       type: integer
 *                       example: 15
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servidor
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T18:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 environment:
 *                   type: string
 *                   example: "development"
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información de la API
 *     tags: [Sistema]
 *     responses:
 *       200:
 *         description: Información básica de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API de Condominio360 Solicitudes"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 documentation:
 *                   type: string
 *                   example: "/api-docs"
 */
