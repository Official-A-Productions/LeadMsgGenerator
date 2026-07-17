import { useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, X } from 'lucide-react';

export function FileDropzone({ onFile, isParsing, currentFile, onReset }) {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  if (isParsing) {
    return (
      <div className="dropzone">
        <div className="dropzone-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
        <div className="dropzone-title">Reading file…</div>
        <div className="dropzone-sub">Detecting columns and rows</div>
      </div>
    );
  }

  if (currentFile) {
    return (
      <div className="dropzone dropzone-loaded" style={{ position: 'relative' }}>
        <div className="dropzone-icon">
          <FileSpreadsheet size={20} />
        </div>
        <div className="dropzone-title">{currentFile.name}</div>
        <div className="dropzone-sub">File loaded — drag another to replace</div>
        <button
          onClick={(e) => { e.stopPropagation(); onReset(); }}
          className="btn btn-ghost btn-icon btn-sm"
          style={{ position: 'absolute', top: 10, right: 10 }}
          title="Remove"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <label onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="dropzone" style={{ position: 'relative' }}>
      <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleChange} />
      <div className="dropzone-icon"><UploadCloud size={20} /></div>
      <div className="dropzone-title">Drop your spreadsheet here</div>
      <div className="dropzone-sub">or click to browse · .xlsx .xls .csv</div>
    </label>
  );
}
