const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

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

// Debug de roles para validar instancia/DB activa (solo desarrollo)
router.get('/debug/roles', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    const roles = await db('roles')
      .select('id', 'nombre')
      .orderBy('id', 'asc');

    return res.json({
      success: true,
      data: {
        roles,
        db: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '3306'),
          name: process.env.DB_NAME || 'spjt_db'
        },
        env: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    return next(error);
  }
});

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
