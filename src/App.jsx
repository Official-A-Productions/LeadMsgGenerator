import { useState } from 'react';
import { QueryProvider } from './providers/QueryProvider.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { GeneratePage } from './pages/GeneratePage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { WhatsAppPage } from './pages/WhatsAppPage.jsx';
import { useSettings } from './hooks/useSettings.js';
import { useExcel } from './hooks/useExcel.js';
import { useBatchGeneration } from './hooks/useBatchGeneration.js';

const TABS = [
  { id: 'upload',   label: 'Upload' },
  { id: 'generate', label: 'Generate' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'settings', label: 'Settings' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const settings = useSettings();
  const excel = useExcel();
  const generation = useBatchGeneration();

  return (
    <QueryProvider>
      <nav className="nav">
        <span className="nav-brand">Lead Message Generator</span>
        <div className="nav-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === 'upload'   && <HomePage   excel={excel}   onNext={() => setActiveTab('generate')} />}
      {activeTab === 'generate' && <GeneratePage excel={excel} settings={settings} generation={generation} onNext={() => setActiveTab('whatsapp')} />}
      {activeTab === 'whatsapp' && <WhatsAppPage />}
      {activeTab === 'settings' && <SettingsPage settings={settings} />}
    </QueryProvider>
  );
}
