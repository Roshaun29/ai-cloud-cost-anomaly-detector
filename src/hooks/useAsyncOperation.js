import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

/**
 * Hook for handling async operations with automatic error/success toasts
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Configuration options
 * @returns {Object} - Loading state, error, and execute function
 */
export function useAsyncOperation(asyncFn, options = {}) {
  const {
    successMessage = 'Operation successful',
    errorMessage = 'Operation failed',
    showSuccess = true,
    showError = true,
    onSuccess = null,
    onError = null,
  } = options;

  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [operationError, setOperationError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setOperationError(null);

    try {
      const result = await asyncFn(...args);
      
      if (showSuccess && successMessage) {
        success(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMsg = err.message || errorMessage;
      setOperationError(errorMsg);

      if (showError) {
        error(errorMsg);
      }

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, success, error, successMessage, errorMessage, showSuccess, showError, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setOperationError(null);
  }, []);

  return {
    execute,
    loading,
    error: operationError,
    reset,
  };
}
