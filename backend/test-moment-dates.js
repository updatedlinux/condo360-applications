#!/usr/bin/env node

// Script simple para verificar fechas con moment
const moment = require('moment-timezone');

// Configurar zona horaria
moment.tz.setDefault('America/Caracas');

console.log('🔍 Verificando fechas con moment-timezone...');
console.log('==========================================');

const testDates = ['2025-10-11', '2025-10-12', '2025-10-18', '2025-10-19'];

testDates.forEach(dateStr => {
    const date = moment(dateStr).tz('America/Caracas');
    const dayOfWeek = date.day(); // 0=domingo, 1=lunes, ..., 6=sábado
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    console.log(`📅 Fecha: ${dateStr}`);
    console.log(`   Día de la semana: ${dayNames[dayOfWeek]} (${dayOfWeek})`);
    console.log(`   Es sábado: ${dayOfWeek === 6 ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Formato completo: ${date.format('YYYY-MM-DD dddd')}`);
    console.log('');
});

console.log('🕐 Fecha actual en Venezuela:');
const now = moment().tz('America/Caracas');
console.log(`   Fecha: ${now.format('YYYY-MM-DD')}`);
console.log(`   Día: ${now.format('dddd')}`);
console.log(`   Hora: ${now.format('HH:mm:ss')}`);
console.log(`   Zona: ${now.format('Z')}`);
