#!/usr/bin/env node

// Script para verificar las funciones de cálculo de sábados del frontend
console.log('🔍 Verificando funciones de cálculo de sábados...');
console.log('===============================================');

// Simular la función getNextSaturday del frontend
function getNextSaturday() {
    const today = new Date();
    const venezuelanTime = new Date(today.getTime() - (4 * 60 * 60 * 1000));
    
    // Encontrar el próximo sábado
    let nextSaturday = new Date(venezuelanTime);
    const daysUntilSaturday = (6 - venezuelanTime.getDay()) % 7;
    
    if (daysUntilSaturday === 0 && venezuelanTime.getHours() >= 18) {
        // Si es sábado después de las 6 PM, usar el siguiente sábado
        nextSaturday.setDate(venezuelanTime.getDate() + 7);
    } else {
        nextSaturday.setDate(venezuelanTime.getDate() + daysUntilSaturday);
    }
    
    return nextSaturday.toISOString().split('T')[0];
}

// Simular la función getLastSaturdayOfYear del frontend
function getLastSaturdayOfYear() {
    const year = new Date().getFullYear();
    const lastDay = new Date(year, 11, 31); // 31 de diciembre
    const lastSaturday = new Date(lastDay);
    
    // Retroceder hasta encontrar el último sábado del año
    while (lastSaturday.getDay() !== 6) {
        lastSaturday.setDate(lastSaturday.getDate() - 1);
    }
    
    return lastSaturday.toISOString().split('T')[0];
}

// Simular la función isValidSaturdayVenezuela del frontend
function isValidSaturdayVenezuela(dateString) {
    const date = new Date(dateString);
    const venezuelanTime = new Date(date.getTime() - (4 * 60 * 60 * 1000));
    return venezuelanTime.getDay() === 6; // 6 = sábado
}

console.log('📅 Fechas calculadas por el frontend:');
console.log(`   Próximo sábado: ${getNextSaturday()}`);
console.log(`   Último sábado del año: ${getLastSaturdayOfYear()}`);

console.log('');
console.log('🧪 Verificando fechas de prueba:');
const testDates = ['2025-10-11', '2025-10-12', '2025-10-18', '2025-10-19'];
testDates.forEach(dateStr => {
    const isValid = isValidSaturdayVenezuela(dateStr);
    const date = new Date(dateStr);
    const dayName = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
    
    console.log(`   ${dateStr}: ${dayName} - ${isValid ? '✅ Válido' : '❌ Inválido'}`);
});

console.log('');
console.log('🕐 Información actual:');
const now = new Date();
const venezuelanTime = new Date(now.getTime() - (4 * 60 * 60 * 1000));
console.log(`   Fecha actual: ${now.toISOString().split('T')[0]}`);
console.log(`   Día actual: ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][now.getDay()]}`);
console.log(`   Hora actual: ${now.toTimeString()}`);
console.log(`   Zona horaria Venezuela: ${venezuelanTime.toISOString().split('T')[0]}`);
console.log(`   Día en Venezuela: ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][venezuelanTime.getDay()]}`);
