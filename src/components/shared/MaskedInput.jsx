import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { maskApiKey } from '../../utils/format.js';

export function MaskedInput({ value, onChange, placeholder = 'Paste API key...', disabled }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
      <input
        type={revealed ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="input"
        style={{ flex: 1 }}
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="btn btn-secondary btn-icon btn-sm"
        title={revealed ? 'Hide' : 'Show'}
        style={{ flexShrink: 0 }}
      >
        {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

export function MaskedKeyDisplay({ apiKey }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'ui-monospace, Consolas, monospace', fontSize: 11.5, color: '#555' }}>
      {revealed ? apiKey : maskApiKey(apiKey)}
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        className="btn btn-ghost btn-icon"
        style={{ padding: 2, marginLeft: 2 }}
        title={revealed ? 'Hide' : 'Show'}
      >
        {revealed ? <EyeOff size={11} /> : <Eye size={11} />}
      </button>
    </span>
  );
}
