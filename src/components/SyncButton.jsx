export function SyncButton({ onSync, loading }) {
  return (
    <button className="primary-button sync-button" onClick={onSync} type="button" disabled={loading}>
      <span className={`sync-dot ${loading ? 'is-loading' : ''}`} />
      {loading ? (
        <>
          <span className="loading-spinner" style={{ width: '0.8rem', height: '0.8rem' }} />
          Syncing...
        </>
      ) : (
        'Sync Data'
      )}
    </button>
  );
}
