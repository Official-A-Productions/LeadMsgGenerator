import { PROVIDER_DEFINITIONS } from '../../config/providers.js';

export function ProviderList({ settings, setActiveProvider, setModel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {PROVIDER_DEFINITIONS.map((provider) => {
        const isActive = settings.activeProviderId === provider.id;
        const keyCount = (settings.providerKeys[provider.id] || []).length;
        const currentModel = settings.providerModels?.[provider.id] || provider.defaultModel;

        return (
          <div
            key={provider.id}
            className={`provider-row${isActive ? ' active' : ''}`}
            onClick={() => setActiveProvider(provider.id)}
          >
            <div className="radio-dot" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span className="font-semibold" style={{ fontSize: 13, color: '#111' }}>{provider.name}</span>
                <span className={`badge ${keyCount > 0 ? 'badge-green' : 'badge-red'}`}>
                  {keyCount} key{keyCount !== 1 ? 's' : ''}
                </span>
                {isActive && <span className="badge badge-blue">Active</span>}
              </div>
              <div className="text-xs text-muted">
                {keyCount === 0 ? 'No keys configured' : `${keyCount} key${keyCount !== 1 ? 's' : ''} available`}
              </div>
            </div>

            {/* Model selector */}
            <div onClick={(e) => e.stopPropagation()}>
              <select
                value={currentModel}
                onChange={(e) => setModel(provider.id, e.target.value)}
                className="input"
                style={{ width: 'auto', fontSize: 12, padding: '4px 8px', minWidth: 160 }}
              >
                {provider.models.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
