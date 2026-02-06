import { useEffect, useState, type FormEvent } from 'react';
import { useMonitoringUploads, useUploadMonitoring, useMonitoringUpload, useConfirmMonitoringUpload } from '../hooks/useMonitoring';
import { useLlmConfig } from '../hooks/useLlmConfig';
import { useAuth } from '../contexts/AuthContext';

export default function MonitoringUploads() {
  const { isAdmin } = useAuth();
  const { data: uploads = [] } = useMonitoringUploads();
  const { data: llmConfig } = useLlmConfig(isAdmin);
  const uploadMutation = useUploadMonitoring();
  const confirmMutation = useConfirmMonitoringUpload();

  const [file, setFile] = useState<File | null>(null);
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null);
  const { data: selectedUpload, refetch: refetchUpload } = useMonitoringUpload(selectedUploadId ?? undefined);
  const [editedMetrics, setEditedMetrics] = useState<Array<any>>([]);
  const [editedCaptureTime, setEditedCaptureTime] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error' | ''>('');
  const isModalOpen = selectedUploadId !== null;
  const formatIst = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      setFeedback('Uploading...');
      setFeedbackTone('');
      await uploadMutation.mutateAsync(formData);
      setFeedback('Upload successful. Parsing screenshot...');
      setFeedbackTone('success');
      setFile(null);
    } catch (err: any) {
      setFeedback(err?.message || 'Upload failed.');
      setFeedbackTone('error');
    }
  };

  useEffect(() => {
    if (selectedUpload) {
      setEditedMetrics(selectedUpload.extracted_metrics ? [...selectedUpload.extracted_metrics] : []);
      const capture = selectedUpload.capture_time
        ? new Date(selectedUpload.capture_time).toISOString()
        : new Date().toISOString();
      setEditedCaptureTime(capture);
    }
  }, [selectedUpload]);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (!isModalOpen || !selectedUploadId) {
      setPreviewUrl('');
      return undefined;
    }

    fetch(`/api/monitoring-uploads/${selectedUploadId}/file`, { credentials: 'include' })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => {
        if (!blob) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => setPreviewUrl(''));

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isModalOpen, selectedUploadId]);

  useEffect(() => {
    if (!isModalOpen || !selectedUploadId) return undefined;
    if (!selectedUpload || selectedUpload.parse_status === 'pending') {
      const timer = setInterval(() => {
        refetchUpload();
      }, 2000);
      return () => clearInterval(timer);
    }
    return undefined;
  }, [isModalOpen, selectedUploadId, selectedUpload, refetchUpload]);

  const closeModal = () => {
    setSelectedUploadId(null);
    setEditedMetrics([]);
    setEditedCaptureTime('');
    setPreviewUrl('');
  };

  const handleConfirm = async () => {
    if (!selectedUploadId || !selectedUpload) return;
    try {
      await confirmMutation.mutateAsync({
        id: selectedUploadId,
        data: {
          metrics: editedMetrics,
          capture_time: editedCaptureTime || new Date().toISOString(),
        },
      });
      setFeedback('Metrics saved successfully.');
      setFeedbackTone('success');
      closeModal();
    } catch (err: any) {
      setFeedback(err?.message || 'Failed to save metrics.');
      setFeedbackTone('error');
    }
  };

  const updateMetricField = (index: number, field: string, value: string) => {
    setEditedMetrics((prev) => {
      const next = [...prev];
      if (field === 'value') {
        const numeric = value === '' ? undefined : Number(value);
        next[index] = { ...next[index], [field]: Number.isNaN(numeric) ? value : numeric };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const addMetricRow = () => {
    setEditedMetrics((prev) => [...prev, { key: '', value: '', unit: '', ip_address: '' }]);
  };

  const removeMetricRow = (index: number) => {
    setEditedMetrics((prev) => prev.filter((_, i) => i !== index));
  };

  const canConfirm = Boolean(
    selectedUpload &&
    selectedUpload.parse_status !== 'pending' &&
    editedMetrics.length > 0 &&
    selectedUploadId
  );

  const activeKey = llmConfig?.keys?.find(key => key.is_selected);
  const llmBadge = llmConfig
    ? llmConfig.requires_selection
      ? { label: 'LLM selection required', tone: 'bg-amber-500/10 text-amber-600' }
      : activeKey
        ? { label: `LLM: ${activeKey.provider.toUpperCase()}`, tone: 'bg-emerald-500/10 text-emerald-600' }
        : { label: 'LLM: not configured', tone: 'bg-red-500/10 text-red-500' }
    : null;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Monitoring Uploads</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload Grafana screenshots. IPs in the image are used to map devices/VMs.</p>
          </div>
          <div className="flex items-center gap-2">
            {llmBadge && (
              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${llmBadge.tone}`}>
                {llmBadge.label}
              </span>
            )}
            <span className="px-5 py-2 bg-brand-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest pill-shadow">
              30-Day Retention
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col md:flex-row gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
          <input
            type="file"
            accept=".png,.jpg,.jpeg"
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />

          <button
            type="submit"
            disabled={uploadMutation.isPending || !file}
            className="px-6 py-3 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow disabled:opacity-50"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Screenshot'}
          </button>
        </form>

        {feedback && (
          <div className={`mt-4 text-sm font-semibold ${
            feedbackTone === 'success' ? 'text-emerald-500' : feedbackTone === 'error' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Uploads</h3>
          <span className="text-xs font-bold text-slate-400">{uploads.length} items</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {uploads.map(upload => (
            <div key={upload.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{upload.file_name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {upload.dashboard_label || 'Dashboard'} ? {formatIst(upload.created_at)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  upload.parse_status === 'ok' ? 'bg-emerald-500/10 text-emerald-500' :
                  upload.parse_status === 'error' ? 'bg-red-500/10 text-red-500' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {upload.parse_status}
                </span>
                <button
                  type="button"
                  className="text-sm font-bold text-brand-500"
                  onClick={() => setSelectedUploadId(upload.id)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
          {uploads.length === 0 && (
            <div className="p-12 text-center text-slate-400">No uploads yet.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
              <div>
                <div className="text-lg font-black text-slate-900 dark:text-white">Upload Preview</div>
                <div className="text-xs text-slate-400">{selectedUpload?.file_name || 'Loading...'}</div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="h-9 w-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-brand-500"
                aria-label="Close"
              >
                x
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[75vh]">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={selectedUpload?.file_name || 'Upload preview'}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-400">Preview not available yet.</div>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  Mapping will use IP address to match devices/VMs in the master data.
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Extracted Metrics</h4>
                  <span className="text-[10px] font-bold text-slate-400">{editedMetrics.length} items</span>
                </div>
                {!selectedUpload && (
                  <div className="text-sm text-slate-400">Loading metrics...</div>
                )}
                {selectedUpload?.parse_status === 'pending' && (
                  <div className="text-sm text-amber-500">Parsing in progress... (auto-refreshing)</div>
                )}
                {selectedUpload?.parse_status === 'error' && (
                  <div className="text-sm text-red-500">Parsing failed. You can still add metrics manually.</div>
                )}
                {selectedUpload?.parse_error && (
                  <div className="text-xs text-red-500">{selectedUpload.parse_error}</div>
                )}
                {editedMetrics.map((metric, index) => (
                  <div key={`${metric.key || 'metric'}-${index}`} className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A]">
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-xs"
                        placeholder="Metric key"
                        value={metric.key || ''}
                        onChange={(e) => updateMetricField(index, 'key', e.target.value)}
                      />
                      <input
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-xs"
                        placeholder="IP Address"
                        value={metric.ip_address || ''}
                        onChange={(e) => updateMetricField(index, 'ip_address', e.target.value)}
                      />
                      <input
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-xs"
                        placeholder="Value"
                        value={metric.value ?? ''}
                        onChange={(e) => updateMetricField(index, 'value', e.target.value)}
                      />
                      <input
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-xs"
                        placeholder="Unit"
                        value={metric.unit || ''}
                        onChange={(e) => updateMetricField(index, 'unit', e.target.value)}
                      />
                    </div>
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeMetricRow(index)}
                        className="text-[11px] font-bold text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {editedMetrics.length === 0 && selectedUpload?.parse_status !== 'pending' && (
                  <div className="text-sm text-slate-400">No metrics extracted yet.</div>
                )}
                {selectedUpload?.raw_text && (
                  <div className="mt-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Raw Text</div>
                    <div className="mt-2 p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {selectedUpload.raw_text}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => refetchUpload()}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={addMetricRow}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                  >
                    Add Metric
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!canConfirm || confirmMutation.isPending}
                    className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow disabled:opacity-50"
                  >
                    {confirmMutation.isPending ? 'Saving...' : 'Confirm & Save'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                  >
                    Close
                  </button>
                </div>
                {!canConfirm && selectedUpload?.parse_status !== 'pending' && (
                  <div className="text-xs text-amber-500">Add/edit metrics before saving.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
