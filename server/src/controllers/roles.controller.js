const { db } = require('../config/database');
const { logger } = require('../config/logger');

class RolesController {
  async listar(req, res) {
    try {
      const roles = await db('roles').select('id', 'nombre');
      res.json({ success: true, data: { roles } });
    } catch (error) {
      logger.error('Error al listar roles:', error);
      throw error;
    }
  }
}

module.exports = new RolesController();

