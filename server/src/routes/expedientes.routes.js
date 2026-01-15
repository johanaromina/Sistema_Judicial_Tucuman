const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/errorHandler');
const { authGuard, requireSecretario, requireJuez, requireOperador } = require('../middlewares/auth.middleware');
const { auditTrail } = require('../middlewares/auth.middleware');
const expedientesController = require('../controllers/expedientes.controller');

// Aplicar middleware de autenticación a todas las rutas
router.use(authGuard);

// GET /expedientes - Listar expedientes con filtros y paginación
router.get('/', 
  requireOperador,
  auditTrail('LISTAR', 'expedientes'),
  asyncHandler(expedientesController.listarExpedientes)
);

// GET /expedientes/search - Búsqueda rápida para autocompletar
router.get('/search',
  requireOperador,
  auditTrail('BUSCAR', 'expedientes'),
  asyncHandler(expedientesController.busquedaRapida)
);

// POST /expedientes - Crear nuevo expediente
router.post('/', 
  requireSecretario,
  auditTrail('CREAR', 'expedientes'),
  asyncHandler(expedientesController.crearExpediente)
);

// GET /expedientes/:id - Obtener expediente por ID
router.get('/:id', 
  requireOperador,
  auditTrail('CONSULTAR', 'expedientes'),
  asyncHandler(expedientesController.obtenerExpediente)
);

// PATCH /expedientes/:id - Actualizar expediente
router.patch('/:id', 
  requireSecretario,
  auditTrail('ACTUALIZAR', 'expedientes'),
  asyncHandler(expedientesController.actualizarExpediente)
);

// DELETE /expedientes/:id - Eliminar expediente (solo admin)
router.delete('/:id', 
  requireJuez,
  auditTrail('ELIMINAR', 'expedientes'),
  asyncHandler(expedientesController.eliminarExpediente)
);

// GET /expedientes/:id/actuaciones - Listar actuaciones de un expediente
router.get('/:id/actuaciones', 
  requireOperador,
  auditTrail('CONSULTAR', 'actuaciones'),
  asyncHandler(expedientesController.listarActuaciones)
);

// POST /expedientes/:id/actuaciones - Crear nueva actuación
router.post('/:id/actuaciones', 
  requireSecretario,
  auditTrail('CREAR', 'actuaciones'),
  asyncHandler(expedientesController.crearActuacion)
);

// GET /expedientes/:id/documentos - Listar documentos de un expediente
router.get('/:id/documentos', 
  requireOperador,
  auditTrail('CONSULTAR', 'documentos'),
  asyncHandler(expedientesController.listarDocumentos)
);

// POST /expedientes/:id/documentos - Subir documento al expediente
router.post('/:id/documentos', 
  requireSecretario,
  auditTrail('CREAR', 'documentos'),
  asyncHandler(expedientesController.subirDocumento)
);

// GET /expedientes/:id/estadisticas - Estadísticas del expediente
router.get('/:id/estadisticas', 
  requireOperador,
  auditTrail('CONSULTAR', 'estadisticas'),
  asyncHandler(expedientesController.obtenerEstadisticas)
);

module.exports = router; 
