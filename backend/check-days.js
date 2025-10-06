#!/usr/bin/env node

// Script simple para verificar días de la semana
console.log('🔍 Verificando días de la semana...');
console.log('================================');

const dates = [
    '2025-10-11',
    '2025-10-12', 
    '2025-10-18',
    '2025-10-19'
];

dates.forEach(dateStr => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    console.log(`📅 Fecha: ${dateStr}`);
    console.log(`   Día de la semana: ${dayNames[dayOfWeek]} (${dayOfWeek})`);
    console.log(`   Es sábado: ${dayOfWeek === 6 ? '✅ SÍ' : '❌ NO'}`);
    console.log('');
});

// Verificar fecha actual
const now = new Date();
console.log('🕐 Fecha actual:');
console.log(`   Fecha: ${now.toISOString().split('T')[0]}`);
console.log(`   Día: ${now.getDay()} (${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][now.getDay()]})`);
console.log(`   Hora: ${now.toTimeString()}`);

// Encontrar próximos sábados
console.log('');
console.log('📅 Próximos sábados:');
for (let i = 0; i < 10; i++) {
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + i);
    if (testDate.getDay() === 6) {
        console.log(`   ${testDate.toISOString().split('T')[0]} - Sábado`);
    }
}
