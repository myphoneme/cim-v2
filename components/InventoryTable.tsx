
import React, { useState } from 'react';
import { Equipment } from '../types';

interface InventoryTableProps {
  inventory: Equipment[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ inventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('All');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filtered = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterArea === 'All' || item.area === filterArea;
    return matchesSearch && matchesFilter;
  });

  const areas = ['All', ...new Set(inventory.map(e => e.area))];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <h2 className="text-xl font-bold text-slate-800">Assets Repository</h2>
        <div className="flex gap-3">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search equipment..." 
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none"
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          >
            {areas.map(area => <option key={area} value={area}>{area}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Equipment Name</th>
              <th className="px-6 py-4">Vendor</th>
              <th className="px-6 py-4">Model</th>
              <th className="px-6 py-4">Support & Warranty</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4">SOP</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(item => (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4">{item.vendor}</td>
                  <td className="px-6 py-4 font-mono text-xs">{item.model}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-800">{item.validity || 'Check Detail'}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{item.email || item.webSupport}</div>
                  </td>
                  <td className="px-6 py-4 text-center">{item.qty}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                      <i className="fa-solid fa-file-pdf"></i>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      <i className={`fa-solid ${expandedItem === item.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </button>
                  </td>
                </tr>
                {expandedItem === item.id && (
                  <tr className="bg-slate-50/50">
                    <td colSpan={7} className="px-8 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <h4 className="font-bold text-xs uppercase text-slate-400 mb-2 tracking-widest">OEM Support Info</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><i className="fa-solid fa-envelope w-4 text-blue-500"></i> {item.email || 'N/A'}</li>
                            <li className="flex items-center gap-2"><i className="fa-solid fa-phone w-4 text-blue-500"></i> {item.phone || 'N/A'}</li>
                            <li className="flex items-center gap-2">
                              <i className="fa-solid fa-globe w-4 text-blue-500"></i> 
                              {item.webSupport ? <a href={item.webSupport} target="_blank" className="text-blue-600 underline">Support Portal</a> : 'N/A'}
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs uppercase text-slate-400 mb-2 tracking-widest">Portal Access</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><i className="fa-solid fa-user w-4 text-amber-500"></i> User: {item.userName || 'Generic'}</li>
                            <li className="flex items-center gap-2"><i className="fa-solid fa-key w-4 text-amber-500"></i> OTP: {item.otpRequired || 'No'}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs uppercase text-slate-400 mb-2 tracking-widest">Warranty & Contacts</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2"><i className="fa-solid fa-calendar w-4 text-emerald-500"></i> Valid Till: {item.validity || 'N/A'}</li>
                            <li className="flex items-center gap-2"><i className="fa-solid fa-user-tie w-4 text-emerald-500"></i> {item.contactInfo || 'DC Lead'}</li>
                            <li className="flex items-center gap-2"><i className="fa-solid fa-mobile-screen w-4 text-emerald-500"></i> {item.contactNumber || 'N/A'}</li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No equipment found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;
