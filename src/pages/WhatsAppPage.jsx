import { useWhatsApp } from '../hooks/useWhatsApp.js';
import { Play, Pause, RefreshCw, XCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { StatusBadge } from '../components/shared/StatusBadge.jsx';

export function WhatsAppPage() {
  const { status, queue, settings, error, start, pause, cancelJob, retryJob, updateSettings, clearCompleted, purgeAll } = useWhatsApp();

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">WhatsApp Delivery</h1>
        <div className="alert alert-warning">
          <AlertTriangle size={15} className="alert-icon" />
          <span className="text-sm">{error}. Is the backend server running?</span>
        </div>
      </div>
    );
  }

  const { authStatus, queueStats, processorRunning } = status || {};

  return (
    <div className="page page-wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">WhatsApp Delivery</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>Automate message sending</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {processorRunning ? (
            <button className="btn btn-warning" onClick={pause}><Pause size={14} /> Pause Queue</button>
          ) : (
            <button className="btn btn-primary" onClick={start} disabled={authStatus !== 'AUTHENTICATED'}><Play size={14} /> Start Queue</button>
          )}
          {queue.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearCompleted} title="Remove sent, cancelled & failed jobs">
              <Trash2 size={14} /> Clear Completed
            </button>
          )}
          {queue.length > 0 && !processorRunning && (
            <button className="btn btn-ghost btn-sm" style={{ color: '#c00' }} onClick={() => { if (confirm('Clear entire queue?')) purgeAll(); }} title="Wipe all jobs">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {authStatus === 'NOT_AUTHENTICATED' && (
          <div className="alert alert-warning">
            <span className="alert-icon">📱</span>
            <span className="text-sm font-semibold">Authentication Required: Please check the server console window. A browser should be open waiting for you to scan the WhatsApp QR code.</span>
          </div>
        )}
        
        {authStatus === 'AUTHENTICATED' && (
          <div className="alert alert-info" style={{ backgroundColor: '#e6f4ea', borderColor: '#ceead6', color: '#137333' }}>
            <span className="alert-icon">✅</span>
            <span className="text-sm font-semibold">Authenticated with WhatsApp Web</span>
          </div>
        )}

        {processorRunning && status?.currentActivity && (
          <div className="alert alert-info" style={{ backgroundColor: '#f0f4fe', borderColor: '#d2e3fc', color: '#1a73e8' }}>
            <span className="alert-icon">⚡</span>
            <span className="text-sm font-semibold">Live Server Activity: {status.currentActivity}</span>
          </div>
        )}

        {status?.isSleeping && (
          <div className="alert alert-info" style={{ backgroundColor: '#e8f0fe', borderColor: '#d2e3fc', color: '#1967d2' }}>
            <span className="alert-icon">⏳</span>
            <span className="text-sm font-semibold">
              Batch size reached ({status.messagesSentInCurrentBatch} sent). Taking a break until {new Date(status.sleepUntil).toLocaleTimeString()}.
            </span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {queueStats && Object.entries({
            'Pending': queueStats.pending,
            'Sending': queueStats.sending,
            'Sent': queueStats.sent,
            'Failed': queueStats.failed,
            'Cancelled': queueStats.cancelled
          }).map(([label, val]) => (
            <div key={label} className="card" style={{ padding: 16, textAlign: 'center' }}>
              <div className="text-2xl font-semibold">{val}</div>
              <div className="text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Throttling Settings */}
        {settings && (
          <div className="card">
            <div className="card-body" style={{ padding: 20 }}>
              <h3 className="font-semibold" style={{ fontSize: 14, marginBottom: 16 }}>Throttling Settings (Saved on Server)</h3>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                <div>
                  <label className="text-xs font-semibold block mb-1">Min Delay (s)</label>
                  <input type="number" className="input" style={{ width: 80 }} value={settings.minDelaySec} onChange={e => updateSettings({ minDelaySec: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Max Delay (s)</label>
                  <input type="number" className="input" style={{ width: 80 }} value={settings.maxDelaySec} onChange={e => updateSettings({ maxDelaySec: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Batch Size</label>
                  <input type="number" className="input" style={{ width: 80 }} value={settings.batchSize} onChange={e => updateSettings({ batchSize: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Batch Break (min)</label>
                  <input type="number" className="input" style={{ width: 80 }} value={settings.batchDelayMin} onChange={e => updateSettings({ batchDelayMin: Number(e.target.value) })} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body" style={{ padding: 20 }}>
            <h3 className="font-semibold" style={{ fontSize: 14, marginBottom: 16 }}>Delivery Queue</h3>
            
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(job => (
                    <tr key={job.id}>
                      <td className="font-semibold">{job.businessName}</td>
                      <td>{job.phoneNumber}</td>
                      <td><p className="text-xs line-clamp-2">{job.message}</p></td>
                      <td>
                        <StatusBadge status={job.status.toLowerCase()} />
                        {job.lastError && <p className="text-xs mt-1" style={{color: '#c00'}}>{job.lastError}</p>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {['QUEUED', 'PENDING', 'RETRY_PENDING'].includes(job.status) && (
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => cancelJob(job.leadId || job.id)} title="Cancel"><XCircle size={13}/></button>
                          )}
                          {job.status === 'FAILED' && (
                            <button className="btn btn-ghost btn-sm btn-icon" onClick={() => retryJob(job.leadId || job.id)} title="Retry"><RefreshCw size={13}/></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {queue.length === 0 && (
                    <tr><td colSpan={5} style={{textAlign: 'center', padding: 20, color: '#999'}}>Queue is empty.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
