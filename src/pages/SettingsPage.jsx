import { APIKeyManager } from '../components/settings/APIKeyManager.jsx';
import { ProviderList } from '../components/settings/ProviderList.jsx';
import { MessageSettingsForm } from '../components/settings/MessageSettingsForm.jsx';

export function SettingsPage({ settings }) {
  const { settings: appSettings, setActiveProvider, addKey, removeKey, reorderKeys, setModel, updateMessageSettings } = settings;

  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>
      <p className="page-desc">Configure your AI providers, API keys, and default copywriting templates</p>

      <div className="space-y-6">
        {/* AI Provider */}
        <div>
          <div className="section-label">AI Provider</div>
          <ProviderList
            settings={appSettings}
            setActiveProvider={setActiveProvider}
            setModel={setModel}
          />
        </div>

        {/* API Keys */}
        <div>
          <div className="section-label">API Keys</div>
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            <span className="alert-icon">🔑</span>
            <span className="text-xs">
              Configure multiple keys for rotation. If a key hits rate limits or billing limits, the system rotates to the next key seamlessly.
            </span>
          </div>
          <APIKeyManager
            settings={appSettings}
            addKey={addKey}
            removeKey={removeKey}
            reorderKeys={reorderKeys}
          />
        </div>

        {/* Message defaults */}
        <div>
          <div className="section-label">Default Template Styling</div>
          <div className="card">
            <div className="card-body">
              <MessageSettingsForm settings={appSettings} onChange={updateMessageSettings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
