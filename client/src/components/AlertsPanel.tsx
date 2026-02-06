import { useMemo, useState } from 'react';
import { useAlerts, useAssignAlert, useUpdateAlertStatus } from '../hooks/useAlerts';
import { useTeams } from '../hooks/useTeams';

const statusOptions = ['open', 'ack', 'in_progress', 'resolved', 'closed'];

export default function AlertsPanel() {
  const { data: alerts = [] } = useAlerts();
  const updateMutation = useUpdateAlertStatus();
  const assignMutation = useAssignAlert();
  const { data: teams = [] } = useTeams();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<number | ''>('');

  const filtered = statusFilter === 'all'
    ? alerts
    : alerts.filter(a => a.status === statusFilter);

  const selected = useMemo(
    () => filtered.find(a => a.id === selectedId) || null,
    [filtered, selectedId]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Alerts</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track abnormal conditions and resolutions.</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm font-bold"
          >
            <option value="all">All Statuses</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Feed</h3>
            <span className="text-xs font-bold text-slate-400">{filtered.length} alerts</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[70vh] overflow-y-auto">
            {filtered.map(alert => (
              <button
                key={alert.id}
                onClick={() => setSelectedId(alert.id)}
                className={`w-full text-left p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors ${
                  selectedId === alert.id ? 'bg-slate-50 dark:bg-white/[0.03]' : ''
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white">{alert.summary || 'Alert triggered'}</div>
                <div className="text-xs text-slate-400 mt-1">{new Date(alert.detected_at).toLocaleString()}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-brand-500 mt-1">{alert.severity}</div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-slate-400">No alerts found.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-8">
          {selected ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selected.summary || 'Alert triggered'}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Detected: {new Date(selected.detected_at).toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                    value={selected.status}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, status: e.target.value })}
                  >
                    {statusOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">Assign Team</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                    value={selectedTeam}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : '';
                      setSelectedTeam(val);
                      if (val) {
                        assignMutation.mutate({ id: selected.id, team_id: val });
                      }
                    }}
                  >
                    <option value="">Unassigned</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">Resolution Notes</label>
                <textarea
                  className="w-full min-h-[120px] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                  placeholder="Add investigation notes or resolution details..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setNote('')}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    if (!note.trim()) return;
                    updateMutation.mutate({ id: selected.id, status: selected.status, note });
                    setNote('');
                  }}
                  className="px-6 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-400">Select an alert to view details.</div>
          )}
        </div>
      </div>
    </div>
  );
}
