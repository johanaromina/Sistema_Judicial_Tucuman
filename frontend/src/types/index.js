// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  JUEZ: 'JUEZ',
  SECRETARIO: 'SECRETARIO',
  OPERADOR: 'OPERADOR'
};

// Estados de expedientes
export const EXPEDIENTE_STATUS = {
  PENDIENTE: 'PENDIENTE',
  EN_TRAMITE: 'EN_TRAMITE',
  RESUELTO: 'RESUELTO',
  ARCHIVADO: 'ARCHIVADO'
};

// Estados de documentos
export const DOCUMENTO_STATUS = {
  PENDIENTE: 'PENDIENTE',
  FIRMADO: 'FIRMADO',
  RECHAZADO: 'RECHAZADO',
  ARCHIVADO: 'ARCHIVADO'
};

// Tipos de firma
export const FIRMA_TYPES = {
  DEMO: 'DEMO',
  TOKEN: 'TOKEN',
  HSM: 'HSM'
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'SPJT - Sistema de Procesos Judiciales',
  VERSION: '1.0.0',
  BUILD: '1',
  SUPPORT_EMAIL: 'soporte@spjt.com'
};

// Permisos del sistema
export const PERMISSIONS = {
  // Expedientes
  EXPEDIENTE_CREATE: 'EXPEDIENTE_CREATE',
  EXPEDIENTE_READ: 'EXPEDIENTE_READ',
  EXPEDIENTE_UPDATE: 'EXPEDIENTE_UPDATE',
  EXPEDIENTE_DELETE: 'EXPEDIENTE_DELETE',
  
  // Documentos
  DOCUMENTO_UPLOAD: 'DOCUMENTO_UPLOAD',
  DOCUMENTO_SIGN: 'DOCUMENTO_SIGN',
  DOCUMENTO_DOWNLOAD: 'DOCUMENTO_DOWNLOAD',
  DOCUMENTO_DELETE: 'DOCUMENTO_DELETE',
  
  // Usuarios
  USUARIO_CREATE: 'USUARIO_CREATE',
  USUARIO_READ: 'USUARIO_READ',
  USUARIO_UPDATE: 'USUARIO_UPDATE',
  USUARIO_DELETE: 'USUARIO_DELETE',
  
  // Auditoría
  AUDITORIA_READ: 'AUDITORIA_READ',
  AUDITORIA_EXPORT: 'AUDITORIA_EXPORT'
};

// Mapeo de roles a permisos
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.JUEZ]: [
    PERMISSIONS.EXPEDIENTE_CREATE,
    PERMISSIONS.EXPEDIENTE_READ,
    PERMISSIONS.EXPEDIENTE_UPDATE,
    PERMISSIONS.DOCUMENTO_UPLOAD,
    PERMISSIONS.DOCUMENTO_SIGN,
    PERMISSIONS.DOCUMENTO_DOWNLOAD,
    PERMISSIONS.AUDITORIA_READ
  ],
  [USER_ROLES.SECRETARIO]: [
    PERMISSIONS.EXPEDIENTE_CREATE,
    PERMISSIONS.EXPEDIENTE_READ,
    PERMISSIONS.EXPEDIENTE_UPDATE,
    PERMISSIONS.DOCUMENTO_UPLOAD,
    PERMISSIONS.DOCUMENTO_SIGN,
    PERMISSIONS.DOCUMENTO_DOWNLOAD,
    PERMISSIONS.USUARIO_READ,
    PERMISSIONS.AUDITORIA_READ
  ],
  [USER_ROLES.OPERADOR]: [
    PERMISSIONS.EXPEDIENTE_READ,
    PERMISSIONS.DOCUMENTO_UPLOAD,
    PERMISSIONS.DOCUMENTO_DOWNLOAD
  ]
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  UPLOAD_PATH: '/uploads'
};

// Configuración de notificaciones
export const NOTIFICATION_CONFIG = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  },
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000
  }
};

// Configuración de validación
export const VALIDATION_CONFIG = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]+$/
};

// Configuración de seguridad
export const SECURITY_CONFIG = {
  TOKEN_EXPIRY: 15 * 60 * 1000, // 15 minutos
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 días
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000 // 15 minutos
};

// Configuración de logs
export const LOG_CONFIG = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  },
  MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_LOG_FILES: 5
};

// Configuración de exportación
export const EXPORT_CONFIG = {
  FORMATS: {
    PDF: 'pdf',
    EXCEL: 'xlsx',
    CSV: 'csv'
  },
  MAX_EXPORT_SIZE: 10000 // Máximo 10,000 registros por exportación
};

// Configuración de búsqueda
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 100,
  DEBOUNCE_DELAY: 300
};

// Configuración de caché
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutos
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  CLEANUP_INTERVAL: 10 * 60 * 1000 // 10 minutos
}; 