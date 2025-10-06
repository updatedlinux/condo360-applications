const moment = require('moment-timezone');

/**
 * Middleware para formatear fechas en formato venezolano (GMT-4)
 * Convierte todas las fechas a formato DD/MM/YYYY h:mm A
 */
const formatDatesMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (data && typeof data === 'object') {
      data = formatDatesInObject(data);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Formatear fechas recursivamente en un objeto
 * @param {any} obj - Objeto a procesar
 * @returns {any} - Objeto con fechas formateadas
 */
function formatDatesInObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => formatDatesInObject(item));
  }
  
  if (typeof obj === 'object') {
    const formatted = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (isDateField(key) && value) {
        formatted[key] = formatDate(value);
        // También agregar versión formateada legible
        formatted[key + '_formatted'] = formatDateReadable(value);
      } else if (typeof value === 'object') {
        formatted[key] = formatDatesInObject(value);
      } else {
        formatted[key] = value;
      }
    }
    
    return formatted;
  }
  
  return obj;
}

/**
 * Verificar si un campo es una fecha
 * @param {string} fieldName - Nombre del campo
 * @returns {boolean} - True si es campo de fecha
 */
function isDateField(fieldName) {
  const dateFields = [
    'created_at',
    'updated_at',
    'move_date',
    'date',
    'timestamp',
    'created',
    'updated',
    'modified'
  ];
  
  return dateFields.some(field => 
    fieldName.toLowerCase().includes(field.toLowerCase())
  );
}

/**
 * Formatear fecha a formato ISO con zona horaria venezolana
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada en ISO
 */
function formatDate(date) {
  try {
    return moment(date).tz('America/Caracas').format();
  } catch (error) {
    return date;
  }
}

/**
 * Formatear fecha a formato legible venezolano
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada legible
 */
function formatDateReadable(date) {
  try {
    return moment(date).tz('America/Caracas').format('DD/MM/YYYY [a las] h:mm A');
  } catch (error) {
    return date;
  }
}

/**
 * Formatear fecha para mostrar en listas
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada para listas
 */
function formatDateForList(date) {
  try {
    return moment(date).tz('America/Caracas').format('DD/MM/YYYY h:mm A');
  } catch (error) {
    return date;
  }
}

/**
 * Formatear solo fecha (sin hora)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Solo fecha formateada
 */
function formatDateOnly(date) {
  try {
    return moment(date).tz('America/Caracas').format('DD/MM/YYYY');
  } catch (error) {
    return date;
  }
}

/**
 * Obtener fecha actual en zona horaria venezolana
 * @returns {string} - Fecha actual formateada
 */
function getCurrentVenezuelanDate() {
  return moment().tz('America/Caracas').format('DD/MM/YYYY [a las] h:mm A');
}

/**
 * Obtener timestamp actual en zona horaria venezolana
 * @returns {string} - Timestamp actual
 */
function getCurrentVenezuelanTimestamp() {
  return moment().tz('America/Caracas').format();
}

module.exports = {
  formatDatesMiddleware,
  formatDate,
  formatDateReadable,
  formatDateForList,
  formatDateOnly,
  getCurrentVenezuelanDate,
  getCurrentVenezuelanTimestamp
};
