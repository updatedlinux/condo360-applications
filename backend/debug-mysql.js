#!/usr/bin/env node

/**
 * Script de debugging para MySQL
 * Verifica exactamente qué parámetros se están pasando a las consultas
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugMySQL() {
    console.log('🔍 Debugging MySQL Parameters...');
    console.log('================================');
    
    try {
        // Conectar a la base de datos
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'wordpress',
            port: process.env.DB_PORT || 3306
        });
        
        console.log('✅ Conexión a MySQL establecida');
        
        // Probar consulta simple
        console.log('\n1. Probando consulta simple...');
        const [simpleResult] = await connection.execute('SELECT COUNT(*) as total FROM condo360solicitudes_requests');
        console.log('✅ Consulta simple exitosa:', simpleResult[0]);
        
        // Probar consulta con LIMIT y OFFSET usando diferentes tipos de parámetros
        console.log('\n2. Probando consulta con LIMIT y OFFSET...');
        
        // Test 1: Parámetros como números
        console.log('   Test 1: Parámetros como números enteros');
        try {
            const [result1] = await connection.execute(
                'SELECT * FROM condo360solicitudes_requests ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [20, 0]
            );
            console.log('   ✅ Éxito con números:', result1.length, 'registros');
        } catch (error) {
            console.log('   ❌ Error con números:', error.message);
        }
        
        // Test 2: Parámetros como strings
        console.log('   Test 2: Parámetros como strings');
        try {
            const [result2] = await connection.execute(
                'SELECT * FROM condo360solicitudes_requests ORDER BY created_at DESC LIMIT ? OFFSET ?',
                ['20', '0']
            );
            console.log('   ✅ Éxito con strings:', result2.length, 'registros');
        } catch (error) {
            console.log('   ❌ Error con strings:', error.message);
        }
        
        // Test 3: Parámetros mixtos
        console.log('   Test 3: Parámetros mixtos');
        try {
            const [result3] = await connection.execute(
                'SELECT * FROM condo360solicitudes_requests ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [20, '0']
            );
            console.log('   ✅ Éxito con mixtos:', result3.length, 'registros');
        } catch (error) {
            console.log('   ❌ Error con mixtos:', error.message);
        }
        
        // Test 4: Parámetros undefined/null
        console.log('   Test 4: Parámetros undefined/null');
        try {
            const [result4] = await connection.execute(
                'SELECT * FROM condo360solicitudes_requests ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [undefined, null]
            );
            console.log('   ✅ Éxito con undefined/null:', result4.length, 'registros');
        } catch (error) {
            console.log('   ❌ Error con undefined/null:', error.message);
        }
        
        // Test 5: Verificar tipos de datos
        console.log('\n3. Verificando tipos de datos...');
        const testParams = [20, 0, '20', '0', undefined, null];
        testParams.forEach((param, index) => {
            console.log(`   Parámetro ${index}: ${param} (tipo: ${typeof param})`);
        });
        
        // Test 6: Consulta con JOIN
        console.log('\n4. Probando consulta con JOIN...');
        try {
            const [joinResult] = await connection.execute(`
                SELECT r.*, u.display_name, u.user_email, u.user_nicename
                FROM condo360solicitudes_requests r
                LEFT JOIN wp_users u ON r.wp_user_id = u.ID
                ORDER BY r.created_at DESC
                LIMIT ? OFFSET ?
            `, [5, 0]);
            console.log('   ✅ Consulta con JOIN exitosa:', joinResult.length, 'registros');
        } catch (error) {
            console.log('   ❌ Error en consulta con JOIN:', error.message);
        }
        
        await connection.end();
        console.log('\n✅ Debugging completado');
        
    } catch (error) {
        console.error('❌ Error en debugging:', error);
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    debugMySQL();
}

module.exports = debugMySQL;
