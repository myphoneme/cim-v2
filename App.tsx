
import React, { useState } from 'react';
import { NavigationTab, Equipment, ManualContent } from './types';
import { DC_EQUIPMENT } from './constants';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import ChatInterface from './components/ChatInterface';
import Library from './components/Library';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Dashboard);
  const [inventory, setInventory] = useState<Equipment[]>(DC_EQUIPMENT);

  const handleAddAsset = (item: Equipment) => {
    setInventory(prev => [...prev, item]);
  };

  const handleUpdateAsset = (item: Equipment) => {
    setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm('Are you sure you want to remove this asset?')) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleSaveManual = (assetId: string, manual: ManualContent) => {
    setInventory(prev => prev.map(item => 
      item.id === assetId ? { ...item, generatedManual: manual, sopStatus: 'Available' } : item
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case NavigationTab.Dashboard: return <Dashboard />;
      case NavigationTab.Inventory: return <InventoryTable inventory={inventory} />;
      case NavigationTab.Library: return <Library inventory={inventory} />;
      case NavigationTab.Assistant: return <ChatInterface inventory={inventory} />;
      case NavigationTab.Admin: return (
        <AdminPanel 
          inventory={inventory} 
          onAdd={handleAddAsset} 
          onUpdate={handleUpdateAsset} 
          onDelete={handleDeleteAsset}
          onSaveManual={handleSaveManual}
        />
      );
      default: return <Dashboard />;
    }
  };

  const menuItems = [
    { id: NavigationTab.Dashboard, label: 'Overview', icon: 'fa-gauge-high' },
    { id: NavigationTab.Inventory, label: 'Equipment List', icon: 'fa-server' },
    { id: NavigationTab.Library, label: 'SOP Library', icon: 'fa-book' },
    { id: NavigationTab.Assistant, label: 'AI Assistant', icon: 'fa-robot' },
    { id: NavigationTab.Admin, label: 'Admin Portal', icon: 'fa-user-gear' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col h-auto md:h-screen md:sticky md:top-0 z-10 shadow-xl">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-microchip text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-white font-black tracking-tight leading-none">DC-OPS</h1>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Control Center</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal pb-4 md:pb-0">
          <div className="flex md:block gap-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-all group font-medium ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center ${activeTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}></i>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-6 mt-auto hidden md:block border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
            <div>
              <p className="text-xs font-bold text-white">Senior Lead</p>
              <p className="text-[10px] text-slate-500">Admin Mode</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-hidden">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">
              {activeTab === 'assistant' ? 'Ops Conversational Assistant' : activeTab}
            </h2>
            <p className="text-slate-500 text-sm">24/7/365 Data Centre Operational Management</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
