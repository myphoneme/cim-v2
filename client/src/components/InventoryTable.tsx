import { useState, Fragment } from 'react';
import { useEquipment } from '../hooks/useEquipment';

export default function InventoryTable() {
  const { data: inventory = [], isLoading } = useEquipment();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('All');
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filtered = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterArea === 'All' || item.area === filterArea;
    return matchesSearch && matchesFilter;
  });

  const areas = ['All', ...new Set(inventory.map(e => e.area))];

  return (
    <div className="bg-white dark:bg-[#111111] rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-10 border-b border-slate-100 dark:border-white/5 md:flex md:items-center md:justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="mb-8 md:mb-0">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Cloud Fleet Registry</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Operational Audit: {filtered.length} Nodes Identified</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500"></i>
            <input
              type="text"
              placeholder="Filter assets..."
              className="pl-14 pr-8 py-4 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-full focus:ring-2 focus:ring-brand-500 focus:outline-none w-full sm:w-80 text-sm font-bold transition-all text-slate-900 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border border-slate-200 dark:border-white/10 rounded-full px-8 py-4 bg-white dark:bg-[#0A0A0A] text-slate-700 dark:text-slate-300 font-black text-[10px] focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all uppercase tracking-widest cursor-pointer"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          >
            {areas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111111] text-slate-400 font-black uppercase text-[10px] tracking-[0.3em] border-b border-white/5">
            <tr>
              <th className="px-10 py-7">Node Specification</th>
              <th className="px-10 py-7">OEM Partner</th>
              <th className="px-10 py-7">Serial UID</th>
              <th className="px-10 py-7">SLA Status</th>
              <th className="px-10 py-7 text-center">Volume</th>
              <th className="px-10 py-7"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map(item => (
              <Fragment key={item.id}>
                <tr className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="font-black text-slate-900 dark:text-white text-lg tracking-tight uppercase">{item.name}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-500 mt-1">{item.area}</div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{item.vendor}</span>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">{item.model}</div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg text-slate-500 uppercase">PENDING</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${item.sop_status === 'Available' ? 'bg-emerald-500' : 'bg-brand-500'}`}></span>
                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">EXP: TBD</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className="text-xl font-black text-slate-900 dark:text-white">{item.quantity}</span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${expandedItem === item.id ? 'bg-brand-500 text-white pill-shadow rotate-180' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-brand-500'}`}
                    >
                      <i className="fa-solid fa-chevron-down text-xs"></i>
                    </button>
                  </td>
                </tr>
                {expandedItem === item.id && (
                  <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
                    <td colSpan={6} className="px-12 py-12 border-l-8 border-brand-500">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                        <div className="space-y-6">
                          <h4 className="font-black text-[10px] uppercase text-brand-500 tracking-[0.4em]">Vendor Support</h4>
                          <ul className="space-y-4">
                            <li className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                              <i className="fa-solid fa-envelope text-brand-500 w-5"></i>
                              {item.email || `tacsupport@${item.vendor.toLowerCase().replace(/\s+/g, '')}.net`}
                            </li>
                            <li className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                              <i className="fa-solid fa-phone text-brand-500 w-5"></i>
                              {item.phone || '1800 572 7729'}
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-6">
                          <h4 className="font-black text-[10px] uppercase text-brand-500 tracking-[0.4em]">Node Logic</h4>
                          <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-[1.5rem] border border-slate-100 dark:border-white/5 space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                              <span>Account</span>
                              <span className="text-slate-900 dark:text-white">{item.account_type || 'AUTO'}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                              <span>Security</span>
                              <span className={`${
                                item.security_level === 'CRITICAL' ? 'text-red-500' :
                                item.security_level === 'HIGH' ? 'text-amber-500' :
                                item.security_level === 'MEDIUM' ? 'text-blue-500' :
                                'text-brand-500'
                              }`}>{item.security_level || 'LOW'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-6">
                          <h4 className="font-black text-[10px] uppercase text-brand-500 tracking-[0.4em]">Operations</h4>
                          <button className="w-full py-4 bg-brand-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest pill-shadow transition-all active:scale-95 hover:bg-brand-600">
                            Access Control Terminal
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <div className="p-16 text-center text-slate-400 dark:text-slate-500">
          <i className="fa-solid fa-search text-4xl mb-4 block opacity-50"></i>
          No equipment found matching your criteria.
        </div>
      )}
    </div>
  );
}
