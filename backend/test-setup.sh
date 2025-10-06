#!/bin/bash

# Script de prueba para Condominio360 Solicitudes Backend

echo "🔍 Verificando configuración del backend..."

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo "❌ Archivo .env no encontrado"
    echo "📝 Copiando archivo de ejemplo..."
    cp env.example .env
    echo "⚠️  IMPORTANTE: Configure las variables en el archivo .env antes de continuar"
    echo "   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    echo "   - SMTP_HOST, SMTP_USER, SMTP_PASS"
    echo "   - WORDPRESS_URL"
    exit 1
fi

# Verificar dependencias
echo "📦 Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar que las dependencias críticas están instaladas
echo "🔍 Verificando dependencias críticas..."
node -e "
const required = ['express', 'mysql2', 'nodemailer', 'moment-timezone', 'cors', 'helmet'];
const missing = [];

required.forEach(dep => {
    try {
        require(dep);
        console.log('✅', dep);
    } catch (e) {
        missing.push(dep);
        console.log('❌', dep);
    }
});

if (missing.length > 0) {
    console.log('❌ Dependencias faltantes:', missing.join(', '));
    process.exit(1);
} else {
    console.log('✅ Todas las dependencias están instaladas');
}
"

if [ $? -ne 0 ]; then
    echo "❌ Error en dependencias"
    exit 1
fi

# Verificar configuración de base de datos
echo "🗄️ Verificando configuración de base de datos..."
node -e "
require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wordpress'
};

console.log('Configuración DB:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database
});

mysql.createConnection(config)
    .then(connection => {
        console.log('✅ Conexión a base de datos exitosa');
        connection.end();
    })
    .catch(error => {
        console.log('❌ Error de conexión a base de datos:', error.message);
        process.exit(1);
    });
"

if [ $? -ne 0 ]; then
    echo "❌ Error en configuración de base de datos"
    exit 1
fi

# Verificar configuración SMTP
echo "📧 Verificando configuración SMTP..."
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');

const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true'
    }
};

console.log('Configuración SMTP:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user
});

const transporter = nodemailer.createTransport(config);
transporter.verify()
    .then(() => {
        console.log('✅ Configuración SMTP válida');
    })
    .catch(error => {
        console.log('❌ Error en configuración SMTP:', error.message);
        process.exit(1);
    });
"

if [ $? -ne 0 ]; then
    echo "❌ Error en configuración SMTP"
    exit 1
fi

# Verificar archivos críticos
echo "📁 Verificando archivos críticos..."
files=(
    "src/app.js"
    "src/config/database.js"
    "src/services/EmailService.js"
    "src/models/Request.js"
    "src/controllers/RequestController.js"
    "src/routes/requests.js"
    "src/middleware/errorHandler.js"
    "src/middleware/dateFormatter.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - Archivo faltante"
        exit 1
    fi
done

echo ""
echo "🎉 Verificación completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configure las variables en .env si no lo ha hecho"
echo "2. Ejecute el script SQL: mysql -u root -p wordpress_db < sql/create_tables.sql"
echo "3. Inicie el servidor: npm start"
echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm start"
echo ""
echo "🔧 Para desarrollo:"
echo "   npm run dev"
