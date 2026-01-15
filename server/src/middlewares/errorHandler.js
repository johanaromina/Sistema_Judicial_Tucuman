const { logger } = require('../config/logger');

// Función para crear errores personalizados
function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

// Función para manejar errores asíncronos
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Middleware principal de manejo de errores
function errorHandler(error, req, res, next) {
  let { statusCode = 500, message } = error;

  // Log del error
  logger.error('Error en la aplicación:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  // Manejo de errores específicos de MySQL
  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'El recurso ya existe en el sistema';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Referencia inválida en la base de datos';
  } else if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'No se puede eliminar el recurso porque está siendo referenciado';
  }

  // Manejo de errores de validación
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Datos de entrada inválidos';
  }

  // Manejo de errores de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Respuesta de error
  res.status(statusCode).json({
    success: false,
    error: {
      message: message || 'Error interno del servidor',
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
    },
  });
}

module.exports = {
  errorHandler,
  createError,
  asyncHandler
}; 