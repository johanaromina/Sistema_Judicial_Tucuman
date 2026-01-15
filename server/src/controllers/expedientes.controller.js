const { db } = require('../config/database');
const { logger, auditLog } = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

class ExpedientesController {
  // GET /expedientes - Listar expedientes con filtros
  async listarExpedientes(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        query = '',
        fuero = '',
        estado = '',
        institucion = '',
        fechaDesde = '',
        fechaHasta = ''
      } = req.query;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;
      
      // Construir query base
      let queryBuilder = db('expedientes as e')
        .select(
          'e.*',
          'u.nombre as creado_por_nombre',
          'i.nombre as institucion_nombre',
          'i.tipo as institucion_tipo'
        )
        .join('users as u', 'e.creado_por', 'u.id')
        .leftJoin('instituciones as i', 'e.institucion_id', 'i.id');

      // Aplicar filtros
      if (query) {
        queryBuilder = queryBuilder.where(function() {
          this.where('e.nro', 'like', `%${query}%`)
            .orWhere('e.caratula', 'like', `%${query}%`)
            .orWhere('e.fuero', 'like', `%${query}%`);
        });
      }

      if (fuero) {
        queryBuilder = queryBuilder.where('e.fuero', fuero);
      }

      if (estado) {
        queryBuilder = queryBuilder.where('e.estado', estado);
      }

      if (institucion) {
        queryBuilder = queryBuilder.where('i.nombre', 'like', `%${institucion}%`);
      }

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('e.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('e.created_at', '<=', fechaHasta);
      }

      // Obtener total de registros
      const totalQuery = queryBuilder.clone();
      const [{ total }] = await totalQuery.clearSelect().count('* as total');

      // Aplicar paginación y ordenamiento
      const expedientes = await queryBuilder
        .orderBy('e.created_at', 'desc')
        .limit(limitNum)
        .offset(offset);

      // Obtener estadísticas adicionales
      const estadisticas = await db('expedientes')
        .select('estado')
        .count('* as cantidad')
        .groupBy('estado');

      res.json({
        success: true,
        data: {
          expedientes,
          paginacion: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          },
          estadisticas
        }
      });

    } catch (error) {
      logger.error('Error al listar expedientes:', error);
      throw error;
    }
  }

  // GET /expedientes/search - Búsqueda rápida (para autocompletar)
  async busquedaRapida(req, res) {
    try {
      const { query = '', limit = 10 } = req.query;
      const limitNum = Math.min(parseInt(limit) || 10, 50);

      const qb = db('expedientes as e')
        .select('e.id', 'e.nro', 'e.caratula', 'e.fuero')
        .orderBy('e.created_at', 'desc')
        .limit(limitNum);

      if (query) {
        qb.where(function() {
          this.where('e.nro', 'like', `%${query}%`)
            .orWhere('e.caratula', 'like', `%${query}%`)
            .orWhere('e.fuero', 'like', `%${query}%`);
        });
      }

      const resultados = await qb;

      res.json({ success: true, data: { expedientes: resultados } });
    } catch (error) {
      logger.error('Error en búsqueda rápida de expedientes:', error);
      throw error;
    }
  }

  // POST /expedientes - Crear nuevo expediente
  async crearExpediente(req, res) {
    try {
      const {
        nro,
        caratula,
        fuero,
        institucion_id,
        estado = 'abierto'
      } = req.body;

      const userId = req.user.id;

      // Validar que el número de expediente sea único
      const expedienteExistente = await db('expedientes')
        .where('nro', nro)
        .first();

      if (expedienteExistente) {
        throw createError('Ya existe un expediente con ese número', 409);
      }

      // Crear el expediente
      const [expedienteId] = await db('expedientes').insert({
        nro,
        caratula,
        fuero,
        estado,
        institucion_id,
        creado_por: userId
      });

      // Obtener el expediente creado
      const expediente = await db('expedientes as e')
        .select(
          'e.*',
          'u.nombre as creado_por_nombre',
          'i.nombre as institucion_nombre'
        )
        .join('users as u', 'e.creado_por', 'u.id')
        .leftJoin('instituciones as i', 'e.institucion_id', 'i.id')
        .where('e.id', expedienteId)
        .first();

      // Crear actuación inicial
      await db('actuaciones').insert({
        expediente_id: expedienteId,
        tipo: 'Apertura de expediente',
        descripcion: `Se abre expediente ${nro} - ${caratula}`,
        fecha: new Date(),
        creado_por: userId
      });

      res.status(201).json({
        success: true,
        message: 'Expediente creado exitosamente',
        data: { expediente }
      });

    } catch (error) {
      logger.error('Error al crear expediente:', error);
      throw error;
    }
  }

  // GET /expedientes/:id - Obtener expediente por ID
  async obtenerExpediente(req, res) {
    try {
      const { id } = req.params;

      const expediente = await db('expedientes as e')
        .select(
          'e.*',
          'u.nombre as creado_por_nombre',
          'i.nombre as institucion_nombre',
          'i.tipo as institucion_tipo'
        )
        .join('users as u', 'e.creado_por', 'u.id')
        .leftJoin('instituciones as i', 'e.institucion_id', 'i.id')
        .where('e.id', id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Obtener actuaciones recientes
      const actuaciones = await db('actuaciones as a')
        .select('a.*', 'u.nombre as creado_por_nombre')
        .join('users as u', 'a.creado_por', 'u.id')
        .where('a.expediente_id', id)
        .orderBy('a.created_at', 'desc')
        .limit(5);

      // Obtener documentos recientes
      const documentos = await db('documentos as d')
        .select('d.*', 'u.nombre as subido_por_nombre')
        .join('users as u', 'd.creado_por', 'u.id')
        .where('d.expediente_id', id)
        .orderBy('d.created_at', 'desc')
        .limit(5);

      res.json({
        success: true,
        data: {
          expediente,
          actuaciones,
          documentos
        }
      });

    } catch (error) {
      logger.error('Error al obtener expediente:', error);
      throw error;
    }
  }

  // PATCH /expedientes/:id - Actualizar expediente
  async actualizarExpediente(req, res) {
    try {
      const { id } = req.params;
      const { caratula, fuero, estado, institucion_id } = req.body;
      const userId = req.user.id;

      // Verificar que el expediente existe
      const expedienteExistente = await db('expedientes')
        .where('id', id)
        .first();

      if (!expedienteExistente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Actualizar expediente
      await db('expedientes')
        .where('id', id)
        .update({
          caratula: caratula || expedienteExistente.caratula,
          fuero: fuero || expedienteExistente.fuero,
          estado: estado || expedienteExistente.estado,
          institucion_id: institucion_id || expedienteExistente.institucion_id,
          updated_at: new Date()
        });

      // Crear actuación de modificación
      await db('actuaciones').insert({
        expediente_id: id,
        tipo: 'Modificación de expediente',
        descripcion: 'Se modificaron datos del expediente',
        fecha: new Date(),
        creado_por: userId
      });

      // Obtener expediente actualizado
      const expediente = await db('expedientes as e')
        .select(
          'e.*',
          'u.nombre as creado_por_nombre',
          'i.nombre as institucion_nombre'
        )
        .join('users as u', 'e.creado_por', 'u.id')
        .leftJoin('instituciones as i', 'e.institucion_id', 'i.id')
        .where('e.id', id)
        .first();

      res.json({
        success: true,
        message: 'Expediente actualizado exitosamente',
        data: { expediente }
      });

    } catch (error) {
      logger.error('Error al actualizar expediente:', error);
      throw error;
    }
  }

  // DELETE /expedientes/:id - Eliminar expediente
  async eliminarExpediente(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el expediente existe
      const expediente = await db('expedientes')
        .where('id', id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Verificar que no tenga documentos o actuaciones
      const tieneDocumentos = await db('documentos')
        .where('expediente_id', id)
        .first();

      const tieneActuaciones = await db('actuaciones')
        .where('expediente_id', id)
        .first();

      if (tieneDocumentos || tieneActuaciones) {
        throw createError('No se puede eliminar un expediente que tenga documentos o actuaciones', 400);
      }

      // Eliminar expediente
      await db('expedientes')
        .where('id', id)
        .del();

      res.json({
        success: true,
        message: 'Expediente eliminado exitosamente'
      });

    } catch (error) {
      logger.error('Error al eliminar expediente:', error);
      throw error;
    }
  }

  // GET /expedientes/:id/actuaciones - Listar actuaciones
  async listarActuaciones(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Verificar que el expediente existe
      const expediente = await db('expedientes')
        .where('id', id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Obtener total de actuaciones
      const [{ total }] = await db('actuaciones')
        .where('expediente_id', id)
        .count('* as total');

      // Obtener actuaciones paginadas
      const actuaciones = await db('actuaciones as a')
        .select('a.*', 'u.nombre as creado_por_nombre')
        .join('users as u', 'a.creado_por', 'u.id')
        .where('a.expediente_id', id)
        .orderBy('a.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: {
          actuaciones,
          paginacion: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error al listar actuaciones:', error);
      throw error;
    }
  }

  // POST /expedientes/:id/actuaciones - Crear actuación
  async crearActuacion(req, res) {
    try {
      const { id } = req.params;
      const { tipo, descripcion, fecha } = req.body;
      const userId = req.user.id;

      // Verificar que el expediente existe
      const expediente = await db('expedientes')
        .where('id', id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Crear actuación
      const [actuacionId] = await db('actuaciones').insert({
        expediente_id: id,
        tipo,
        descripcion,
        fecha: fecha || new Date(),
        creado_por: userId
      });

      // Obtener actuación creada
      const actuacion = await db('actuaciones as a')
        .select('a.*', 'u.nombre as creado_por_nombre')
        .join('users as u', 'a.creado_por', 'u.id')
        .where('a.id', actuacionId)
        .first();

      res.status(201).json({
        success: true,
        message: 'Actuación creada exitosamente',
        data: { actuacion }
      });

    } catch (error) {
      logger.error('Error al crear actuación:', error);
      throw error;
    }
  }

  // GET /expedientes/:id/documentos - Listar documentos
  async listarDocumentos(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      // Verificar que el expediente existe
      const expediente = await db('expedientes')
        .where('id', id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Obtener total de documentos
      const [{ total }] = await db('documentos')
        .where('expediente_id', id)
        .count('* as total');

      // Obtener documentos paginados
      const documentos = await db('documentos as d')
        .select('d.*', 'u.nombre as subido_por_nombre')
        .join('users as u', 'd.creado_por', 'u.id')
        .where('d.expediente_id', id)
        .orderBy('d.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: {
          documentos,
          paginacion: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error al listar documentos:', error);
      throw error;
    }
  }

  // POST /expedientes/:id/documentos - Subir documento
  async subirDocumento(req, res) {
    try {
      const { id } = req.params;
      const { nombre, tipo_mime, size, url, hash_sha256, actuacion_id } = req.body;
      const userId = req.user.id;

      // Verificar que el expediente existe
      const expediente = await db('expedientes')
        .where('id', id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Crear documento
      const [documentoId] = await db('documentos').insert({
        expediente_id: id,
        actuacion_id,
        nombre,
        tipo_mime,
        size,
        url,
        hash_sha256,
        creado_por: userId
      });

      // Obtener documento creado
      const documento = await db('documentos as d')
        .select('d.*', 'u.nombre as subido_por_nombre')
        .join('users as u', 'd.creado_por', 'u.id')
        .where('d.id', documentoId)
        .first();

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: { documento }
      });

    } catch (error) {
      logger.error('Error al subir documento:', error);
      throw error;
    }
  }

  // GET /expedientes/:id/estadisticas - Estadísticas del expediente
  async obtenerEstadisticas(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el expediente existe
      const expediente = await db('expedientes')
        .where('id', id)
        .first();

      if (!expediente) {
        throw createError('Expediente no encontrado', 404);
      }

      // Contar actuaciones
      const [{ totalActuaciones }] = await db('actuaciones')
        .where('expediente_id', id)
        .count('* as totalActuaciones');

      // Contar documentos
      const [{ totalDocumentos }] = await db('documentos')
        .where('expediente_id', id)
        .count('* as totalDocumentos');

      // Tamaño total de documentos
      const [{ tamañoTotal }] = await db('documentos')
        .where('expediente_id', id)
        .sum('size as tamañoTotal');

      // Actuaciones por tipo
      const actuacionesPorTipo = await db('actuaciones')
        .select('tipo')
        .count('* as cantidad')
        .where('expediente_id', id)
        .groupBy('tipo');

      // Documentos por tipo MIME
      const documentosPorTipo = await db('documentos')
        .select('tipo_mime')
        .count('* as cantidad')
        .where('expediente_id', id)
        .groupBy('tipo_mime');

      res.json({
        success: true,
        data: {
          expediente: {
            id: expediente.id,
            nro: expediente.nro,
            caratula: expediente.caratula,
            estado: expediente.estado,
            fuero: expediente.fuero
          },
          estadisticas: {
            totalActuaciones,
            totalDocumentos,
            tamañoTotal: tamañoTotal || 0,
            actuacionesPorTipo,
            documentosPorTipo
          }
        }
      });

    } catch (error) {
      logger.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

module.exports = new ExpedientesController(); 
