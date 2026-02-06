import { useMemo, useState, type FormEvent } from 'react';
import { useAlertRules, useCreateAlertRule, useUpdateAlertRule, useDeleteAlertRule } from '../hooks/useAlerts';
import { useMetricDefinitions, useMetricGroups, useCreateMetricDefinition, useCreateMetricGroup, useUpdateMetricGroup, useDeleteMetricGroup, useAddMetricGroupMember } from '../hooks/useMetrics';
import LlmConfigPanel from './LlmConfigPanel';
import { useAuth } from '../contexts/AuthContext';

const settingsTabs = [
  { id: 'rules', label: 'Alert Rules', icon: 'fa-triangle-exclamation' },
  { id: 'groups', label: 'Metric Groups', icon: 'fa-layer-group' },
  { id: 'metrics', label: 'Metric Definitions', icon: 'fa-gauge-high' },
  { id: 'llm', label: 'LLM Keys', icon: 'fa-key' },
] as const;

type SettingsTab = typeof settingsTabs[number]['id'];

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('rules');
  const { isAdmin } = useAuth();

  const { data: rules = [] } = useAlertRules();
  const { data: groups = [] } = useMetricGroups();
  const { data: definitions = [] } = useMetricDefinitions();

  const createRule = useCreateAlertRule();
  const updateRule = useUpdateAlertRule();
  const deleteRule = useDeleteAlertRule();
  const createGroup = useCreateMetricGroup();
  const updateGroup = useUpdateMetricGroup();
  const deleteGroup = useDeleteMetricGroup();
  const addMember = useAddMetricGroupMember();
  const createMetric = useCreateMetricDefinition();

  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: '',
    group_id: '',
    metric_key: 'cpu_util',
    operator: '>',
    threshold: 85,
    duration_minutes: 0,
    severity: 'warning',
    message_template: '',
    is_enabled: true,
  });

  const [groupForm, setGroupForm] = useState({ name: '', description: '' });
  const [memberForm, setMemberForm] = useState({ group_id: '', metric_key: '' });
  const [metricForm, setMetricForm] = useState({ key: '', display_name: '', default_unit: '%', description: '' });

  const filteredRules = useMemo(() => rules, [rules]);

  const handleRuleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...ruleForm,
      group_id: ruleForm.group_id ? Number(ruleForm.group_id) : undefined,
      threshold: Number(ruleForm.threshold),
      duration_minutes: Number(ruleForm.duration_minutes),
    };
    if (editingRuleId) {
      await updateRule.mutateAsync({ id: editingRuleId, data: payload });
    } else {
      await createRule.mutateAsync(payload);
    }
    setEditingRuleId(null);
    setRuleForm({
      name: '',
      group_id: '',
      metric_key: 'cpu_util',
      operator: '>',
      threshold: 85,
      duration_minutes: 0,
      severity: 'warning',
      message_template: '',
      is_enabled: true,
    });
  };

  const startEdit = (rule: any) => {
    setEditingRuleId(rule.id);
    setRuleForm({
      name: rule.name,
      group_id: rule.group_id ? String(rule.group_id) : '',
      metric_key: rule.metric_key,
      operator: rule.operator,
      threshold: rule.threshold,
      duration_minutes: rule.duration_minutes || 0,
      severity: rule.severity,
      message_template: rule.message_template || '',
      is_enabled: rule.is_enabled,
    });
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Delete this rule?')) return;
    await deleteRule.mutateAsync(id);
    if (editingRuleId === id) {
      setEditingRuleId(null);
    }
  };

  const handleGroupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!groupForm.name) return;
    if (editingGroupId) {
      await updateGroup.mutateAsync({ id: editingGroupId, data: groupForm });
    } else {
      await createGroup.mutateAsync(groupForm);
    }
    setEditingGroupId(null);
    setGroupForm({ name: '', description: '' });
  };

  const startEditGroup = (group: any) => {
    setEditingGroupId(group.id);
    setGroupForm({ name: group.name, description: group.description || '' });
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm('Delete this group?')) return;
    await deleteGroup.mutateAsync(id);
    if (editingGroupId === id) {
      setEditingGroupId(null);
      setGroupForm({ name: '', description: '' });
    }
  };

  const handleMemberSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!memberForm.group_id || !memberForm.metric_key) return;
    await addMember.mutateAsync({ groupId: Number(memberForm.group_id), metric_key: memberForm.metric_key });
    setMemberForm({ group_id: '', metric_key: '' });
  };

  const handleMetricSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!metricForm.key || !metricForm.display_name) return;
    await createMetric.mutateAsync(metricForm);
    setMetricForm({ key: '', display_name: '', default_unit: '%', description: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Settings</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure alerting and monitoring rules.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {settingsTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white pill-shadow'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-brand-500'
              }`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Alert Rules</h3>
              <span className="text-xs font-bold text-slate-400">{filteredRules.length} rules</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredRules.map(rule => (
                <div key={rule.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{rule.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{rule.metric_key} {rule.operator} {rule.threshold}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-500 mt-1">{rule.severity}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(rule)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredRules.length === 0 && (
                <div className="p-12 text-center text-slate-400">No rules yet.</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">{editingRuleId ? 'Edit Rule' : 'Create Rule'}</h4>
            <form onSubmit={handleRuleSubmit} className="mt-4 space-y-3">
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Rule name" value={ruleForm.name} onChange={e => setRuleForm({ ...ruleForm, name: e.target.value })} required />
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" value={ruleForm.group_id} onChange={e => setRuleForm({ ...ruleForm, group_id: e.target.value })}>
                <option value="">Any Group</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" value={ruleForm.metric_key} onChange={e => setRuleForm({ ...ruleForm, metric_key: e.target.value })}>
                {definitions.map(m => (
                  <option key={m.key} value={m.key}>{m.key}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" value={ruleForm.operator} onChange={e => setRuleForm({ ...ruleForm, operator: e.target.value })}>
                  <option value=">">&gt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<">&lt;</option>
                  <option value="<=">&lt;=</option>
                </select>
                <input type="number" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" value={ruleForm.threshold} onChange={e => setRuleForm({ ...ruleForm, threshold: Number(e.target.value) })} />
              </div>
              <input type="number" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Duration (minutes)" value={ruleForm.duration_minutes} onChange={e => setRuleForm({ ...ruleForm, duration_minutes: Number(e.target.value) })} />
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" value={ruleForm.severity} onChange={e => setRuleForm({ ...ruleForm, severity: e.target.value })}>
                <option value="warning">warning</option>
                <option value="critical">critical</option>
              </select>
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Message template" value={ruleForm.message_template} onChange={e => setRuleForm({ ...ruleForm, message_template: e.target.value })} />
              <button type="submit" className="w-full px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow">
                {editingRuleId ? 'Update Rule' : 'Create Rule'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">
              {editingGroupId ? 'Edit Group' : 'Create Group'}
            </h4>
            <form onSubmit={handleGroupSubmit} className="mt-4 space-y-3">
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Group name" value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} required />
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Description" value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} />
              <button type="submit" className="w-full px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow">
                {editingGroupId ? 'Update Group' : 'Create Group'}
              </button>
            </form>
            <div className="mt-6 border-t border-slate-100 dark:border-white/5 pt-5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-400">Existing Groups</h5>
                <span className="text-[10px] font-bold text-slate-400">{groups.length} groups</span>
              </div>
              <div className="mt-4 space-y-2">
                {groups.map(group => (
                  <div key={group.id} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{group.name}</div>
                      {group.description && <div className="text-xs text-slate-400">{group.description}</div>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditGroup(group)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-white/10 text-slate-600 hover:text-brand-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-red-500/10 text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {groups.length === 0 && (
                  <div className="text-slate-400 text-sm">No groups yet.</div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Add Metrics to Group</h4>
            <form onSubmit={handleMemberSubmit} className="mt-4 space-y-3">
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" value={memberForm.group_id} onChange={e => setMemberForm({ ...memberForm, group_id: e.target.value })}>
                <option value="">Select group</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" value={memberForm.metric_key} onChange={e => setMemberForm({ ...memberForm, metric_key: e.target.value })}>
                <option value="">Select metric</option>
                {definitions.map(m => (
                  <option key={m.key} value={m.key}>{m.key}</option>
                ))}
              </select>
              <button type="submit" className="w-full px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow">Add Member</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Create Metric</h4>
            <form onSubmit={handleMetricSubmit} className="mt-4 space-y-3">
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Key (cpu_util)" value={metricForm.key} onChange={e => setMetricForm({ ...metricForm, key: e.target.value })} required />
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Display name" value={metricForm.display_name} onChange={e => setMetricForm({ ...metricForm, display_name: e.target.value })} required />
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Default unit (%)" value={metricForm.default_unit} onChange={e => setMetricForm({ ...metricForm, default_unit: e.target.value })} />
              <input className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm" placeholder="Description" value={metricForm.description} onChange={e => setMetricForm({ ...metricForm, description: e.target.value })} />
              <button type="submit" className="w-full px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow">Create Metric</button>
            </form>
          </div>
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Existing Metrics</h4>
            <div className="mt-4 space-y-2">
              {definitions.map(m => (
                <div key={m.key} className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">{m.display_name}</div>
                  <div className="text-xs text-slate-400">{m.key}  {m.default_unit || ''}</div>
                </div>
              ))}
              {definitions.length === 0 && (
                <div className="text-slate-400 text-sm">No metrics yet.</div>
              )}
            </div>
          </div>
        </div>
      )}


      {activeTab === 'llm' && (
        isAdmin ? (
          <LlmConfigPanel />
        ) : (
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm p-8 text-center text-slate-500">
            Admin access required to manage LLM keys.
          </div>
        )
      )}
    </div>
  );
}
