const jwt = require('jsonwebtoken');
const argon2 = require('argon2');
const { db } = require('../config/database');
const { logger, auditLog } = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

class AuthController {
  // POST /auth/register
  async register(req, res) {
    const { nombre, email, password, rol_id, rol } = req.body;

    try {
      // Verificar si ya existe el email
      const existente = await db('users').where({ email }).first();
      if (existente) {
        throw createError('Ya existe un usuario con ese email', 409);
      }

      // Resolver rol
      let roleId = rol_id;
      if (!roleId) {
        let roleName = rol || process.env.DEFAULT_ROLE || 'OPERADOR';
        // normalizar mayúsculas
        roleName = String(roleName).toUpperCase();
        const roleRow = await db('roles').where({ nombre: roleName }).first();
        if (!roleRow) {
          throw createError('Rol no válido', 400);
        }
        roleId = roleRow.id;
      } else {
        const roleRow = await db('roles').where({ id: roleId }).first();
        if (!roleRow) {
          throw createError('Rol no encontrado', 404);
        }
      }

      // Hash de la contraseña
      const password_hash = await argon2.hash(password);

      // Crear usuario
      const [id] = await db('users').insert({
        nombre,
        email,
        password_hash,
        rol_id: roleId,
        activo: 1,
        created_at: new Date(),
      });

      // Devolver usuario básico
      const usuario = await db('users as u')
        .select('u.id', 'u.nombre', 'u.email', 'r.nombre as rol')
        .join('roles as r', 'u.rol_id', 'r.id')
        .where('u.id', id)
        .first();

      res.status(201).json({
        success: true,
        message: 'Registro exitoso',
        data: { usuario }
      });
    } catch (error) {
      logger.error('Error en registro:', error);
      throw error;
    }
  }

  // POST /auth/login
  async login(req, res) {
    const { email, password } = req.body;

    try {
      // Buscar usuario por email
      const [user] = await db('users')
        .select('users.*', 'roles.nombre as rol_nombre')
        .join('roles', 'users.rol_id', 'roles.id')
        .where('users.email', email)
        .where('users.activo', 1);

      if (!user) {
        throw createError('Credenciales inválidas', 401);
      }

      // Verificar contraseña
      const isValidPassword = await argon2.verify(user.password_hash, password);
      if (!isValidPassword) {
        throw createError('Credenciales inválidas', 401);
      }

      // Generar tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          rol: user.rol_nombre 
        },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
      );

      // Guardar refresh token en la base de datos
      await db('users')
        .where('id', user.id)
        .update({ 
          refresh_token: refreshToken,
          ultimo_acceso: new Date()
        });

      // Log de auditoría
      auditLog(user.id, 'LOGIN', 'auth', null, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      // Respuesta exitosa
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol_nombre
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
          }
        }
      });

    } catch (error) {
      logger.error('Error en login:', error);
      throw error;
    }
  }

  // POST /auth/refresh
  async refreshToken(req, res) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token requerido', 400);
    }

    try {
      // Verificar refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Verificar que el token esté en la base de datos
      const [user] = await db('users')
        .select('users.id', 'users.email', 'users.activo', 'roles.nombre as rol_nombre')
        .leftJoin('roles', 'users.rol_id', 'roles.id')
        .where('users.id', decoded.userId)
        .where('users.refresh_token', refreshToken)
        .where('users.activo', 1);

      if (!user) {
        throw createError('Refresh token inválido', 401);
      }

      // Generar nuevo access token
      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email, rol: user.rol_nombre },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
      );

      res.json({
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          accessToken: newAccessToken,
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
        }
      });

    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw createError('Refresh token inválido', 401);
      }
      if (error.name === 'TokenExpiredError') {
        throw createError('Refresh token expirado', 401);
      }
      throw error;
    }
  }

  // POST /auth/logout
  async logout(req, res) {
    const { refreshToken } = req.body || {};
    const userId = req.user?.id;

    try {
      if (userId) {
        // Invalidar token del usuario autenticado
        await db('users').where('id', userId).update({ refresh_token: null });
      } else if (refreshToken) {
        // En caso de no tener usuario en contexto, invalidar por refresh token
        await db('users').where('refresh_token', refreshToken).update({ refresh_token: null });
      }

      // Log de auditoría
      if (userId) {
        auditLog(userId, 'LOGOUT', 'auth', null, {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
      }

      res.json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      logger.error('Error en logout:', error);
      throw error;
    }
  }

  // GET /auth/me
  async getProfile(req, res) {
    const userId = req.user.id;

    try {
      const [user] = await db('users')
        .select('users.id', 'users.nombre', 'users.email', 'users.activo', 'roles.nombre as rol')
        .join('roles', 'users.rol_id', 'roles.id')
        .where('users.id', userId);

      if (!user) {
        throw createError('Usuario no encontrado', 404);
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol,
            activo: user.activo
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener perfil:', error);
      throw error;
    }
  }
}

module.exports = new AuthController(); 
