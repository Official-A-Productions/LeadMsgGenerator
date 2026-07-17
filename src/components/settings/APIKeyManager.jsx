import { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { MaskedInput, MaskedKeyDisplay } from '../shared/MaskedInput.jsx';
import { ProviderManager } from '../../services/ai/ProviderManager.js';
import { PROVIDER_DEFINITIONS } from '../../config/providers.js';

export function APIKeyManager({ settings, addKey, removeKey }) {
  return (
    <div className="space-y-4">
      {PROVIDER_DEFINITIONS.map((provider) => (
        <ProviderKeySection
          key={provider.id}
          provider={provider}
          keys={settings.providerKeys[provider.id] || []}
          onAdd={(key) => addKey(provider.id, key)}
          onRemove={(i) => removeKey(provider.id, i)}
        />
      ))}
    </div>
  );
}

function ProviderKeySection({ provider, keys, onAdd, onRemove }) {
  const [newKey, setNewKey] = useState('');
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(null);

  const handleAdd = () => {
    const trimmed = newKey.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewKey('');
  };

  const handleTest = async (apiKey, index) => {
    setTesting(index);
    try {
      const manager = new ProviderManager({
        activeProviderId: provider.id,
        apiKeys: [apiKey],
      });
      const ok = await manager.testKey(apiKey);
      setTestResults((r) => ({ ...r, [index]: ok ? 'ok' : 'fail' }));
    } catch {
      setTestResults((r) => ({ ...r, [index]: 'fail' }));
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h4 className="font-semibold" style={{ fontSize: 13, color: '#111' }}>{provider.name} Key Management</h4>
            <p className="text-xs text-muted mt-1">
              {keys.length === 0
                ? 'Add API keys to enable generation'
                : `${keys.length} key${keys.length !== 1 ? 's' : ''} configured for key-rotation fallback`}
            </p>
          </div>
        </div>

        {/* Existing keys */}
        {keys.length > 0 && (
          <div className="space-y-2" style={{ marginBottom: 14 }}>
            {keys.map((key, i) => (
              <div key={i} className="key-row">
                <span className="key-num">{i + 1}</span>
                <span className="key-mono" style={{ flex: 1 }}>
                  <MaskedKeyDisplay apiKey={key} />
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleTest(key, i)}
                  disabled={testing === i}
                  style={{ flexShrink: 0 }}
                >
                  {testing === i ? 'Testing...' : 'Test Key'}
                </button>
                {testResults[i] === 'ok'   && <CheckCircle size={14} style={{ color: '#1a7a40', flexShrink: 0 }} />}
                {testResults[i] === 'fail' && <XCircle     size={14} style={{ color: '#b91c1c', flexShrink: 0 }} />}
                <button
                  onClick={() => onRemove(i)}
                  className="btn btn-ghost btn-icon btn-sm"
                  style={{ flexShrink: 0 }}
                  title="Delete key"
                >
                  <Trash2 size={13} style={{ color: '#c00' }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new key */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <MaskedInput
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder={`Paste ${provider.name} key...`}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={!newKey.trim()}
            style={{ flexShrink: 0 }}
          >
            <Plus size={14} /> Add Key
          </button>
        </div>
      </div>
    </div>
  );
}
