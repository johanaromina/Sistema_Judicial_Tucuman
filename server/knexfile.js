require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'spjt_user',
      password: process.env.DB_PASSWORD || 'spjt_password',
      database: process.env.DB_NAME || 'spjt_db',
      charset: 'utf8mb4',
      timezone: 'UTC',
    },
    migrations: {
      directory: './prisma/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './prisma/seeds',
    },
    debug: true,
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
      timezone: 'UTC',
    },
    migrations: {
      directory: './prisma/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './prisma/seeds',
    },
    debug: false,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
  },
}; 