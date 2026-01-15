const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3001;

// Configuración básica de seguridad
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100
});
app.use('/api/', limiter);

// Middleware de logging
app.use(morgan('combined'));

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
    environment: 'test',
    message: 'Servidor SPJT funcionando correctamente'
  });
});

// Ruta de prueba
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'API SPJT v1.0.0 funcionando',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba de autenticación
app.post('/api/v1/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Endpoint de autenticación funcionando',
    data: {
      test: true,
      timestamp: new Date().toISOString()
    }
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Ruta no encontrada',
      statusCode: 404,
      path: req.originalUrl
    }
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor SPJT de prueba iniciado en puerto ${PORT}`);
  console.log(`📊 Ambiente: test`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API: http://localhost:${PORT}/api/v1`);
  console.log(`\n✅ El servidor está funcionando correctamente!`);
  console.log(`\n🔧 Para probar:`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
  console.log(`   - API: http://localhost:${PORT}/api/v1`);
  console.log(`   - Test Auth: POST http://localhost:${PORT}/api/v1/auth/test`);
});

module.exports = app; 