import { Toast } from './Toast';
import { useToast } from '../context/ToastContext';

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          action={toast.action}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}
