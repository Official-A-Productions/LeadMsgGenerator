import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export function ErrorAlert({ errors = [], onDismiss, type = 'error' }) {
  if (!errors.length) return null;
  const isWarning = type === 'warning';
  return (
    <div className={`alert ${isWarning ? 'alert-warning' : 'alert-error'}`}>
      <span className="alert-icon">
        {isWarning
          ? <AlertTriangle size={15} />
          : <AlertCircle size={15} />
        }
      </span>
      <div style={{ flex: 1 }}>
        {errors.map((e, i) => <p key={i} className="text-sm">{e}</p>)}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="btn btn-ghost btn-icon btn-sm"
          style={{ flexShrink: 0, marginLeft: 4 }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
