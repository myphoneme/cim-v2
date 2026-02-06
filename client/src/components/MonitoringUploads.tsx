import { useEffect, useState, type FormEvent } from 'react';
import { useMonitoringUploads, useUploadMonitoring, useMonitoringUpload, useConfirmMonitoringUpload } from '../hooks/useMonitoring';
import { useLlmConfig } from '../hooks/useLlmConfig';
import { useAuth } from '../contexts/AuthContext';

export default function MonitoringUploads() {
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data: uploadsData } = useMonitoringUploads({ page, limit: pageSize });
  const uploads = uploadsData?.items || [];
  const totalUploads = uploadsData?.total || 0;
  const { data: llmConfig } = useLlmConfig(isAdmin);
  const uploadMutation = useUploadMonitoring();
  const confirmMutation = useConfirmMonitoringUpload();

  const [file, setFile] = useState<File | null>(null);
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null);
  const { data: selectedUpload, refetch: refetchUpload } = useMonitoringUpload(selectedUploadId ?? undefined);
  const [editedMetrics, setEditedMetrics] = useState<Array<any>>([]);
  const [editedCaptureTime, setEditedCaptureTime] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error' | 'warning' | ''>('');
  const isModalOpen = selectedUploadId !== null;
  const formatIst = (iso: string) => {
    const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(iso);
    const normalized = hasTz ? iso : `${iso}Z`;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(new Date(normalized)) + ' IST';
  };
  const formatShortIst = (iso: string) => {
    const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(iso);
    const normalized = hasTz ? iso : `${iso}Z`;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(normalized)).replace(/[^\d]/g, '');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      setFeedback('Uploading...');
      setFeedbackTone('');
      const created = await uploadMutation.mutateAsync(formData);
      setFeedback('Upload successful. Parsing screenshot...');
      setFeedbackTone('success');
      setFile(null);
      setPage(1);
      if (created?.id) {
        setSelectedUploadId(created.id);
      }
    } catch (err: any) {
      setFeedback(err?.message || 'Upload failed.');
      setFeedbackTone('error');
    }
  };

  useEffect(() => {
    if (selectedUpload) {
      const normalized = (selectedUpload.extracted_metrics || []).map((metric: any) => {
        const rawKey = (metric?.key || '').toLowerCase();
        const keyMap: Record<string, string> = {
          cpu_usage: 'cpu_util',
          cpu_util: 'cpu_util',
          mem_usage: 'ram_util',
          ram_util: 'ram_util',
          disk_root: 'disk_util',
          disk_usage: 'disk_util',
          disk_util: 'disk_util',
          net_in: 'net_in',
          net_out: 'net_out',
        };
        const mappedKey = keyMap[rawKey] || rawKey;
        return { ...metric, key: mappedKey };
      });
      setEditedMetrics(normalized);
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
    setShowPreview(false);
  };

  const handleConfirm = async () => {
    if (!selectedUploadId || !selectedUpload) return;
    try {
      const result = await confirmMutation.mutateAsync({
        id: selectedUploadId,
        data: {
          metrics: editedMetrics,
          capture_time: editedCaptureTime || new Date().toISOString(),
        },
      });
      const skipped = result?.skipped_unmapped?.length || 0;
      if (skipped > 0) {
        setFeedback(`Saved ${result.created} metrics. ${skipped} skipped because IPs are not in master data.`);
        setFeedbackTone('warning');
      } else {
        setFeedback('Metrics saved successfully.');
        setFeedbackTone('success');
      }
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
  const isParsing = selectedUpload?.parse_status === 'pending';
  const totalPages = Math.max(1, Math.ceil(totalUploads / pageSize));
  const canGoNext = page < totalPages;

  const metricKeys = [
    { key: 'cpu_util', label: 'CPU %' },
    { key: 'ram_util', label: 'RAM %' },
    { key: 'disk_util', label: 'Disk %' },
    { key: 'net_in', label: 'Net In %' },
    { key: 'net_out', label: 'Net Out %' },
  ];

  const [editingIp, setEditingIp] = useState<string | null>(null);
  const [rowDraft, setRowDraft] = useState<Record<string, string>>({});

  const groupedIps = Array.from(new Set(
    (editedMetrics || [])
      .map((metric) => (metric?.ip_address || '').trim())
      .filter((ip) => ip.length > 0)
  ));

  const getMetricValue = (ip: string, key: string) => {
    const metric = editedMetrics.find((m) => m.ip_address === ip && m.key === key);
    if (!metric || metric.value === undefined || metric.value === null || metric.value === '') {
      return 'N/A';
    }
    return String(metric.value);
  };

  const startRowEdit = (ip: string) => {
    const draft: Record<string, string> = {};
    metricKeys.forEach((metric) => {
      const value = getMetricValue(ip, metric.key);
      draft[metric.key] = value === 'N/A' ? '' : value;
    });
    setRowDraft(draft);
    setEditingIp(ip);
  };

  const cancelRowEdit = () => {
    setEditingIp(null);
    setRowDraft({});
  };

  const saveRowEdit = (ip: string) => {
    setEditedMetrics((prev) => {
      const next = [...prev];
      metricKeys.forEach((metric) => {
        const draftValue = rowDraft[metric.key];
        const existingIndex = next.findIndex((m) => m.ip_address === ip && m.key === metric.key);
        if (draftValue === '' || draftValue === undefined) {
          if (existingIndex >= 0) {
            next.splice(existingIndex, 1);
          }
          return;
        }
        const numeric = Number(draftValue);
        const entry = {
          key: metric.key,
          value: Number.isNaN(numeric) ? draftValue : numeric,
          unit: '%',
          ip_address: ip,
        };
        if (existingIndex >= 0) {
          next[existingIndex] = { ...next[existingIndex], ...entry };
        } else {
          next.push(entry);
        }
      });
      return next;
    });
    cancelRowEdit();
  };

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
            feedbackTone === 'success'
              ? 'text-emerald-500'
              : feedbackTone === 'warning'
                ? 'text-amber-500'
                : feedbackTone === 'error'
                  ? 'text-red-500'
                  : 'text-slate-400'
          }`}>
            {feedback}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Uploads</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Page {page} of {totalPages}</span>
            <span className="text-xs font-bold text-slate-400">- {totalUploads} total</span>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {uploads.map(upload => (
            <div key={upload.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {upload.file_name} - {formatShortIst(upload.created_at)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {upload.dashboard_label || 'Dashboard'} - {formatIst(upload.created_at)}
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
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-white/5">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="text-xs font-bold text-slate-400">
            Page {page} of {totalPages} · {pageSize} per page
          </div>
          <button
            type="button"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!canGoNext}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 sticky top-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur z-10">
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
            <div className="space-y-6 p-6 overflow-y-auto max-h-[78vh]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  Mapping will use IP address to match devices/VMs in the master data.
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview((prev) => !prev)}
                    className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                  >
                    {showPreview ? 'Hide Screenshot' : 'View Screenshot'}
                  </button>
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                    >
                      Open Full
                    </a>
                  )}
                </div>
              </div>
              {showPreview && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 shadow-sm">
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
              )}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Health Metrics</h4>
                <span className="text-[10px] font-bold text-slate-400">{groupedIps.length} IPs</span>
              </div>
              {!selectedUpload && (
                <div className="text-sm text-slate-400">Loading metrics...</div>
              )}
              {selectedUpload?.parse_status === 'pending' && (
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <span className="h-3 w-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
                  </span>
                  Parsing in progress... (auto-refreshing)
                </div>
              )}
              {selectedUpload?.parse_status === 'error' && (
                <div className="text-sm text-red-500">Parsing failed. You can still add metrics manually.</div>
              )}
              {selectedUpload?.parse_error && (
                <div className="text-xs text-red-500">{selectedUpload.parse_error}</div>
              )}
              <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 text-slate-500">
                      <tr>
                        <th className="text-left px-4 py-2 font-bold">IP Address</th>
                        {metricKeys.map((metric) => (
                          <th key={metric.key} className="text-left px-4 py-2 font-bold">{metric.label}</th>
                        ))}
                        <th className="text-right px-4 py-2 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {groupedIps.length === 0 && (
                        <tr>
                          <td colSpan={metricKeys.length + 2} className="px-4 py-4 text-slate-400 text-center">
                            No IP metrics yet. Parsing results will appear here.
                          </td>
                        </tr>
                      )}
                      {groupedIps.map((ip) => (
                        <tr key={ip}>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{ip}</td>
                          {metricKeys.map((metric) => (
                            <td key={metric.key} className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              {editingIp === ip ? (
                                <input
                                  type="number"
                                  className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A]"
                                  value={rowDraft[metric.key] ?? ''}
                                  onChange={(e) => setRowDraft((prev) => ({ ...prev, [metric.key]: e.target.value }))}
                                />
                              ) : (
                                getMetricValue(ip, metric.key)
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right">
                            {editingIp === ip ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveRowEdit(ip)}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-brand-500 text-white"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelRowEdit}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startRowEdit(ip)}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {selectedUpload?.raw_text && (
                <div className="mt-2">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Raw Text</div>
                  <div className="mt-2 p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {selectedUpload.raw_text}
                  </div>
                </div>
              )}
              <div className="sticky bottom-0 -mx-6 px-6 py-4 bg-white/95 dark:bg-[#111111]/95 border-t border-slate-100 dark:border-white/5 backdrop-blur flex flex-wrap items-center gap-3">
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
                  className="flex-1 min-w-[180px] px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow disabled:opacity-50"
                >
                  {confirmMutation.isPending ? 'Saving...' : 'Confirm & Save'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isParsing}
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
      )}
    </div>
  );
}
