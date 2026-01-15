import api from './client';

export const expedientesApi = {
  // Obtener lista de expedientes
  getExpedientes: async (params = {}) => {
    const response = await api.get('/expedientes', { params });
    const body = response.data || {};
    // Normalizar a un arreglo para la UI
    return body?.data?.expedientes || body?.expedientes || [];
  },

  // Búsqueda rápida para autocompletar
  quickSearch: async ({ query, limit = 10 } = {}) => {
    const params = { query, limit };
    const response = await api.get('/expedientes/search', { params });
    return response.data;
  },

  // Obtener expediente por ID
  getExpediente: async (id) => {
    const response = await api.get(`/expedientes/${id}`);
    const body = response.data || {};
    return body?.data?.expediente || body?.expediente || body;
  },

  // Crear nuevo expediente
  crearExpediente: async (expediente) => {
    const response = await api.post('/expedientes', expediente);
    return response.data;
  },

  // Actualizar expediente
  actualizarExpediente: async (id, expediente) => {
    const response = await api.put(`/expedientes/${id}`, expediente);
    return response.data;
  },

  // Eliminar expediente
  eliminarExpediente: async (id) => {
    const response = await api.delete(`/expedientes/${id}`);
    return response.data;
  },

  // Obtener actuaciones de un expediente (con paginación)
  getActuaciones: async (expedienteId, params = {}) => {
    const response = await api.get(`/expedientes/${expedienteId}/actuaciones`, { params });
    const body = response.data || {};
    return {
      actuaciones: body?.data?.actuaciones || body?.actuaciones || [],
      paginacion: body?.data?.paginacion || body?.paginacion || { page: 1, limit: 20, total: 0, totalPages: 1 },
    };
  },

  // Crear nueva actuación
  crearActuacion: async (expedienteId, actuacion) => {
    const response = await api.post(`/expedientes/${expedienteId}/actuaciones`, actuacion);
    return response.data;
  },

  // Obtener documentos de un expediente (normalizado)
  getDocumentos: async (expedienteId, params = {}) => {
    const response = await api.get(`/expedientes/${expedienteId}/documentos`, { params });
    const body = response.data || {};
    return body?.data?.documentos || body?.documentos || [];
  }
}; 
