const winston = require('winston');
const path = require('path');

// Configuración de colores para consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Formato personalizado para logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { service: 'spjt-api' },
  transports: [
    // Logs de error
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Logs combinados
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Agregar transporte de consola en desarrollo
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: logFormat,
  }));
}

// Función helper para logging estructurado
function logWithContext(level, message, context) {
  if (context) {
    logger.log(level, `${message}`, { context });
  } else {
    logger.log(level, message);
  }
}

// Función para logging de auditoría
function auditLog(userId, action, resource, resourceId, details) {
  logger.info('AUDIT_LOG', {
    userId,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
  });
}

// Función para logging de seguridad
function securityLog(level, message, details) {
  logger.log(level, `SECURITY: ${message}`, { details });
}

module.exports = {
  logger,
  logWithContext,
  auditLog,
  securityLog
}; 