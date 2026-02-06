import { useMemo, useState, Fragment } from 'react';
import { useDeviceItems, useLocations } from '../hooks/useAssets';
import { useVmItems } from '../hooks/useVms';
import type { DeviceCategory, DeviceItemListItem } from '../types';

const categories: { id: DeviceCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Devices', icon: 'fa-layer-group' },
  { id: 'Network', label: 'Network', icon: 'fa-network-wired' },
  { id: 'Compute', label: 'Compute', icon: 'fa-server' },
  { id: 'Storage', label: 'Storage', icon: 'fa-database' },
  { id: 'Security', label: 'Security', icon: 'fa-shield-halved' },
  { id: 'Backup', label: 'Backup', icon: 'fa-cloud-arrow-up' },
  { id: 'Virtual', label: 'Virtual Machines', icon: 'fa-desktop' },
];

export default function InfrastructureView() {
  // Fixed hook order
  const [activeCategory, setActiveCategory] = useState<DeviceCategory | 'all'>('all');
  const [selectedLocation, setSelectedLocation] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDerivedCategory, setSelectedDerivedCategory] = useState<'all' | 'Router' | 'Firewall' | 'Switch' | 'PoE Switch' | 'Virtual'>('all');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const { data: locations = [] } = useLocations();
  const { data: vmItems = [] } = useVmItems();
  const queryCategory = activeCategory !== 'all' && activeCategory !== 'Virtual' ? { category: activeCategory } : {};
  const { data: items = [], isLoading } = useDeviceItems({
    ...queryCategory,
    ...(selectedLocation !== 'all' && { location_id: selectedLocation }),
  });
  const { data: allItems = [], isLoading: isLoadingAll } = useDeviceItems();

  const locationIdByName = useMemo(() => {
    const map: Record<string, number> = {};
    locations.forEach(loc => { map[loc.name] = loc.id; });
    return map;
  }, [locations]);

  const deriveCategory = (item: DeviceItemListItem): 'Router' | 'Firewall' | 'Switch' | 'PoE Switch' | 'Virtual' => {
    if (item.category === 'Virtual') return 'Virtual';
    const source = `${item.hostname || ''} ${item.device_name}`.toLowerCase();
    if (source.includes('poe') || source.includes('poe-sw')) return 'PoE Switch';
    if (source.includes('-fw') || source.includes('firewall')) return 'Firewall';
    if (source.includes('-rtr') || source.includes('router')) return 'Router';
    return 'Switch';
  };

  const vmAll = useMemo(() => vmItems.map(vm => ({
    id: Number(vm.id) + 100000,
    device_name: vm.role || vm.name,
    hostname: vm.hostname || vm.name,
    ip_address: vm.ip_address,
    serial_number: '',
    category: 'Virtual' as DeviceCategory,
    model: vm.os,
    version: '',
    status: 'Active',
    location_name: locations.find(l => l.id === vm.location_id)?.name || 'Unassigned',
    equipment_name: `${vm.project || ''} ${vm.tier || ''}`.trim(),
  })), [vmItems, locations]);

  const gridData = useMemo(() => {
    const map: Record<string, Record<'Router' | 'Firewall' | 'Switch' | 'PoE Switch' | 'Virtual' | 'total', number>> = {};
    [...allItems, ...vmAll].forEach(item => {
      const loc = item.location_name || 'Unassigned';
      if (!map[loc]) {
        map[loc] = { Router: 0, Firewall: 0, Switch: 0, 'PoE Switch': 0, Virtual: 0, total: 0 };
      }
      const derived = deriveCategory(item as any);
      map[loc][derived] += 1;
      map[loc].total += 1;
    });
    return map;
  }, [allItems, vmAll]);

  const vmFiltered = vmAll.filter(vm => {
    const locMatch = selectedLocation === 'all' ? true : vm.location_name === locations.find(l => l.id === selectedLocation)?.name;
    const catMatch = activeCategory === 'all' || activeCategory === 'Virtual';
    return locMatch && catMatch;
  });

  const displayItems = useMemo(() => {
    if (activeCategory === 'Virtual') return vmFiltered;
    if (activeCategory === 'all') return [...items, ...vmFiltered];
    return items;
  }, [activeCategory, items, vmFiltered]);

  const filtered = displayItems.filter(item => {
    const matchesSearch =
      item.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.hostname?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.model?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesDerived =
      selectedDerivedCategory === 'all' ? true : deriveCategory(item) === selectedDerivedCategory;
    return matchesSearch && matchesDerived;
  });

  const getCategoryIcon = (category: DeviceCategory) => {
    const cat = categories.find(c => c.id === category);
    return cat?.icon || 'fa-cube';
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

  const categoryCounts = useMemo(() => {
    return [...allItems, ...vmAll].reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [allItems, vmAll]);

  const loading = isLoading || isLoadingAll;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white dark:bg-[#111111] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Infrastructure Grid</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Location-wise counts by category. Click counts to drill into the listing below.</p>
          </div>
          <button
            className="text-sm text-brand-500 font-bold"
            onClick={() => {
              setSelectedLocation('all');
              setSelectedDerivedCategory('all');
              setActiveCategory('all');
            }}
          >
            Reset filters
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-black">
                <tr>
                  <th className="px-6 py-3 text-left">Location</th>
                  <th className="px-6 py-3 text-center">Routers</th>
                  <th className="px-6 py-3 text-center">Firewalls</th>
                  <th className="px-6 py-3 text-center">Switches</th>
                  <th className="px-6 py-3 text-center">PoE Switches</th>
                  <th className="px-6 py-3 text-center">Virtual</th>
                  <th className="px-6 py-3 text-center">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {Object.keys(gridData).sort().map(loc => {
                  const counts = gridData[loc];
                  const renderCell = (label: 'Router' | 'Firewall' | 'Switch' | 'PoE Switch' | 'Virtual' | 'total', color: string) => (
                    <button
                      className={`w-full px-3 py-2 rounded-xl font-bold transition ${
                        counts[label] > 0
                          ? `${color} bg-opacity-10 hover:bg-opacity-20`
                          : 'text-slate-300 bg-slate-100 dark:bg-white/5 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (counts[label] === 0) return;
                        const targetLocId = locationIdByName[loc];
                        setSelectedLocation(targetLocId ?? 'all');
                        setActiveCategory('all');
                        setSelectedDerivedCategory(label === 'total' ? 'all' : label);
                        setSearchTerm('');
                      }}
                    >
                      {counts[label]}
                    </button>
                  );

                  return (
                    <tr key={loc} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">{loc}</td>
                      <td className="px-6 py-3 text-center">{renderCell('Router', 'text-blue-600')}</td>
                      <td className="px-6 py-3 text-center">{renderCell('Firewall', 'text-amber-600')}</td>
                      <td className="px-6 py-3 text-center">{renderCell('Switch', 'text-emerald-600')}</td>
                      <td className="px-6 py-3 text-center">{renderCell('PoE Switch', 'text-fuchsia-600')}</td>
                      <td className="px-6 py-3 text-center">{renderCell('Virtual', 'text-purple-600')}</td>
                      <td className="px-6 py-3 text-center">{renderCell('total', 'text-slate-900 dark:text-white')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {categories.map(cat => {
          const count = cat.id === 'all' ? displayItems.length : (categoryCounts[cat.id] || 0);
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-500 text-white pill-shadow scale-105'
                  : 'bg-white dark:bg-[#111111] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5 hover:border-brand-500'
              }`}
            >
              <i className={`fa-solid ${cat.icon}`}></i>
              <span>{cat.label}</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                activeCategory === cat.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-white/10 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-white/5 md:flex md:items-center md:justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              {activeCategory === 'all' ? 'All Infrastructure' : `${activeCategory} Devices`}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {filtered.length} devices registered
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <i className="fa-solid fa-location-dot absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="pl-12 pr-10 py-4 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-full focus:ring-2 focus:ring-brand-500 focus:outline-none w-full sm:w-52 text-sm font-bold transition-all text-slate-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
            </div>
            <div className="relative group">
              <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500"></i>
              <input
                type="text"
                placeholder="Search devices..."
                className="pl-14 pr-8 py-4 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-full focus:ring-2 focus:ring-brand-500 focus:outline-none w-full sm:w-80 text-sm font-bold transition-all text-slate-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111111] text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] border-b border-white/5">
              <tr>
                <th className="px-8 py-5">Device</th>
                <th className="px-8 py-5">IP / Hostname</th>
                <th className="px-8 py-5">Model / Version</th>
                <th className="px-8 py-5">Serial No</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map(item => (
                <Fragment key={item.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                          <i className={`fa-solid ${getCategoryIcon(item.category)} text-lg`}></i>
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-base">{item.device_name}</div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-brand-500 mt-1">{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-mono text-sm text-slate-700 dark:text-slate-300">{item.ip_address || '-'}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">{item.hostname || '-'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-slate-700 dark:text-slate-300 text-sm">{item.model || '-'}</div>
                      {item.version && <div className="text-[10px] text-slate-400 mt-1">{item.version}</div>}
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-slate-500 uppercase">
                        {item.serial_number || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {item.location_name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          expandedItem === item.id
                            ? 'bg-brand-500 text-white pill-shadow rotate-180'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-brand-500'
                        }`}
                      >
                        <i className="fa-solid fa-chevron-down text-xs"></i>
                      </button>
                    </td>
                  </tr>
                  {expandedItem === item.id && (
                    <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
                      <td colSpan={7} className="px-10 py-10 border-l-8 border-brand-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                          <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase text-brand-500 tracking-[0.4em]">Device Details</h4>
                            <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">Hostname</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{item.hostname || '-'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">IP Address</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{item.ip_address || '-'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">Serial No</span>
                                <span className="font-mono text-slate-700 dark:text-slate-300">{item.serial_number || '-'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase text-brand-500 tracking-[0.4em]">Model Info</h4>
                            <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">Model</span>
                                <span className="text-slate-700 dark:text-slate-300">{item.model || '-'}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">Version</span>
                                <span className="text-slate-700 dark:text-slate-300">{item.version || '-'}</span>
                              </div>
                              {item.equipment_name && (
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-400 font-bold">Equipment</span>
                                  <span className="text-brand-500">{item.equipment_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-black text-[10px] uppercase text-brand-500 tracking-[0.4em]">Status & Access</h4>
                            <div className="p-5 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">Status</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{item.status}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400 font-bold">Location</span>
                                <span className="text-slate-700 dark:text-slate-300">{item.location_name || 'Unassigned'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No infrastructure records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
