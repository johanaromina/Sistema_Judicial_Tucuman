const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middlewares/errorHandler');
const { validateLogin, validateRefresh, validateRegister } = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');
const { authGuard } = require('../middlewares/auth.middleware');

// POST /auth/login - Iniciar sesión
router.post('/login', 
  validateLogin, 
  asyncHandler(authController.login)
);

// POST /auth/register - Registro público de usuario
router.post('/register',
  validateRegister,
  asyncHandler(authController.register)
);

// POST /auth/refresh - Renovar token
router.post('/refresh', 
  validateRefresh, 
  asyncHandler(authController.refreshToken)
);

// POST /auth/logout - Cerrar sesión
router.post('/logout', 
  authGuard,
  asyncHandler(authController.logout)
);

// GET /auth/me - Obtener perfil del usuario autenticado
router.get('/me', 
  authGuard,
  asyncHandler(authController.getProfile)
);

module.exports = router; 
