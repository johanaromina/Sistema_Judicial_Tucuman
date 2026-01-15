const argon2 = require('argon2');

exports.seed = async function(knex) {
  // Limpiar tablas existentes
  await knex('auditorias').del();
  await knex('firmas').del();
  await knex('documentos').del();
  await knex('actuaciones').del();
  await knex('expedientes').del();
  await knex('users').del();
  await knex('instituciones').del();
  await knex('roles').del();

  // Insertar roles
  const rolesResult = await knex('roles').insert([
    { nombre: 'admin' },
    { nombre: 'juez' },
    { nombre: 'secretario' },
    { nombre: 'operador' }
  ]);

  // Obtener los roles insertados
  const roles = await knex('roles').select('*');
  console.log('Roles insertados:', roles.length);

  // Insertar instituciones
  const institucionesResult = await knex('instituciones').insert([
    { 
      nombre: 'Juzgado Civil y Comercial N° 1',
      tipo: 'Juzgado',
      localidad: 'Ciudad de Buenos Aires'
    },
    { 
      nombre: 'Juzgado Penal N° 2',
      tipo: 'Juzgado',
      localidad: 'Ciudad de Buenos Aires'
    },
    { 
      nombre: 'Secretaría General',
      tipo: 'Secretaría',
      localidad: 'Ciudad de Buenos Aires'
    }
  ]);

  // Obtener las instituciones insertadas
  const instituciones = await knex('instituciones').select('*');
  console.log('Instituciones insertadas:', instituciones.length);

  // Crear hash de contraseña para usuarios de prueba
  const passwordHash = await argon2.hash('123456');

  // Insertar usuarios
  const usersResult = await knex('users').insert([
    {
      nombre: 'Administrador del Sistema',
      email: 'admin@spjt.com',
      password_hash: passwordHash,
      rol_id: roles.find(r => r.nombre === 'admin').id,
      activo: true
    },
    {
      nombre: 'Dr. Juan Pérez',
      email: 'juez.perez@spjt.com',
      password_hash: passwordHash,
      rol_id: roles.find(r => r.nombre === 'juez').id,
      activo: true
    },
    {
      nombre: 'Lic. María González',
      email: 'secretaria.gonzalez@spjt.com',
      password_hash: passwordHash,
      rol_id: roles.find(r => r.nombre === 'secretario').id,
      activo: true
    },
    {
      nombre: 'Carlos Rodríguez',
      email: 'operador.rodriguez@spjt.com',
      password_hash: passwordHash,
      rol_id: roles.find(r => r.nombre === 'operador').id,
      activo: true
    }
  ]);

  // Obtener los usuarios insertados
  const users = await knex('users').select('*');
  console.log('Usuarios insertados:', users.length);

  // Insertar expedientes de prueba
  const expedientesResult = await knex('expedientes').insert([
    {
      nro: 'EXP-2024-001',
      caratula: 'PÉREZ, Juan c/ GONZÁLEZ, María s/ Daños y Perjuicios',
      fuero: 'Civil y Comercial',
      estado: 'abierto',
      institucion_id: instituciones.find(i => i.tipo === 'Juzgado').id,
      creado_por: users.find(u => u.rol_id === roles.find(r => r.nombre === 'secretario').id).id
    },
    {
      nro: 'EXP-2024-002',
      caratula: 'RODRÍGUEZ, Carlos s/ Robo',
      fuero: 'Penal',
      estado: 'en_trámite',
      institucion_id: instituciones.find(i => i.tipo === 'Juzgado').id,
      creado_por: users.find(u => u.rol_id === roles.find(r => r.nombre === 'juez').id).id
    }
  ]);

  // Obtener los expedientes insertados
  const expedientes = await knex('expedientes').select('*');
  console.log('Expedientes insertados:', expedientes.length);

  // Insertar actuaciones de prueba
  const actuacionesResult = await knex('actuaciones').insert([
    {
      expediente_id: expedientes[0].id,
      tipo: 'Presentación de demanda',
      descripcion: 'Se presenta demanda por daños y perjuicios',
      fecha: new Date('2024-01-15'),
      creado_por: users.find(u => u.rol_id === roles.find(r => r.nombre === 'secretario').id).id
    },
    {
      expediente_id: expedientes[1].id,
      tipo: 'Apertura de causa',
      descripcion: 'Se abre causa penal por robo',
      fecha: new Date('2024-01-20'),
      creado_por: users.find(u => u.rol_id === roles.find(r => r.nombre === 'juez').id).id
    }
  ]);

  console.log('✅ Datos iniciales insertados correctamente');
  console.log(`📊 Roles: ${roles.length}`);
  console.log(`🏛️  Instituciones: ${instituciones.length}`);
  console.log(`👥 Usuarios: ${users.length}`);
  console.log(`📁 Expedientes: ${expedientes.length}`);
  console.log('\n🔑 Credenciales de prueba:');
  console.log('Email: admin@spjt.com | Password: 123456');
  console.log('Email: juez.perez@spjt.com | Password: 123456');
  console.log('Email: secretaria.gonzalez@spjt.com | Password: 123456');
  console.log('Email: operador.rodriguez@spjt.com | Password: 123456');
}; 