import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Cargar datos de autenticación al iniciar
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Cargar autenticación almacenada
  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedRefreshToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_refresh_token'),
        AsyncStorage.getItem('auth_user')
      ]);

      if (storedToken && storedRefreshToken && storedUser) {
        const user = JSON.parse(storedUser);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user,
            token: storedToken,
            refreshToken: storedRefreshToken
          }
        });
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Error al cargar autenticación:', error);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Función de login
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      // Aquí se haría la llamada a la API
      // const response = await authService.login(credentials);
      
      // Por ahora simulamos el login
      const mockResponse = {
        user: {
          id: 1,
          email: credentials.email,
          nombre: 'Usuario Demo',
          apellido: 'SPJT',
          rol: USER_ROLES.ADMIN,
          institucion: 'Tribunal Superior'
        },
        token: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token'
      };

      // Guardar en AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('auth_token', mockResponse.token),
        AsyncStorage.setItem('auth_refresh_token', mockResponse.refreshToken),
        AsyncStorage.setItem('auth_user', JSON.stringify(mockResponse.user))
      ]);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: mockResponse
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message || 'Error en el login'
      });
      return { success: false, error: error.message };
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      // Limpiar AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem('auth_token'),
        AsyncStorage.removeItem('auth_refresh_token'),
        AsyncStorage.removeItem('auth_user')
      ]);

      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Función para refrescar token
  const refreshToken = async () => {
    try {
      if (!state.refreshToken) {
        throw new Error('No hay refresh token');
      }

      // Aquí se haría la llamada a la API
      // const response = await authService.refreshToken(state.refreshToken);
      
      // Por ahora simulamos el refresh
      const mockResponse = {
        token: 'new_mock_jwt_token',
        refreshToken: 'new_mock_refresh_token'
      };

      // Actualizar AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('auth_token', mockResponse.token),
        AsyncStorage.setItem('auth_refresh_token', mockResponse.refreshToken)
      ]);

      dispatch({
        type: AUTH_ACTIONS.REFRESH_TOKEN,
        payload: mockResponse
      });

      return { success: true };
    } catch (error) {
      console.error('Error al refrescar token:', error);
      await logout();
      return { success: false, error: error.message };
    }
  };

  // Función para limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Función para verificar permisos
  const hasPermission = (requiredRole) => {
    if (!state.user) return false;
    
    const userRole = state.user.rol;
    
    // Jerarquía de roles
    const roleHierarchy = {
      [USER_ROLES.OPERADOR]: 1,
      [USER_ROLES.SECRETARIO]: 2,
      [USER_ROLES.JUEZ]: 3,
      [USER_ROLES.ADMIN]: 4
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  // Función para verificar si es admin
  const isAdmin = () => hasPermission(USER_ROLES.ADMIN);

  // Función para verificar si es juez
  const isJuez = () => hasPermission(USER_ROLES.JUEZ);

  // Función para verificar si es secretario
  const isSecretario = () => hasPermission(USER_ROLES.SECRETARIO);

  // Función para verificar si es operador
  const isOperador = () => hasPermission(USER_ROLES.OPERADOR);

  const value = {
    ...state,
    login,
    logout,
    refreshToken,
    clearError,
    hasPermission,
    isAdmin,
    isJuez,
    isSecretario,
    isOperador
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 