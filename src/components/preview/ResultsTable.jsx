import { useState } from 'react';
import { Copy, RefreshCw, Pencil, CheckCheck } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge.jsx';
import { MessageEditor } from './MessageEditor.jsx';
import { ROW_STATUS } from '../../constants/providers.js';

export function ResultsTable({ results, onRegenerate, onEdit, isRunning, onQueue }) {
  const [search, setSearch] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filtered = results.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.businessName?.toLowerCase().includes(q) ||
      r.phone?.toLowerCase().includes(q) ||
      r.businessType?.toLowerCase().includes(q) ||
      r.message?.toLowerCase().includes(q)
    );
  });

  const handleCopy = (row) => {
    navigator.clipboard.writeText(row.message || '');
    setCopiedId(row.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-3">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <input
          type="search"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ maxWidth: 240 }}
        />
        <span className="text-xs text-muted">{filtered.length} row{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="table-wrap">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Business Name</th>
              <th>Phone</th>
              <th>Business Type</th>
              <th>Status</th>
              <th>Outreach Message</th>
              <th style={{ textAlign: 'right', width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={row.id}>
                <td style={{ color: '#bbb', fontSize: 11 }}>{row.rowIndex || i + 1}</td>
                <td>
                  <span className="font-semibold" style={{ color: '#111' }}>
                    {row.businessName}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap', color: '#555' }}>{row.phone}</td>
                <td>
                  {row.businessType
                    ? <span className="badge badge-gray">{row.businessType}</span>
                    : <span style={{ color: '#ccc' }}>—</span>
                  }
                </td>
                <td>
                  <StatusBadge status={row.status} />
                  {row.error && (
                    <p className="text-xs" style={{ color: '#c00', marginTop: 3, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.error}>
                      {row.error}
                    </p>
                  )}
                </td>
                <td style={{ maxWidth: 300 }}>
                  <p className="text-xs line-clamp-3" style={{ color: '#444', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {row.message}
                  </p>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    {row.status === ROW_STATUS.SUCCESS && (
                      <>
                        {onQueue && (
                          <button
                            onClick={() => onQueue(row)}
                            className="btn btn-ghost btn-sm"
                            title="Queue for WhatsApp"
                            style={{ fontSize: 11, padding: '2px 8px', marginRight: 4 }}
                          >
                            Queue
                          </button>
                        )}
                        <button
                          onClick={() => handleCopy(row)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Copy"
                        >
                          {copiedId === row.id
                            ? <CheckCheck size={13} style={{ color: '#1a7a40' }} />
                            : <Copy size={13} />
                          }
                        </button>
                        <button
                          onClick={() => setEditingRow(row)}
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                      </>
                    )}
                    {(row.status === ROW_STATUS.SUCCESS || row.status === ROW_STATUS.ERROR) && (
                      <button
                        onClick={() => onRegenerate(row.id)}
                        disabled={isRunning || row.status === ROW_STATUS.PROCESSING}
                        className="btn btn-ghost btn-icon btn-sm"
                        title="Regenerate"
                      >
                        <RefreshCw
                          size={13}
                          className={row.status === ROW_STATUS.PROCESSING ? 'spin' : ''}
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px 16px', color: '#999' }}>
                  No entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingRow && (
        <MessageEditor
          row={editingRow}
          onSave={(msg) => { onEdit(editingRow.id, { message: msg }); setEditingRow(null); }}
          onClose={() => setEditingRow(null)}
        />
      )}
    </div>
  );
}
