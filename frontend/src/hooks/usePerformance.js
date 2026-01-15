import { useEffect, useRef, useCallback } from 'react';
import { PERFORMANCE_CONFIG } from '../config/performance';
import { useState } from 'react';

// Hook para monitorear y optimizar el rendimiento
export const usePerformance = (componentName = 'Component') => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const isMounted = useRef(false);

  // Contador de renders
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (PERFORMANCE_CONFIG.debugging.renderLogs) {
      console.log(`🔄 ${componentName} - Render #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms)`);
    }
    
    lastRenderTime.current = currentTime;
  });

  // Monitoreo de montaje/desmontaje
  useEffect(() => {
    isMounted.current = true;
    const mountTime = performance.now();
    
    if (PERFORMANCE_CONFIG.debugging.performanceLogs) {
      console.log(`🚀 ${componentName} - Montado en ${mountTime.toFixed(2)}ms`);
    }

    return () => {
      isMounted.current = false;
      const unmountTime = performance.now();
      const totalLifetime = unmountTime - mountTime;
      
      if (PERFORMANCE_CONFIG.debugging.performanceLogs) {
        console.log(`💀 ${componentName} - Desmontado después de ${totalLifetime.toFixed(2)}ms (${renderCount.current} renders)`);
      }
    };
  }, [componentName]);

  // Función para medir el tiempo de ejecución de funciones
  const measureExecution = useCallback((fn, operationName = 'operation') => {
    if (!PERFORMANCE_CONFIG.debugging.performanceLogs) {
      return fn();
    }

    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log(`⏱️ ${componentName} - ${operationName}: ${executionTime.toFixed(2)}ms`);
    
    return result;
  }, [componentName]);

  // Función para medir operaciones asíncronas
  const measureAsyncExecution = useCallback(async (asyncFn, operationName = 'async operation') => {
    if (!PERFORMANCE_CONFIG.debugging.performanceLogs) {
      return await asyncFn();
    }

    const startTime = performance.now();
    const result = await asyncFn();
    const endTime = performance.now();
    const executionTime = endTime - startTime;

    console.log(`⏱️ ${componentName} - ${operationName}: ${executionTime.toFixed(2)}ms`);
    
    return result;
  }, [componentName]);

  // Función para verificar si el componente está montado
  const isComponentMounted = useCallback(() => {
    return isMounted.current;
  }, []);

  // Función para obtener estadísticas de rendimiento
  const getPerformanceStats = useCallback(() => {
    return {
      renderCount: renderCount.current,
      isMounted: isMounted.current,
      lastRenderTime: lastRenderTime.current,
      componentName,
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    isMounted: isComponentMounted,
    measureExecution,
    measureAsyncExecution,
    getPerformanceStats,
  };
};

// Hook para optimizar listas largas
export const useListOptimization = (items, itemHeight = 50, windowHeight = 800) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const scrollViewRef = useRef(null);

  const calculateVisibleRange = useCallback((scrollY) => {
    const start = Math.floor(scrollY / itemHeight);
    const end = Math.min(start + Math.ceil(windowHeight / itemHeight) + 2, items.length);
    
    setVisibleRange({ start, end });
  }, [items.length, itemHeight, windowHeight]);

  const getVisibleItems = useCallback(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const onScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    calculateVisibleRange(scrollY);
  }, [calculateVisibleRange]);

  return {
    visibleItems: getVisibleItems(),
    onScroll,
    scrollViewRef,
    totalHeight: items.length * itemHeight,
    visibleRange,
  };
};

// Hook para debounce
export const useDebounce = (value, delay = PERFORMANCE_CONFIG.api.searchDebounce) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttle
export const useThrottle = (callback, delay = 100) => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();

    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }
      
      lastCallTimer.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }
    };
  }, []);

  return throttledCallback;
};

export default usePerformance; 