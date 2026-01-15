import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/env';

// Crear instancia de Axios
console.log('API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
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
      let token = await AsyncStorage.getItem('auth_token');
      // Fallback para Web: usar localStorage si no hay token en AsyncStorage
      if (!token && typeof window !== 'undefined' && window.localStorage) {
        try { token = window.localStorage.getItem('auth_token'); } catch {}
      }
      if (token) {
        config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y renovar tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('auth_refresh_token');
        
        if (refreshToken) {
          // Intentar renovar el token
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken },
            { skipAuthRefresh: true } // Evitar loop infinito
          );

          const refreshData = response.data?.data || response.data;
          const accessToken = refreshData?.accessToken;
          const newRefreshToken = refreshData?.refreshToken || refreshToken;

          if (accessToken) {
            // Guardar nuevos tokens
            await AsyncStorage.setItem('auth_token', accessToken);
            await AsyncStorage.setItem('auth_refresh_token', newRefreshToken);

            // Reintentar la petición original
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        
        // Si falla la renovación, limpiar tokens y redirigir al login
        await AsyncStorage.multiRemove(['auth_token', 'auth_refresh_token', 'user']);
        
        // Aquí podrías emitir un evento para redirigir al login
        // EventEmitter.emit('tokenExpired');
      }
    }

    return Promise.reject(error);
  }
);

// Función para limpiar tokens
export const clearAuthTokens = async () => {
  try {
    await AsyncStorage.multiRemove(['auth_token', 'auth_refresh_token', 'user']);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

// Función para establecer tokens
export const setAuthTokens = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem('auth_token', accessToken);
    await AsyncStorage.setItem('auth_refresh_token', refreshToken);
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
};

// Función para obtener token actual
export const getCurrentToken = async () => {
  try {
    return await AsyncStorage.getItem('auth_token');
  } catch (error) {
    console.error('Error getting current token:', error);
    return null;
  }
};

// Función para verificar si hay un token válido
export const hasValidToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return null;
  }
};

export default api; 
