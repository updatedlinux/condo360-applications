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

// Configurar trust proxy para manejar headers X-Forwarded-For (solo para desarrollo interno)
if (process.env.NODE_ENV === 'development') {
  app.set('trust proxy', true);
} else {
  // En producción, ser más específico con los proxies confiables
  app.set('trust proxy', 1); // Solo confiar en el primer proxy
}

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Condominio360 Solicitudes API',
      version: '1.0.0',
      description: 'API para el módulo de solicitudes de Condominio360',
      contact: {
        name: 'Condominio360',
        email: 'admin@bonaventurecclub.com'
      }
    },
    servers: [
      {
        url: 'https://applications.bonaventurecclub.com',
        description: 'Servidor de producción',
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      schemas: {
        Request: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID único de la solicitud'
            },
            wp_user_id: {
              type: 'integer',
              description: 'ID del usuario de WordPress'
            },
            request_type: {
              type: 'string',
              enum: ['Mudanza - Entrada', 'Mudanza - Salida', 'Sugerencias', 'Reclamos'],
              description: 'Tipo de solicitud'
            },
            details: {
              type: 'string',
              description: 'Detalles de la solicitud'
            },
            move_date: {
              type: 'string',
              format: 'date',
              description: 'Fecha de mudanza'
            },
            transporter_name: {
              type: 'string',
              description: 'Nombre del transportista'
            },
            transporter_id_card: {
              type: 'string',
              description: 'Cédula del transportista'
            },
            vehicle_brand: {
              type: 'string',
              description: 'Marca del vehículo'
            },
            vehicle_model: {
              type: 'string',
              description: 'Modelo del vehículo'
            },
            vehicle_plate: {
              type: 'string',
              description: 'Placa del vehículo'
            },
            vehicle_color: {
              type: 'string',
              description: 'Color del vehículo'
            },
            driver_name: {
              type: 'string',
              description: 'Nombre del chofer'
            },
            driver_id_card: {
              type: 'string',
              description: 'Cédula del chofer'
            },
            status: {
              type: 'string',
              enum: ['Recibida', 'Aprobado', 'Rechazado', 'Atendido'],
              description: 'Estado de la solicitud'
            },
            response: {
              type: 'string',
              description: 'Respuesta de la junta de condominio'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de última actualización'
            },
            display_name: {
              type: 'string',
              description: 'Nombre para mostrar del usuario'
            },
            user_email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario'
            },
            user_nicename: {
              type: 'string',
              description: 'Nombre de usuario'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Tipo de error'
            },
            message: {
              type: 'string',
              description: 'Mensaje de error'
            },
            status: {
              type: 'integer',
              description: 'Código de estado HTTP'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica si la operación fue exitosa'
            },
            message: {
              type: 'string',
              description: 'Mensaje de respuesta'
            },
            data: {
              type: 'object',
              description: 'Datos de respuesta'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/docs/*.js'],
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

// Rate limiting (deshabilitado para desarrollo interno)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // límite aumentado para desarrollo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente de nuevo más tarde.'
  },
  skip: (req) => {
    // Saltar rate limiting en desarrollo
    return process.env.NODE_ENV === 'development' || process.env.RATE_LIMITING_DISABLED === 'true';
  }
});

// Solo aplicar rate limiting si no está deshabilitado
if (process.env.RATE_LIMITING_DISABLED !== 'true') {
  app.use('/api/', limiter);
}

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
