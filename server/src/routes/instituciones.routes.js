const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/errorHandler');
const { authGuard, requireOperador } = require('../middlewares/auth.middleware');
const institucionesController = require('../controllers/instituciones.controller');

// Todas protegidas
router.use(authGuard);

// GET /instituciones - Listar instituciones
router.get('/', requireOperador, asyncHandler(institucionesController.listar));

module.exports = router;

