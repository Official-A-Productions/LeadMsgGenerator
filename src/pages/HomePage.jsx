import { FileDropzone } from '../components/upload/FileDropzone.jsx';
import { ColumnMapper } from '../components/upload/ColumnMapper.jsx';
import { ErrorAlert } from '../components/shared/ErrorAlert.jsx';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export function HomePage({ excel, onNext }) {
  const { file, headers, rows, columnMap, parseErrors, isParsing, isReady, loadFile, reset, overrideColumnMap } = excel;
  const canProceed = isReady && columnMap.businessName && columnMap.phone;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Upload Leads</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>Step 1 of 2 — Load your spreadsheet file</p>
        </div>
        <button
          className="btn btn-primary"
          disabled={!canProceed}
          onClick={onNext}
        >
          Continue to Generate <ArrowRight size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Dropzone */}
        <FileDropzone
          onFile={loadFile}
          isParsing={isParsing}
          currentFile={file}
          onReset={reset}
        />

        {/* Errors */}
        {parseErrors.length > 0 && (
          <ErrorAlert errors={parseErrors} onDismiss={reset} />
        )}

        {/* Column detection */}
        {file && !isParsing && headers.length > 0 && (
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 className="font-semibold" style={{ fontSize: 14 }}>Column Mapping</h3>
                  <p className="text-xs text-muted mt-1">We auto-detected your columns — override if needed</p>
                </div>
                {canProceed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green-600)' }}>
                    <CheckCircle2 size={15} />
                    <span className="text-xs font-semibold">Matched</span>
                  </div>
                )}
              </div>
              <ColumnMapper
                headers={headers}
                columnMap={columnMap}
                rows={rows}
                onOverride={overrideColumnMap}
              />
            </div>
          </div>
        )}

        {/* Tip */}
        {!file && (
          <div className="alert alert-info">
            <span className="alert-icon">💡</span>
            <div>
              <p className="text-sm font-semibold">What to include in your spreadsheet</p>
              <ul className="text-xs text-muted mt-2" style={{ paddingLeft: 14, lineHeight: 1.8 }}>
                <li>A <strong>Business Name</strong> column (e.g. Business Name, Company, Store Name)</li>
                <li>A <strong>Phone Number</strong> column (e.g. Phone, Mobile, WhatsApp)</li>
                <li>All other columns will automatically be supplied to the AI as context</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
