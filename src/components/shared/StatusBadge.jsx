import { ROW_STATUS } from '../../constants/providers.js';

const STATUS_CONFIG = {
  [ROW_STATUS.PENDING]:    { label: 'Pending',        cls: 'badge-pending' },
  [ROW_STATUS.PROCESSING]: { label: 'Sending…',       cls: 'badge-processing' },
  [ROW_STATUS.SUCCESS]:    { label: 'Done',            cls: 'badge-success' },
  [ROW_STATUS.ERROR]:      { label: 'Error',           cls: 'badge-error' },
  [ROW_STATUS.SKIPPED]:    { label: 'Skipped',         cls: 'badge-skipped' },

  // WhatsApp Queue Status Mappings
  'queued':         { label: 'Queued',         cls: 'badge-pending' },
  'pending':        { label: 'Pending',        cls: 'badge-pending' },
  'sending':        { label: 'Sending…',       cls: 'badge-processing' },
  'retry_pending':  { label: 'Retrying…',      cls: 'badge-processing' },
  'sent':           { label: 'Sent',           cls: 'badge-success' },
  'failed':         { label: 'Failed',         cls: 'badge-error' },
  'cancelled':      { label: 'Cancelled',      cls: 'badge-skipped' },
  'already_sent':   { label: 'Already Sent',   cls: 'badge-skipped' },
  'invalid_number': { label: 'Invalid Number', cls: 'badge-error' },
};

export function StatusBadge({ status }) {
  const normalizedKey = (status || '').toLowerCase();
  const config = STATUS_CONFIG[normalizedKey] || { label: status || 'Pending', cls: 'badge-pending' };
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}
