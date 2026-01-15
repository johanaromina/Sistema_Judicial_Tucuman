import api from './client';

export const documentosApi = {
  // Obtener lista de documentos
  getDocumentos: async (params = {}) => {
    const response = await api.get('/documentos', { params });
    return response.data;
  },

  // Obtener documento por ID
  getDocumento: async (id) => {
    const response = await api.get(`/documentos/${id}`);
    return response.data;
  },

  // Subir documento
  subirDocumento: async ({ expedienteId, archivo, datos = {} }) => {
    if (!archivo) {
      throw new Error('Debe adjuntarse un archivo');
    }

    const formData = new FormData();

    if (archivo.file) {
      formData.append('documento', archivo.file, archivo.name || archivo.file?.name || 'documento.pdf');
    } else {
      formData.append('documento', {
        uri: archivo.uri,
        name: archivo.name || `documento.${archivo.mimeType?.split('/')[1] || 'pdf'}`,
        type: archivo.mimeType || 'application/pdf',
      });
    }

    formData.append('expediente_id', expedienteId);

    if (datos.nombre) formData.append('nombre', datos.nombre);
    if (datos.descripcion) formData.append('descripcion', datos.descripcion);
    if (datos.tipo) formData.append('tipo', datos.tipo);
    if (datos.actuacion_id) formData.append('actuacion_id', datos.actuacion_id);

    const response = await api.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Firmar documento (modo demo)
  firmarDemo: async (documentoId, data = {}) => {
    const response = await api.post(`/documentos/${documentoId}/firma/demo`, data);
    return response.data;
  },

  // Preparar firma con token
  prepararFirmaToken: async (documentoId, data = {}) => {
    const response = await api.post(`/documentos/${documentoId}/firma/token/preparar`, data);
    return response.data;
  },

  // Completar firma con token
  completarFirmaToken: async (documentoId, data = {}) => {
    const response = await api.post(`/documentos/${documentoId}/firma/token/completar`, data);
    return response.data;
  },

  // Firmar documento con HSM
  firmarHSM: async (documentoId, data = {}) => {
    const response = await api.post(`/documentos/${documentoId}/firma/hsm`, data);
    return response.data;
  },

  // Obtener estado de firmas
  getEstadoFirma: async (documentoId) => {
    const response = await api.get(`/documentos/${documentoId}/firma/status`);
    return response.data;
  },

  // Verificar firma de documento
  verificarFirma: async (documentoId) => {
    const response = await api.post(`/documentos/${documentoId}/firma/verificar`);
    return response.data;
  },

  // Descargar documento
  descargarDocumento: async (documentoId) => {
    const response = await api.get(`/documentos/${documentoId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Eliminar documento
  eliminarDocumento: async (documentoId) => {
    const response = await api.delete(`/documentos/${documentoId}`);
    return response.data;
  },

  // Obtener historial de firmas
  getHistorialFirmas: async (documentoId) => {
    return documentosApi.getEstadoFirma(documentoId);
  }
}; 