import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const {
      type = 'info',
      duration = 4000,
      action = null,
    } = options;

    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type, action };

    setToasts((current) => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'success', duration: options.duration ?? 3000 });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'error', duration: options.duration ?? 5000 });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'warning', duration: options.duration ?? 4000 });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast(message, { ...options, type: 'info', duration: options.duration ?? 3000 });
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
