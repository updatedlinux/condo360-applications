#!/usr/bin/env node

// Script para verificar si las fechas de prueba son sábados
const moment = require('moment-timezone');

// Configurar zona horaria para Venezuela (GMT-4)
moment.tz.setDefault('America/Caracas');

console.log('🔍 Verificando fechas de prueba...');
console.log('================================');

const testDates = [
    '2025-10-11',
    '2025-10-12', 
    '2025-10-18',
    '2025-10-19'
];

testDates.forEach(dateStr => {
    const date = moment(dateStr).tz('America/Caracas');
    const dayOfWeek = date.format('dddd');
    const isSaturday = date.day() === 6;
    
    console.log(`📅 Fecha: ${dateStr}`);
    console.log(`   Día de la semana: ${dayOfWeek}`);
    console.log(`   Es sábado: ${isSaturday ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   Zona horaria: ${date.format('Z')}`);
    console.log('');
});

// Verificar fecha actual
const now = moment().tz('America/Caracas');
console.log('🕐 Fecha actual en Venezuela:');
console.log(`   Fecha: ${now.format('YYYY-MM-DD')}`);
console.log(`   Día: ${now.format('dddd')}`);
console.log(`   Hora: ${now.format('HH:mm:ss')}`);
console.log(`   Zona: ${now.format('Z')}`);

// Encontrar próximos sábados
console.log('');
console.log('📅 Próximos sábados:');
for (let i = 0; i < 5; i++) {
    const nextSaturday = moment().tz('America/Caracas').add(i, 'weeks').day(6);
    if (nextSaturday.isAfter(now, 'day')) {
        console.log(`   ${nextSaturday.format('YYYY-MM-DD')} - ${nextSaturday.format('dddd')}`);
    }
}
