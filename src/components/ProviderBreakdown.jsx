import { GlassCard } from './GlassCard';

const PROVIDER_INFO = {
  aws: { label: 'AWS', services: ['EC2', 'S3'] },
  azure: { label: 'Azure', services: ['Virtual Machines', 'Blob Storage'] },
  gcp: { label: 'GCP', services: ['Compute Engine', 'BigQuery'] },
};

export function ProviderBreakdown({ summary = {}, costRows = [] }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getServiceCosts = (provider) => {
    const services = PROVIDER_INFO[provider]?.services || [];
    return services.map((service) => {
      const cost = costRows
        .filter((row) => row.provider === provider && row.service === service)
        .reduce((sum, row) => sum + Number(row.cost || 0), 0);
      return { service, cost };
    });
  };

  const totalCost = Object.values(summary).reduce((sum, val) => sum + Number(val || 0), 0);

  return (
    <GlassCard title="Multi-cloud breakdown" subtitle="Cost distribution by provider">
      <div className="provider-breakdown">
        {Object.entries(PROVIDER_INFO).map(([provider, info]) => {
          const providerCost = summary[provider] || 0;
          const serviceCosts = getServiceCosts(provider);
          const percentage = totalCost > 0 ? ((providerCost / totalCost) * 100).toFixed(1) : 0;

          return (
            <div key={provider} className="provider-breakdown-item">
              <div className="provider-breakdown-header">
                <strong>{info.label}</strong>
                <span className="provider-cost">{formatCurrency(providerCost)}</span>
              </div>
              <div className="provider-breakdown-percentage">{percentage}% of total spend</div>
              {serviceCosts.length > 0 && (
                <div className="provider-services">
                  {serviceCosts.map(({ service, cost }) => (
                    <div key={service} className="service-cost">
                      <span>{service}</span>
                      <span>{formatCurrency(cost)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
