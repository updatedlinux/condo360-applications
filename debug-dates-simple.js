#!/usr/bin/env node

// Script simple para debuggear fechas
console.log('🔍 Debuggeando fechas...');
console.log('======================');

const testDate = '2025-10-11';
console.log(`📅 Fecha de prueba: ${testDate}`);

// Crear fecha directamente
const date = new Date(testDate);
console.log(`   new Date('${testDate}'):`);
console.log(`   - Fecha completa: ${date}`);
console.log(`   - Día de la semana: ${date.getDay()} (0=domingo, 6=sábado)`);
console.log(`   - Es sábado: ${date.getDay() === 6 ? '✅ SÍ' : '❌ NO'}`);

// Verificar fecha actual
const today = new Date();
console.log(`\n🕐 Fecha actual:`);
console.log(`   - Fecha: ${today.toISOString().split('T')[0]}`);
console.log(`   - Día: ${today.getDay()}`);
console.log(`   - Es sábado: ${today.getDay() === 6 ? '✅ SÍ' : '❌ NO'}`);

// Verificar si la fecha de prueba es futura
today.setHours(0, 0, 0, 0);
const checkDate = new Date(testDate);
checkDate.setHours(0, 0, 0, 0);

console.log(`\n📊 Comparación:`);
console.log(`   - Hoy (sin hora): ${today.toISOString()}`);
console.log(`   - Fecha prueba (sin hora): ${checkDate.toISOString()}`);
console.log(`   - Es futura: ${checkDate > today ? '✅ SÍ' : '❌ NO'}`);

// Probar con diferentes formatos
console.log(`\n🧪 Diferentes formatos:`);
const formats = [
    '2025-10-11',
    '2025-10-11T00:00:00',
    '2025-10-11T00:00:00Z',
    '2025-10-11T00:00:00-04:00'
];

formats.forEach(format => {
    const testDate = new Date(format);
    console.log(`   ${format}: día ${testDate.getDay()} ${testDate.getDay() === 6 ? '✅' : '❌'}`);
});
