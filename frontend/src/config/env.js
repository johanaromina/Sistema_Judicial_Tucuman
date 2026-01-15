// Configuración del entorno de la aplicación SPJT
export const ENV = {
  // Configuración de la API
  API_BASE_URL: 'http://192.168.100.9:3001/api/v1',
  
  // Configuración de la aplicación
  APP_NAME: 'SPJT - Sistema de Procesos Judiciales',
  VERSION: '1.0.0',
  BUILD: '1',
  SUPPORT_EMAIL: 'soporte@spjt.com',
  
  // Configuración del entorno
  NODE_ENV: 'development',
  DEBUG: true,
  
  // Configuración de la base de datos
  DB_HOST: 'localhost',
  DB_PORT: 3306,
  DB_NAME: 'spjt_db',
  
  // Configuración de seguridad
  JWT_SECRET: 'your-secret-key-here',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Configuración de archivos
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: '/uploads',
  
  // Configuración de logs
  LOG_LEVEL: 'debug',
  LOG_FILE: 'spjt.log',
  
  // Configuración de notificaciones
  NOTIFICATION_ENABLED: true,
  EMAIL_ENABLED: false,
  SMS_ENABLED: false,
  
  // Configuración de caché
  CACHE_ENABLED: true,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  
  // Configuración de rate limiting
  RATE_LIMIT_ENABLED: true,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Configuración de CORS
  CORS_ORIGIN: ['http://localhost:3000', 'http://localhost:19006', 'http://192.168.100.9:19006'],
  
  // Configuración de SSL/TLS
  SSL_ENABLED: false,
  SSL_CERT_PATH: '',
  SSL_KEY_PATH: '',
  
  // Configuración de proxy
  PROXY_ENABLED: false,
  PROXY_HOST: '',
  PROXY_PORT: '',
  
  // Configuración de monitoreo
  MONITORING_ENABLED: true,
  HEALTH_CHECK_INTERVAL: 30 * 1000, // 30 segundos
  
  // Configuración de backup
  BACKUP_ENABLED: true,
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
  BACKUP_RETENTION_DAYS: 30,
  
  // Configuración de auditoría
  AUDIT_ENABLED: true,
  AUDIT_LOG_LEVEL: 'info',
  AUDIT_RETENTION_DAYS: 365,
  
  // Configuración de sesiones
  SESSION_ENABLED: true,
  SESSION_SECRET: 'your-session-secret-here',
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas
  
  // Configuración de autenticación
  AUTH_ENABLED: true,
  AUTH_PROVIDER: 'local', // local, ldap, oauth
  AUTH_MFA_ENABLED: false,
  AUTH_PASSWORD_POLICY: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true
  },
  
  // Configuración de roles y permisos
  RBAC_ENABLED: true,
  DEFAULT_ROLE: 'OPERADOR',
  SUPER_ADMIN_ROLE: 'ADMIN',
  
  // Configuración de expedientes
  EXPEDIENTE_AUTO_NUMBERING: true,
  EXPEDIENTE_PREFIX: 'EXP',
  EXPEDIENTE_YEAR_FORMAT: 'YYYY',
  
  // Configuración de documentos
  DOCUMENTO_AUTO_VERSIONING: true,
  DOCUMENTO_MAX_VERSIONS: 10,
  DOCUMENTO_SIGNATURE_REQUIRED: true,
  
  // Configuración de firmas
  FIRMA_DIGITAL_ENABLED: true,
  FIRMA_HSM_ENABLED: false,
  FIRMA_TOKEN_ENABLED: true,
  FIRMA_DEMO_ENABLED: true,
  
  // Configuración de notificaciones push
  PUSH_NOTIFICATIONS_ENABLED: false,
  PUSH_VAPID_PUBLIC_KEY: '',
  PUSH_VAPID_PRIVATE_KEY: '',
  
  // Configuración de websockets
  WEBSOCKET_ENABLED: false,
  WEBSOCKET_PORT: 3002,
  
  // Configuración de tareas programadas
  CRON_ENABLED: true,
  CRON_TIMEZONE: 'America/Argentina/Buenos_Aires',
  
  // Configuración de exportación
  EXPORT_ENABLED: true,
  EXPORT_MAX_RECORDS: 10000,
  EXPORT_FORMATS: ['pdf', 'xlsx', 'csv'],
  
  // Configuración de búsqueda
  SEARCH_ENABLED: true,
  SEARCH_ENGINE: 'database', // database, elasticsearch, algolia
  SEARCH_INDEX_PREFIX: 'spjt_',
  
  // Configuración de caché distribuido
  REDIS_ENABLED: false,
  REDIS_HOST: 'localhost',
  REDIS_PORT: 6379,
  REDIS_PASSWORD: '',
  REDIS_DB: 0,
  
  // Configuración de cola de tareas
  QUEUE_ENABLED: false,
  QUEUE_DRIVER: 'database', // database, redis, sqs
  QUEUE_CONNECTION: 'default',
  
  // Configuración de almacenamiento
  STORAGE_DRIVER: 'local', // local, s3, gcs, azure
  STORAGE_BUCKET: '',
  STORAGE_REGION: '',
  STORAGE_ENDPOINT: '',
  
  // Configuración de CDN
  CDN_ENABLED: false,
  CDN_URL: '',
  CDN_API_KEY: '',
  
  // Configuración de analytics
  ANALYTICS_ENABLED: false,
  ANALYTICS_PROVIDER: 'google', // google, mixpanel, amplitude
  ANALYTICS_TRACKING_ID: '',
  
  // Configuración de errores
  ERROR_REPORTING_ENABLED: false,
  ERROR_REPORTING_PROVIDER: 'sentry', // sentry, bugsnag, rollbar
  ERROR_REPORTING_DSN: '',
  
  // Configuración de performance
  PERFORMANCE_MONITORING_ENABLED: false,
  PERFORMANCE_MONITORING_PROVIDER: 'newrelic', // newrelic, datadog, appdynamics
  PERFORMANCE_MONITORING_LICENSE_KEY: '',
  
  // Configuración de testing
  TESTING_ENABLED: false,
  TESTING_FRAMEWORK: 'jest',
  TESTING_COVERAGE_THRESHOLD: 80,
  
  // Configuración de CI/CD
  CI_ENABLED: false,
  CI_PROVIDER: 'github', // github, gitlab, bitbucket
  CI_WEBHOOK_URL: '',
  
  // Configuración de deployment
  DEPLOYMENT_ENVIRONMENT: 'development', // development, staging, production
  DEPLOYMENT_AUTO_SCALING: false,
  DEPLOYMENT_MIN_INSTANCES: 1,
  DEPLOYMENT_MAX_INSTANCES: 5
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': `SPJT-App/${ENV.VERSION}`
  }
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: ENV.APP_NAME,
  VERSION: ENV.VERSION,
  BUILD: ENV.BUILD,
  SUPPORT_EMAIL: ENV.SUPPORT_EMAIL,
  DEBUG: ENV.DEBUG,
  ENVIRONMENT: ENV.NODE_ENV
};

// Configuración de la base de datos
export const DB_CONFIG = {
  HOST: ENV.DB_HOST,
  PORT: ENV.DB_PORT,
  NAME: ENV.DB_NAME,
  USER: process.env.DB_USER || 'root',
  PASSWORD: process.env.DB_PASSWORD || '',
  DIALECT: 'mysql',
  POOL: {
    MAX: 10,
    MIN: 0,
    ACQUIRE: 30000,
    IDLE: 10000
  }
};

// Configuración de seguridad
export const SECURITY_CONFIG = {
  JWT_SECRET: ENV.JWT_SECRET,
  JWT_EXPIRES_IN: ENV.JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: ENV.JWT_REFRESH_EXPIRES_IN,
  PASSWORD_POLICY: ENV.AUTH_PASSWORD_POLICY,
  SESSION_SECRET: ENV.SESSION_SECRET,
  SESSION_MAX_AGE: ENV.SESSION_MAX_AGE
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: ENV.MAX_FILE_SIZE,
  UPLOAD_PATH: ENV.UPLOAD_PATH,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
};

// Configuración de logs
export const LOG_CONFIG = {
  LEVEL: ENV.LOG_LEVEL,
  FILE: ENV.LOG_FILE,
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  FORMAT: 'combined'
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  ENABLED: ENV.NOTIFICATION_ENABLED,
  EMAIL: ENV.EMAIL_ENABLED,
  SMS: ENV.SMS_ENABLED,
  PUSH: ENV.PUSH_NOTIFICATIONS_ENABLED
};

// Configuración de caché
export const CACHE_CONFIG = {
  ENABLED: ENV.CACHE_ENABLED,
  TTL: ENV.CACHE_TTL,
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 minutos
};

// Configuración de rate limiting
export const RATE_LIMIT_CONFIG = {
  ENABLED: ENV.RATE_LIMIT_ENABLED,
  WINDOW: ENV.RATE_LIMIT_WINDOW,
  MAX_REQUESTS: ENV.RATE_LIMIT_MAX_REQUESTS
};

// Configuración de CORS
export const CORS_CONFIG = {
  ORIGIN: ENV.CORS_ORIGIN,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Requested-With'],
  CREDENTIALS: true,
  MAX_AGE: 86400 // 24 horas
};

// Configuración de monitoreo
export const MONITORING_CONFIG = {
  ENABLED: ENV.MONITORING_ENABLED,
  HEALTH_CHECK_INTERVAL: ENV.HEALTH_CHECK_INTERVAL,
  METRICS_ENABLED: true,
  ALERTS_ENABLED: true
};

// Configuración de backup
export const BACKUP_CONFIG = {
  ENABLED: ENV.BACKUP_ENABLED,
  INTERVAL: ENV.BACKUP_INTERVAL,
  RETENTION_DAYS: ENV.BACKUP_RETENTION_DAYS,
  COMPRESSION: true,
  ENCRYPTION: false
};

// Configuración de auditoría
export const AUDIT_CONFIG = {
  ENABLED: ENV.AUDIT_ENABLED,
  LOG_LEVEL: ENV.AUDIT_LOG_LEVEL,
  RETENTION_DAYS: ENV.AUDIT_RETENTION_DAYS,
  EVENTS: ['create', 'update', 'delete', 'login', 'logout', 'export']
};

// Configuración de autenticación
export const AUTH_CONFIG = {
  ENABLED: ENV.AUTH_ENABLED,
  PROVIDER: ENV.AUTH_PROVIDER,
  MFA_ENABLED: ENV.AUTH_MFA_ENABLED,
  PASSWORD_POLICY: ENV.AUTH_PASSWORD_POLICY
};

// Configuración de RBAC
export const RBAC_CONFIG = {
  ENABLED: ENV.RBAC_ENABLED,
  DEFAULT_ROLE: ENV.DEFAULT_ROLE,
  SUPER_ADMIN_ROLE: ENV.SUPER_ADMIN_ROLE
};

// Configuración de expedientes
export const EXPEDIENTE_CONFIG = {
  AUTO_NUMBERING: ENV.EXPEDIENTE_AUTO_NUMBERING,
  PREFIX: ENV.EXPEDIENTE_PREFIX,
  YEAR_FORMAT: ENV.EXPEDIENTE_YEAR_FORMAT
};

// Configuración de documentos
export const DOCUMENTO_CONFIG = {
  AUTO_VERSIONING: ENV.DOCUMENTO_AUTO_VERSIONING,
  MAX_VERSIONS: ENV.DOCUMENTO_MAX_VERSIONS,
  SIGNATURE_REQUIRED: ENV.DOCUMENTO_SIGNATURE_REQUIRED
};

// Configuración de firmas
export const FIRMA_CONFIG = {
  DIGITAL_ENABLED: ENV.FIRMA_DIGITAL_ENABLED,
  HSM_ENABLED: ENV.FIRMA_HSM_ENABLED,
  TOKEN_ENABLED: ENV.FIRMA_TOKEN_ENABLED,
  DEMO_ENABLED: ENV.FIRMA_DEMO_ENABLED
};

// Configuración de exportación
export const EXPORT_CONFIG = {
  ENABLED: ENV.EXPORT_ENABLED,
  MAX_RECORDS: ENV.EXPORT_MAX_RECORDS,
  FORMATS: ENV.EXPORT_FORMATS
};

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  ENABLED: ENV.SEARCH_ENABLED,
  ENGINE: ENV.SEARCH_ENGINE,
  INDEX_PREFIX: ENV.SEARCH_INDEX_PREFIX
};

// Configuración de Redis
export const REDIS_CONFIG = {
  ENABLED: ENV.REDIS_ENABLED,
  HOST: ENV.REDIS_HOST,
  PORT: ENV.REDIS_PORT,
  PASSWORD: ENV.REDIS_PASSWORD,
  DB: ENV.REDIS_DB
};

// Configuración de cola de tareas
export const QUEUE_CONFIG = {
  ENABLED: ENV.QUEUE_ENABLED,
  DRIVER: ENV.QUEUE_DRIVER,
  CONNECTION: ENV.QUEUE_CONNECTION
};

// Configuración de almacenamiento
export const STORAGE_CONFIG = {
  DRIVER: ENV.STORAGE_DRIVER,
  BUCKET: ENV.STORAGE_BUCKET,
  REGION: ENV.STORAGE_REGION,
  ENDPOINT: ENV.STORAGE_ENDPOINT
};

// Configuración de CDN
export const CDN_CONFIG = {
  ENABLED: ENV.CDN_ENABLED,
  URL: ENV.CDN_URL,
  API_KEY: ENV.CDN_API_KEY
};

// Configuración de analytics
export const ANALYTICS_CONFIG = {
  ENABLED: ENV.ANALYTICS_ENABLED,
  PROVIDER: ENV.ANALYTICS_PROVIDER,
  TRACKING_ID: ENV.ANALYTICS_TRACKING_ID
};

// Configuración de reporte de errores
export const ERROR_REPORTING_CONFIG = {
  ENABLED: ENV.ERROR_REPORTING_ENABLED,
  PROVIDER: ENV.ERROR_REPORTING_PROVIDER,
  DSN: ENV.ERROR_REPORTING_DSN
};

// Configuración de monitoreo de performance
export const PERFORMANCE_CONFIG = {
  ENABLED: ENV.PERFORMANCE_MONITORING_ENABLED,
  PROVIDER: ENV.PERFORMANCE_MONITORING_PROVIDER,
  LICENSE_KEY: ENV.PERFORMANCE_MONITORING_LICENSE_KEY
};

// Configuración de testing
export const TESTING_CONFIG = {
  ENABLED: ENV.TESTING_ENABLED,
  FRAMEWORK: ENV.TESTING_FRAMEWORK,
  COVERAGE_THRESHOLD: ENV.TESTING_COVERAGE_THRESHOLD
};

// Configuración de CI/CD
export const CI_CONFIG = {
  ENABLED: ENV.CI_ENABLED,
  PROVIDER: ENV.CI_PROVIDER,
  WEBHOOK_URL: ENV.CI_WEBHOOK_URL
};

// Configuración de deployment
export const DEPLOYMENT_CONFIG = {
  ENVIRONMENT: ENV.DEPLOYMENT_ENVIRONMENT,
  AUTO_SCALING: ENV.DEPLOYMENT_AUTO_SCALING,
  MIN_INSTANCES: ENV.DEPLOYMENT_MIN_INSTANCES,
  MAX_INSTANCES: ENV.DEPLOYMENT_MAX_INSTANCES
};

// Exportar todas las configuraciones
export default {
  ENV,
  API_CONFIG,
  APP_CONFIG,
  DB_CONFIG,
  SECURITY_CONFIG,
  FILE_CONFIG,
  LOG_CONFIG,
  NOTIFICATION_CONFIG,
  CACHE_CONFIG,
  RATE_LIMIT_CONFIG,
  CORS_CONFIG,
  MONITORING_CONFIG,
  BACKUP_CONFIG,
  AUDIT_CONFIG,
  AUTH_CONFIG,
  RBAC_CONFIG,
  EXPEDIENTE_CONFIG,
  DOCUMENTO_CONFIG,
  FIRMA_CONFIG,
  EXPORT_CONFIG,
  SEARCH_CONFIG,
  REDIS_CONFIG,
  QUEUE_CONFIG,
  STORAGE_CONFIG,
  CDN_CONFIG,
  ANALYTICS_CONFIG,
  ERROR_REPORTING_CONFIG,
  PERFORMANCE_CONFIG,
  TESTING_CONFIG,
  CI_CONFIG,
  DEPLOYMENT_CONFIG
}; 