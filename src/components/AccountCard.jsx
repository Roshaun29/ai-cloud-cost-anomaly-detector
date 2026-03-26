import { ProviderIcon } from './ProviderIcon';

export function AccountCard({ 
  account, 
  costSummary, 
  lastSyncTime,
  onSync,
  isSyncing,
  error 
}) {
  const totalCost = costSummary?.total || 0;
  const serviceCount = costSummary?.services || 0;
  const trend = costSummary?.trend || 0;

  const getStatusClass = () => {
    if (isSyncing) return 'syncing';
    if (error) return 'error';
    return 'connected';
  };

  const getStatusIcon = () => {
    if (isSyncing) return '↻';
    if (error) return '⚠';
    return '✓';
  };

  const getStatusLabel = () => {
    if (isSyncing) return 'Syncing...';
    if (error) return 'Sync Failed';
    return 'Connected';
  };

  return (
    <div className="account-card glass-card">
      <div className="account-card-header">
        <div className="account-info">
          <div className="account-provider">
            <ProviderIcon provider={account.provider} size="md" />
          </div>
          <div className="account-details">
            <h3 className="account-name">{account.account_name}</h3>
            <p className="account-id">{account.account_id || `Account ID: ${account.id}`}</p>
          </div>
        </div>
        <div className={`account-status status-${getStatusClass()}`}>
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-label">{getStatusLabel()}</span>
        </div>
      </div>

      <div className="account-card-body">
        <div className="cost-summary">
          <div className="cost-metric">
            <span className="cost-label">Total Cost</span>
            <span className="cost-value">${totalCost.toFixed(2)}</span>
          </div>
          <div className="cost-metric">
            <span className="cost-label">Services</span>
            <span className="cost-value">{serviceCount}</span>
          </div>
          <div className={`cost-metric trend-${trend >= 0 ? 'up' : 'down'}`}>
            <span className="cost-label">Trend</span>
            <span className="cost-value">{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
          </div>
        </div>

        {lastSyncTime && (
          <div className="sync-info">
            <span className="sync-label">Last synced:</span>
            <span className="sync-time">{lastSyncTime}</span>
          </div>
        )}
      </div>

      <div className="account-card-footer">
        <button
          className="primary-button account-sync-btn"
          onClick={() => onSync(account)}
          disabled={isSyncing || error}
          title={isSyncing ? 'Syncing in progress...' : 'Sync this account'}
        >
          {isSyncing ? (
            <>
              <span className="sync-spinner" />
              Syncing...
            </>
          ) : (
            'Sync Account'
          )}
        </button>
      </div>
    </div>
  );
}
