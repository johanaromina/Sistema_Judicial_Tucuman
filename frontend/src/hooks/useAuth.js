import React, { createContext, useContext, useEffect, useState, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/auth.api';
import { USER_ROLES } from '../types';

// Estado inicial
const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      console.log('Reducer - LOGIN_SUCCESS ejecutado con payload:', action.payload);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para verificar si el usuario tiene ciertos roles
  const hasRole = (...roles) => {
    return state.user && roles.includes(state.user.rol);
  };

  // Función para verificar permisos específicos
  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    const rolePermissions = {
      [USER_ROLES.ADMIN]: ['all'],
      [USER_ROLES.JUEZ]: ['expedientes.read', 'expedientes.write', 'documentos.read', 'documentos.write', 'firmas.all'],
      [USER_ROLES.SECRETARIO]: ['expedientes.read', 'expedientes.write', 'documentos.read', 'documentos.write', 'usuarios.read'],
      [USER_ROLES.OPERADOR]: ['expedientes.read', 'documentos.read']
    };

    const userPermissions = rolePermissions[state.user.rol] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  // Función de login
  const signIn = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      console.log('Enviando credenciales:', { email, password });
      const response = await authApi.login({ email, password });
      console.log('useAuth - respuesta del login recibida:', response);
      console.log('useAuth - tipo de respuesta:', typeof response);
      console.log('useAuth - es objeto:', response && typeof response === 'object');
      console.log('useAuth - propiedades de response:', response ? Object.keys(response) : 'response es null/undefined');
      
      // Extraer datos de la respuesta del servidor (API: { success, message, data: { user, tokens } })
      const { user: rawUser, tokens } = (response && response.data) ? response.data : {};
      const { user, tokens: tokensNested } = (response && response.data && response.data.data) ? response.data.data : {};
      const finalUser = user || rawUser;
      const finalTokens = tokens || tokensNested || {};
      if (!finalUser || !finalTokens.accessToken) {
        throw new Error('Respuesta de login inesperada');
      }
      const { accessToken, refreshToken } = finalTokens;
      
      // Normalizar rol a mayúsculas para alinearlo con USER_ROLES
      const normalizedUser = {
        ...finalUser,
        rol: (finalUser.rol || finalUser.rol_nombre || '').toUpperCase()
      };
      console.log('useAuth - datos extraídos:', { user: normalizedUser, accessToken, refreshToken });
      
      // Guardar tokens en AsyncStorage
      console.log('useAuth - guardando tokens en AsyncStorage...');
      await Promise.all([
        AsyncStorage.setItem('auth_token', accessToken),
        AsyncStorage.setItem('auth_refresh_token', refreshToken)
      ]);
      // Fallback Web: también guardar en localStorage
      try { if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('auth_token', accessToken);
        window.localStorage.setItem('auth_refresh_token', refreshToken);
      }} catch {}
      console.log('useAuth - tokens guardados exitosamente');

      console.log('useAuth - datos para dispatch:', {
        user: normalizedUser,
        token: accessToken,
        refreshToken: refreshToken
      });
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: normalizedUser,
          token: accessToken,
          refreshToken: refreshToken
        }
      });
      
            console.log('useAuth - dispatch completado, estado actualizado');
      
      // Verificar el estado después del dispatch
      console.log('useAuth - estado actual después del login:', {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error en el inicio de sesión';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Función de logout (rápida, fire-and-forget)
  const signOut = async () => {
    // Disparar logout en el servidor pero no bloquear la UI
    try {
      authApi.logout().catch(() => {});
    } catch {}

      try {
        await Promise.all([
          AsyncStorage.removeItem('auth_token'),
          AsyncStorage.removeItem('auth_refresh_token'),
          AsyncStorage.removeItem('user')
        ]);
        try { if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('auth_token');
          window.localStorage.removeItem('auth_refresh_token');
          window.localStorage.removeItem('user');
        }} catch {}
      } catch (storageError) {
        console.error('Error limpiando tokens:', storageError);
      } finally {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
  };

  // Función para refrescar token
  const refreshToken = async () => {
    try {
      let currentRefreshToken = await AsyncStorage.getItem('auth_refresh_token');
      if (!currentRefreshToken && typeof window !== 'undefined' && window.localStorage) {
        try { currentRefreshToken = window.localStorage.getItem('auth_refresh_token'); } catch {}
      }
      if (!currentRefreshToken) {
        throw new Error('No hay refresh token');
      }

      const response = await authApi.refreshToken(currentRefreshToken);
      
      // Guardar nuevos tokens
      await Promise.all([
        AsyncStorage.setItem('auth_token', response.accessToken),
        AsyncStorage.setItem('auth_refresh_token', response.refreshToken)
      ]);
      try { if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('auth_token', response.accessToken);
        window.localStorage.setItem('auth_refresh_token', response.refreshToken);
      }} catch {}

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: {
          token: response.accessToken,
          refreshToken: response.refreshToken
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      await signOut();
      return { success: false, error: 'Token expirado' };
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para verificar autenticación al iniciar la app
  const bootstrap = async () => {
    try {
      console.log('Bootstrap - iniciando verificación de autenticación...');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      let token = await AsyncStorage.getItem('auth_token');
      if (!token && typeof window !== 'undefined' && window.localStorage) {
        try { token = window.localStorage.getItem('auth_token'); } catch {}
      }
      console.log('Bootstrap - token encontrado:', !!token);
      
      if (token) {
        console.log('Bootstrap - verificando usuario con token...');
        try {
      const meResponse = await authApi.me();
      const meUser = meResponse?.data?.user || meResponse?.data?.data?.user || meResponse?.user; 
      const normalizedMeUser = meUser ? { ...meUser, rol: (meUser.rol || meUser.rol_nombre || '').toUpperCase() } : null;
      console.log('Bootstrap - usuario verificado:', normalizedMeUser);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: normalizedMeUser,
          token,
          refreshToken: await AsyncStorage.getItem('auth_refresh_token')
        }
      });
        } catch (meError) {
          console.error('Bootstrap - error al verificar usuario:', meError);
          // Si falla la verificación del usuario, limpiar tokens
          await signOut();
        }
      } else {
        console.log('Bootstrap - no hay token, usuario no autenticado');
      }
    } catch (error) {
      console.error('Error en bootstrap:', error);
      await signOut();
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Efecto para verificar autenticación al montar el componente
  useEffect(() => {
    bootstrap();
  }, []);

  const value = {
    ...state,
    signIn,
    signOut,
    refreshToken,
    clearError,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
