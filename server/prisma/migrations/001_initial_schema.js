exports.up = function(knex) {
  return knex.schema
    // Tabla de roles
    .createTable('roles', function(table) {
      table.increments('id').primary();
      table.string('nombre', 32).unique().notNullable();
      table.timestamps(true, true);
    })
    
    // Tabla de instituciones
    .createTable('instituciones', function(table) {
      table.increments('id').primary();
      table.string('nombre', 255).notNullable();
      table.string('tipo', 100);
      table.string('localidad', 100);
      table.timestamps(true, true);
    })
    
    // Tabla de usuarios
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.string('nombre', 120).notNullable();
      table.string('email', 120).unique().notNullable();
      table.string('password_hash', 255).notNullable();
      table.integer('rol_id').unsigned().notNullable();
      table.boolean('activo').defaultTo(true);
      table.string('refresh_token', 500);
      table.timestamp('ultimo_acceso');
      table.timestamps(true, true);
      
      table.foreign('rol_id').references('id').inTable('roles');
    })
    
    // Tabla de expedientes
    .createTable('expedientes', function(table) {
      table.bigIncrements('id').primary();
      table.string('nro', 50).unique().notNullable();
      table.string('caratula', 255).notNullable();
      table.string('fuero', 50);
      table.string('estado', 30).defaultTo('abierto');
      table.integer('institucion_id').unsigned();
      table.integer('creado_por').unsigned().notNullable();
      table.timestamps(true, true);
      
      table.foreign('institucion_id').references('id').inTable('instituciones');
      table.foreign('creado_por').references('id').inTable('users');
    })
    
    // Tabla de actuaciones
    .createTable('actuaciones', function(table) {
      table.bigIncrements('id').primary();
      table.bigInteger('expediente_id').unsigned().notNullable();
      table.string('tipo', 50);
      table.text('descripcion');
      table.date('fecha');
      table.integer('creado_por').unsigned().notNullable();
      table.timestamps(true, true);
      
      table.foreign('expediente_id').references('id').inTable('expedientes');
      table.foreign('creado_por').references('id').inTable('users');
    })
    
    // Tabla de documentos
    .createTable('documentos', function(table) {
      table.bigIncrements('id').primary();
      table.bigInteger('expediente_id').unsigned().notNullable();
      table.bigInteger('actuacion_id').unsigned();
      table.string('nombre', 255).notNullable();
      table.string('tipo_mime', 100);
      table.bigInteger('size');
      table.string('url', 500);
      table.string('hash_sha256', 64);
      table.timestamps(true, true);
      
      table.foreign('expediente_id').references('id').inTable('expedientes');
      table.foreign('actuacion_id').references('id').inTable('actuaciones');
    })
    
    // Tabla de firmas
    .createTable('firmas', function(table) {
      table.bigIncrements('id').primary();
      table.bigInteger('documento_id').unsigned().notNullable();
      table.integer('firmante_id').unsigned().notNullable();
      table.string('tipo_firma', 30); // demo | token | hsm
      table.string('certificado_sn', 128);
      table.datetime('sello_tiempo');
      table.boolean('valido').defaultTo(true);
      table.timestamps(true, true);
      
      table.foreign('documento_id').references('id').inTable('documentos');
      table.foreign('firmante_id').references('id').inTable('users');
    })
    
    // Tabla de auditoría
    .createTable('auditorias', function(table) {
      table.bigIncrements('id').primary();
      table.integer('user_id').unsigned();
      table.string('accion', 50);
      table.string('recurso', 50);
      table.bigInteger('recurso_id');
      table.string('ip', 45);
      table.string('user_agent', 255);
      table.json('detalles');
      table.timestamps(true, true);
      
      table.foreign('user_id').references('id').inTable('users');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('auditorias')
    .dropTableIfExists('firmas')
    .dropTableIfExists('documentos')
    .dropTableIfExists('actuaciones')
    .dropTableIfExists('expedientes')
    .dropTableIfExists('users')
    .dropTableIfExists('instituciones')
    .dropTableIfExists('roles');
}; 