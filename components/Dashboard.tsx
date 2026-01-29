
import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DC_EQUIPMENT, INFRA_ITEMS } from '../constants';
import { InfrastructureCategory } from '../types';

const Dashboard: React.FC = () => {
  const infraCategories: InfrastructureCategory[] = ['Router', 'Firewall', 'Switch', 'PoE Switch'];
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<InfrastructureCategory | 'All' | null>(null);

  const areaCounts = DC_EQUIPMENT.reduce((acc: any, item) => {
    acc[item.area] = (acc[item.area] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(areaCounts).map(key => ({
    name: key,
    value: areaCounts[key]
  }));

  const vendorCounts = DC_EQUIPMENT.reduce((acc: any, item) => {
    acc[item.vendor] = (acc[item.vendor] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(vendorCounts).map(key => ({
    name: key,
    count: vendorCounts[key]
  })).sort((a, b) => b.count - a.count).slice(0, 8);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const locationBreakdown = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    INFRA_ITEMS.forEach(item => {
      if (!map[item.location]) {
        map[item.location] = {};
      }
      map[item.location][item.category] = (map[item.location][item.category] || 0) + 1;
      map[item.location].total = (map[item.location].total || 0) + 1;
    });
    return map;
  }, []);

  const sortedLocations = useMemo(
    () => Object.keys(locationBreakdown).sort(),
    [locationBreakdown]
  );

  const filteredInfra = useMemo(() => {
    if (!selectedLocation) return [];
    return INFRA_ITEMS.filter(item =>
      item.location === selectedLocation &&
      (selectedCategory === 'All' || selectedCategory === null || item.category === selectedCategory)
    );
  }, [selectedLocation, selectedCategory]);

  const handleCellClick = (location: string, category: InfrastructureCategory | 'All', count: number) => {
    if (count === 0) return;
    setSelectedLocation(location);
    setSelectedCategory(category);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Total Assets</p>
          <h3 className="text-3xl font-bold text-slate-900">{DC_EQUIPMENT.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Network Devices</p>
          <h3 className="text-3xl font-bold text-blue-600">{areaCounts['Network'] || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Security Nodes</p>
          <h3 className="text-3xl font-bold text-emerald-600">{areaCounts['Security'] || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm font-medium">L1/L2 Readiness</p>
          <h3 className="text-3xl font-bold text-amber-600">92%</h3>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h4 className="text-lg font-semibold text-slate-800">Infrastructure by Location & Category</h4>
          <p className="text-sm text-slate-500">Click counts to drill into the live listing.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-3 py-2 text-left">Location</th>
                {infraCategories.map(cat => (
                  <th key={cat} className="px-3 py-2 text-center">{cat}</th>
                ))}
                <th className="px-3 py-2 text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedLocations.map(location => {
                const counts = locationBreakdown[location] || {};
                const rowTotal = counts.total || 0;
                return (
                  <tr key={location} className="hover:bg-slate-50 transition-colors">
                    <th className="px-3 py-2 text-left font-semibold text-slate-900">{location}</th>
                    {infraCategories.map(cat => {
                      const count = counts[cat] || 0;
                      return (
                        <td key={`${location}-${cat}`} className="px-3 py-2 text-center">
                          <button
                            className={`px-2 py-1 rounded-md text-sm font-semibold transition ${
                              count
                                ? 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                                : 'text-slate-300 bg-slate-100 cursor-not-allowed'
                            }`}
                            onClick={() => handleCellClick(location, cat, count)}
                          >
                            {count}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      <button
                        className={`px-2 py-1 rounded-md text-sm font-semibold transition ${
                          rowTotal
                            ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            : 'text-slate-300 bg-slate-100 cursor-not-allowed'
                        }`}
                        onClick={() => handleCellClick(location, 'All', rowTotal)}
                      >
                        {rowTotal}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedLocation && (
          <div className="mt-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-500">Current listing</p>
                <p className="font-semibold text-slate-800">
                  {selectedLocation} — {selectedCategory || 'All'} ({filteredInfra.length})
                </p>
              </div>
              <button
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  setSelectedLocation(null);
                  setSelectedCategory(null);
                }}
              >
                Clear
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Hostname</th>
                    <th className="px-3 py-2 text-left">IP Address</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredInfra.map(item => (
                    <tr key={item.id} className="bg-white">
                      <td className="px-3 py-2 font-semibold text-slate-900">{item.hostname}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-600">{item.ipAddress || '—'}</td>
                      <td className="px-3 py-2">{item.category}</td>
                      <td className="px-3 py-2 text-slate-600">{item.description}</td>
                    </tr>
                  ))}
                  {filteredInfra.length === 0 && (
                    <tr>
                      <td className="px-3 py-6 text-center text-slate-400" colSpan={4}>
                        No items found for this selection.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-4 text-slate-800">Equipment by Domain</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h4 className="text-lg font-semibold mb-4 text-slate-800">Top OEM Vendors</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
