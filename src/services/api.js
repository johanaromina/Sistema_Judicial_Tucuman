import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../types';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('auth_refresh_token');
        if (refreshToken) {
          // Intentar refrescar el token
          const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data;

          // Guardar nuevos tokens
          await Promise.all([
            AsyncStorage.setItem('auth_token', newToken),
            AsyncStorage.setItem('auth_refresh_token', newRefreshToken)
          ]);

          // Actualizar el header de la petición original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Reintentar la petición original
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error al refrescar token:', refreshError);
        // Si falla el refresh, redirigir al login
        // Aquí podrías usar un evento o callback para notificar al contexto
      }
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  },

  // Obtener perfil del usuario
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Servicios de expedientes
export const expedientesService = {
  // Listar expedientes
  listar: async (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await api.get(`/expedientes?${params}`);
    return response.data;
  },

  // Obtener expediente por ID
  obtener: async (id) => {
    const response = await api.get(`/expedientes/${id}`);
    return response.data;
  },

  // Crear expediente
  crear: async (expediente) => {
    const response = await api.post('/expedientes', expediente);
    return response.data;
  },

  // Actualizar expediente
  actualizar: async (id, expediente) => {
    const response = await api.put(`/expedientes/${id}`, expediente);
    return response.data;
  },

  // Eliminar expediente
  eliminar: async (id) => {
    const response = await api.delete(`/expedientes/${id}`);
    return response.data;
  },

  // Listar actuaciones de un expediente
  listarActuaciones: async (expedienteId) => {
    const response = await api.get(`/expedientes/${expedienteId}/actuaciones`);
    return response.data;
  },

  // Crear actuación
  crearActuacion: async (expedienteId, actuacion) => {
    const response = await api.post(`/expedientes/${expedienteId}/actuaciones`, actuacion);
    return response.data;
  }
};

// Servicios de documentos
export const documentosService = {
  // Listar documentos
  listar: async (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await api.get(`/documentos?${params}`);
    return response.data;
  },

  // Obtener documento por ID
  obtener: async (id) => {
    const response = await api.get(`/documentos/${id}`);
    return response.data;
  },

  // Descargar documento
  descargar: async (id) => {
    const response = await api.get(`/documentos/${id}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Subir documento
  subir: async (expedienteId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('expedienteId', expedienteId);
    
    // Agregar metadatos
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const response = await api.post('/documentos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Actualizar documento
  actualizar: async (id, metadata) => {
    const response = await api.put(`/documentos/${id}`, metadata);
    return response.data;
  },

  // Eliminar documento
  eliminar: async (id) => {
    const response = await api.delete(`/documentos/${id}`);
    return response.data;
  },

  // Iniciar firma
  iniciarFirma: async (id, firmantes) => {
    const response = await api.post(`/documentos/${id}/firma/iniciar`, { firmantes });
    return response.data;
  },

  // Verificar estado de firma
  estadoFirma: async (id) => {
    const response = await api.get(`/documentos/${id}/firma/estado`);
    return response.data;
  },

  // Verificar firma
  verificarFirma: async (id) => {
    const response = await api.post(`/documentos/${id}/firma/verificar`);
    return response.data;
  }
};

// Servicios de usuarios
export const usuariosService = {
  // Listar usuarios
  listar: async (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await api.get(`/usuarios?${params}`);
    return response.data;
  },

  // Obtener usuario por ID
  obtener: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Crear usuario
  crear: async (usuario) => {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },

  // Actualizar usuario
  actualizar: async (id, usuario) => {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },

  // Eliminar usuario
  eliminar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  // Cambiar estado de usuario
  cambiarEstado: async (id, estado) => {
    const response = await api.patch(`/usuarios/${id}/estado`, { estado });
    return response.data;
  },

  // Cambiar rol de usuario
  cambiarRol: async (id, rol) => {
    const response = await api.patch(`/usuarios/${id}/rol`, { rol });
    return response.data;
  }
};

// Servicios de auditoría
export const auditoriaService = {
  // Listar auditoría
  listar: async (filters = {}, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    const response = await api.get(`/auditoria?${params}`);
    return response.data;
  },

  // Auditoría por usuario
  porUsuario: async (userId, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/auditoria/usuario/${userId}?${params}`);
    return response.data;
  },

  // Auditoría por recurso
  porRecurso: async (recurso, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/auditoria/recurso/${recurso}?${params}`);
    return response.data;
  },

  // Exportar auditoría
  exportar: async (filters = {}, formato = 'json') => {
    const params = new URLSearchParams({
      formato,
      ...filters
    });
    const response = await api.get(`/auditoria/exportar?${params}`);
    return response.data;
  }
};

export default api; 