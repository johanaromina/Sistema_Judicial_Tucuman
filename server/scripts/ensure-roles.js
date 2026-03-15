require('dotenv').config();
const { db } = require('../src/config/database');

const REQUIRED_ROLES = ['ADMIN', 'JUEZ', 'SECRETARIO', 'OPERADOR'];

async function ensureRoles() {
  try {
    const existingRows = await db('roles').select('id', 'nombre');
    const existingByUpper = new Map(
      existingRows.map((r) => [String(r.nombre).trim().toUpperCase(), r])
    );

    const missingRoles = REQUIRED_ROLES.filter((role) => !existingByUpper.has(role));

    if (missingRoles.length > 0) {
      await db('roles').insert(missingRoles.map((nombre) => ({ nombre })));
      console.log(`Roles insertados: ${missingRoles.join(', ')}`);
    } else {
      console.log('No faltan roles. Ya estaban cargados.');
    }

    const finalRoles = await db('roles').select('id', 'nombre').orderBy('id', 'asc');
    console.log('Roles actuales en DB:');
    console.table(finalRoles);
  } catch (error) {
    console.error('Error asegurando roles:', error.message);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

ensureRoles();
