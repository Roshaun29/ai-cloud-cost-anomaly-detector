export function ProviderSelector({ selectedProviders, onChange, disabled = false }) {
  const allProviders = [
    { id: 'aws', label: 'AWS', color: '#FF9900' },
    { id: 'azure', label: 'Azure', color: '#0078D4' },
    { id: 'gcp', label: 'GCP', color: '#EA4335' },
  ];

  const handleToggle = (providerId) => {
    const newSelection = selectedProviders.includes(providerId)
      ? selectedProviders.filter((p) => p !== providerId)
      : [...selectedProviders, providerId];

    onChange(newSelection);
  };

  return (
    <div className="provider-selector">
      <label className="provider-selector-label">Cloud Providers</label>
      <div className="provider-chips">
        {allProviders.map((provider) => (
          <button
            key={provider.id}
            className={`provider-chip ${selectedProviders.includes(provider.id) ? 'active' : ''}`}
            onClick={() => handleToggle(provider.id)}
            disabled={disabled}
            type="button"
            style={{
              '--provider-color': provider.color,
            }}
          >
            <span className="provider-dot" />
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}
