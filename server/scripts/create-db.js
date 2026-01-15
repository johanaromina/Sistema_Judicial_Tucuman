require('dotenv').config();

const mysql = require('mysql2/promise');
const knex = require('knex');

const dbName = process.env.DB_NAME || 'spjt_db';

async function ensureDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'spjt_user',
    password: process.env.DB_PASSWORD || 'spjt_password',
    multipleStatements: false,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
}

async function createSchema() {
  const db = knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'spjt_user',
      password: process.env.DB_PASSWORD || 'spjt_password',
      database: dbName,
      charset: 'utf8mb4',
      timezone: 'UTC',
    },
    migrations: {
      directory: './prisma/migrations',
      tableName: 'knex_migrations',
    },
  });

  try {
    if (!(await db.schema.hasTable('roles'))) {
      await db.schema.createTable('roles', function(table) {
        table.increments('id').primary();
        table.string('nombre', 32).unique().notNullable();
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable('instituciones'))) {
      await db.schema.createTable('instituciones', function(table) {
        table.increments('id').primary();
        table.string('nombre', 255).notNullable();
        table.string('tipo', 100);
        table.string('localidad', 100);
        table.timestamps(true, true);
      });
    }

    if (!(await db.schema.hasTable('users'))) {
      await db.schema.createTable('users', function(table) {
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
      });
    }

    if (!(await db.schema.hasTable('expedientes'))) {
      await db.schema.createTable('expedientes', function(table) {
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
      });
    }

    if (!(await db.schema.hasTable('actuaciones'))) {
      await db.schema.createTable('actuaciones', function(table) {
        table.bigIncrements('id').primary();
        table.bigInteger('expediente_id').unsigned().notNullable();
        table.string('tipo', 50);
        table.text('descripcion');
        table.date('fecha');
        table.integer('creado_por').unsigned().notNullable();
        table.timestamps(true, true);

        table.foreign('expediente_id').references('id').inTable('expedientes');
        table.foreign('creado_por').references('id').inTable('users');
      });
    }

    if (!(await db.schema.hasTable('documentos'))) {
      await db.schema.createTable('documentos', function(table) {
        table.bigIncrements('id').primary();
        table.bigInteger('expediente_id').unsigned().notNullable();
        table.bigInteger('actuacion_id').unsigned();
        table.string('nombre', 255).notNullable();
        table.string('tipo_mime', 100);
        table.bigInteger('size');
        table.string('url', 500);
        table.string('hash_sha256', 64);
        table.text('descripcion').nullable();
        table.string('estado', 30).defaultTo('pendiente_firma');
        table.integer('creado_por').unsigned().nullable();
        table.timestamps(true, true);

        table.foreign('expediente_id').references('id').inTable('expedientes');
        table.foreign('actuacion_id').references('id').inTable('actuaciones');
        table.foreign('creado_por').references('id').inTable('users');
      });
    }

    if (!(await db.schema.hasTable('firmas'))) {
      await db.schema.createTable('firmas', function(table) {
        table.bigIncrements('id').primary();
        table.bigInteger('documento_id').unsigned().notNullable();
        table.integer('firmante_id').unsigned().notNullable();
        table.string('tipo_firma', 30);
        table.string('certificado_sn', 128);
        table.datetime('sello_tiempo');
        table.boolean('valido').defaultTo(true);
        table.string('estado', 30).defaultTo('PENDIENTE');
        table.text('firma_base64', 'longtext');
        table.string('hash_documento', 64);
        table.json('metadatos');
        table.text('comentario', 'longtext');
        table.string('referencia_externa', 100);
        table.timestamps(true, true);

        table.foreign('documento_id').references('id').inTable('documentos');
        table.foreign('firmante_id').references('id').inTable('users');
      });
    }

    if (!(await db.schema.hasTable('auditorias'))) {
      await db.schema.createTable('auditorias', function(table) {
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
    }
  } finally {
    await db.destroy();
  }
}

async function main() {
  await ensureDatabase();
  await createSchema();
  console.log(`DB lista: ${dbName}`);
}

main().catch((err) => {
  console.error('Error creando la BD:', err);
  process.exit(1);
});
