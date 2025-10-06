#!/usr/bin/env node

// Script para verificar la función corregida
console.log('🔍 Verificando función corregida...');
console.log('==================================');

// Función corregida
function getNextSaturday() {
    const today = new Date();
    
    // Encontrar el próximo sábado
    let nextSaturday = new Date(today);
    const daysUntilSaturday = (6 - today.getDay()) % 7;
    
    if (daysUntilSaturday === 0) {
        // Si es sábado, usar el siguiente sábado
        nextSaturday.setDate(today.getDate() + 7);
    } else {
        // Calcular días hasta el próximo sábado
        nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    }
    
    return nextSaturday.toISOString().split('T')[0];
}

// Función para verificar si es sábado
function isValidSaturday(dateString) {
    const date = new Date(dateString);
    return date.getDay() === 6; // 6 = sábado
}

console.log('📅 Fecha calculada por la función corregida:');
const nextSat = getNextSaturday();
console.log(`   Próximo sábado: ${nextSat}`);
console.log(`   Es sábado: ${isValidSaturday(nextSat) ? '✅ SÍ' : '❌ NO'}`);

console.log('');
console.log('🧪 Verificando fechas conocidas:');
const knownDates = [
    { date: '2025-10-11', day: 'Viernes', valid: false },
    { date: '2025-10-12', day: 'Sábado', valid: true },
    { date: '2025-10-18', day: 'Viernes', valid: false },
    { date: '2025-10-19', day: 'Sábado', valid: true }
];

knownDates.forEach(item => {
    const isValid = isValidSaturday(item.date);
    const status = isValid === item.valid ? '✅' : '❌';
    console.log(`   ${item.date}: ${item.day} - ${status} ${isValid ? 'Válido' : 'Inválido'}`);
});

console.log('');
console.log('🕐 Información actual:');
const now = new Date();
const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
console.log(`   Fecha actual: ${now.toISOString().split('T')[0]}`);
console.log(`   Día actual: ${dayNames[now.getDay()]}`);
console.log(`   Días hasta sábado: ${(6 - now.getDay()) % 7}`);
