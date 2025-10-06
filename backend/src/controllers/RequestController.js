const { RequestModel, RequestValidator } = require('../models/Request');
const EmailService = require('../services/EmailService');
const db = require('../config/database');

/**
 * Controlador para las solicitudes de Condominio360
 */
class RequestController {
  constructor() {
    this.requestModel = new RequestModel(db);
    this.emailService = new EmailService();
  }

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
   *               request_type:
   *                 type: string
   *                 enum: [Mudanza - Entrada, Mudanza - Salida, Sugerencias, Reclamos]
   *                 description: Tipo de solicitud
   *               details:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 2000
   *                 description: Detalles de la solicitud
   *               move_date:
   *                 type: string
   *                 format: date
   *                 description: Fecha de mudanza (requerido para mudanzas, debe ser sábado)
   *               transporter_name:
   *                 type: string
   *                 description: Nombre del transportista (requerido para mudanzas)
   *               transporter_id_card:
   *                 type: string
   *                 description: Cédula del transportista (requerido para mudanzas)
   *               vehicle_brand:
   *                 type: string
   *                 description: Marca del vehículo (requerido para mudanzas)
   *               vehicle_model:
   *                 type: string
   *                 description: Modelo del vehículo (requerido para mudanzas)
   *               vehicle_plate:
   *                 type: string
   *                 description: Placa del vehículo (requerido para mudanzas)
   *               vehicle_color:
   *                 type: string
   *                 description: Color del vehículo (requerido para mudanzas)
   *               driver_name:
   *                 type: string
   *                 description: Nombre del chofer (requerido para mudanzas)
   *               driver_id_card:
   *                 type: string
   *                 description: Cédula del chofer (requerido para mudanzas)
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
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Request'
   *       400:
   *         description: Datos de entrada inválidos
   *       404:
   *         description: Usuario no encontrado
   *       500:
   *         description: Error interno del servidor
   */
  async createRequest(req, res, next) {
    try {
      // Validar datos de entrada
      const validation = RequestValidator.validateCreate(req.body);
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error
        });
      }

      const requestData = validation.value;

      // Verificar que el usuario existe
      const userExists = await this.requestModel.userExists(requestData.wp_user_id);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario especificado no existe en el sistema'
        });
      }

      // Crear la solicitud
      const request = await this.requestModel.create(requestData);

      // Obtener datos del usuario para el correo
      const userSql = 'SELECT ID, display_name, user_email, user_nicename FROM wp_users WHERE ID = ?';
      const userResults = await db.query(userSql, [requestData.wp_user_id]);
      const user = userResults[0];

      // Enviar correo de confirmación
      await this.emailService.sendRequestConfirmation(request, user);

      res.status(201).json({
        success: true,
        message: 'Solicitud creada exitosamente. Será atendida en un lapso de 24 horas hábiles.',
        data: request,
        confirmation: {
          message: 'Su solicitud ha sido recibida correctamente',
          timeframe: '24 horas hábiles',
          details: 'La junta de condominio revisará su solicitud y le enviará una respuesta por correo electrónico'
        }
      });
    } catch (error) {
      next(error);
    }
  }

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
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [Recibida, Aprobado, Rechazado, Atendido]
   *         description: Filtrar por estado de la solicitud
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [Mudanza - Entrada, Mudanza - Salida, Sugerencias, Reclamos, Carta de Residencia]
   *         description: Filtrar por tipo de solicitud
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 20
   *         description: Límite de resultados por página
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
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Request'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   */
  async getRequests(req, res, next) {
    try {
      const { user_id, status, type } = req.query;
      const { page, limit, offset } = req.pagination;

      let requests, total;

      if (user_id) {
        // Obtener solicitudes de un usuario específico
        requests = await this.requestModel.findByUserId(user_id, limit, offset);
        total = await this.requestModel.countByUserId(user_id);
      } else {
        // Obtener todas las solicitudes (para administradores) con filtros
        requests = await this.requestModel.findAll(limit, offset, { status, type });
        total = await this.requestModel.countAll({ status, type });
      }

      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: requests,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }

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
   *                 data:
   *                   $ref: '#/components/schemas/Request'
   *       404:
   *         description: Solicitud no encontrada
   */
  async getRequestById(req, res, next) {
    try {
      const { id } = req.params;
      const request = await this.requestModel.findById(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada',
          message: 'La solicitud especificada no existe'
        });
      }

      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  }

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
   *               response:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 2000
   *                 description: Respuesta de la junta de condominio
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
   *                 message:
   *                   type: string
   *                 data:
   *                   $ref: '#/components/schemas/Request'
   *       400:
   *         description: Datos de entrada inválidos
   *       404:
   *         description: Solicitud no encontrada
   */
  async updateRequest(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar que la solicitud existe
      const existingRequest = await this.requestModel.findById(id);
      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada',
          message: 'La solicitud especificada no existe'
        });
      }

      // Validar datos de entrada
      const validation = RequestValidator.validateUpdate(req.body);
      if (validation.error) {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: validation.error
        });
      }

      const updateData = validation.value;

      // Validar que el estado es válido para el tipo de solicitud
      console.log(`DEBUG updateRequest: request_type="${existingRequest.request_type}", status="${updateData.status}"`);
      const isValidStatus = RequestValidator.validateStatusForType(existingRequest.request_type, updateData.status);
      console.log(`DEBUG validateStatusForType result: ${isValidStatus}`);
      
      if (!isValidStatus) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido para este tipo de solicitud',
          message: `Para solicitudes de ${existingRequest.request_type}, el estado debe ser ${existingRequest.request_type.includes('Mudanza') ? 'Aprobado o Rechazado' : 'Atendido'}`
        });
      }

      // Actualizar la solicitud
      const updatedRequest = await this.requestModel.update(id, updateData);

      // Obtener datos del usuario para el correo
      const userSql = 'SELECT ID, display_name, user_email, user_nicename FROM wp_users WHERE ID = ?';
      const userResults = await db.query(userSql, [existingRequest.wp_user_id]);
      const user = userResults[0];

      // Enviar correo de notificación
      await this.emailService.sendRequestResponse(updatedRequest, user);

      res.json({
        success: true,
        message: 'Solicitud actualizada exitosamente',
        data: updatedRequest
      });
    } catch (error) {
      next(error);
    }
  }

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
   *                 data:
   *                   type: object
   *                   properties:
   *                     total:
   *                       type: integer
   *                     byType:
   *                       type: object
   *                     byStatus:
   *                       type: object
   *                     thisMonth:
   *                       type: integer
   */
  async getStats(req, res, next) {
    try {
      // Estadísticas generales
      const totalSql = 'SELECT COUNT(*) as total FROM condo360solicitudes_requests';
      const totalResult = await db.query(totalSql);

      // Estadísticas por tipo
      const typeSql = `
        SELECT request_type, COUNT(*) as count 
        FROM condo360solicitudes_requests 
        GROUP BY request_type
      `;
      const typeResults = await db.query(typeSql);

      // Estadísticas por estado
      const statusSql = `
        SELECT status, COUNT(*) as count 
        FROM condo360solicitudes_requests 
        GROUP BY status
      `;
      const statusResults = await db.query(statusSql);

      // Solicitudes de este mes
      const monthSql = `
        SELECT COUNT(*) as count 
        FROM condo360solicitudes_requests 
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `;
      const monthResult = await db.query(monthSql);

      // Formatear resultados
      const byType = {};
      typeResults.forEach(row => {
        byType[row.request_type] = row.count;
      });

      const byStatus = {};
      statusResults.forEach(row => {
        byStatus[row.status] = row.count;
      });

      res.json({
        success: true,
        data: {
          total: totalResult[0].total,
          byType,
          byStatus,
          thisMonth: monthResult[0].count
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RequestController;
