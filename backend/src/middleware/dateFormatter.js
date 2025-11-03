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
      // Si el campo ya tiene versión formateada, no formatear de nuevo
      if (key.endsWith('_formatted')) {
        formatted[key] = value;
      } else if (isDateField(key) && value && !isAlreadyFormatted(value)) {
        // Solo formatear si no está ya formateado
        formatted[key] = formatDate(value);
        // Solo agregar _formatted si no existe ya
        if (!obj[key + '_formatted']) {
          formatted[key + '_formatted'] = formatDateReadable(value);
        }
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
 * Verificar si una fecha ya está formateada (es string legible, no ISO)
 * @param {any} value - Valor a verificar
 * @returns {boolean} - True si ya está formateado
 */
function isAlreadyFormatted(value) {
  if (typeof value !== 'string') return false;
  
  // Si es un string que parece fecha formateada (DD/MM/YYYY) o tiene formato legible
  if (value.match(/^\d{2}\/\d{2}\/\d{4}/)) {
    return true;
  }
  
  // Si contiene "a las" es un formato legible
  if (value.includes('a las')) {
    return true;
  }
  
  return false;
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
    // Si ya está formateado, retornarlo como está
    if (typeof date === 'string' && isAlreadyFormatted(date)) {
      return date;
    }
    
    // Si es un objeto Date o string ISO, formatearlo
    const momentDate = moment.tz(date, 'America/Caracas');
    if (!momentDate.isValid()) {
      return date;
    }
    return momentDate.format('DD/MM/YYYY [a las] h:mm A');
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
