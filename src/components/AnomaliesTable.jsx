import { GlassCard } from './GlassCard';

const PROVIDER_COLORS = {
  aws: '#FF9900',
  azure: '#0078D4',
  gcp: '#EA4335',
};

export function AnomaliesTable({ rows, compact = false }) {
  const hasMultipleProviders = rows.length > 0 && new Set(rows.map(r => r.provider)).size > 1;

  return (
    <GlassCard
      title="Detected anomalies"
      subtitle={compact ? 'Latest signals across services' : 'Recent cost irregularities'}
    >
      <div className="table-shell">
        <table className="anomaly-table">
          <thead>
            <tr>
              <th>Date</th>
              {hasMultipleProviders && <th>Provider</th>}
              <th>Service</th>
              <th>Cost</th>
              <th>Score</th>
              <th>Signal</th>
              <th>Explanation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                {hasMultipleProviders && (
                  <td>
                    <span
                      className="provider-badge"
                      style={{ '--provider-color': PROVIDER_COLORS[row.provider] || '#60A5FA' }}
                    >
                      {row.provider?.toUpperCase()}
                    </span>
                  </td>
                )}
                <td>{row.service}</td>
                <td>{row.cost}</td>
                <td>{row.anomalyScore}</td>
                <td>
                  <span className={`severity-pill severity-${row.severity}`}>{row.severity}</span>
                </td>
                <td>{row.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
