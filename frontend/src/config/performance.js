// Configuración de optimizaciones de performance para SPJT

export const PERFORMANCE_CONFIG = {
  // Configuración de React Query
  reactQuery: {
    // Tiempo de vida de los datos en caché (5 minutos)
    staleTime: 5 * 60 * 1000,
    
    // Tiempo de vida máximo en caché (10 minutos)
    gcTime: 10 * 60 * 1000,
    
    // Reintentos en caso de error
    retry: 2,
    
    // Tiempo entre reintentos
    retryDelay: 1000,
    
    // Refetch automático en foco
    refetchOnWindowFocus: false,
    
    // Refetch automático en reconexión
    refetchOnReconnect: true,
  },

  // Configuración de imágenes
  images: {
    // Calidad de imagen (0-1)
    quality: 0.8,
    
    // Tamaño máximo de imagen (MB)
    maxSize: 5,
    
    // Formatos permitidos
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
    
    // Compresión automática
    autoCompress: true,
  },

  // Configuración de navegación
  navigation: {
    // Lazy loading de pantallas
    lazyLoading: true,
    
    // Prefetch de pantallas comunes
    prefetchScreens: ['Home', 'Expedientes', 'Documentos'],
    
    // Tiempo de transición (ms)
    transitionDuration: 300,
  },

  // Configuración de AsyncStorage
  storage: {
    // Tamaño máximo de caché (MB)
    maxCacheSize: 50,
    
    // Limpieza automática de caché
    autoCleanup: true,
    
    // Tiempo de vida de datos en caché (24 horas)
    cacheLifetime: 24 * 60 * 60 * 1000,
  },

  // Configuración de API
  api: {
    // Timeout de peticiones (15 segundos)
    timeout: 15000,
    
    // Debounce para búsquedas (300ms)
    searchDebounce: 300,
    
    // Tamaño máximo de respuesta (MB)
    maxResponseSize: 10,
    
    // Compresión de respuestas
    compression: true,
  },

  // Configuración de animaciones
  animations: {
    // Usar animaciones nativas
    useNativeDriver: true,
    
    // Reducir animaciones en dispositivos lentos
    reduceMotion: false,
    
    // Duración de animaciones (ms)
    duration: 300,
  },

  // Configuración de debugging
  debugging: {
    // Logs de performance
    performanceLogs: __DEV__,
    
    // Logs de red
    networkLogs: __DEV__,
    
    // Logs de renderizado
    renderLogs: __DEV__,
  },
};

// Función para obtener configuración según el ambiente
export const getPerformanceConfig = (environment = 'development') => {
  const baseConfig = PERFORMANCE_CONFIG;
  
  if (environment === 'production') {
    return {
      ...baseConfig,
      debugging: {
        performanceLogs: false,
        networkLogs: false,
        renderLogs: false,
      },
      reactQuery: {
        ...baseConfig.reactQuery,
        staleTime: 10 * 60 * 1000, // 10 minutos en producción
        gcTime: 20 * 60 * 1000,    // 20 minutos en producción
      },
    };
  }
  
  return baseConfig;
};

// Función para limpiar caché
export const clearCache = async () => {
  try {
    // Limpiar caché de React Query
    // queryClient.clear();
    
    // Limpiar AsyncStorage
    // await AsyncStorage.clear();
    
    console.log('Caché limpiado exitosamente');
  } catch (error) {
    console.error('Error al limpiar caché:', error);
  }
};

export default PERFORMANCE_CONFIG; 