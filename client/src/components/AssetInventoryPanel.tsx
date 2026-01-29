import { useState, type FormEvent } from 'react';
import {
  useDeviceItems,
  useLocations,
  useCreateDeviceItem,
  useUpdateDeviceItem,
  useDeleteDeviceItem,
} from '../hooks/useAssets';
import { useEquipment } from '../hooks/useEquipment';
import type { DeviceCategory, DeviceItemListItem } from '../types';

interface FormData {
  device_name: string;
  hostname: string;
  ip_address: string;
  serial_number: string;
  category: DeviceCategory;
  equipment_id: string;
  model: string;
  version: string;
  location_id: string;
  username: string;
  password: string;
  description: string;
  rack_position: string;
  status: string;
}

const emptyForm: FormData = {
  device_name: '',
  hostname: '',
  ip_address: '',
  serial_number: '',
  category: 'Network',
  equipment_id: '',
  model: '',
  version: '',
  location_id: '',
  username: '',
  password: '',
  description: '',
  rack_position: '',
  status: 'Active',
};

const categories: DeviceCategory[] = ['Network', 'Compute', 'Storage', 'Security', 'Backup'];
const statuses = ['Active', 'Inactive', 'Maintenance', 'Decommissioned'];

export default function AssetInventoryPanel() {
  const [filterCategory, setFilterCategory] = useState<DeviceCategory | ''>('');
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [showPassword, setShowPassword] = useState<number | null>(null);

  const { data: items = [], isLoading } = useDeviceItems(
    filterCategory || filterLocation
      ? {
          category: filterCategory || undefined,
          location_id: filterLocation ? parseInt(filterLocation) : undefined,
        }
      : undefined
  );
  const { data: locations = [] } = useLocations();
  const { data: equipment = [] } = useEquipment();
  const createMutation = useCreateDeviceItem();
  const updateMutation = useUpdateDeviceItem();
  const deleteMutation = useDeleteDeviceItem();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleEdit = (item: DeviceItemListItem) => {
    setEditingId(item.id);
    setFormData({
      device_name: item.device_name,
      hostname: item.hostname || '',
      ip_address: item.ip_address || '',
      serial_number: item.serial_number || '',
      category: item.category,
      equipment_id: '',
      model: item.model || '',
      version: item.version || '',
      location_id: '',
      username: '',
      password: '',
      description: '',
      rack_position: '',
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      equipment_id: formData.equipment_id ? parseInt(formData.equipment_id) : undefined,
      location_id: formData.location_id ? parseInt(formData.location_id) : undefined,
    };

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this device?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getCategoryIcon = (category: DeviceCategory) => {
    switch (category) {
      case 'Network': return 'fa-network-wired';
      case 'Compute': return 'fa-server';
      case 'Storage': return 'fa-database';
      case 'Security': return 'fa-shield-halved';
      case 'Backup': return 'fa-cloud-arrow-up';
      default: return 'fa-cube';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500';
      case 'Inactive': return 'bg-slate-400';
      case 'Maintenance': return 'bg-amber-500';
      case 'Decommissioned': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-[#111111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Asset Inventory</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage infrastructure devices across all locations • {items.length} devices registered
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-brand-500 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center gap-2 pill-shadow"
        >
          <i className="fa-solid fa-plus"></i> Add Device
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          className="border border-slate-200 dark:border-white/10 rounded-full px-6 py-3 bg-white dark:bg-[#111111] text-slate-700 dark:text-slate-300 font-bold text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all cursor-pointer"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as DeviceCategory | '')}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          className="border border-slate-200 dark:border-white/10 rounded-full px-6 py-3 bg-white dark:bg-[#111111] text-slate-700 dark:text-slate-300 font-bold text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all cursor-pointer"
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111111] text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="px-6 py-5">Device</th>
                <th className="px-6 py-5">IP / Hostname</th>
                <th className="px-6 py-5">Model</th>
                <th className="px-6 py-5">Serial No</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Credentials</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                        <i className={`fa-solid ${getCategoryIcon(item.category)}`}></i>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{item.device_name}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-brand-500">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-mono text-sm text-slate-600 dark:text-slate-300">{item.ip_address || '-'}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">{item.hostname || '-'}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-slate-600 dark:text-slate-300 text-xs">{item.model || '-'}</div>
                    {item.version && <div className="text-[10px] text-slate-400 mt-1">{item.version}</div>}
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs bg-slate-100 dark:bg-white/5 px-2 py-1 rounded text-slate-500">
                      {item.serial_number || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      {item.location_name || 'Unassigned'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button
                      onClick={() => setShowPassword(showPassword === item.id ? null : item.id)}
                      className="text-xs text-slate-400 hover:text-brand-500 transition-colors"
                    >
                      <i className={`fa-solid ${showPassword === item.id ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-8 h-8 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center"
                        title="Edit"
                      >
                        <i className="fa-solid fa-pen-to-square text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center"
                        title="Delete"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && (
          <div className="p-16 text-center text-slate-400 dark:text-slate-500">
            <i className="fa-solid fa-server text-4xl mb-4 block opacity-50"></i>
            No devices found. Add your first device to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                  {editingId ? 'Edit Device' : 'Add New Device'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Enter device details below
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                    Device Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Core Router 1"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.device_name}
                    onChange={e => setFormData({ ...formData, device_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as DeviceCategory })}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                    Hostname
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., FSL-DC-PUN-COR-RTR-01"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
                    value={formData.hostname}
                    onChange={e => setFormData({ ...formData, hostname: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 10.0.11.11"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
                    value={formData.ip_address}
                    onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 957JL24"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
                    value={formData.serial_number}
                    onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                    Location
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.location_id}
                    onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Model Info */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-[10px] font-black uppercase text-brand-500 tracking-[0.3em] mb-4">Model Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                      Link to Equipment Master
                    </label>
                    <select
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.equipment_id}
                      onChange={e => setFormData({ ...formData, equipment_id: e.target.value })}
                    >
                      <option value="">Manual Entry</option>
                      {equipment.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.vendor} {eq.model} - {eq.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                      Model (Manual)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., iEdge 1000"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.model}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      disabled={!!formData.equipment_id}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                      Version / Firmware
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., InfinityOS 1.4"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.version}
                      onChange={e => setFormData({ ...formData, version: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                      Status
                    </label>
                    <select
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      {statuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                <h4 className="text-[10px] font-black uppercase text-brand-500 tracking-[0.3em] mb-4">Access Credentials</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., admin"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white font-mono"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest bg-brand-500 text-white hover:bg-brand-600 transition-all pill-shadow disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
