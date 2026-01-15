import api from './client';

export const institucionesApi = {
  listar: async ({ search = '', page = 1, limit = 100 } = {}) => {
    const params = {};
    const q = typeof search === 'string' ? search : (search == null ? '' : String(search));
    if (q) params.search = q;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    try {
      const res = await api.get('/instituciones', { params });
      const data = res.data?.data || res.data || {};
      return data.instituciones || [];
    } catch (e) {
      console.error('Error cargando instituciones:', e?.response?.data || e?.message || e);
      throw e;
    }
  }
};

export default institucionesApi;
