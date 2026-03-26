import { AccountCard } from './AccountCard';

export function AccountsList({ 
  accounts, 
  accountCosts,
  accountSyncTimes,
  syncingAccountId,
  syncErrors,
  onSync,
  onAddAccount 
}) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="accounts-container">
        <div className="accounts-empty">
          <div className="empty-icon">☁️</div>
          <h3>No cloud accounts connected yet</h3>
          <p>Connect your first cloud account to start monitoring costs and anomalies.</p>
          <button 
            className="primary-button" 
            onClick={onAddAccount}
          >
            + Add Cloud Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accounts-container">
      <div className="accounts-grid">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            costSummary={accountCosts?.[account.id] || { 
              total: 0, 
              services: 0, 
              trend: 0 
            }}
            lastSyncTime={accountSyncTimes?.[account.id]}
            onSync={onSync}
            isSyncing={syncingAccountId === account.id}
            error={syncErrors?.[account.id]}
          />
        ))}
      </div>
      <div className="accounts-footer">
        <button 
          className="secondary-button" 
          onClick={onAddAccount}
        >
          + Add Another Account
        </button>
      </div>
    </div>
  );
}
