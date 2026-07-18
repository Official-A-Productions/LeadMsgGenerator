import { MessageSettingsForm } from '../components/settings/MessageSettingsForm.jsx';
import { GenerationControls } from '../components/generation/GenerationControls.jsx';
import { ProgressPanel } from '../components/generation/ProgressPanel.jsx';
import { ResultsTable } from '../components/preview/ResultsTable.jsx';
import { ErrorAlert } from '../components/shared/ErrorAlert.jsx';
import { exportToExcel } from '../services/excel/exporter.js';
import { Download, AlertTriangle, Send } from 'lucide-react';
import { useWhatsApp } from '../hooks/useWhatsApp.js';

export function GeneratePage({ excel, settings, generation, onNext }) {
  const { rows, columnMap } = excel;
  const { settings: appSettings, updateMessageSettings } = settings;
  const { enqueue } = useWhatsApp();
  const {
    state, results, successResults, progress, batchError,
    isRunning, isDone, isIdle,
    start, cancel, reset, regenerate, editRow,
  } = generation;

  const activeKeys = appSettings.providerKeys[appSettings.activeProviderId] || [];
  const hasKeys = activeKeys.length > 0;
  const hasRows = rows.length > 0;

  const handleStart = () => {
    start({
      rows,
      businessNameCol: columnMap.businessName,
      phoneCol: columnMap.phone,
      settings: appSettings.messageSettings,
      activeProviderId: appSettings.activeProviderId,
      apiKeys: activeKeys,
      model: appSettings.providerModels?.[appSettings.activeProviderId],
    });
  };

  const handleExport = async () => {
    await exportToExcel(successResults.map((r) => ({
      businessName: r.businessName,
      phone: r.phone,
      businessType: r.businessType,
      message: r.message,
    })));
  };

  const handleRegenerate = (rowId) => {
    regenerate(rowId, {
      businessNameCol: columnMap.businessName,
      phoneCol: columnMap.phone,
      settings: appSettings.messageSettings,
    });
  };

  return (
    <div className="page page-wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Generate Outreach</h1>
          <p className="page-desc" style={{ marginBottom: 0 }}>
            {hasRows ? `${rows.length} leads loaded` : 'No file uploaded'}
            {hasRows && ` · ${appSettings.activeProviderId === 'gemini' ? 'Gemini' : 'Groq'} (${activeKeys.length} keys)`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={onNext}
          >
            Go to WhatsApp
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={successResults.length === 0}
          >
            <Download size={13} /> Export Excel ({successResults.length})
          </button>
          <GenerationControls
            isRunning={isRunning} isDone={isDone} isIdle={isIdle}
            canStart={!isRunning && hasRows && hasKeys}
            onStart={handleStart} onCancel={cancel} onReset={reset}
          />
        </div>
      </div>

      <div className="space-y-4">
        {/* Warnings */}
        {!hasRows && (
          <div className="alert alert-warning">
            <AlertTriangle size={15} className="alert-icon" />
            <span className="text-sm">
              Please upload your leads file first on the <strong>Upload</strong> tab.
            </span>
          </div>
        )}
        {hasRows && !hasKeys && (
          <div className="alert alert-warning">
            <AlertTriangle size={15} className="alert-icon" />
            <span className="text-sm">
              No API keys configured for <strong>{appSettings.activeProviderId === 'gemini' ? 'Gemini' : 'Groq'}</strong>. Please add keys on the <strong>Settings</strong> tab.
            </span>
          </div>
        )}
        {batchError && <ErrorAlert errors={[batchError]} />}

        {/* Settings Form */}
        {isIdle && hasRows && (
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold" style={{ fontSize: 14, marginBottom: 16 }}>Message Style Settings</h3>
              <MessageSettingsForm settings={appSettings} onChange={updateMessageSettings} />
            </div>
          </div>
        )}

        {/* Generation Progress */}
        {(isRunning || isDone) && progress.total > 0 && (
          <div className="card">
            <div className="card-body">
              <ProgressPanel progress={progress} isRunning={isRunning} />
            </div>
          </div>
        )}

        {/* Results table */}
        {results.length > 0 && (
          <div className="card">
            <div className="card-body" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="font-semibold" style={{ fontSize: 14 }}>Personalized Messages</h3>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    enqueue(successResults.map(r => ({
                      leadId: r.id,
                      businessName: r.businessName,
                      phoneNumber: r.phone,
                      message: r.message
                    })));
                    onNext();
                  }}
                  disabled={successResults.length === 0}
                >
                  <Send size={13} style={{ marginRight: 4 }} /> Queue All {successResults.length > 0 ? `(${successResults.length})` : ''}
                </button>
              </div>
              <ResultsTable
                results={results}
                onRegenerate={handleRegenerate}
                onEdit={editRow}
                isRunning={isRunning}
                onQueue={(row) => {
                  enqueue([{
                    leadId: row.id,
                    businessName: row.businessName,
                    phoneNumber: row.phone,
                    message: row.message
                  }]);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
