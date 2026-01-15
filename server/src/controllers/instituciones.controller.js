const { db } = require('../config/database');
const { logger } = require('../config/logger');

class InstitucionesController {
  // GET /instituciones
  async listar(req, res) {
    try {
      const { search = '', page = 1, limit = 50 } = req.query;
      const p = Math.max(parseInt(page) || 1, 1);
      const l = Math.min(Math.max(parseInt(limit) || 50, 1), 200);
      const offset = (p - 1) * l;

      let qb = db('instituciones').select('id', 'nombre', 'tipo');
      if (search) qb = qb.where('nombre', 'like', `%${search}%`);

      const [{ total }] = await qb.clone().clearSelect().count('* as total');
      const instituciones = await qb.orderBy('nombre', 'asc').limit(l).offset(offset);

      res.json({
        success: true,
        data: {
          instituciones,
          paginacion: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        }
      });
    } catch (error) {
      logger.error('Error al listar instituciones:', error);
      throw error;
    }
  }
}

module.exports = new InstitucionesController();

