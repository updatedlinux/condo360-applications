# Estructura del Proyecto Condominio360 Solicitudes

```
condo360-applications/
├── backend/                          # Backend Node.js
│   ├── src/
│   │   ├── app.js                   # Aplicación principal
│   │   ├── config/
│   │   │   └── database.js          # Configuración de base de datos
│   │   ├── controllers/
│   │   │   └── RequestController.js  # Controlador de solicitudes
│   │   ├── middleware/
│   │   │   └── errorHandler.js      # Manejo de errores
│   │   ├── models/
│   │   │   └── Request.js           # Modelo y validaciones
│   │   ├── routes/
│   │   │   └── requests.js          # Rutas de la API
│   │   └── services/
│   │       └── EmailService.js       # Servicio de correos
│   ├── sql/
│   │   └── create_tables.sql        # Scripts de base de datos
│   ├── package.json                 # Dependencias Node.js
│   ├── env.example                  # Variables de entorno ejemplo
│   └── ecosystem.config.js         # Configuración PM2
├── wordpress-plugin/                # Plugin WordPress
│   ├── condo360-solicitudes.php     # Archivo principal del plugin
│   └── assets/
│       ├── css/
│       │   └── style.css           # Estilos CSS
│       └── js/
│           └── script.js            # JavaScript del plugin
└── README.md                       # Documentación principal
```

## Descripción de Archivos

### Backend (Node.js)

- **`src/app.js`**: Punto de entrada de la aplicación Express
- **`src/config/database.js`**: Configuración y pool de conexiones MySQL
- **`src/controllers/RequestController.js`**: Lógica de negocio para solicitudes
- **`src/middleware/errorHandler.js`**: Middleware para manejo de errores
- **`src/models/Request.js`**: Modelo de datos y validaciones con Joi
- **`src/routes/requests.js`**: Definición de rutas de la API REST
- **`src/services/EmailService.js`**: Servicio para envío de correos HTML
- **`sql/create_tables.sql`**: Scripts SQL para crear tablas y triggers
- **`package.json`**: Dependencias y scripts de Node.js
- **`env.example`**: Plantilla de variables de entorno

### Plugin WordPress

- **`condo360-solicitudes.php`**: Archivo principal del plugin con shortcodes
- **`assets/css/style.css`**: Estilos CSS responsive compatibles con Astra
- **`assets/js/script.js`**: JavaScript para AJAX y validaciones frontend

## Tecnologías Utilizadas

### Backend
- **Node.js** >= 18.0.0
- **Express.js** - Framework web
- **MySQL2** - Driver de base de datos
- **Nodemailer** - Envío de correos
- **Joi** - Validación de datos
- **Swagger** - Documentación de API
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Protección contra spam

### Frontend
- **WordPress** >= 6.0
- **PHP** - Lógica del plugin
- **jQuery** - Manipulación DOM y AJAX
- **CSS3** - Estilos responsive
- **HTML5** - Estructura semántica

### Base de Datos
- **MySQL** >= 5.7
- **Triggers** - Validación de fechas de mudanza
- **Views** - Estadísticas rápidas
- **Stored Procedures** - Limpieza de logs

### Infraestructura
- **Nginx Proxy Manager** - Proxy reverso
- **PM2** - Gestión de procesos Node.js
- **SMTP** - Servidor de correo
- **SSL/TLS** - Seguridad de comunicaciones

## Flujo de Datos

1. **Usuario** completa formulario en WordPress
2. **Plugin** envía datos vía AJAX al backend
3. **API** valida datos y guarda en MySQL
4. **Servicio de correo** envía notificación
5. **Administrador** revisa y responde solicitud
6. **Sistema** notifica al usuario sobre respuesta

## Características de Seguridad

- Validación de datos en frontend y backend
- Sanitización de entradas
- Rate limiting para prevenir spam
- CORS configurado para dominio específico
- Headers de seguridad con Helmet
- Validación de fechas con triggers SQL
- Logs de actividad para auditoría

## Escalabilidad

- Pool de conexiones MySQL
- Clustering con PM2
- Paginación en todas las consultas
- Índices optimizados en base de datos
- Cache de consultas frecuentes
- Compresión de respuestas HTTP
