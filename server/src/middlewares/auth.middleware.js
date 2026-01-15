const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { createError } = require('./errorHandler');
const { auditLog } = require('../config/logger');

// Middleware de autenticación JWT
function authGuard(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Token de acceso requerido', 401);
    }

    const token = authHeader.substring(7); // Remover 'Bearer '
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // Verificar que el usuario existe y esté activo
    db('users')
      .select('id', 'email', 'activo')
      .where('id', decoded.userId)
      .where('activo', 1)
      .first()
      .then(user => {
        if (!user) {
          throw createError('Usuario no encontrado o inactivo', 401);
        }
        
        // Agregar información del usuario al request
        req.user = {
          id: user.id,
          email: user.email,
          rol: (decoded.rol || '').toString().toLowerCase()
        };
        
        next();
      })
      .catch(error => {
        next(error);
      });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(createError('Token inválido', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(createError('Token expirado', 401));
    } else {
      next(error);
    }
  }
}

// Middleware de autorización RBAC
function rbacGuard(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Usuario no autenticado', 401));
    }

    if (!allowedRoles.includes(req.user.rol)) {
      // Log de intento de acceso no autorizado
      auditLog(req.user.id, 'UNAUTHORIZED_ACCESS', req.path, null, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requiredRoles: allowedRoles,
        userRole: req.user.rol
      });

      return next(createError('Acceso no autorizado', 403));
    }

    next();
  };
}

// Middleware de auditoría
function auditTrail(action, resource) {
  return (req, res, next) => {
    // Interceptar la respuesta para registrar la acción
    const originalSend = res.send;
    
    res.send = function(data) {
      // Registrar la acción en la base de datos
      if (req.user && res.statusCode < 400) {
        auditLog(
          req.user.id,
          action,
          resource,
          req.params.id || null,
          {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            statusCode: res.statusCode
          }
        );
      }
      
      // Llamar al método original
      originalSend.call(this, data);
    };
    
    next();
  };
}

// Middleware para roles específicos
const requireJuez = rbacGuard(['juez', 'admin']);
const requireSecretario = rbacGuard(['secretario', 'juez', 'admin']);
const requireAdmin = rbacGuard(['admin']);
const requireOperador = rbacGuard(['operador', 'secretario', 'juez', 'admin']);

module.exports = {
  authGuard,
  rbacGuard,
  auditTrail,
  requireJuez,
  requireSecretario,
  requireAdmin,
  requireOperador
}; 
