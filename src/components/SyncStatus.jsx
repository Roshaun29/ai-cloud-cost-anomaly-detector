import { useEffect, useState } from 'react';

export function SyncStatus({ lastSyncedAt, syncing, error }) {
  const [displayTime, setDisplayTime] = useState(lastSyncedAt);

  // Update the relative time display periodically
  useEffect(() => {
    if (!lastSyncedAt) return;

    const updateTime = () => {
      const now = new Date();
      const syncDate = new Date(lastSyncedAt);
      const diffMs = now - syncDate;
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 60) {
        setDisplayTime('Just now');
      } else if (diffMins < 60) {
        setDisplayTime(`${diffMins} min ago`);
      } else {
        setDisplayTime(syncDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  const getStatusClass = () => {
    if (syncing) return 'syncing';
    if (error) return 'error';
    return 'success';
  };

  return (
    <div className={`sync-status-badge ${getStatusClass()}`}>
      {syncing ? (
        <>
          <span className="loading-spinner" style={{ width: '0.5rem', height: '0.5rem' }} />
          Syncing data...
        </>
      ) : error ? (
        <>
          <span>⚠ Sync failed</span>
        </>
      ) : (
        <>
          <span>Last synced: {displayTime}</span>
        </>
      )}
    </div>
  );
}
