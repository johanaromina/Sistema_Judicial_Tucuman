// Tipos principales de la aplicación SPJT

// Usuario y autenticación
export const USER_ROLES = {
  ADMIN: 'admin',
  JUEZ: 'juez',
  SECRETARIO: 'secretario',
  OPERADOR: 'operador'
};

export const USER_STATUS = {
  ACTIVE: 'activo',
  INACTIVE: 'inactivo'
};

// Estados de expedientes
export const EXPEDIENTE_STATUS = {
  PENDIENTE: 'pendiente',
  EN_TRAMITE: 'en_tramite',
  RESUELTO: 'resuelto',
  ARCHIVADO: 'archivado'
};

// Estados de actuaciones
export const ACTUACION_STATUS = {
  PENDIENTE: 'pendiente',
  COMPLETADA: 'completada',
  CANCELADA: 'cancelada'
};

// Estados de documentos
export const DOCUMENTO_STATUS = {
  BORRADOR: 'borrador',
  PENDIENTE_FIRMA: 'pendiente_firma',
  FIRMADO: 'firmado',
  VERIFICADO: 'verificado'
};

// Estados de firmas
export const FIRMA_STATUS = {
  PENDIENTE: 'pendiente',
  FIRMADO: 'firmado',
  VERIFICADO: 'verificado',
  RECHAZADO: 'rechazado'
};

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// Configuración de la API
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'SPJT - Sistema de Procesos Judiciales',
  VERSION: '1.0.0',
  BUILD: '1',
  SUPPORT_EMAIL: 'soporte@spjt.com'
}; 