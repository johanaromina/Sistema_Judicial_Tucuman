const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

const { errorHandler } = require('./middlewares/errorHandler');
const { notFoundHandler } = require('./middlewares/notFoundHandler');
const { logger } = require('./config/logger');
const { connectDatabase } = require('./config/database');
const routes = require('./routes');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // máximo 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:8082', 'http://localhost:3002', 'http://192.168.100.9:19006'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware de logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Middleware de compresión
app.use(compression());

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1', routes);

// Middleware de manejo de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Función de inicio
async function startServer() {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    logger.info('Base de datos conectada exitosamente');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor SPJT iniciado en puerto ${PORT}`);
      logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();

module.exports = app; 