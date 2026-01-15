const express = require('express');
const router = express.Router();

const { asyncHandler } = require('../middlewares/errorHandler');
const { authGuard, requireAdmin, auditTrail } = require('../middlewares/auth.middleware');
const rolesController = require('../controllers/roles.controller');

// Proteger todas las rutas
router.use(authGuard);

// GET /roles - Listar roles (solo admin)
router.get('/', requireAdmin, auditTrail('LISTAR', 'roles'), asyncHandler(rolesController.listar));

module.exports = router;

