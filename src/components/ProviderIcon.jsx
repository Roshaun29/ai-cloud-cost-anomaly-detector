export function ProviderIcon({ provider, size = 'md' }) {
  const sizeClasses = {
    sm: 'provider-icon-sm',
    md: 'provider-icon-md',
    lg: 'provider-icon-lg',
  };

  const providerIcons = {
    aws: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="provider-icon-svg">
        <path d="M6 3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H6zm1 3h10v10H7V6z" />
        <circle cx="12" cy="11" r="2" fill="#FF9900" />
      </svg>
    ),
    azure: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="provider-icon-svg">
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z" />
        <path d="M8 8l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    gcp: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="provider-icon-svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
        <path d="M12 6.5c-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5 5.5-2.46 5.5-5.5-2.46-5.5-5.5-5.5z" />
      </svg>
    ),
  };

  const providerLabels = {
    aws: 'AWS',
    azure: 'Azure',
    gcp: 'GCP',
  };

  const providerColors = {
    aws: 'var(--provider-aws, #FF9900)',
    azure: 'var(--provider-azure, #0078D4)',
    gcp: 'var(--provider-gcp, #EA4335)',
  };

  return (
    <div className={`provider-icon ${sizeClasses[size]}`} style={{ color: providerColors[provider] }}>
      {providerIcons[provider] || providerIcons.aws}
      <span className="provider-label">{providerLabels[provider] || provider.toUpperCase()}</span>
    </div>
  );
}
