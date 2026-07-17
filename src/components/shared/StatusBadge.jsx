import { ROW_STATUS } from '../../constants/providers.js';

const STATUS_CONFIG = {
  [ROW_STATUS.PENDING]:    { label: 'Pending',     cls: 'badge-pending' },
  [ROW_STATUS.PROCESSING]: { label: 'Processing…', cls: 'badge-processing' },
  [ROW_STATUS.SUCCESS]:    { label: 'Done',         cls: 'badge-success' },
  [ROW_STATUS.ERROR]:      { label: 'Error',        cls: 'badge-error' },
  [ROW_STATUS.SKIPPED]:    { label: 'Skipped',      cls: 'badge-skipped' },
};

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[ROW_STATUS.PENDING];
  return <span className={`badge ${config.cls}`}>{config.label}</span>;
}
