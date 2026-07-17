import { Upload, Zap, Settings, Sparkles } from 'lucide-react';
import { ROW_STATUS } from '../../constants/providers.js';

const NAV_ITEMS = [
  { id: 'upload',   label: 'Upload Leads',    icon: Upload },
  { id: 'generate', label: 'Generate',         icon: Zap },
  { id: 'settings', label: 'Settings',         icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, excel, generation, settings }) {
  const { rows } = excel;
  const { results } = generation;
  const successCount = results.filter(r => r.status === ROW_STATUS.SUCCESS).length;
  const activeKeys = settings.settings.providerKeys[settings.settings.activeProviderId]?.length || 0;

  function getBadge(id) {
    if (id === 'upload'   && rows.length > 0) return rows.length;
    if (id === 'generate' && successCount > 0) return successCount;
    if (id === 'settings' && activeKeys > 0) return activeKeys + ' keys';
    return null;
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={18} />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">Lead AI</span>
          <span className="sidebar-logo-sub">Message Generator</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const badge = getBadge(id);
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`sidebar-item${activeTab === id ? ' active' : ''}`}
            >
              <Icon size={15} />
              {label}
              {badge !== null && (
                <span className="item-num">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 2 }}>
            {settings.settings.activeProviderId === 'gemini' ? 'Google Gemini' : 'Groq'}
          </div>
          <div>{activeKeys} key{activeKeys !== 1 ? 's' : ''} configured</div>
        </div>
      </div>
    </aside>
  );
}
