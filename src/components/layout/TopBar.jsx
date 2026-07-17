import { APP_CONFIG } from '../../config/app.js';

export function TopBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'generate', label: 'Generate' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-0 flex items-center justify-between h-12">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-slate-800">{APP_CONFIG.name}</span>
        <span className="text-xs text-muted">v{APP_CONFIG.version}</span>
      </div>

      <nav className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
