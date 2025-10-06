#!/bin/bash

# Script para aplicar corrección definitiva del problema MySQL
echo "🔧 Aplicando corrección definitiva del problema MySQL..."
echo "======================================================"

# Crear archivo de corrección temporal
cat > /tmp/mysql_fix.js << 'EOF'
// Corrección temporal para el problema de MySQL
const mysql = require('mysql2/promise');

async function testMySQLFix() {
    console.log('🧪 Probando diferentes enfoques para MySQL...');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'wordpress',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ Conexión establecida');
        
        // Test 1: Usar consultas sin parámetros preparados
        console.log('\n1. Probando consulta sin parámetros preparados...');
        try {
            const [result1] = await connection.execute(
                'SELECT COUNT(*) as total FROM condo360solicitudes_requests'
            );
            console.log('✅ Consulta simple exitosa:', result1[0]);
        } catch (error) {
            console.log('❌ Error en consulta simple:', error.message);
        }
        
        // Test 2: Usar query() en lugar de execute()
        console.log('\n2. Probando con query() en lugar de execute()...');
        try {
            const [result2] = await connection.query(
                'SELECT * FROM condo360solicitudes_requests ORDER BY created_at DESC LIMIT 5 OFFSET 0'
            );
            console.log('✅ Query directa exitosa:', result2.length, 'registros');
        } catch (error) {
            console.log('❌ Error en query directa:', error.message);
        }
        
        // Test 3: Usar parámetros como strings
        console.log('\n3. Probando con parámetros como strings...');
        try {
            const [result3] = await connection.execute(
                'SELECT * FROM condo360solicitudes_requests ORDER BY created_at DESC LIMIT ? OFFSET ?',
                ['5', '0']
            );
            console.log('✅ Parámetros como strings exitoso:', result3.length, 'registros');
        } catch (error) {
            console.log('❌ Error con parámetros como strings:', error.message);
        }
        
        // Test 4: Usar parámetros como números
        console.log('\n4. Probando con parámetros como números...');
        try {
            const [result4] = await connection.execute(
                'SELECT * FROM condo360solicitudes_requests ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [5, 0]
            );
            console.log('✅ Parámetros como números exitoso:', result4.length, 'registros');
        } catch (error) {
            console.log('❌ Error con parámetros como números:', error.message);
        }
        
        await connection.end();
        console.log('\n✅ Pruebas completadas');
        
    } catch (error) {
        console.error('❌ Error general:', error);
    }
}

testMySQLFix();
EOF

echo "📝 Archivo de prueba creado: /tmp/mysql_fix.js"
echo "🚀 Ejecutando pruebas..."

# Ejecutar desde el directorio del backend
cd /usr/local/src/condo360-applications/backend
node /tmp/mysql_fix.js

echo ""
echo "🎯 Basado en los resultados, aplicaremos la corrección más efectiva..."
