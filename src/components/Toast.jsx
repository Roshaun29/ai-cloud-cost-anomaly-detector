export function Toast({ id, message, type, action, onRemove }) {
  const getIcon = (toastType) => {
    switch (toastType) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '◆';
    }
  };

  return (
    <div 
      className={`toast toast-${type}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-content">
        <span className={`toast-icon toast-icon-${type}`}>
          {getIcon(type)}
        </span>
        <div className="toast-text">
          <p className="toast-message">{message}</p>
        </div>
      </div>
      <div className="toast-actions">
        {action && (
          <button 
            className="toast-action-btn" 
            onClick={() => {
              action.onClick();
              onRemove(id);
            }}
          >
            {action.label}
          </button>
        )}
        <button 
          className="toast-close-btn" 
          onClick={() => onRemove(id)}
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
