import { useState, useEffect, useCallback, useMemo } from 'react';
import { PERFORMANCE_CONFIG } from '../config/performance';

// Hook para lazy loading de pantallas
export const useLazyLoading = (screenName, dependencies = []) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadScreen = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simular tiempo de carga para pantallas pesadas
        await new Promise(resolve => setTimeout(resolve, 100));

        if (isMounted) {
          setIsLoaded(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      }
    };

    loadScreen();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const reload = useCallback(() => {
    setIsLoaded(false);
    setIsLoading(true);
    setError(null);
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    reload,
  };
};

// Hook para lazy loading de listas
export const useLazyList = (items, pageSize = 20, initialLoad = true) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = useMemo(() => Math.ceil(items.length / pageSize), [items.length, pageSize]);

  const loadNextPage = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    
    // Simular delay de carga
    await new Promise(resolve => setTimeout(resolve, 300));

    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    const newItems = items.slice(startIndex, endIndex);
    
    setVisibleItems(prev => [...prev, ...newItems]);
    setCurrentPage(nextPage);
    setHasMore(nextPage < totalPages);
    setIsLoading(false);
  }, [currentPage, pageSize, totalPages, items, isLoading, hasMore]);

  const loadInitialPage = useCallback(async () => {
    setIsLoading(true);
    
    // Simular delay de carga inicial
    await new Promise(resolve => setTimeout(resolve, 500));

    const initialItems = items.slice(0, pageSize);
    setVisibleItems(initialItems);
    setCurrentPage(1);
    setHasMore(items.length > pageSize);
    setIsLoading(false);
  }, [items, pageSize]);

  const reset = useCallback(() => {
    setVisibleItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (initialLoad) {
      loadInitialPage();
    }
  }, [initialLoad, loadInitialPage]);

  return {
    visibleItems,
    currentPage,
    hasMore,
    isLoading,
    loadNextPage,
    loadInitialPage,
    reset,
    totalPages,
    totalItems: items.length,
  };
};

// Hook para lazy loading de imágenes
export const useLazyImage = (imageUrl, placeholder = null) => {
  const [imageState, setImageState] = useState({
    isLoading: true,
    isLoaded: false,
    error: null,
    image: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setImageState(prev => ({ ...prev, isLoading: true, error: null }));

        // Simular carga de imagen
        await new Promise(resolve => setTimeout(resolve, 200));

        if (isMounted) {
          setImageState({
            isLoading: false,
            isLoaded: true,
            error: null,
            image: imageUrl,
          });
        }
      } catch (err) {
        if (isMounted) {
          setImageState({
            isLoading: false,
            isLoaded: false,
            error: err,
            image: placeholder,
          });
        }
      }
    };

    if (imageUrl) {
      loadImage();
    }

    return () => {
      isMounted = false;
    };
  }, [imageUrl, placeholder]);

  return imageState;
};

// Hook para lazy loading de datos de API
export const useLazyAPI = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await apiCall(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
};

// Hook para lazy loading de formularios
export const useLazyForm = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const validate = useCallback(async () => {
    if (!validationSchema) return true;

    setIsValidating(true);
    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationError) {
      const newErrors = {};
      validationError.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [values, validationSchema]);

  const submit = useCallback(async (onSubmit) => {
    const isValid = await validate();
    if (!isValid) return false;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (err) {
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
    setIsValidating(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    isValidating,
    setValue,
    validate,
    submit,
    reset,
  };
};

export default useLazyLoading; 