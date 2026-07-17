import { useState } from 'react';
import { X } from 'lucide-react';

export function MessageEditor({ row, onSave, onClose }) {
  const [text, setText] = useState(row.message || '');
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-title">Edit Outreach Message</div>
            <div className="modal-sub">
              {row.businessName} · {row.businessType || 'Business'}
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm" style={{ padding: 4 }}>
            <X size={15} />
          </button>
        </div>
        <div className="modal-body" style={{ padding: '16px 20px' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="input"
            style={{ resize: 'vertical', lineHeight: 1.6, padding: '10px 12px' }}
            placeholder="Edit outreach message..."
            autoFocus
          />
        </div>
        <div className="modal-foot">
          <span className="text-xs text-muted" style={{ marginRight: 'auto' }}>
            {wordCount} word{wordCount !== 1 ? 's' : ''}
          </span>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={() => onSave(text)}
            disabled={!text.trim()}
          >
            Save Message
          </button>
        </div>
      </div>
    </div>
  );
}
