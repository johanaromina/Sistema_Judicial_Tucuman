import api from './client';

const normalizarUsuario = (usuario) => {
  if (!usuario) return null;
  const rolNombre = usuario.rol || usuario.rol_nombre || usuario.rolName || usuario.role || usuario.role_name;
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    activo: usuario.activo ?? usuario.status ?? true,
    rol: rolNombre ? rolNombre.toUpperCase() : null,
    institucion: usuario.institucion || usuario.institucion_nombre || usuario.area || null,
    permisos: usuario.permisos || usuario.permissions || [],
    ultimoAcceso: usuario.ultimo_acceso || usuario.last_access || null,
    creadoEn: usuario.created_at || usuario.createdAt || null,
  };
};

const normalizarListaUsuarios = (response) => {
  const data = response?.data || response || {};
  const usuariosRaw =
    data.usuarios ||
    data.data?.usuarios ||
    data.data ||
    [];
  const paginacion =
    data.paginacion ||
    data.data?.paginacion || {
      page: 1,
      limit: usuariosRaw.length,
      total: usuariosRaw.length,
      totalPages: 1,
    };

  return {
    usuarios: usuariosRaw.map(normalizarUsuario).filter(Boolean),
    paginacion,
  };
};

export const usuariosApi = {
  crear: async ({ nombre, email, password, rol_id, institucion_id, permisos }) => {
    const payload = {
      nombre,
      email,
      password,
      rol_id,
    };
    if (institucion_id) payload.institucion_id = institucion_id;
    if (Array.isArray(permisos)) payload.permisos = permisos;

    const res = await api.post('/usuarios', payload);
    const body = res.data || {};
    return {
      success: body.success ?? true,
      message: body.message,
      usuario: normalizarUsuario(body.data?.usuario || body.usuario),
    };
  },

  listar: async ({ page = 1, limit = 20, rol, activo, search } = {}) => {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    if (rol) params.rol = rol;
    if (typeof activo === 'boolean') params.activo = String(activo);
    if (search) params.search = search;

    const res = await api.get('/usuarios', { params });
    return normalizarListaUsuarios(res.data);
  },

  obtener: async (id) => {
    const res = await api.get(`/usuarios/${id}`);
    return normalizarUsuario(res.data?.data?.usuario || res.data?.usuario);
  },

  actualizar: async (id, payload) => {
    const res = await api.patch(`/usuarios/${id}`, payload);
    return normalizarUsuario(res.data?.data?.usuario || res.data?.usuario);
  },

  cambiarEstado: async (id, activo) => {
    const res = await api.patch(`/usuarios/${id}/activar`, { activo });
    return res.data;
  },

  cambiarRol: async (id, rol_id) => {
    const res = await api.patch(`/usuarios/${id}/rol`, { rol_id });
    return res.data;
  },

  listarRoles: async () => {
    const res = await api.get('/roles');
    return res.data?.data?.roles || res.data?.roles || [];
  },
};

export default usuariosApi;
