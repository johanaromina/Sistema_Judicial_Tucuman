const express = require('express');
const router = express.Router();

// Importar rutas específicas
const authRoutes = require('./auth.routes');
const expedientesRoutes = require('./expedientes.routes');
const documentosRoutes = require('./documentos.routes');
const usuariosRoutes = require('./usuarios.routes');
const auditoriaRoutes = require('./auditoria.routes');
const rolesRoutes = require('./roles.routes');
const institucionesRoutes = require('./instituciones.routes');

// Middleware de logging para todas las rutas
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de autenticación (públicas)
router.use('/auth', authRoutes);

// Rutas protegidas
router.use('/expedientes', expedientesRoutes);
router.use('/documentos', documentosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/roles', rolesRoutes);
router.use('/instituciones', institucionesRoutes);

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    message: 'API SPJT v1.0.0',
    version: '1.0.0',
    endpoints: {
      auth: '/auth',
      expedientes: '/expedientes',
      documentos: '/documentos',
      usuarios: '/usuarios',
      auditoria: '/auditoria'
    },
    documentation: 'https://github.com/tu-usuario/spjt-api',
    status: 'active',
    note: 'Sprint 2 completado - Sistema completo funcionando'
  });
});

module.exports = router; 
