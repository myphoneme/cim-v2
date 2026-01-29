import { useState, useRef, useEffect, type FormEvent, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  useEquipment,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  useGenerateManual,
  useEquipmentById,
} from '../hooks/useEquipment';
import { useLocations, useDeviceItems, useCreateLocation, useCreateDeviceItemsBulk } from '../hooks/useAssets';
import { attachmentsApi } from '../api/equipment';
import type { DeviceArea, DocumentCategory, EquipmentListItem, Attachment, DeviceItemListItem, DeviceCategory, VirtualMachine } from '../types';
import AssetInventoryPanel from './AssetInventoryPanel';
import { VIRTUAL_MACHINES } from '../vms';

type AdminTab = 'equipment' | 'assets' | 'locations' | 'vms';

interface FormData {
  name: string;
  area: DeviceArea;
  type: string;
  vendor: string;
  model: string;
  serial_number: string;
  license_details: string;
  quantity: string;
  email: string;
  phone: string;
  account_type: string;
  security_level: string;
  web_support: string;
  validity: string;
  contact_number: string;
}

const emptyForm: FormData = {
  name: '',
  area: 'Network',
  type: '',
  vendor: '',
  model: '',
  serial_number: '',
  license_details: '',
  quantity: '1',
  email: '',
  phone: '',
  account_type: 'AUTO',
  security_level: 'LOW',
  web_support: '',
  validity: '',
  contact_number: '',
};

const documentCategories: { value: DocumentCategory; label: string }[] = [
  { value: 'implementation', label: 'Implementation / Deployment' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
  { value: 'maintenance', label: 'Maintenance' },
];

const emptyVm: VirtualMachine = {
  id: '',
  name: '',
  vendor: '',
  project: '',
  tier: '',
  ip_address: '',
  hostname: '',
  role: '',
  os: '',
  disk_primary: '',
  disk_secondary: '',
  memory_gb: '',
  host_ip: '',
  vcpu: '',
  location: 'Pune Data Center',
};

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const { data: inventory = [], isLoading } = useEquipment();
  const { data: locations = [] } = useLocations();
  const { data: deviceItems = [] } = useDeviceItems();
  const createLocation = useCreateLocation();
  const createDeviceBulk = useCreateDeviceItemsBulk();
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();
  const generateManualMutation = useGenerateManual();

  const [activeTab, setActiveTab] = useState<AdminTab>('equipment');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | 'all'>('all');
  const [newLocation, setNewLocation] = useState({ name: '', code: '', type: 'BR', address: '', is_primary: false });
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState<DeviceCategory>('Network');
  const [bulkLocationId, setBulkLocationId] = useState<number | ''>('');
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [vmSearch, setVmSearch] = useState('');
  const [vmData, setVmData] = useState<VirtualMachine[]>(VIRTUAL_MACHINES);
  const [vmModalOpen, setVmModalOpen] = useState(false);
  const [vmForm, setVmForm] = useState<VirtualMachine>(emptyVm);
  const [vmEditingId, setVmEditingId] = useState<string | number | null>(null);

  // Document management state
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('implementation');
  const [urlInput, setUrlInput] = useState({ name: '', url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: selectedEquipment, refetch: refetchEquipment } = useEquipmentById(selectedEquipmentId || 0);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fa-solid fa-lock text-4xl text-slate-300 dark:text-slate-600 mb-4"></i>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Admin Access Required</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">You need administrator privileges to access this section.</p>
        </div>
      </div>
    );
  }

  // Admin Tabs
  const adminTabs = [
    { id: 'equipment' as AdminTab, label: 'Equipment Master', icon: 'fa-boxes-stacked' },
    { id: 'assets' as AdminTab, label: 'Asset Inventory', icon: 'fa-server' },
    { id: 'locations' as AdminTab, label: 'Locations & Items', icon: 'fa-location-dot' },
    { id: 'vms' as AdminTab, label: 'Virtual Machines', icon: 'fa-desktop' },
  ];

  const renderTabs = () => (
    <div className="flex gap-2 bg-white dark:bg-[#111111] p-2 rounded-full border border-slate-200 dark:border-white/5 w-fit">
      {adminTabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
            activeTab === tab.id
              ? 'bg-brand-500 text-white pill-shadow'
              : 'text-slate-400 hover:text-brand-500'
          }`}
        >
          <i className={`fa-solid ${tab.icon}`}></i>
          {tab.label}
        </button>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const locationCounts = useMemo(() => {
    const map: Record<number, { name: string; code: string; count: number; routers: number; firewalls: number; switches: number; poe: number }> = {};
    locations.forEach(loc => {
      map[loc.id] = { name: loc.name, code: loc.code, count: 0, routers: 0, firewalls: 0, switches: 0, poe: 0 };
    });
    deviceItems.forEach((item: DeviceItemListItem) => {
      const loc = locations.find(l => l.name === item.location_name || l.code === item.location_name);
      if (!loc || !map[loc.id]) return;
      map[loc.id].count += 1;
      const host = (item.hostname || '').toLowerCase();
      if (host.includes('rtr')) map[loc.id].routers += 1;
      else if (host.includes('fw')) map[loc.id].firewalls += 1;
      else if (host.includes('poe')) map[loc.id].poe += 1;
      else map[loc.id].switches += 1;
    });
    return map;
  }, [deviceItems, locations]);

  const filteredDevices = useMemo(() => {
    if (selectedLocationId === 'all') return deviceItems;
    const target = locations.find(l => l.id === selectedLocationId);
    return deviceItems.filter(d => d.location_name === target?.name || d.location_name === target?.code);
  }, [selectedLocationId, deviceItems, locations]);

  const filteredVms = useMemo(() => {
    const term = vmSearch.toLowerCase();
    return vmData.filter((vm: VirtualMachine) =>
      vm.name.toLowerCase().includes(term) ||
      vm.hostname.toLowerCase().includes(term) ||
      vm.ip_address.toLowerCase().includes(term) ||
      vm.project.toLowerCase().includes(term) ||
      vm.role.toLowerCase().includes(term)
    );
  }, [vmSearch, vmData]);

  const handleEdit = (item: EquipmentListItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      area: item.area,
      type: item.type,
      vendor: item.vendor,
      model: item.model,
      serial_number: '',
      license_details: '',
      quantity: item.quantity,
      email: item.email || '',
      phone: item.phone || '',
      account_type: item.account_type || 'AUTO',
      security_level: item.security_level || 'LOW',
      web_support: '',
      validity: '',
      contact_number: '',
    });
    setIsModalOpen(true);
  };

  const handleCreateLocation = async (e: FormEvent) => {
    e.preventDefault();
    if (!newLocation.name || !newLocation.code) return;
    setIsCreatingLocation(true);
    try {
      await createLocation.mutateAsync({
        name: newLocation.name,
        code: newLocation.code,
        type: newLocation.type as 'DC' | 'BR' | 'DR',
        address: newLocation.address,
        is_primary: newLocation.is_primary,
        is_active: true,
      });
      setNewLocation({ name: '', code: '', type: 'BR', address: '', is_primary: false });
    } finally {
      setIsCreatingLocation(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('vmData');
    if (saved) {
      try {
        setVmData(JSON.parse(saved));
      } catch {
        setVmData(VIRTUAL_MACHINES);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('vmData', JSON.stringify(vmData));
  }, [vmData]);

  const parseBulkLines = () => {
    const lines = bulkText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];

    const splitLine = (line: string) => line.split(/\s+/).filter(Boolean);
    const headerParts = splitLine(lines[0]).map(h => h.toLowerCase());
    const knownHeaders = ['hostname', 'ip', 'ip_address', 'device_name', 'name', 'description', 'status', 'node', 'category'];
    const hasHeader = headerParts.some(h => knownHeaders.includes(h) || h === 'ip') && headerParts.length > 2;
    const headerMap: Record<string, number> = {};

    if (hasHeader) {
      headerParts.forEach((h, idx) => {
        headerMap[h] = idx;
      });
    }

    const dataLines = hasHeader ? lines.slice(1) : lines;

    const rows = dataLines.map(line => {
      const parts = splitLine(line);
      const getVal = (keys: string[]) => {
        for (const key of keys) {
          if (headerMap[key] !== undefined && parts[headerMap[key]]) return parts[headerMap[key]];
        }
        return '';
      };

      let hostname = hasHeader ? (getVal(['hostname', 'node', 'name']) || '') : '';
      let ip = hasHeader ? (getVal(['ip', 'ip_address']) || '') : '';
      let desc = hasHeader ? (getVal(['device_name', 'name', 'description', 'category']) || '') : '';
      const status = hasHeader ? getVal(['status']) : '';

      const looksNumeric = (val: string) => /^\d+$/.test(val);
      const looksIp = (val: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(val);

      if (!hostname) {
        let tokens = parts;
        if (looksNumeric(tokens[0])) {
          tokens = tokens.slice(1);
        }
        hostname = tokens[0] || '';
        if (tokens[1] && looksIp(tokens[1])) {
          ip = tokens[1];
          desc = tokens.slice(2).join(' ');
        } else {
          desc = tokens.slice(1).join(' ');
        }
      }

      if (!ip && parts[1] && looksIp(parts[1])) {
        ip = parts[1];
      }
      desc = desc || hostname;

      return {
        hostname,
        ip_address: ip,
        device_name: desc,
        status: (['active', 'inactive', 'maintenance', 'decommissioned'].includes(status.toLowerCase()) ? status : 'Active') as 'Active' | 'Inactive' | 'Maintenance' | 'Decommissioned',
      };
    });

    return rows;
  };

  const handleBulkSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBulkError(null);
    setBulkSuccess(null);
    if (!bulkLocationId) {
      setBulkError('Select a location.');
      return;
    }
    const rows = parseBulkLines();
    if (!rows.length) {
      setBulkError('Paste at least one line.');
      return;
    }
    setIsBulkSaving(true);
    try {
      const payload = rows.map(r => ({
        location_id: bulkLocationId,
        category: bulkCategory,
        hostname: r.hostname,
        ip_address: r.ip_address,
        device_name: r.device_name,
        status: 'Active' as const,
      }));
      await createDeviceBulk.mutateAsync(payload);
      setBulkSuccess(`Uploaded ${payload.length} devices.`);
      setBulkText('');
    } catch (err: any) {
      setBulkError(err?.message || 'Bulk upload failed');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to remove this asset?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleGenerateManual = async (id: number) => {
    setGeneratingId(id);
    try {
      await generateManualMutation.mutateAsync(id);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleVmEdit = (vm: VirtualMachine) => {
    setVmEditingId(vm.id);
    setVmForm(vm);
    setVmModalOpen(true);
  };

  const handleVmAdd = () => {
    setVmEditingId(null);
    setVmForm({ ...emptyVm, id: Date.now().toString() });
    setVmModalOpen(true);
  };

  const handleVmDelete = (id: string | number) => {
    if (confirm('Delete this virtual machine?')) {
      setVmData(prev => prev.filter(vm => vm.id !== id));
    }
  };

  const handleVmSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (vmEditingId) {
      setVmData(prev => prev.map(vm => vm.id === vmEditingId ? vmForm : vm));
    } else {
      setVmData(prev => [...prev, vmForm]);
    }
    setVmModalOpen(false);
  };

  const handleOpenDocs = (equipmentId: number) => {
    setSelectedEquipmentId(equipmentId);
    setDocsModalOpen(true);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !selectedEquipmentId) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        let fileType = 'pdf';
        if (['doc', 'docx'].includes(ext)) fileType = 'docx';
        else if (['mp4', 'webm', 'mov'].includes(ext)) fileType = 'video';

        await attachmentsApi.upload({
          equipmentId: selectedEquipmentId,
          file,
          fileType,
          documentCategory: uploadCategory,
        });
      }
      await refetchEquipment();
      setUploadModalOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (activeTab === 'assets') {
    return (
      <div className="space-y-6 animate-fade-in">
        {renderTabs()}
        <AssetInventoryPanel />
      </div>
    );
  }

  if (activeTab === 'locations') {
    return (
      <div className="space-y-6 animate-fade-in">
        {renderTabs()}
        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Locations & Item Registry</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Choose a site to view its devices.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedLocationId('all')}
                className={`px-4 py-2 rounded-xl text-sm font-bold ${
                  selectedLocationId === 'all' ? 'bg-brand-500 text-white pill-shadow' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Locations
              </button>
              <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-white">
                {filteredDevices.length} items
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateLocation} className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10">
            <input
              required
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
              placeholder="Location name"
              value={newLocation.name}
              onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
            />
            <input
              required
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
              placeholder="Code (e.g. THA-BR)"
              value={newLocation.code}
              onChange={e => setNewLocation({ ...newLocation, code: e.target.value })}
            />
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
              value={newLocation.type}
              onChange={e => setNewLocation({ ...newLocation, type: e.target.value })}
            >
              <option value="DC">DC</option>
              <option value="BR">Branch</option>
              <option value="DR">DR</option>
            </select>
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
              placeholder="Address (optional)"
              value={newLocation.address}
              onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
            />
            <button
              type="submit"
              disabled={isCreatingLocation}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 text-white pill-shadow disabled:opacity-50"
            >
              {isCreatingLocation ? 'Saving…' : 'Add Location'}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {locations.map(loc => {
              const stats = locationCounts[loc.id] || { count: 0, routers: 0, firewalls: 0, switches: 0, poe: 0 };
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocationId(loc.id)}
                  className={`text-left bg-white dark:bg-[#0A0A0A] border rounded-2xl p-5 shadow-sm hover:shadow-md transition ${
                    selectedLocationId === loc.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Location</p>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">{loc.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{loc.code}</p>
                    </div>
                    <span className="text-sm font-bold bg-brand-50 text-brand-600 px-3 py-1 rounded-full">{stats.count} items</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Routers: {stats.routers}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span> Firewalls: {stats.firewalls}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Switches: {stats.switches}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-fuchsia-500 rounded-full"></span> PoE: {stats.poe}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Hostname</th>
                  <th className="px-6 py-4">IP</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredDevices.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{item.hostname || item.device_name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{item.ip_address || '—'}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{item.status}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{item.location_name || 'Unassigned'}</td>
                  </tr>
                ))}
                {filteredDevices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
            <h4 className="text-lg font-black text-slate-900 dark:text-white mb-4">Bulk Upload (TXT)</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select location and category, then paste lines (hostname IP description...).</p>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  required
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                  value={bulkLocationId}
                  onChange={e => setBulkLocationId(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                  value={bulkCategory}
                  onChange={e => setBulkCategory(e.target.value as DeviceCategory)}
                >
                  <option value="Network">Network</option>
                  <option value="Security">Security</option>
                  <option value="Compute">Compute</option>
                  <option value="Storage">Storage</option>
                  <option value="Backup">Backup</option>
                </select>
              </div>
              <textarea
                className="w-full min-h-[160px] px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm font-mono"
                placeholder="FSL-BR-THA-COR-RTR-01    10.4.21.11    Thane - Primary Router"
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isBulkSaving}
                  className="px-5 py-2 rounded-xl bg-brand-500 text-white font-bold text-sm pill-shadow disabled:opacity-50"
                >
                  {isBulkSaving ? 'Uploading…' : 'Upload Devices'}
                </button>
                {bulkSuccess && <span className="text-emerald-600 text-sm font-semibold">{bulkSuccess}</span>}
                {bulkError && <span className="text-red-600 text-sm font-semibold">{bulkError}</span>}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === 'vms') {
    return (
      <div className="space-y-6 animate-fade-in">
        {renderTabs()}
        <div className="bg-white dark:bg-[#111111] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Virtual Machines</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Pune DC virtual estate with app, DB, and management tiers.</p>
            </div>
            <div className="relative w-full md:w-80">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-sm"
                placeholder="Search hostname, IP, role..."
                value={vmSearch}
                onChange={e => setVmSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleVmAdd}
              className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-sm pill-shadow"
            >
              <i className="fa-solid fa-plus mr-2"></i>Add VM
            </button>
          </div>

          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">VM Name</th>
                  <th className="px-6 py-4">Role / Tier</th>
                  <th className="px-6 py-4">IP</th>
                  <th className="px-6 py-4">Hostname</th>
                  <th className="px-6 py-4">OS</th>
                  <th className="px-6 py-4">Disks</th>
                  <th className="px-6 py-4">RAM</th>
                  <th className="px-6 py-4">vCPU</th>
                  <th className="px-6 py-4">Host IP</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredVms.map(vm => (
                  <tr key={vm.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {vm.name}
                      <div className="text-[10px] uppercase text-slate-500 font-black mt-1">{vm.vendor} • {vm.project}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{vm.role}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{vm.tier}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{vm.ip_address}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{vm.hostname}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{vm.os}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      <div>{vm.disk_primary}</div>
                      {vm.disk_secondary && <div className="text-[11px] text-slate-500">+ {vm.disk_secondary}</div>}
                    </td>
                    <td className="px-6 py-4">{vm.memory_gb || '—'}</td>
                    <td className="px-6 py-4">{vm.vcpu || '—'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{vm.host_ip || '—'}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleVmEdit(vm)} className="text-slate-400 hover:text-brand-500">
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button onClick={() => handleVmDelete(vm.id)} className="text-slate-400 hover:text-red-500">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredVms.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-8 text-center text-slate-400">No virtual machines match this search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {vmModalOpen && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">{vmEditingId ? 'Edit Virtual Machine' : 'Add Virtual Machine'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Update VM metadata for visibility.</p>
                  </div>
                  <button onClick={() => setVmModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                </div>
                <form onSubmit={handleVmSubmit} className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Name</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.name} onChange={e => setVmForm({ ...vmForm, name: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Hostname</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.hostname} onChange={e => setVmForm({ ...vmForm, hostname: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Vendor</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.vendor} onChange={e => setVmForm({ ...vmForm, vendor: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Project</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.project} onChange={e => setVmForm({ ...vmForm, project: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Tier</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.tier} onChange={e => setVmForm({ ...vmForm, tier: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">IP Address</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.ip_address} onChange={e => setVmForm({ ...vmForm, ip_address: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Host IP</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.host_ip} onChange={e => setVmForm({ ...vmForm, host_ip: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Role</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.role} onChange={e => setVmForm({ ...vmForm, role: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Operating System</label>
                      <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.os} onChange={e => setVmForm({ ...vmForm, os: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Disk (Primary)</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.disk_primary} onChange={e => setVmForm({ ...vmForm, disk_primary: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Disk (Secondary)</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.disk_secondary || ''} onChange={e => setVmForm({ ...vmForm, disk_secondary: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">RAM (GB)</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.memory_gb} onChange={e => setVmForm({ ...vmForm, memory_gb: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">vCPU</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.vcpu} onChange={e => setVmForm({ ...vmForm, vcpu: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Location</label>
                        <input className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111111] px-3 py-2 text-sm" value={vmForm.location || ''} onChange={e => setVmForm({ ...vmForm, location: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setVmModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold text-sm">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-brand-500 text-white font-bold text-sm pill-shadow">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleAddUrl = async () => {
    if (!selectedEquipmentId || !urlInput.name || !urlInput.url) return;

    setIsUploading(true);
    try {
      const isYouTube = urlInput.url.includes('youtube.com') || urlInput.url.includes('youtu.be');
      await attachmentsApi.addUrl({
        equipmentId: selectedEquipmentId,
        name: urlInput.name,
        url: urlInput.url,
        fileType: isYouTube ? 'youtube' : 'web',
        documentCategory: uploadCategory,
      });
      await refetchEquipment();
      setUrlModalOpen(false);
      setUrlInput({ name: '', url: '' });
    } catch (error) {
      console.error('Add URL failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (confirm('Delete this document?')) {
      try {
        await attachmentsApi.delete(attachmentId);
        await refetchEquipment();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'fa-file-pdf text-red-500';
      case 'docx': return 'fa-file-word text-blue-500';
      case 'video': return 'fa-file-video text-purple-500';
      case 'youtube': return 'fa-brands fa-youtube text-red-600';
      case 'web': return 'fa-globe text-blue-500';
      default: return 'fa-file text-slate-400';
    }
  };

  const getCategoryBadge = (category: DocumentCategory) => {
    const colors: Record<DocumentCategory, string> = {
      implementation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      tutorial: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      troubleshooting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      maintenance: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    const labels: Record<DocumentCategory, string> = {
      implementation: 'Implementation',
      tutorial: 'Tutorial',
      troubleshooting: 'Troubleshooting',
      maintenance: 'Maintenance',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${colors[category]}`}>
        {labels[category]}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex gap-2 bg-white dark:bg-[#111111] p-2 rounded-full border border-slate-200 dark:border-white/5 w-fit">
        {adminTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-brand-500 text-white pill-shadow'
                : 'text-slate-400 hover:text-brand-500'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-[#111111] p-8 rounded-[2rem] border border-slate-200 dark:border-white/5">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Equipment Master List</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage equipment types and upload training documentation.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-brand-500 text-white px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center gap-2 pill-shadow"
        >
          <i className="fa-solid fa-plus"></i> Add Equipment
        </button>
      </div>

      {/* Equipment Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-5">Equipment & Area</th>
              <th className="px-6 py-5">OEM / Model</th>
              <th className="px-6 py-5">Qty</th>
              <th className="px-6 py-5">Documents</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                  <div className="text-[10px] font-bold text-brand-500 uppercase mt-0.5">{item.area}</div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-slate-600 dark:text-slate-300 font-medium">{item.vendor}</div>
                  <div className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded inline-block text-slate-500 dark:text-slate-400 mt-1">
                    {item.model}
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-600 dark:text-slate-300">{item.quantity}</td>
                <td className="px-6 py-5">
                  <button
                    onClick={() => handleOpenDocs(item.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-all group"
                  >
                    <i className="fa-solid fa-folder-open text-slate-400 group-hover:text-brand-500"></i>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-brand-600">
                      {item.doc_count + item.video_count > 0 ? (
                        <>{item.doc_count} docs, {item.video_count} videos</>
                      ) : (
                        'Upload'
                      )}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleGenerateManual(item.id)}
                      disabled={generatingId === item.id}
                      className="w-9 h-9 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-400 hover:text-brand-500 transition-all flex items-center justify-center disabled:opacity-50"
                      title="Generate AI SOP"
                    >
                      {generatingId === item.id ? (
                        <i className="fa-solid fa-spinner animate-spin"></i>
                      ) : (
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-9 h-9 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center"
                      title="Edit Equipment"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-9 h-9 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center"
                      title="Delete Equipment"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingId ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  Fill in the equipment details below.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Asset Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Functional Area
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: e.target.value as DeviceArea })}
                  >
                    <option value="Network">Network</option>
                    <option value="Security">Security</option>
                    <option value="Comput">Compute</option>
                    <option value="Software">Software</option>
                    <option value="Application">Application</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Vendor
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Model
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Type
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Quantity
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </div>
              </div>

              {/* Vendor Support Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-black uppercase text-brand-500 tracking-[0.3em] mb-4">Vendor Support</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      placeholder="tacsupport@vendor.com"
                      className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                      Support Phone
                    </label>
                    <input
                      type="text"
                      placeholder="1800 572 7729"
                      className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Node Logic Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <h4 className="text-xs font-black uppercase text-brand-500 tracking-[0.3em] mb-4">Node Logic</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                      Account Type
                    </label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.account_type}
                      onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                    >
                      <option value="AUTO">AUTO</option>
                      <option value="MANUAL">MANUAL</option>
                      <option value="HYBRID">HYBRID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                      Security Level
                    </label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-brand-500 outline-none transition-all text-slate-900 dark:text-white"
                      value={formData.security_level}
                      onChange={e => setFormData({ ...formData, security_level: e.target.value })}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-8 py-3 rounded-xl font-bold bg-brand-500 text-white hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {docsModalOpen && selectedEquipment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedEquipment.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {selectedEquipment.vendor} {selectedEquipment.model} • Manage training documents
                </p>
              </div>
              <button
                onClick={() => setDocsModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            {/* Upload Buttons */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex gap-4">
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex-1 bg-slate-900 dark:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-slate-600 transition-all"
              >
                <i className="fa-solid fa-cloud-arrow-up text-blue-400"></i>
                Upload Files
              </button>
              <button
                onClick={() => setUrlModalOpen(true)}
                className="flex-1 bg-slate-900 dark:bg-slate-700 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 dark:hover:bg-slate-600 transition-all"
              >
                <i className="fa-solid fa-link text-blue-400"></i>
                <i className="fa-brands fa-youtube text-red-500"></i>
                Web / YouTube
              </button>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto">
              {selectedEquipment.attachments && selectedEquipment.attachments.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {selectedEquipment.attachments.map((attachment: Attachment) => (
                    <div key={attachment.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                          <i className={`fa-solid ${getFileIcon(attachment.type)} text-lg`}></i>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{attachment.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {getCategoryBadge(attachment.document_category)}
                            <span className="text-xs text-slate-400">
                              {new Date(attachment.upload_date).toLocaleDateString()}
                            </span>
                            {!attachment.is_published && (
                              <span className="text-xs text-red-500 font-bold">Unpublished</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAttachment(attachment.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <i className="fa-solid fa-folder-open text-4xl text-slate-300 dark:text-slate-600 mb-4"></i>
                  <h4 className="font-bold text-slate-800 dark:text-white">No Documents Yet</h4>
                  <p className="text-slate-400 text-sm mt-2">
                    Upload files or add links to create training materials.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Files Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload Files</h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Document Category
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-orange-500 outline-none transition-all text-slate-900 dark:text-white"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                >
                  {documentCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div
                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center cursor-pointer hover:border-brand-500 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-slate-300 dark:text-slate-600 mb-4"></i>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  Click to select files
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  PDF, Word, Video files supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.mp4,.webm,.mov"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              {isUploading && (
                <div className="flex items-center justify-center gap-3 text-brand-500">
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  <span className="font-medium">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* URL Modal */}
      {urlModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Web / YouTube Link</h3>
              <button
                onClick={() => setUrlModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-all flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Document Category
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-orange-500 outline-none transition-all text-slate-900 dark:text-white"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                >
                  {documentCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Title / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Quick Setup Tutorial"
                  className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-orange-500 outline-none transition-all text-slate-900 dark:text-white"
                  value={urlInput.name}
                  onChange={(e) => setUrlInput({ ...urlInput, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or https://..."
                  className="w-full bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-3 text-sm focus:border-orange-500 outline-none transition-all text-slate-900 dark:text-white"
                  value={urlInput.url}
                  onChange={(e) => setUrlInput({ ...urlInput, url: e.target.value })}
                />
              </div>

              <button
                onClick={handleAddUrl}
                disabled={isUploading || !urlInput.name || !urlInput.url}
                className="w-full bg-brand-500 text-white py-3 rounded-xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50"
              >
                {isUploading ? 'Adding...' : 'Add Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
