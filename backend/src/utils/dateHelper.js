const moment = require('moment-timezone');

// Configurar zona horaria para Venezuela (GMT-4)
const TIMEZONE = 'America/Caracas';

/**
 * Helper para manejar fechas en GMT-4 (America/Caracas)
 */
class DateHelper {
  /**
   * Obtener fecha actual en GMT-4
   * @returns {moment.Moment} - Fecha actual en GMT-4
   */
  static now() {
    return moment.tz(TIMEZONE);
  }

  /**
   * Convertir fecha a GMT-4 y formatear como YYYY-MM-DD (solo fecha, sin hora)
   * @param {string|Date|moment.Moment} date - Fecha a convertir
   * @returns {string} - Fecha formateada como YYYY-MM-DD en GMT-4
   */
  static toDateOnly(date) {
    if (!date) return null;
    
    // Si es string "YYYY-MM-DD", verificar que esté en GMT-4
    if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Interpretar como fecha en GMT-4 (medianoche)
      return moment.tz(date, TIMEZONE).format('YYYY-MM-DD');
    }
    
    // Convertir a moment en GMT-4
    const momentDate = moment.tz(date, TIMEZONE);
    return momentDate.format('YYYY-MM-DD');
  }

  /**
   * Convertir fecha a objeto Date en GMT-4 (medianoche)
   * @param {string|Date|moment.Moment} date - Fecha a convertir
   * @returns {Date} - Objeto Date en GMT-4 (medianoche)
   */
  static toDateObject(date) {
    if (!date) return null;
    
    const momentDate = moment.tz(date, TIMEZONE).startOf('day');
    return momentDate.toDate();
  }

  /**
   * Verificar si una fecha es sábado en GMT-4
   * @param {string|Date|moment.Moment} date - Fecha a verificar
   * @returns {boolean} - True si es sábado
   */
  static isSaturday(date) {
    if (!date) return false;
    const momentDate = moment.tz(date, TIMEZONE);
    return momentDate.day() === 6; // 6 = sábado
  }

  /**
   * Verificar si una fecha es futura en GMT-4
   * @param {string|Date|moment.Moment} date - Fecha a verificar
   * @returns {boolean} - True si es futura
   */
  static isFuture(date) {
    if (!date) return false;
    const momentDate = moment.tz(date, TIMEZONE).startOf('day');
    const today = moment.tz(TIMEZONE).startOf('day');
    return momentDate.isAfter(today);
  }

  /**
   * Formatear fecha para mostrar (DD/MM/YYYY) en GMT-4
   * @param {string|Date|moment.Moment} date - Fecha a formatear
   * @returns {string} - Fecha formateada como DD/MM/YYYY
   */
  static formatDisplay(date) {
    if (!date) return null;
    const momentDate = moment.tz(date, TIMEZONE);
    return momentDate.format('DD/MM/YYYY');
  }

  /**
   * Formatear fecha y hora para mostrar (DD/MM/YYYY HH:mm AM/PM) en GMT-4
   * @param {string|Date|moment.Moment} date - Fecha a formatear
   * @returns {string} - Fecha y hora formateada
   */
  static formatDateTime(date) {
    if (!date) return null;
    const momentDate = moment.tz(date, TIMEZONE);
    const hours = momentDate.hours();
    const minutes = momentDate.minutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${momentDate.format('DD/MM/YYYY')} a las ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  /**
   * Obtener día de la semana en español
   * @param {string|Date|moment.Moment} date - Fecha
   * @returns {string} - Día de la semana en español
   */
  static getDayName(date) {
    if (!date) return null;
    const momentDate = moment.tz(date, TIMEZONE);
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    return days[momentDate.day()];
  }

  /**
   * Parsear fecha desde string YYYY-MM-DD y asegurar que esté en GMT-4
   * @param {string|Date|moment.Moment} dateString - String de fecha YYYY-MM-DD o Date object
   * @returns {moment.Moment} - Moment en GMT-4
   */
  static parseDateString(dateString) {
    if (!dateString) return null;
    
    // Si viene como string "YYYY-MM-DD", interpretar como medianoche en GMT-4
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Parsear directamente como fecha local en GMT-4 (sin conversión UTC)
      const [year, month, day] = dateString.split('-');
      return moment.tz({
        year: parseInt(year, 10),
        month: parseInt(month, 10) - 1, // moment usa 0-11 para meses
        day: parseInt(day, 10)
      }, TIMEZONE).startOf('day');
    }
    
    // Si viene como Date object, extraer componentes locales
    if (dateString instanceof Date) {
      // Crear moment directamente en GMT-4 usando los componentes de fecha
      return moment.tz({
        year: dateString.getFullYear(),
        month: dateString.getMonth(),
        day: dateString.getDate()
      }, TIMEZONE).startOf('day');
    }
    
    // Para otros formatos, usar moment normal
    return moment.tz(dateString, TIMEZONE).startOf('day');
  }
}

module.exports = DateHelper;

