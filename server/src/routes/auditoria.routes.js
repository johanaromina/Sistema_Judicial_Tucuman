const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/errorHandler');
const { authGuard, requireAdmin, requireSecretario } = require('../middlewares/auth.middleware');
const { auditTrail } = require('../middlewares/auth.middleware');
const auditoriaController = require('../controllers/auditoria.controller');

// Aplicar middleware de autenticación a todas las rutas
router.use(authGuard);

// GET /auditoria - Listar registros de auditoría
router.get('/', 
  requireAdmin,
  auditTrail('CONSULTAR', 'auditoria'),
  asyncHandler(auditoriaController.listarAuditoria)
);

// GET /auditoria/usuarios - Auditoría por usuario
router.get('/usuarios', 
  requireAdmin,
  auditTrail('CONSULTAR', 'auditoria_usuarios'),
  asyncHandler(auditoriaController.auditoriaPorUsuario)
);

// GET /auditoria/recursos - Auditoría por recurso
router.get('/recursos', 
  requireAdmin,
  auditTrail('CONSULTAR', 'auditoria_recursos'),
  asyncHandler(auditoriaController.auditoriaPorRecurso)
);

// GET /auditoria/tiempo - Auditoría por período de tiempo
router.get('/tiempo', 
  requireAdmin,
  auditTrail('CONSULTAR', 'auditoria_tiempo'),
  asyncHandler(auditoriaController.auditoriaPorTiempo)
);

// GET /auditoria/exportar - Exportar auditoría
router.get('/exportar', 
  requireAdmin,
  auditTrail('EXPORTAR', 'auditoria'),
  asyncHandler(auditoriaController.exportarAuditoria)
);

// GET /reportes/tiempos - Reporte de tiempos de expedientes
router.get('/reportes/tiempos', 
  requireSecretario,
  auditTrail('CONSULTAR', 'reporte_tiempos'),
  asyncHandler(auditoriaController.reporteTiempos)
);

// GET /reportes/volumen - Reporte de volumen de trabajo
router.get('/reportes/volumen', 
  requireSecretario,
  auditTrail('CONSULTAR', 'reporte_volumen'),
  asyncHandler(auditoriaController.reporteVolumen)
);

// GET /reportes/usuarios - Reporte de actividad por usuario
router.get('/reportes/usuarios', 
  requireAdmin,
  auditTrail('CONSULTAR', 'reporte_usuarios'),
  asyncHandler(auditoriaController.reporteUsuarios)
);

// GET /reportes/instituciones - Reporte por institución
router.get('/reportes/instituciones', 
  requireSecretario,
  auditTrail('CONSULTAR', 'reporte_instituciones'),
  asyncHandler(auditoriaController.reporteInstituciones)
);

module.exports = router; 