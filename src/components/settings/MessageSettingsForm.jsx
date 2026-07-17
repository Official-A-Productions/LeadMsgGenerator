import {
  LANGUAGE_OPTIONS,
  TONE_OPTIONS,
  LENGTH_OPTIONS,
  CTA_OPTIONS,
} from '../../config/defaults.js';

export function MessageSettingsForm({ settings, onChange }) {
  const { messageSettings } = settings;
  const update = (key, value) => onChange({ [key]: value });

  return (
    <div className="space-y-4">
      <div className="grid-2">
        <SelectField label="Language"  value={messageSettings.language} options={LANGUAGE_OPTIONS} onChange={(v) => update('language', v)} />
        <SelectField label="Tone"      value={messageSettings.tone}     options={TONE_OPTIONS}     onChange={(v) => update('tone', v)} />
        <SelectField label="Length"    value={messageSettings.length}   options={LENGTH_OPTIONS}   onChange={(v) => update('length', v)} />
        <SelectField label="CTA Style" value={messageSettings.cta}      options={CTA_OPTIONS}      onChange={(v) => update('cta', v)} />
      </div>

      <div className="toggle-wrapper">
        <button
          type="button"
          role="switch"
          aria-checked={messageSettings.emoji}
          onClick={() => update('emoji', !messageSettings.emoji)}
          className={`toggle${messageSettings.emoji ? ' on' : ''}`}
        >
          <div className="toggle-track" />
          <div className="toggle-thumb" />
        </button>
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--gray-700)' }}>Use Emojis</div>
          <div className="text-xs text-muted">
            {messageSettings.emoji ? '1–2 relevant emojis per message' : 'Plain text, no emojis'}
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-base"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
