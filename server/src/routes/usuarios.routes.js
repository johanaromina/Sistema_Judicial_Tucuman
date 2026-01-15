const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/errorHandler');
const { authGuard, requireAdmin, requireSecretario } = require('../middlewares/auth.middleware');
const { auditTrail } = require('../middlewares/auth.middleware');
const usuariosController = require('../controllers/usuarios.controller');

// Aplicar middleware de autenticación a todas las rutas
router.use(authGuard);

// GET /usuarios - Listar usuarios (solo admin)
router.get('/', 
  requireAdmin,
  auditTrail('LISTAR', 'usuarios'),
  asyncHandler(usuariosController.listarUsuarios)
);

// GET /usuarios/:id - Obtener usuario por ID
router.get('/:id', 
  requireAdmin,
  auditTrail('CONSULTAR', 'usuarios'),
  asyncHandler(usuariosController.obtenerUsuario)
);

// POST /usuarios - Crear nuevo usuario (solo admin)
router.post('/', 
  requireAdmin,
  auditTrail('CREAR', 'usuarios'),
  asyncHandler(usuariosController.crearUsuario)
);

// PATCH /usuarios/:id - Actualizar usuario
router.patch('/:id', 
  requireAdmin,
  auditTrail('ACTUALIZAR', 'usuarios'),
  asyncHandler(usuariosController.actualizarUsuario)
);

// DELETE /usuarios/:id - Eliminar usuario (solo admin)
router.delete('/:id', 
  requireAdmin,
  auditTrail('ELIMINAR', 'usuarios'),
  asyncHandler(usuariosController.eliminarUsuario)
);

// PATCH /usuarios/:id/activar - Activar/desactivar usuario
router.patch('/:id/activar', 
  requireAdmin,
  auditTrail('CAMBIAR_ESTADO', 'usuarios'),
  asyncHandler(usuariosController.cambiarEstadoUsuario)
);

// PATCH /usuarios/:id/rol - Cambiar rol de usuario
router.patch('/:id/rol', 
  requireAdmin,
  auditTrail('CAMBIAR_ROL', 'usuarios'),
  asyncHandler(usuariosController.cambiarRolUsuario)
);

// GET /usuarios/:id/actividad - Obtener actividad del usuario
router.get('/:id/actividad', 
  requireAdmin,
  auditTrail('CONSULTAR_ACTIVIDAD', 'usuarios'),
  asyncHandler(usuariosController.obtenerActividadUsuario)
);

// GET /usuarios/:id/expedientes - Expedientes del usuario
router.get('/:id/expedientes', 
  requireSecretario,
  auditTrail('CONSULTAR_EXPEDIENTES', 'usuarios'),
  asyncHandler(usuariosController.obtenerExpedientesUsuario)
);

module.exports = router; 