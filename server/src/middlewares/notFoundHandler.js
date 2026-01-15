const { logger } = require('../config/logger');

function notFoundHandler(req, res) {
  // Log de la ruta no encontrada
  logger.warn('Ruta no encontrada:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: {
      message: 'Ruta no encontrada',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: req.url,
      method: req.method,
      suggestion: 'Verifique la URL y el método HTTP',
    },
  });
}

module.exports = {
  notFoundHandler
}; 