const Joi = require('joi');
const moment = require('moment-timezone');
const DateHelper = require('../utils/dateHelper');

// Configurar zona horaria para Venezuela (GMT-4)
moment.tz.setDefault('America/Caracas');

/**
 * Modelo para las solicitudes de Condominio360
 */
class RequestModel {
  constructor(db) {
    this.db = db;
  }

  /**
   * Crear una nueva solicitud
   * @param {Object} requestData - Datos de la solicitud
   * @returns {Promise<Object>} - Solicitud creada
   */
  async create(requestData) {
    const {
      wp_user_id,
      request_type,
      details,
      move_date,
      transporter_name,
      transporter_id_card,
      vehicle_brand,
      vehicle_model,
      vehicle_plate,
      vehicle_color,
      driver_name,
      driver_id_card
    } = requestData;

    const sql = `
      INSERT INTO condo360solicitudes_requests (
        wp_user_id, request_type, details, move_date,
        transporter_name, transporter_id_card, vehicle_brand,
        vehicle_model, vehicle_plate, vehicle_color,
        driver_name, driver_id_card, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Recibida', NOW(), NOW())
    `;

    // Convertir move_date a formato DATE (YYYY-MM-DD) en GMT-4
    let moveDateFormatted = null;
    if (move_date) {
      moveDateFormatted = DateHelper.toDateOnly(move_date);
      console.log(`DEBUG create: move_date original=${move_date}, formatted=${moveDateFormatted}`);
    }

    // Convertir undefined a null para campos opcionales
    const params = [
      wp_user_id, 
      request_type, 
      details, 
      moveDateFormatted,
      transporter_name || null, 
      transporter_id_card || null, 
      vehicle_brand || null,
      vehicle_model || null, 
      vehicle_plate || null, 
      vehicle_color || null,
      driver_name || null, 
      driver_id_card || null
    ];

    console.log(`DEBUG create: request_type=${request_type}, params count=${params.length}`);
    
    const result = await this.db.query(sql, params);
    return await this.findById(result.insertId);
  }

  /**
   * Buscar solicitud por ID
   * @param {number} id - ID de la solicitud
   * @returns {Promise<Object|null>} - Solicitud encontrada
   */
  async findById(id) {
    const sql = `
      SELECT r.*, u.display_name, u.user_email, u.user_nicename
      FROM condo360solicitudes_requests r
      LEFT JOIN wp_users u ON r.wp_user_id = u.ID
      WHERE r.id = ?
    `;
    
    const results = await this.db.query(sql, [id]);
    if (results.length === 0) return null;
    
    // Formatear fechas para GMT-4
    return this.formatRequestDates(results[0]);
  }

  /**
   * Convertir parámetros a enteros de forma segura
   * @param {any} value - Valor a convertir
   * @param {number} defaultValue - Valor por defecto
   * @returns {number} - Entero válido
   */
  safeParseInt(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Formatear fechas de una solicitud para GMT-4
   * @param {Object} request - Solicitud a formatear
   * @returns {Object} - Solicitud con fechas formateadas
   */
  formatRequestDates(request) {
    if (!request) return null;

    const formatted = { ...request };

    // Formatear move_date si existe (solo fecha, sin hora)
    if (formatted.move_date) {
      // La BD devuelve DATE como string "YYYY-MM-DD", interpretarlo en GMT-4
      const moveDateMoment = DateHelper.parseDateString(formatted.move_date);
      formatted.move_date_formatted = DateHelper.formatDisplay(moveDateMoment);
      
      // También mantener el ISO original para compatibilidad
      formatted.move_date = DateHelper.toDateOnly(moveDateMoment);
      
      console.log(`DEBUG formatRequestDates: move_date original=${request.move_date}, formatted=${formatted.move_date}, display=${formatted.move_date_formatted}`);
    }

    // Formatear created_at y updated_at con hora
    if (formatted.created_at) {
      const createdMoment = moment.tz(formatted.created_at, 'America/Caracas');
      formatted.created_at_formatted = DateHelper.formatDateTime(createdMoment);
    }

    if (formatted.updated_at) {
      const updatedMoment = moment.tz(formatted.updated_at, 'America/Caracas');
      formatted.updated_at_formatted = DateHelper.formatDateTime(updatedMoment);
    }

    return formatted;
  }

  /**
   * Buscar solicitudes por usuario
   * @param {number} wp_user_id - ID del usuario de WordPress
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Array>} - Lista de solicitudes
   */
  async findByUserId(wp_user_id, limit = 20, offset = 0) {
    // Convertir a enteros de forma segura
    const limitInt = this.safeParseInt(limit, 20);
    const offsetInt = this.safeParseInt(offset, 0);
    
    console.log(`DEBUG findByUserId: wp_user_id=${wp_user_id}, limit=${limit}->${limitInt}, offset=${offset}->${offsetInt}`);
    
    // Usar interpolación directa para LIMIT y OFFSET (solución definitiva)
    const sql = `
      SELECT r.*, u.display_name, u.user_email, u.user_nicename
      FROM condo360solicitudes_requests r
      LEFT JOIN wp_users u ON r.wp_user_id = u.ID
      WHERE r.wp_user_id = ?
      ORDER BY r.created_at DESC
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;
    
    const results = await this.db.query(sql, [wp_user_id]);
    // Formatear fechas para GMT-4
    return results.map(request => this.formatRequestDates(request));
  }

  /**
   * Obtener todas las solicitudes (para administradores) con filtros
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Offset para paginación
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} - Lista de solicitudes
   */
  async findAll(limit = 20, offset = 0, filters = {}) {
    // Convertir a enteros de forma segura
    const limitInt = this.safeParseInt(limit, 20);
    const offsetInt = this.safeParseInt(offset, 0);
    
    console.log(`DEBUG findAll: limit=${limit}->${limitInt}, offset=${offset}->${offsetInt}, filters=`, filters);
    
    // Construir WHERE clause dinámicamente
    let whereClause = '';
    const whereConditions = [];
    
    if (filters.status && filters.status.trim() !== '') {
      whereConditions.push(`r.status = '${filters.status}'`);
    }
    
    if (filters.type && filters.type.trim() !== '') {
      whereConditions.push(`r.request_type = '${filters.type}'`);
    }
    
    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }
    
    // Usar interpolación directa para LIMIT y OFFSET (solución definitiva)
    const sql = `
      SELECT r.*, u.display_name, u.user_email, u.user_nicename
      FROM condo360solicitudes_requests r
      LEFT JOIN wp_users u ON r.wp_user_id = u.ID
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ${limitInt} OFFSET ${offsetInt}
    `;
    
    console.log('DEBUG SQL:', sql);
    
    const results = await this.db.query(sql);
    // Formatear fechas para GMT-4
    return results.map(request => this.formatRequestDates(request));
  }

  /**
   * Contar total de solicitudes por usuario
   * @param {number} wp_user_id - ID del usuario de WordPress
   * @returns {Promise<number>} - Total de solicitudes
   */
  async countByUserId(wp_user_id) {
    const sql = `
      SELECT COUNT(*) as total
      FROM condo360solicitudes_requests
      WHERE wp_user_id = ?
    `;
    
    const result = await this.db.query(sql, [wp_user_id]);
    return result[0].total;
  }

  /**
   * Contar total de solicitudes (para administradores) con filtros
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<number>} - Total de solicitudes
   */
  async countAll(filters = {}) {
    // Construir WHERE clause dinámicamente
    let whereClause = '';
    const whereConditions = [];
    
    if (filters.status && filters.status.trim() !== '') {
      whereConditions.push(`status = '${filters.status}'`);
    }
    
    if (filters.type && filters.type.trim() !== '') {
      whereConditions.push(`request_type = '${filters.type}'`);
    }
    
    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }
    
    const sql = `
      SELECT COUNT(*) as total
      FROM condo360solicitudes_requests
      ${whereClause}
    `;
    
    console.log('DEBUG countAll SQL:', sql);
    
    const result = await this.db.query(sql);
    return result[0].total;
  }

  /**
   * Actualizar solicitud
   * @param {number} id - ID de la solicitud
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} - Solicitud actualizada
   */
  async update(id, updateData) {
    const {
      status,
      response
    } = updateData;

    const sql = `
      UPDATE condo360solicitudes_requests
      SET status = ?, response = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await this.db.query(sql, [status, response, id]);
    return await this.findById(id);
  }

  /**
   * Verificar si un usuario existe en WordPress
   * @param {number} wp_user_id - ID del usuario de WordPress
   * @returns {Promise<boolean>} - True si existe
   */
  async userExists(wp_user_id) {
    const sql = `
      SELECT ID FROM wp_users WHERE ID = ?
    `;
    
    const results = await this.db.query(sql, [wp_user_id]);
    return results.length > 0;
  }
}

/**
 * Validaciones para las solicitudes
 */
class RequestValidator {
  /**
   * Validar datos de creación de solicitud
   * @param {Object} data - Datos a validar
   * @returns {Object} - Resultado de la validación
   */
  static validateCreate(data) {
    // Determinar qué esquema usar basado en el tipo de solicitud
    let schema;
    
    if (data.request_type && data.request_type.includes('Mudanza')) {
      // Para mudanzas, usar el esquema completo que incluye campos de mudanza
      schema = Joi.object({
        wp_user_id: Joi.number().integer().positive().required()
          .messages({
            'number.base': 'El ID del usuario debe ser un número',
            'number.integer': 'El ID del usuario debe ser un número entero',
            'number.positive': 'El ID del usuario debe ser positivo',
            'any.required': 'El ID del usuario es requerido'
          }),
        request_type: Joi.string().valid('Mudanza - Entrada', 'Mudanza - Salida', 'Sugerencias', 'Reclamos', 'Carta de Residencia').required()
          .messages({
            'any.only': 'El tipo de solicitud debe ser uno de: Mudanza - Entrada, Mudanza - Salida, Sugerencias, Reclamos, Carta de Residencia',
            'any.required': 'El tipo de solicitud es requerido'
          }),
        details: Joi.string().min(10).max(2000).required()
          .messages({
            'string.min': 'Los detalles deben tener al menos 10 caracteres',
            'string.max': 'Los detalles no pueden exceder 2000 caracteres',
            'any.required': 'Los detalles son requeridos'
          }),
        move_date: Joi.date().iso().required()
          .custom((value, helpers) => {
            // Usar DateHelper para validar en GMT-4
            const parsedDate = DateHelper.parseDateString(value);
            
            if (!parsedDate || !parsedDate.isValid()) {
              return helpers.error('date.base');
            }
            
            // Verificar que sea sábado en GMT-4
            if (!DateHelper.isSaturday(parsedDate)) {
              return helpers.error('custom.saturday');
            }
            
            // Verificar que sea futura en GMT-4
            if (!DateHelper.isFuture(parsedDate)) {
              return helpers.error('custom.future');
            }
            
            // Retornar la fecha formateada como YYYY-MM-DD
            return DateHelper.toDateOnly(parsedDate);
          })
          .messages({
            'date.base': 'La fecha debe ser válida',
            'date.format': 'La fecha debe estar en formato ISO',
            'custom.saturday': 'Las mudanzas solo pueden ser programadas para sábados',
            'custom.future': 'La fecha de mudanza debe ser futura',
            'any.required': 'La fecha de mudanza es requerida para solicitudes de mudanza'
          }),
        transporter_name: Joi.string().min(2).max(255).required()
          .messages({
            'string.min': 'El nombre del transportista debe tener al menos 2 caracteres',
            'string.max': 'El nombre del transportista no puede exceder 255 caracteres',
            'any.required': 'El nombre del transportista es requerido'
          }),
        transporter_id_card: Joi.string().min(5).max(50).required()
          .messages({
            'string.min': 'La cédula del transportista debe tener al menos 5 caracteres',
            'string.max': 'La cédula del transportista no puede exceder 50 caracteres',
            'any.required': 'La cédula del transportista es requerida'
          }),
        vehicle_brand: Joi.string().min(2).max(100).required()
          .messages({
            'string.min': 'La marca del vehículo debe tener al menos 2 caracteres',
            'string.max': 'La marca del vehículo no puede exceder 100 caracteres',
            'any.required': 'La marca del vehículo es requerida'
          }),
        vehicle_model: Joi.string().min(2).max(100).required()
          .messages({
            'string.min': 'El modelo del vehículo debe tener al menos 2 caracteres',
            'string.max': 'El modelo del vehículo no puede exceder 100 caracteres',
            'any.required': 'El modelo del vehículo es requerido'
          }),
        vehicle_plate: Joi.string().min(3).max(20).required()
          .messages({
            'string.min': 'La placa del vehículo debe tener al menos 3 caracteres',
            'string.max': 'La placa del vehículo no puede exceder 20 caracteres',
            'any.required': 'La placa del vehículo es requerida'
          }),
        vehicle_color: Joi.string().min(2).max(50).required()
          .messages({
            'string.min': 'El color del vehículo debe tener al menos 2 caracteres',
            'string.max': 'El color del vehículo no puede exceder 50 caracteres',
            'any.required': 'El color del vehículo es requerido'
          }),
        driver_name: Joi.string().min(2).max(255).required()
          .messages({
            'string.min': 'El nombre del chofer debe tener al menos 2 caracteres',
            'string.max': 'El nombre del chofer no puede exceder 255 caracteres',
            'any.required': 'El nombre del chofer es requerido'
          }),
        driver_id_card: Joi.string().min(5).max(50).required()
          .messages({
            'string.min': 'La cédula del chofer debe tener al menos 5 caracteres',
            'string.max': 'La cédula del chofer no puede exceder 50 caracteres',
            'any.required': 'La cédula del chofer es requerida'
          })
      });
    } else {
      // Para otros tipos de solicitud, usar esquema básico
      schema = Joi.object({
        wp_user_id: Joi.number().integer().positive().required()
          .messages({
            'number.base': 'El ID del usuario debe ser un número',
            'number.integer': 'El ID del usuario debe ser un número entero',
            'number.positive': 'El ID del usuario debe ser positivo',
            'any.required': 'El ID del usuario es requerido'
          }),
        request_type: Joi.string().valid('Mudanza - Entrada', 'Mudanza - Salida', 'Sugerencias', 'Reclamos', 'Carta de Residencia').required()
          .messages({
            'any.only': 'El tipo de solicitud debe ser uno de: Mudanza - Entrada, Mudanza - Salida, Sugerencias, Reclamos, Carta de Residencia',
            'any.required': 'El tipo de solicitud es requerido'
          }),
        details: Joi.string().min(10).max(2000).required()
          .messages({
            'string.min': 'Los detalles deben tener al menos 10 caracteres',
            'string.max': 'Los detalles no pueden exceder 2000 caracteres',
            'any.required': 'Los detalles son requeridos'
          })
      });
    }

    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      return { error: error.details.map(detail => detail.message) };
    }

    return { value };
  }

  /**
   * Validar datos de actualización de solicitud
   * @param {Object} data - Datos a validar
   * @returns {Object} - Resultado de la validación
   */
  static validateUpdate(data) {
    const schema = Joi.object({
      status: Joi.string().valid('Recibida', 'Aprobado', 'Rechazado', 'Atendido').required()
        .messages({
          'any.only': 'El estado debe ser uno de: Recibida, Aprobado, Rechazado, Atendido',
          'any.required': 'El estado es requerido'
        }),
      response: Joi.string().min(10).max(2000).required()
        .messages({
          'string.min': 'La respuesta debe tener al menos 10 caracteres',
          'string.max': 'La respuesta no puede exceder 2000 caracteres',
          'any.required': 'La respuesta es requerida'
        })
    });

    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      return { error: error.details.map(detail => detail.message) };
    }

    return { value };
  }

  /**
   * Validar estado según tipo de solicitud
   * @param {string} request_type - Tipo de solicitud
   * @param {string} status - Estado a validar
   * @returns {boolean} - True si es válido
   */
  static validateStatusForType(request_type, status) {
    if (request_type.includes('Mudanza')) {
      return ['Aprobado', 'Rechazado'].includes(status);
    } else {
      return status === 'Atendido';
    }
  }
}

module.exports = {
  RequestModel,
  RequestValidator
};
