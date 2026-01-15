const { db } = require('../config/database');
const { logger } = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');
const argon2 = require('argon2');

class UsuariosController {
  // GET /usuarios - Listar usuarios
  async listarUsuarios(req, res) {
    try {
      const { page = 1, limit = 20, activo, rol, search = '' } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;
      const offset = (pageNum - 1) * limitNum;

      let queryBuilder = db('users as u')
        .select('u.id', 'u.nombre', 'u.email', 'u.activo', 'u.created_at', 'r.nombre as rol')
        .join('roles as r', 'u.rol_id', 'r.id');

      if (activo !== undefined) {
        queryBuilder = queryBuilder.where('u.activo', String(activo) === 'true');
      }

      if (rol) {
        // Comparación case-insensitive para el nombre del rol
        queryBuilder = queryBuilder.whereRaw('UPPER(r.nombre) = ?', [String(rol).toUpperCase()]);
      }

      if (search) {
        const q = `%${search}%`;
        queryBuilder = queryBuilder.where(function () {
          this.where('u.nombre', 'like', q).orWhere('u.email', 'like', q);
        });
      }

      // Obtener total
      const [{ total }] = await queryBuilder.clone().clearSelect().count('* as total');

      // Aplicar paginación
      const usuarios = await queryBuilder
        .orderBy('u.created_at', 'desc')
        .limit(limitNum)
        .offset(offset);

      res.json({
        success: true,
        data: {
          usuarios,
          paginacion: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });

    } catch (error) {
      logger.error('Error al listar usuarios:', error);
      throw error;
    }
  }

  // GET /usuarios/:id - Obtener usuario
  async obtenerUsuario(req, res) {
    try {
      const { id } = req.params;

      const usuario = await db('users as u')
        .select('u.id', 'u.nombre', 'u.email', 'u.activo', 'u.created_at', 'r.nombre as rol')
        .join('roles as r', 'u.rol_id', 'r.id')
        .where('u.id', id)
        .first();

      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      res.json({
        success: true,
        data: { usuario }
      });

    } catch (error) {
      logger.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  // POST /usuarios - Crear usuario
  async crearUsuario(req, res) {
    try {
      const { nombre, email, password, rol_id } = req.body;

      // Verificar que el email sea único
      const usuarioExistente = await db('users')
        .where('email', email)
        .first();

      if (usuarioExistente) {
        throw createError('Ya existe un usuario con ese email', 409);
      }

      // Hash de la contraseña
      const passwordHash = await argon2.hash(password);

      // Crear usuario
      const [userId] = await db('users').insert({
        nombre,
        email,
        password_hash: passwordHash,
        rol_id,
        activo: true
      });

      // Obtener usuario creado
      const usuario = await db('users as u')
        .select('u.id', 'u.nombre', 'u.email', 'u.activo', 'u.created_at', 'r.nombre as rol')
        .join('roles as r', 'u.rol_id', 'r.id')
        .where('u.id', userId)
        .first();

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: { usuario }
      });

    } catch (error) {
      logger.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // PATCH /usuarios/:id - Actualizar usuario
  async actualizarUsuario(req, res) {
    try {
      const { id } = req.params;
      const { nombre, email, activo } = req.body;

      // Verificar que el usuario existe
      const usuario = await db('users')
        .where('id', id)
        .first();

      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      // Actualizar usuario
      await db('users')
        .where('id', id)
        .update({
          nombre: nombre || usuario.nombre,
          email: email || usuario.email,
          activo: activo !== undefined ? activo : usuario.activo,
          updated_at: new Date()
        });

      // Obtener usuario actualizado
      const usuarioActualizado = await db('users as u')
        .select('u.id', 'u.nombre', 'u.email', 'u.activo', 'u.created_at', 'r.nombre as rol')
        .join('roles as r', 'u.rol_id', 'r.id')
        .where('u.id', id)
        .first();

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: { usuario: usuarioActualizado }
      });

    } catch (error) {
      logger.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // DELETE /usuarios/:id - Eliminar usuario
  async eliminarUsuario(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el usuario existe
      const usuario = await db('users')
        .where('id', id)
        .first();

      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      // Verificar que no tenga expedientes creados
      const tieneExpedientes = await db('expedientes')
        .where('creado_por', id)
        .first();

      if (tieneExpedientes) {
        throw createError('No se puede eliminar un usuario que tenga expedientes creados', 400);
      }

      // Eliminar usuario
      await db('users')
        .where('id', id)
        .del();

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) {
      logger.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // PATCH /usuarios/:id/activar - Cambiar estado del usuario
  async cambiarEstadoUsuario(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      // Verificar que el usuario existe
      const usuario = await db('users')
        .where('id', id)
        .first();

      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      // Cambiar estado
      await db('users')
        .where('id', id)
        .update({
          activo: activo,
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
      });

    } catch (error) {
      logger.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  }

  // PATCH /usuarios/:id/rol - Cambiar rol del usuario
  async cambiarRolUsuario(req, res) {
    try {
      const { id } = req.params;
      const { rol_id } = req.body;

      // Verificar que el usuario existe
      const usuario = await db('users')
        .where('id', id)
        .first();

      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      // Verificar que el rol existe
      const rol = await db('roles')
        .where('id', rol_id)
        .first();

      if (!rol) {
        throw createError('Rol no encontrado', 404);
      }

      // Cambiar rol
      await db('users')
        .where('id', id)
        .update({
          rol_id: rol_id,
          updated_at: new Date()
        });

      res.json({
        success: true,
        message: 'Rol del usuario cambiado exitosamente'
      });

    } catch (error) {
      logger.error('Error al cambiar rol del usuario:', error);
      throw error;
    }
  }

  // GET /usuarios/:id/actividad - Obtener actividad del usuario
  async obtenerActividadUsuario(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Verificar que el usuario existe
      const usuario = await db('users')
        .where('id', id)
        .first();

      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      // Obtener actividad de auditoría
      const [{ total }] = await db('auditorias')
        .where('user_id', id)
        .count('* as total');

      const actividad = await db('auditorias')
        .where('user_id', id)
        .orderBy('created_at', 'desc')
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
          },
          actividad,
          paginacion: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener actividad del usuario:', error);
      throw error;
    }
  }

  // GET /usuarios/:id/expedientes - Expedientes del usuario
  async obtenerExpedientesUsuario(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Verificar que el usuario existe
      const usuario = await db('users')
        .where('id', id)
        .first();

      if (!usuario) {
        throw createError('Usuario no encontrado', 404);
      }

      // Obtener expedientes creados por el usuario
      const [{ total }] = await db('expedientes')
        .where('creado_por', id)
        .count('* as total');

      const expedientes = await db('expedientes as e')
        .select('e.*', 'i.nombre as institucion_nombre')
        .leftJoin('instituciones as i', 'e.institucion_id', 'i.id')
        .where('e.creado_por', id)
        .orderBy('e.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email
          },
          expedientes,
          paginacion: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener expedientes del usuario:', error);
      throw error;
    }
  }
}

module.exports = new UsuariosController(); 
