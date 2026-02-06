import { useState, type FormEvent } from 'react';
import { useLlmConfig, useAddLlmKey, useSelectLlmKey, useDeleteLlmKey, useUpdateLlmKey } from '../hooks/useLlmConfig';

const providerOptions = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'claude', label: 'Claude' },
];

export default function LlmConfigPanel() {
  const { data, isLoading } = useLlmConfig();
  const addKey = useAddLlmKey();
  const selectKey = useSelectLlmKey();
  const deleteKey = useDeleteLlmKey();
  const updateKey = useUpdateLlmKey();

  const [provider, setProvider] = useState('openai');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editKey, setEditKey] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('API key is required.');
      return;
    }
    setError('');
    await addKey.mutateAsync({ provider, api_key: apiKey.trim(), label: label.trim() || undefined });
    setApiKey('');
    setLabel('');
  };

  const startEdit = (id: number, currentLabel?: string) => {
    setEditingId(id);
    setEditLabel(currentLabel || '');
    setEditKey('');
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    await updateKey.mutateAsync({
      keyId: editingId,
      data: {
        api_key: editKey.trim() || undefined,
        label: editLabel.trim() || undefined,
      },
    });
    setEditingId(null);
    setEditKey('');
    setEditLabel('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">LLM Provider Keys</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Add API keys and select the active provider.</p>
          </div>
          {data?.requires_selection && (
            <div className="px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold uppercase tracking-widest">
              Selection required
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
          <select
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {providerOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          <input
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
            placeholder="Paste API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button
            type="submit"
            disabled={addKey.isPending}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow disabled:opacity-50"
          >
            {addKey.isPending ? 'Saving...' : 'Add Key'}
          </button>
        </form>

        {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Configured Keys</h3>
          <span className="text-xs font-bold text-slate-400">{data?.keys?.length || 0} keys</span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-white/5">
          {(data?.keys || []).map((key) => (
            <div key={key.id} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {key.provider.toUpperCase()}
                  {key.label ? ` · ${key.label}` : ''}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {key.masked_key} · Added {new Date(key.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {key.is_selected ? (
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                    Active
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => selectKey.mutate(key.id)}
                    disabled={selectKey.isPending}
                    className="text-sm font-bold text-brand-500"
                  >
                    Use
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(key.id, key.label)}
                  className="text-sm font-bold text-slate-500"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => deleteKey.mutate(key.id)}
                  disabled={deleteKey.isPending}
                  className="text-sm font-bold text-red-500"
                >
                  Remove
                </button>
              </div>
              {editingId === key.id && (
                <form onSubmit={handleUpdate} className="w-full mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                    placeholder="Update label (optional)"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                  />
                  <input
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                    placeholder="New API key"
                    value={editKey}
                    onChange={(e) => setEditKey(e.target.value)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={updateKey.isPending}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow disabled:opacity-50"
                    >
                      {updateKey.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-white/10 text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
          {!data?.keys?.length && (
            <div className="p-12 text-center text-slate-400">No API keys added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
