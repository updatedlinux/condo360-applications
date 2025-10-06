# Solución de Problemas - Condominio360 Solicitudes Backend

## ❌ Error: `nodemailer.createTransporter is not a function`

### Problema
```
TypeError: nodemailer.createTransporter is not a function
```

### Solución
El método correcto es `createTransport`, no `createTransporter`. Ya corregido en el código.

**Archivo corregido**: `src/services/EmailService.js`
```javascript
// ❌ Incorrecto
this.transporter = nodemailer.createTransporter({

// ✅ Correcto  
this.transporter = nodemailer.createTransport({
```

## ⚠️ Advertencias MySQL2: Opciones de configuración inválidas

### Problema
```
Ignoring invalid configuration option passed to Connection: acquireTimeout
Ignoring invalid configuration option passed to Connection: timeout
Ignoring invalid configuration option passed to Connection: reconnect
```

### Solución
Eliminadas las opciones inválidas de la configuración de MySQL2.

**Archivo corregido**: `src/config/database.js`
```javascript
// ❌ Opciones inválidas eliminadas
// acquireTimeout: 60000,
// timeout: 60000,
// reconnect: true,

// ✅ Configuración válida
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wordpress',
  charset: 'utf8mb4',
  timezone: '-04:00',
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};
```

## 🔧 Pasos para Solucionar

### 1. Crear archivo .env
```bash
cd /usr/local/src/condo360-applications/backend
cp env.example .env
```

### 2. Configurar variables de entorno
Editar el archivo `.env` con sus datos reales:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wordpress_db
DB_USER=wordpress_user
DB_PASSWORD=wordpress_password

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
SMTP_SECURE=true
SMTP_TLS_REJECT_UNAUTHORIZED=true

# WordPress
WORDPRESS_URL=https://bonaventurecclub.com
WORDPRESS_SITE_NAME=Bonaventure Country Club
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Verificar configuración
```bash
./test-setup.sh
```

### 5. Crear tablas en base de datos
```bash
mysql -u root -p wordpress_db < sql/create_tables.sql
```

### 6. Iniciar servidor
```bash
npm start
```

## 🧪 Verificación Manual

### Probar conexión a base de datos
```bash
node -e "
require('dotenv').config();
const mysql = require('mysql2/promise');
const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};
mysql.createConnection(config)
  .then(conn => { console.log('✅ DB OK'); conn.end(); })
  .catch(err => console.log('❌ DB Error:', err.message));
"
```

### Probar configuración SMTP
```bash
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.verify()
  .then(() => console.log('✅ SMTP OK'))
  .catch(err => console.log('❌ SMTP Error:', err.message));
"
```

## 📋 Checklist de Verificación

- [ ] Archivo `.env` creado y configurado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Base de datos MySQL accesible
- [ ] Tablas creadas (`sql/create_tables.sql`)
- [ ] Configuración SMTP válida
- [ ] Puerto 7000 disponible
- [ ] Archivos del proyecto presentes

## 🚨 Errores Comunes

### Error: `Cannot find module 'dotenv'`
```bash
npm install dotenv
```

### Error: `ECONNREFUSED` (Base de datos)
- Verificar que MySQL esté ejecutándose
- Comprobar credenciales en `.env`
- Verificar que la base de datos existe

### Error: `Invalid login` (SMTP)
- Verificar credenciales SMTP
- Para Gmail, usar contraseña de aplicación
- Comprobar configuración de 2FA

### Error: `Port 7000 already in use`
```bash
# Encontrar proceso usando el puerto
lsof -i :7000
# Matar proceso
kill -9 <PID>
```

## 📞 Logs de Depuración

### Habilitar logs detallados
```bash
NODE_ENV=development npm start
```

### Ver logs en tiempo real
```bash
tail -f logs/combined.log
```

### Verificar estado de la API
```bash
curl http://localhost:7000/health
```

## ✅ Verificación Final

Una vez corregidos los errores, debería ver:
```
✅ Conexión a la base de datos establecida correctamente
🚀 Servidor ejecutándose en puerto 7000
📚 Documentación disponible en: http://localhost:7000/api-docs
🏥 Health check disponible en: http://localhost:7000/health
```
