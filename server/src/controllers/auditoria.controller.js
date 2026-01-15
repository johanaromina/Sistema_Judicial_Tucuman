const { db } = require('../config/database');
const { logger } = require('../config/logger');
const { createError } = require('../middlewares/errorHandler');

class AuditoriaController {
  // GET /auditoria - Listar auditoría
  async listarAuditoria(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        user_id,
        accion,
        recurso,
        fechaDesde,
        fechaHasta
      } = req.query;

      const offset = (page - 1) * limit;

      let queryBuilder = db('auditorias as a')
        .select(
          'a.*',
          'u.nombre as usuario_nombre',
          'u.email as usuario_email'
        )
        .leftJoin('users as u', 'a.user_id', 'u.id');

      // Aplicar filtros
      if (user_id) {
        queryBuilder = queryBuilder.where('a.user_id', user_id);
      }

      if (accion) {
        queryBuilder = queryBuilder.where('a.accion', accion);
      }

      if (recurso) {
        queryBuilder = queryBuilder.where('a.recurso', recurso);
      }

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('a.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('a.created_at', '<=', fechaHasta);
      }

      // Obtener total
      const [{ total }] = await queryBuilder.clone().count('* as total');

      // Aplicar paginación
      const auditoria = await queryBuilder
        .orderBy('a.created_at', 'desc')
        .limit(limit)
        .offset(offset);

      res.json({
        success: true,
        data: {
          auditoria,
          paginacion: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error al listar auditoría:', error);
      throw error;
    }
  }

  // GET /auditoria/usuarios - Auditoría por usuario
  async auditoriaPorUsuario(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      let queryBuilder = db('auditorias as a')
        .select(
          'u.nombre as usuario_nombre',
          'u.email as usuario_email',
          db.raw('COUNT(*) as total_acciones')
        )
        .join('users as u', 'a.user_id', 'u.id')
        .groupBy('a.user_id', 'u.nombre', 'u.email');

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('a.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('a.created_at', '<=', fechaHasta);
      }

      const auditoria = await queryBuilder
        .orderBy('total_acciones', 'desc');

      res.json({
        success: true,
        data: { auditoria }
      });

    } catch (error) {
      logger.error('Error al obtener auditoría por usuario:', error);
      throw error;
    }
  }

  // GET /auditoria/recursos - Auditoría por recurso
  async auditoriaPorRecurso(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      let queryBuilder = db('auditorias as a')
        .select(
          'a.recurso',
          db.raw('COUNT(*) as total_acciones')
        )
        .groupBy('a.recurso')
        .orderBy('total_acciones', 'desc');

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('a.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('a.created_at', '<=', fechaHasta);
      }

      const auditoria = await queryBuilder;

      res.json({
        success: true,
        data: { auditoria }
      });

    } catch (error) {
      logger.error('Error al obtener auditoría por recurso:', error);
      throw error;
    }
  }

  // GET /auditoria/tiempo - Auditoría por período de tiempo
  async auditoriaPorTiempo(req, res) {
    try {
      const { fechaDesde, fechaHasta, grupo = 'dia' } = req.query;

      let groupBy;
      let dateFormat;

      switch (grupo) {
        case 'hora':
          groupBy = db.raw('DATE_FORMAT(a.created_at, "%Y-%m-%d %H:00:00")');
          dateFormat = 'Hora';
          break;
        case 'dia':
          groupBy = db.raw('DATE(a.created_at)');
          dateFormat = 'Día';
          break;
        case 'mes':
          groupBy = db.raw('DATE_FORMAT(a.created_at, "%Y-%m")');
          dateFormat = 'Mes';
          break;
        default:
          groupBy = db.raw('DATE(a.created_at)');
          dateFormat = 'Día';
      }

      let queryBuilder = db('auditorias as a')
        .select(
          groupBy.as('periodo'),
          db.raw('COUNT(*) as total_acciones')
        )
        .groupBy('periodo')
        .orderBy('periodo', 'asc');

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('a.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('a.created_at', '<=', fechaHasta);
      }

      const auditoria = await queryBuilder;

      res.json({
        success: true,
        data: {
          auditoria,
          agrupacion: dateFormat
        }
      });

    } catch (error) {
      logger.error('Error al obtener auditoría por tiempo:', error);
      throw error;
    }
  }

  // GET /auditoria/exportar - Exportar auditoría
  async exportarAuditoria(req, res) {
    try {
      const { formato = 'json', fechaDesde, fechaHasta } = req.query;

      let queryBuilder = db('auditorias as a')
        .select(
          'a.*',
          'u.nombre as usuario_nombre',
          'u.email as usuario_email'
        )
        .leftJoin('users as u', 'a.user_id', 'u.id')
        .orderBy('a.created_at', 'desc');

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('a.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('a.created_at', '<=', fechaHasta);
      }

      const auditoria = await queryBuilder;

      if (formato === 'csv') {
        // Implementar exportación a CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="auditoria.csv"');
        
        const csvHeader = 'Fecha,Usuario,Acción,Recurso,IP,User Agent\n';
        const csvData = auditoria.map(a => 
          `${a.created_at},${a.usuario_nombre || 'N/A'},${a.accion},${a.recurso},${a.ip || 'N/A'},${a.user_agent || 'N/A'}`
        ).join('\n');
        
        res.send(csvHeader + csvData);
      } else {
        res.json({
          success: true,
          data: { auditoria },
          exportado: true,
          formato: 'json'
        });
      }

    } catch (error) {
      logger.error('Error al exportar auditoría:', error);
      throw error;
    }
  }

  // GET /reportes/tiempos - Reporte de tiempos de expedientes
  async reporteTiempos(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      let queryBuilder = db('expedientes as e')
        .select(
          'e.estado',
          db.raw('AVG(DATEDIFF(COALESCE(e.updated_at, NOW()), e.created_at)) as tiempo_promedio_dias'),
          db.raw('COUNT(*) as total_expedientes')
        )
        .groupBy('e.estado');

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('e.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('e.created_at', '<=', fechaHasta);
      }

      const reporte = await queryBuilder;

      res.json({
        success: true,
        data: { reporte }
      });

    } catch (error) {
      logger.error('Error al generar reporte de tiempos:', error);
      throw error;
    }
  }

  // GET /reportes/volumen - Reporte de volumen de trabajo
  async reporteVolumen(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      let queryBuilder = db('expedientes as e')
        .select(
          db.raw('DATE(e.created_at) as fecha'),
          db.raw('COUNT(*) as expedientes_creados'),
          db.raw('COUNT(DISTINCT e.creado_por) as usuarios_activos')
        )
        .groupBy('fecha')
        .orderBy('fecha', 'desc')
        .limit(30);

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('e.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('e.created_at', '<=', fechaHasta);
      }

      const reporte = await queryBuilder;

      res.json({
        success: true,
        data: { reporte }
      });

    } catch (error) {
      logger.error('Error al generar reporte de volumen:', error);
      throw error;
    }
  }

  // GET /reportes/usuarios - Reporte de actividad por usuario
  async reporteUsuarios(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      let queryBuilder = db('auditorias as a')
        .select(
          'u.nombre as usuario_nombre',
          'u.email as usuario_email',
          'r.nombre as rol',
          db.raw('COUNT(*) as total_acciones'),
          db.raw('COUNT(DISTINCT DATE(a.created_at)) as dias_activos')
        )
        .join('users as u', 'a.user_id', 'u.id')
        .join('roles as r', 'u.rol_id', 'r.id')
        .groupBy('a.user_id', 'u.nombre', 'u.email', 'r.nombre')
        .orderBy('total_acciones', 'desc');

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('a.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('a.created_at', '<=', fechaHasta);
      }

      const reporte = await queryBuilder;

      res.json({
        success: true,
        data: { reporte }
      });

    } catch (error) {
      logger.error('Error al generar reporte de usuarios:', error);
      throw error;
    }
  }

  // GET /reportes/instituciones - Reporte por institución
  async reporteInstituciones(req, res) {
    try {
      const { fechaDesde, fechaHasta } = req.query;

      let queryBuilder = db('expedientes as e')
        .select(
          'i.nombre as institucion_nombre',
          'i.tipo as institucion_tipo',
          db.raw('COUNT(*) as total_expedientes'),
          db.raw('COUNT(DISTINCT e.creado_por) as usuarios_activos')
        )
        .join('instituciones as i', 'e.institucion_id', 'i.id')
        .groupBy('e.institucion_id', 'i.nombre', 'i.tipo')
        .orderBy('total_expedientes', 'desc');

      if (fechaDesde) {
        queryBuilder = queryBuilder.where('e.created_at', '>=', fechaDesde);
      }

      if (fechaHasta) {
        queryBuilder = queryBuilder.where('e.created_at', '<=', fechaHasta);
      }

      const reporte = await queryBuilder;

      res.json({
        success: true,
        data: { reporte }
      });

    } catch (error) {
      logger.error('Error al generar reporte de instituciones:', error);
      throw error;
    }
  }
}

module.exports = new AuditoriaController(); 