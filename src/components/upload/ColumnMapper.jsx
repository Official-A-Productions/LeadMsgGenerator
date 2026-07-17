import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

export function ColumnMapper({ headers, columnMap, rows, onOverride }) {
  const { businessName, phone, context } = columnMap;

  return (
    <div className="space-y-4">
      <div className="grid-2">
        <ColumnSelect
          label="Business Name Column"
          value={businessName || ''}
          headers={headers}
          status={businessName ? 'ok' : 'error'}
          onChange={(v) => onOverride({ businessName: v })}
        />
        <ColumnSelect
          label="Phone Number Column"
          value={phone || ''}
          headers={headers}
          status={phone ? 'ok' : 'error'}
          onChange={(v) => onOverride({ phone: v })}
        />
      </div>

      {context.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Info size={13} style={{ color: '#0f62fe' }} />
            <span className="text-xs font-medium" style={{ color: '#555' }}>
              {context.length} context column{context.length !== 1 ? 's' : ''} parsed
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {context.map((col) => (
              <span key={col} className="badge badge-gray">{col}</span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted" style={{ paddingTop: 10, borderTop: '1px solid #eee' }}>
        <span className="font-semibold" style={{ color: '#111' }}>{rows.length}</span> entries detected
      </div>
    </div>
  );
}

function ColumnSelect({ label, value, headers, status, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
          style={{ flex: 1 }}
        >
          <option value="">— not detected —</option>
          {headers.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        {status === 'ok'
          ? <CheckCircle size={15} style={{ color: '#1a7a40', flexShrink: 0 }} />
          : <AlertTriangle size={15} style={{ color: '#b91c1c', flexShrink: 0 }} />
        }
      </div>
    </div>
  );
}
