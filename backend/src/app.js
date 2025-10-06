const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const moment = require('moment-timezone');
require('dotenv').config();

// Configurar zona horaria global para Venezuela (GMT-4)
moment.tz.setDefault('America/Caracas');

const db = require('./config/database');
const requestRoutes = require('./routes/requests');
const { errorHandler } = require('./middleware/errorHandler');
const { formatDatesMiddleware } = require('./middleware/dateFormatter');

const app = express();
const PORT = process.env.PORT || 7000;

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Condominio360 Solicitudes API',
      version: '1.0.0',
      description: 'API para el módulo de solicitudes de Condominio360',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware de seguridad (configuración permisiva para desarrollo interno)
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false
}));

// Configuración de CORS (sin límites para desarrollo interno)
app.use(cors({
  origin: true, // Permitir cualquier origen
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
}));

// Manejo de preflight requests para desarrollo interno
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rate limiting (configuración permisiva para desarrollo interno)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // límite aumentado para desarrollo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente de nuevo más tarde.'
  },
  skip: (req) => {
    // Saltar rate limiting en desarrollo
    return process.env.NODE_ENV === 'development';
  }
});
app.use('/api/', limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para formatear fechas en zona horaria venezolana
app.use(formatDatesMiddleware);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use('/api/requests', requestRoutes);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Condominio360 Solicitudes',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: 'La ruta solicitada no existe en esta API'
  });
});

// Inicialización del servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await db.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📚 Documentación disponible en: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health check disponible en: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida, cerrando servidor...');
  process.exit(0);
});

startServer();

module.exports = app;
