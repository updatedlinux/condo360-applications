/**
 * Middleware para manejo centralizado de errores
 * @param {Error} err - Error capturado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error capturado:', err);

  // Error de validación de Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Datos de entrada inválidos',
      details: err.details.map(detail => detail.message),
      status: 400
    });
  }

  // Error de MySQL
  if (err.code && err.code.startsWith('ER_')) {
    console.error('Error de MySQL:', err);
    return res.status(500).json({
      error: 'Error interno de base de datos',
      message: 'Ha ocurrido un error al procesar su solicitud',
      status: 500
    });
  }

  // Error de conexión a base de datos
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    console.error('Error de conexión:', err);
    return res.status(503).json({
      error: 'Servicio no disponible',
      message: 'No se puede conectar con la base de datos',
      status: 503
    });
  }

  // Error de validación personalizado
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      message: err.message,
      status: 400
    });
  }

  // Error de recurso no encontrado
  if (err.status === 404) {
    return res.status(404).json({
      error: 'Recurso no encontrado',
      message: err.message || 'El recurso solicitado no existe',
      status: 404
    });
  }

  // Error de autorización
  if (err.status === 401) {
    return res.status(401).json({
      error: 'No autorizado',
      message: err.message || 'No tiene permisos para acceder a este recurso',
      status: 401
    });
  }

  // Error de permisos
  if (err.status === 403) {
    return res.status(403).json({
      error: 'Acceso denegado',
      message: err.message || 'No tiene permisos para realizar esta acción',
      status: 403
    });
  }

  // Error de límite de tamaño
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Archivo demasiado grande',
      message: 'El archivo excede el tamaño máximo permitido',
      status: 413
    });
  }

  // Error de límite de payload
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload demasiado grande',
      message: 'Los datos enviados exceden el tamaño máximo permitido',
      status: 413
    });
  }

  // Error de sintaxis JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON inválido',
      message: 'El formato JSON enviado no es válido',
      status: 400
    });
  }

  // Error genérico del servidor
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : 'Error en la solicitud',
    message: status === 500 ? 'Ha ocurrido un error inesperado' : message,
    status: status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware para manejar rutas no encontradas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Middleware para validar parámetros de paginación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (page < 1) {
    return res.status(400).json({
      error: 'Página inválida',
      message: 'El número de página debe ser mayor a 0',
      status: 400
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      error: 'Límite inválido',
      message: 'El límite debe estar entre 1 y 100',
      status: 400
    });
  }

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit
  };

  next();
};

/**
 * Middleware para validar que el usuario existe
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const validateUserExists = async (req, res, next) => {
  try {
    const { wp_user_id } = req.body;
    
    if (!wp_user_id) {
      return res.status(400).json({
        error: 'ID de usuario requerido',
        message: 'El ID del usuario de WordPress es requerido',
        status: 400
      });
    }

    const db = require('../config/database');
    const sql = 'SELECT ID FROM wp_users WHERE ID = ?';
    const results = await db.query(sql, [wp_user_id]);

    if (results.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario especificado no existe en el sistema',
        status: 404
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para logging de requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    console.log(`${timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

module.exports = {
  errorHandler,
  notFoundHandler,
  validatePagination,
  validateUserExists,
  requestLogger
};
