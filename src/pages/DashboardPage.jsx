import { useEffect, useState, startTransition } from 'react';

import { AnomaliesTable } from '../components/AnomaliesTable';
import { AccountsList } from '../components/AccountsList';
import { CostChart } from '../components/CostChart';
import { GlassCard } from '../components/GlassCard';
import { InputField } from '../components/InputField';
import { ProviderBreakdown } from '../components/ProviderBreakdown';
import { ProviderSelector } from '../components/ProviderSelector';
import { StatCard } from '../components/StatCard';
import { SyncButton } from '../components/SyncButton';
import { SyncStatus } from '../components/SyncStatus';
import { addCloudAccount, fetchMultiCloudDashboard, syncMultiCloud, syncCloudData } from '../services/api';
import { useToast } from '../context/ToastContext';

const CONNECTION_STEPS = [
  'Validating credentials...',
  'Connecting...',
  'Fetching billing data...',
];

const wait = (duration) => new Promise((resolve) => {
  window.setTimeout(resolve, duration);
});

export function DashboardPage() {
  const { success, error, info } = useToast();
  const [dashboard, setDashboard] = useState({ metrics: [], chart: [], anomalies: [], providerSummary: {}, lastSyncedAt: null });
  const [selectedProviders, setSelectedProviders] = useState(['aws', 'azure', 'gcp']);
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({ provider: 'aws', account_name: '' });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState('');
  const [connectionStep, setConnectionStep] = useState('');
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [syncingAccountId, setSyncingAccountId] = useState(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [accountCosts, setAccountCosts] = useState({});
  const [accountSyncTimes, setAccountSyncTimes] = useState({});
  const [syncErrors, setSyncErrors] = useState({});

  // Initial data load
  useEffect(() => {
    loadDashboardData();
  }, [selectedProviders]);

  // Auto-refresh effect (optional, every 60 seconds)
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const refreshInterval = setInterval(() => {
      loadDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(refreshInterval);
  }, [selectedProviders, autoRefreshEnabled]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setSyncError(false);
      const providersStr = selectedProviders.join(',');
      const data = await fetchMultiCloudDashboard(providersStr);
      startTransition(() => setDashboard(data));
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setSyncError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (providers) => {
    setSelectedProviders(providers);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(false);
    try {
      const providersStr = selectedProviders.join(',');
      await syncMultiCloud(providersStr);
      // Refresh dashboard data immediately after sync
      await loadDashboardData();
      success('Cloud accounts synced successfully');
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncError(true);
      error('Failed to sync cloud accounts. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddAccount = async (event) => {
    event.preventDefault();
    setIsSavingAccount(true);
    setAccountMessage('');

    try {
      for (const step of CONNECTION_STEPS) {
        setConnectionStep(step);
        await wait(800);
      }

      const account = await addCloudAccount(accountForm);
      setConnectedAccounts((current) => [account, ...current]);
      setAccountForm({ provider: 'aws', account_name: '' });
      setIsAddAccountOpen(false);
      setConnectionStep('');
      success(`${account.account_name} connected successfully`);
    } catch (err) {
      console.error('Failed to add account:', err);
      error('Unable to add cloud account. Please check your credentials and try again.');
      setConnectionStep('');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleAccountSync = async (account) => {
    setSyncingAccountId(account.id);
    setSyncErrors((prev) => ({ ...prev, [account.id]: false }));
    
    try {
      const result = await syncCloudData(account.provider, account.id);
      
      // Update account sync time
      setAccountSyncTimes((prev) => ({
        ...prev,
        [account.id]: result.lastSyncedAt,
      }));

      // Mock cost data for account (in real implementation, would come from backend)
      setAccountCosts((prev) => ({
        ...prev,
        [account.id]: {
          total: Math.random() * 5000 + 500,
          services: result.syncedServices || 8,
          trend: (Math.random() - 0.5) * 20,
        },
      }));

      // Refresh overall dashboard after account sync
      await loadDashboardData();
      success(`${account.account_name} synced successfully`);
    } catch (err) {
      console.error(`Failed to sync account ${account.id}:`, err);
      setSyncErrors((prev) => ({ ...prev, [account.id]: true }));
      error(`Failed to sync ${account.account_name}`);
    } finally {
      setSyncingAccountId(null);
    }
  };

  return (
    <div className="page-grid">
      <section className="hero-card glass-card">
        <div>
          <p className="eyebrow">Operating snapshot</p>
          <h1>Control cloud spend with anomaly-aware visibility.</h1>
          <p>
            Watch daily spend move against forecast, trigger syncs on demand, and resolve risk before it compounds.
          </p>
        </div>
        <div className="hero-actions">
          <div className="hero-action-row">
            <button className="primary-button secondary-button" type="button" onClick={() => setIsAddAccountOpen(true)}>
              + Add Account
            </button>
            <SyncButton onSync={handleSync} loading={syncing} />
            <label className="auto-refresh-toggle" title="Auto-refresh every 60 seconds">
              <input
                type="checkbox"
                checked={autoRefreshEnabled}
                onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                disabled={syncing}
              />
              <span>Auto-refresh</span>
            </label>
          </div>
          <SyncStatus 
            lastSyncedAt={dashboard.lastSyncedAt} 
            syncing={syncing} 
            error={syncError}
          />
        </div>
      </section>

      <ProviderSelector 
        selectedProviders={selectedProviders}
        onChange={handleProviderChange}
        disabled={syncing}
      />

      <section className="stats-grid">
        {dashboard.metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="dashboard-main-grid">
        <CostChart data={dashboard.chart} loading={loading} />
        <GlassCard title="FinOps posture" subtitle="This week at a glance">
          <div className="insight-list">
            <div className="insight-row">
              <strong>Forecast confidence</strong>
              <span>94.2%</span>
            </div>
            <div className="insight-row">
              <strong>Highest volatility</strong>
              <span>Amazon EC2</span>
            </div>
            <div className="insight-row">
              <strong>Estimated budget risk</strong>
              <span>Moderate</span>
            </div>
            <div className="insight-highlight">
              Blue-glow risk detection is watching abnormal cost drift across your linked workloads.
            </div>
          </div>
        </GlassCard>
      </section>

      <ProviderBreakdown 
        summary={dashboard.providerSummary}
        costRows={Object.values(dashboard.costRowsByProvider || {}).flat() || []}
      />

      <section className="accounts-section">
        <div className="section-header">
          <div>
            <h2>Connected Accounts</h2>
            <p>Manage your cloud accounts and monitor their costs</p>
          </div>
        </div>
        <AccountsList 
          accounts={connectedAccounts}
          accountCosts={accountCosts}
          accountSyncTimes={accountSyncTimes}
          syncingAccountId={syncingAccountId}
          syncErrors={syncErrors}
          onSync={handleAccountSync}
          onAddAccount={() => setIsAddAccountOpen(true)}
        />
      </section>

      <AnomaliesTable rows={dashboard.anomalies} compact />

      {isAddAccountOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => (!isSavingAccount ? setIsAddAccountOpen(false) : null)}>
          <div className="modal-card glass-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="card-header">
              <div>
                <p className="eyebrow">Connect cloud account</p>
                <h3>Add a provider workspace</h3>
              </div>
            </div>
            <form className="auth-form" onSubmit={handleAddAccount}>
              <label className="input-group">
                <span>Provider</span>
                <select
                  value={accountForm.provider}
                  onChange={(event) => setAccountForm((current) => ({ ...current, provider: event.target.value }))}
                  disabled={isSavingAccount}
                >
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                  <option value="gcp">GCP</option>
                </select>
              </label>
              <InputField
                label="Account name"
                placeholder="Production billing account"
                value={accountForm.account_name}
                onChange={(event) => setAccountForm((current) => ({ ...current, account_name: event.target.value }))}
              />
              {connectionStep ? <div className="connection-status">{connectionStep}</div> : null}
              <div className="modal-actions">
                <button className="icon-button modal-button" type="button" onClick={() => setIsAddAccountOpen(false)} disabled={isSavingAccount}>
                  Cancel
                </button>
                <button className="primary-button" type="submit" disabled={isSavingAccount}>
                  {isSavingAccount ? connectionStep || 'Connecting...' : 'Connect Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
