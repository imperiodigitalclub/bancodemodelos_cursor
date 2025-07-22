import { useState, useCallback, useRef } from 'react';

/**
 * Hook personalizado para gerenciar estados assíncronos
 * @param {Function} asyncFunction - Função assíncrona a ser executada
 * @param {Object} options - Opções de configuração
 * @returns {Object} - Estado e funções de controle
 */
const useAsyncState = (asyncFunction, options = {}) => {
  const {
    initialData = null,
    immediate = false,
    onSuccess,
    onError,
    onFinally
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref para controlar se o componente ainda está montado
  const isMountedRef = useRef(true);
  
  // Ref para cancelar requisições anteriores
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (...args) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const result = await asyncFunction(...args, abortControllerRef.current.signal);
      
      if (isMountedRef.current) {
        setData(result);
        setIsInitialized(true);
        onSuccess?.(result, ...args);
      }
    } catch (err) {
      // Ignorar erros de abort
      if (err.name === 'AbortError') {
        return;
      }

      if (isMountedRef.current) {
        setError(err);
        onError?.(err, ...args);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        onFinally?.(...args);
      }
    }
  }, [asyncFunction, onSuccess, onError, onFinally]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    setIsInitialized(false);
  }, [initialData]);

  const retry = useCallback((...args) => {
    return execute(...args);
  }, [execute]);

  // Cleanup quando componente desmonta
  const cleanup = useCallback(() => {
    isMountedRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Executar imediatamente se solicitado
  useState(() => {
    if (immediate) {
      execute();
    }
    
    return cleanup;
  });

  return {
    data,
    loading,
    error,
    isInitialized,
    execute,
    reset,
    retry,
    cleanup
  };
};

/**
 * Hook para debounce de funções
 * @param {Function} func - Função a ser debounced
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} - Função debounced
 */
export const useDebounce = (func, delay) => {
  const timeoutRef = useRef(null);

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      func(...args);
    }, delay);
  }, [func, delay]);
};

/**
 * Hook para throttle de funções
 * @param {Function} func - Função a ser throttled
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} - Função throttled
 */
export const useThrottle = (func, delay) => {
  const lastCallRef = useRef(0);

  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      func(...args);
    }
  }, [func, delay]);
};

/**
 * Hook para gerenciar estado de formulário com validação
 * @param {Object} initialValues - Valores iniciais
 * @param {Function} validationSchema - Schema de validação
 * @returns {Object} - Estado e funções do formulário
 */
export const useFormState = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const setTouchedField = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validate = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.validate(values, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const newErrors = {};
      validationErrors.inner.forEach(error => {
        newErrors[error.path] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    try {
      const isValid = await validate();
      if (isValid) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setTouchedField,
    validate,
    handleSubmit,
    reset
  };
};

export default useAsyncState; 