import { Play, Square, RotateCcw } from 'lucide-react';

export function GenerationControls({ isRunning, isDone, isIdle, canStart, onStart, onCancel, onReset }) {
  if (isRunning) {
    return (
      <button className="btn btn-danger" onClick={onCancel}>
        <Square size={13} /> Stop Generation
      </button>
    );
  }
  if (isDone) {
    return (
      <button className="btn btn-secondary" onClick={onReset}>
        <RotateCcw size={13} /> Start Over
      </button>
    );
  }
  return (
    <button className="btn btn-primary btn-lg" onClick={onStart} disabled={!canStart}>
      <Play size={14} fill="currentColor" /> Generate Messages
    </button>
  );
}
