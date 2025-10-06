# Condominio360 - Módulo de Solicitudes

Sistema completo para gestión de solicitudes de residentes en condominios, desarrollado con Node.js + Express para el backend y plugin WordPress para el frontend.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Reference](#api-reference)
- [Despliegue](#despliegue)
- [Mantenimiento](#mantenimiento)
- [Solución de Problemas](#solución-de-problemas)

## ✨ Características

### Backend Node.js
- ✅ API REST completa con Express.js
- ✅ Base de datos MySQL con WordPress
- ✅ Sistema de correos electrónicos con plantillas HTML
- ✅ Validaciones robustas con Joi
- ✅ Documentación Swagger automática
- ✅ Manejo de errores centralizado
- ✅ Rate limiting y seguridad
- ✅ Logging de actividad

### Plugin WordPress
- ✅ Dos shortcodes: formulario para residentes y panel de administración
- ✅ Interfaz responsive compatible con Astra
- ✅ Validaciones frontend y backend
- ✅ AJAX para comunicación con API
- ✅ Sistema de notificaciones
- ✅ Paginación y filtros

### Funcionalidades del Sistema
- ✅ **Solicitudes de Mudanza**: Entrada y salida con validación de fechas (solo sábados)
- ✅ **Sugerencias**: Sistema de propuestas de mejora
- ✅ **Reclamos**: Gestión de quejas y problemas
- ✅ **Notificaciones por correo**: Acuse de recibo y respuestas
- ✅ **Panel de administración**: Gestión completa para junta/administradores
- ✅ **Historial de solicitudes**: Seguimiento para residentes

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WordPress     │    │   Node.js API   │    │   MySQL DB      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ • Plugin        │    │ • Express.js    │    │ • wp_users      │
│ • Shortcodes    │    │ • Controllers   │    │ • condo360_*    │
│ • AJAX          │    │ • Models        │    │ • Triggers      │
│ • CSS/JS        │    │ • Services      │    │ • Views         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   SMTP Server   │    │   Nginx Proxy   │
│   (Emails)      │    │   Manager       │
└─────────────────┘    └─────────────────┘
```

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 18.0.0
- **MySQL** >= 5.7
- **WordPress** >= 6.0
- **Nginx Proxy Manager** (opcional)
- **SMTP Server** configurado

### 1. Instalación del Backend

```bash
# Clonar o descargar el proyecto
cd /path/to/condo360-applications/backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp env.example .env

# Configurar variables de entorno (ver sección Configuración)
nano .env

# Crear tablas en la base de datos
mysql -u root -p wordpress_db < sql/create_tables.sql

# Iniciar servidor
npm start
# o para desarrollo
npm run dev
```

### 2. Instalación del Plugin WordPress

```bash
# Copiar plugin a directorio de WordPress
cp -r wordpress-plugin/condo360-solicitudes /path/to/wordpress/wp-content/plugins/

# Activar plugin desde WordPress Admin
# Ir a Plugins > Plugins Instalados > Activar "Condominio360 - Módulo de Solicitudes"
```

### 3. Configuración de Nginx Proxy Manager

```nginx
# Configurar proxy para applications.bonaventurecclub.com
# Forward Hostname/IP: localhost
# Forward Port: 7000
# Block Common Exploits: ON
# Websockets Support: ON
```

## ⚙️ Configuración

### Variables de Entorno del Backend

Crear archivo `.env` en el directorio `backend/`:

```env
# Puerto del servidor
PORT=7000

# Configuración de base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=wordpress_db
DB_USER=wordpress_user
DB_PASSWORD=wordpress_password

# Configuración SMTP para envío de correos
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
SMTP_FROM_NAME=Condominio360 - Solicitudes
SMTP_FROM_EMAIL=noreply@bonaventurecclub.com

# Configuración SSL/TLS para SMTP
SMTP_SECURE=true
SMTP_TLS_REJECT_UNAUTHORIZED=true

# URL del sitio WordPress
WORDPRESS_URL=https://bonaventurecclub.com
WORDPRESS_SITE_NAME=Bonaventure Country Club

# Configuración de seguridad
JWT_SECRET=tu_jwt_secret_muy_seguro
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de correos
EMAIL_TEMPLATE_LOGO=https://bonaventurecclub.com/wp-content/uploads/2025/09/2-e1759267603471.png
EMAIL_TEMPLATE_COLOR_PRIMARY=#2563eb
EMAIL_TEMPLATE_COLOR_SECONDARY=#64748b
```

### Configuración de SMTP

#### Gmail
1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Usar la contraseña de aplicación en `SMTP_PASS`
4. Configurar SSL/TLS:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=true
   SMTP_TLS_REJECT_UNAUTHORIZED=true
   ```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_TLS_REJECT_UNAUTHORIZED=true
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_TLS_REJECT_UNAUTHORIZED=true
```

#### Servidor propio
- **Puerto 465**: `SMTP_SECURE=true` (SSL)
- **Puerto 587**: `SMTP_SECURE=false` (STARTTLS)
- **Verificación SSL**: `SMTP_TLS_REJECT_UNAUTHORIZED=true` (recomendado)

#### Configuración SSL/TLS
- `SMTP_SECURE=true`: Usar SSL/TLS (puerto 465)
- `SMTP_SECURE=false`: Usar STARTTLS (puerto 587)
- `SMTP_TLS_REJECT_UNAUTHORIZED=true`: Verificar certificados SSL (recomendado para producción)
- `SMTP_TLS_REJECT_UNAUTHORIZED=false`: Ignorar errores de certificados (solo para desarrollo)

### Configuración de WordPress

1. **Activar plugin** desde el panel de administración
2. **Verificar permisos** de usuarios para acceder a shortcodes
3. **Configurar tema** Astra si es necesario
4. **Probar conectividad** con la API

## 📖 Uso

### Shortcodes Disponibles

#### 1. Formulario para Residentes
```php
[condo360_solicitudes_form show_history="true"]
```

**Parámetros:**
- `show_history`: Mostrar historial de solicitudes (true/false)

**Ubicación recomendada:** Página privada para residentes

#### 2. Panel de Administración
```php
[condo360_solicitudes_admin per_page="20"]
```

**Parámetros:**
- `per_page`: Número de solicitudes por página (default: 20)

**Ubicación recomendada:** Página privada para administradores/junta

### Flujo de Trabajo

#### Para Residentes:
1. **Acceder** a la página con el shortcode del formulario
2. **Seleccionar** tipo de solicitud
3. **Completar** formulario con detalles
4. **Enviar** solicitud
5. **Recibir** correo de confirmación
6. **Consultar** historial de solicitudes
7. **Recibir** notificación cuando sea respondida

#### Para Administradores:
1. **Acceder** al panel de administración
2. **Revisar** estadísticas generales
3. **Filtrar** solicitudes por estado/tipo
4. **Ver detalles** completos de cada solicitud
5. **Responder** con estado y comentarios
6. **Enviar** notificación automática al residente

### Tipos de Solicitudes

#### Mudanza - Entrada/Salida
- **Campos requeridos**: Fecha (solo sábados), datos del transportista, vehículo y chofer
- **Estados válidos**: Aprobado, Rechazado
- **Validaciones**: Fecha futura, día sábado

#### Sugerencias
- **Campos requeridos**: Solo detalles
- **Estados válidos**: Atendido
- **Propósito**: Propuestas de mejora

#### Reclamos
- **Campos requeridos**: Solo detalles
- **Estados válidos**: Atendido
- **Propósito**: Quejas y problemas

## 🔌 API Reference

### Base URL
```
http://localhost:7000/api
```

### Endpoints

#### POST /requests
Crear nueva solicitud

**Request Body:**
```json
{
  "wp_user_id": 123,
  "request_type": "Mudanza - Entrada",
  "details": "Detalles de la solicitud...",
  "move_date": "2024-01-20",
  "transporter_name": "Juan Pérez",
  "transporter_id_card": "12345678",
  "vehicle_brand": "Toyota",
  "vehicle_model": "Hilux",
  "vehicle_plate": "ABC-123",
  "vehicle_color": "Blanco",
  "driver_name": "Carlos López",
  "driver_id_card": "87654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Solicitud creada exitosamente",
  "data": {
    "id": 1,
    "wp_user_id": 123,
    "request_type": "Mudanza - Entrada",
    "status": "Recibida",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### GET /requests
Obtener solicitudes

**Query Parameters:**
- `user_id`: Filtrar por usuario específico
- `page`: Número de página (default: 1)
- `limit`: Límite por página (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### GET /requests/:id
Obtener solicitud específica

#### PUT /requests/:id
Actualizar solicitud

**Request Body:**
```json
{
  "status": "Aprobado",
  "response": "Solicitud aprobada. Puede proceder con la mudanza."
}
```

#### GET /requests/stats
Obtener estadísticas

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 100,
    "byType": {
      "Mudanza - Entrada": 30,
      "Mudanza - Salida": 25,
      "Sugerencias": 30,
      "Reclamos": 15
    },
    "byStatus": {
      "Recibida": 20,
      "Aprobado": 40,
      "Rechazado": 10,
      "Atendido": 30
    },
    "thisMonth": 15
  }
}
```

### Documentación Swagger
Acceder a: `http://localhost:7000/api-docs`

## 🚀 Despliegue

### Producción con PM2

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'condo360-solicitudes',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 7000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Iniciar aplicación
pm2 start ecosystem.config.js

# Configurar inicio automático
pm2 startup
pm2 save
```

### Docker (Opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
EXPOSE 7000

CMD ["npm", "start"]
```

```bash
# Construir imagen
docker build -t condo360-solicitudes .

# Ejecutar contenedor
docker run -d \
  --name condo360-solicitudes \
  -p 7000:7000 \
  --env-file .env \
  condo360-solicitudes
```

### Configuración de Nginx

```nginx
# /etc/nginx/sites-available/condo360-api
server {
    listen 80;
    server_name applications.bonaventurecclub.com;
    
    location / {
        proxy_pass http://localhost:7000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Mantenimiento

### Logs y Monitoreo

```bash
# Ver logs de PM2
pm2 logs condo360-solicitudes

# Monitorear recursos
pm2 monit

# Reiniciar aplicación
pm2 restart condo360-solicitudes
```

### Backup de Base de Datos

```bash
# Backup completo
mysqldump -u root -p wordpress_db > backup_$(date +%Y%m%d).sql

# Backup solo tablas del módulo
mysqldump -u root -p wordpress_db \
  condo360solicitudes_requests \
  condo360solicitudes_config \
  condo360solicitudes_logs > condo360_backup_$(date +%Y%m%d).sql
```

### Limpieza de Logs Antiguos

```sql
-- Ejecutar en MySQL
CALL condo360solicitudes_cleanup_logs(90); -- Mantener 90 días
```

### Actualizaciones

```bash
# Actualizar dependencias
npm update

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix
```

## 🐛 Solución de Problemas

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solución:**
- Verificar que MySQL esté ejecutándose
- Comprobar credenciales en `.env`
- Verificar que la base de datos existe

#### 2. Error de SMTP
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solución:**
- Verificar credenciales SMTP
- Para Gmail, usar contraseña de aplicación
- Comprobar configuración de 2FA

#### 2.1. Error SSL/TLS SMTP
```
Error: self signed certificate in certificate chain
Error: unable to verify the first certificate
Error: certificate verify failed
```

**Solución:**
- Para desarrollo: `SMTP_TLS_REJECT_UNAUTHORIZED=false`
- Para producción: `SMTP_TLS_REJECT_UNAUTHORIZED=true`
- Verificar que el certificado SSL del servidor SMTP sea válido
- Usar puerto correcto según configuración SSL:
  - Puerto 465: `SMTP_SECURE=true`
  - Puerto 587: `SMTP_SECURE=false` (STARTTLS)

#### 3. Plugin WordPress No Funciona
```
Error: API del backend no está disponible
```

**Solución:**
- Verificar que el backend esté ejecutándose
- Comprobar URL de la API en el plugin
- Verificar configuración de CORS

#### 4. Correos No Se Envían
```
Error: Timeout al enviar correo
```

**Solución:**
- Verificar configuración SMTP
- Comprobar firewall y puertos
- Revisar logs del servidor SMTP

### Logs de Depuración

```bash
# Habilitar logs detallados
NODE_ENV=development npm start

# Ver logs en tiempo real
tail -f logs/combined.log

# Verificar estado de la API
curl http://localhost:7000/health
```

### Comandos de Diagnóstico

```bash
# Verificar conectividad de base de datos
mysql -h localhost -u wordpress_user -p wordpress_db -e "SELECT 1"

# Probar endpoint de la API
curl -X GET http://localhost:7000/api/requests/stats

# Verificar configuración del plugin
wp plugin list --path=/path/to/wordpress

# Verificar permisos de archivos
ls -la /path/to/wordpress/wp-content/plugins/condo360-solicitudes/
```

## 📞 Soporte

Para soporte técnico o reportar problemas:

1. **Revisar logs** de la aplicación y base de datos
2. **Verificar configuración** de variables de entorno
3. **Comprobar conectividad** entre componentes
4. **Consultar documentación** de Swagger en `/api-docs`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crear una rama para la feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

---

**Desarrollado con ❤️ para Condominio360**
