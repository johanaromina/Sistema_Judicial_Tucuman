import api from './client';

// API de autenticación
export const authApi = {
  // Registrar usuario
  register: async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('API register - error:', error?.response?.data || error);
      throw error;
    }
  },

  // Iniciar sesión
  login: async (credentials) => {
    try {
      console.log('API login - credenciales recibidas:', credentials);
      console.log('API login - enviando petición a:', '/auth/login');
      const response = await api.post('/auth/login', credentials);
               console.log('API login - respuesta completa:', response);
         console.log('API login - status:', response.status);
         console.log('API login - headers:', response.headers);
         console.log('API login - datos de respuesta:', response.data);
         console.log('API login - estructura de response.data:', {
           hasUser: !!response.data.user,
           hasToken: !!response.data.token,
           hasRefreshToken: !!response.data.refreshToken,
           keys: Object.keys(response.data)
         });
      return response.data;
    } catch (error) {
      console.error('API login - error:', error);
      console.error('API login - detalles del error:', error.response?.data);
      throw error;
    }
  },

  // Renovar token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      // Intentar enviar el refresh token para invalidarlo en el servidor
      let refreshToken = null;
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        refreshToken = await AsyncStorage.getItem('auth_refresh_token');
      } catch {}
      const response = await api.post('/auth/logout', refreshToken ? { refreshToken } : {}, { timeout: 3000 });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener perfil del usuario
  me: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Solicitar restablecimiento de contraseña
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Restablecer contraseña
  resetPassword: async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener permisos del usuario
  getPermissions: async () => {
    try {
      const response = await api.get('/auth/permissions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si el usuario tiene un permiso específico
  hasPermission: async (permission) => {
    try {
      const response = await api.get(`/auth/permissions/${permission}`);
      return response.data.hasPermission;
    } catch (error) {
      throw error;
    }
  }
}; 
