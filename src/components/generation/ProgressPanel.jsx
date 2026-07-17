import { estimateRemaining } from '../../utils/format.js';

export function ProgressPanel({ progress, isRunning }) {
  const { total, done, failed, remaining, percent, elapsedMs, providerLabel } = progress;
  if (total === 0) return null;
  const eta = estimateRemaining(done, total, elapsedMs);

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--gray-800)' }}>
            {isRunning ? 'Generating messages…' : 'Generation complete'}
          </span>
          <span className="text-sm" style={{ color: 'var(--brand-600)', fontWeight: 700 }}>
            {percent}%
          </span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value brand">{done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className="stat-value">{remaining}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Failed</div>
          <div className={`stat-value ${failed > 0 ? 'danger' : ''}`}>{failed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ETA</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{isRunning ? eta : '—'}</div>
        </div>
      </div>

      {/* Provider status */}
      {providerLabel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: 'var(--gray-50)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
        }}>
          {isRunning && (
            <div style={{
              width: 8, height: 8,
              background: 'var(--green-500)',
              borderRadius: '50%',
            }} className="animate-pulse" />
          )}
          <span className="text-xs text-muted">Provider:</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--gray-700)' }}>{providerLabel}</span>
        </div>
      )}
    </div>
  );
}
