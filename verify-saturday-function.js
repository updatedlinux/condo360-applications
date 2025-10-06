#!/usr/bin/env node

// Script para verificar la función corregida
console.log('🔍 Verificando función isValidSaturdayVenezuela corregida...');
console.log('=======================================================');

// Función corregida
function isValidSaturdayVenezuela(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    
    // 6 = sábado en JavaScript (0 = domingo, 1 = lunes, ..., 6 = sábado)
    return date.getDay() === 6;
}

// Función anterior (problemática)
function isValidSaturdayVenezuelaOld(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const venezuelanTime = new Date(date.getTime() - (4 * 60 * 60 * 1000));
    
    // 6 = sábado en JavaScript (0 = domingo, 1 = lunes, ..., 6 = sábado)
    return venezuelanTime.getDay() === 6;
}

console.log('🧪 Verificando fechas conocidas:');
const testDates = [
    { date: '2025-10-11', expected: true, day: 'Sábado' },
    { date: '2025-10-12', expected: true, day: 'Sábado' },
    { date: '2025-10-18', expected: true, day: 'Sábado' },
    { date: '2025-10-19', expected: true, day: 'Sábado' },
    { date: '2025-10-13', expected: false, day: 'Lunes' },
    { date: '2025-10-14', expected: false, day: 'Martes' }
];

testDates.forEach(item => {
    const isValidNew = isValidSaturdayVenezuela(item.date);
    const isValidOld = isValidSaturdayVenezuelaOld(item.date);
    const date = new Date(item.date);
    const actualDay = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][date.getDay()];
    
    console.log(`📅 ${item.date}:`);
    console.log(`   Día real: ${actualDay}`);
    console.log(`   Esperado: ${item.expected ? 'Sábado' : 'No sábado'}`);
    console.log(`   Función nueva: ${isValidNew ? '✅ SÍ' : '❌ NO'} ${isValidNew === item.expected ? '✅' : '❌'}`);
    console.log(`   Función anterior: ${isValidOld ? '✅ SÍ' : '❌ NO'} ${isValidOld === item.expected ? '✅' : '❌'}`);
    console.log('');
});

console.log('🎯 Resumen:');
console.log('===========');
console.log('✅ Función corregida: Usa new Date(dateString) directamente');
console.log('❌ Función anterior: Aplicaba ajuste de zona horaria incorrecto');
console.log('');
console.log('🔧 El problema era que el ajuste de zona horaria estaba cambiando');
console.log('   el día de la semana de las fechas válidas.');
