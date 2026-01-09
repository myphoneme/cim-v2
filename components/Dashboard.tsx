
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DC_EQUIPMENT } from '../constants';

const Dashboard: React.FC = () => {
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
