import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { NavigationTab } from './types';
import Dashboard from './components/Dashboard';
import InfrastructureView from './components/InfrastructureView';
import Library from './components/Library';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';
import LoginForm from './components/LoginForm';

function App() {
  const { user, isLoading, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<NavigationTab>(NavigationTab.Dashboard);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-brand-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const menuItems = [
    { id: NavigationTab.Dashboard, label: 'Overview', icon: 'fa-chart-pie' },
    { id: NavigationTab.Inventory, label: 'Infrastructure', icon: 'fa-server' },
    { id: NavigationTab.Library, label: 'Ops Library', icon: 'fa-book-bookmark' },
    { id: NavigationTab.Assistant, label: 'AI Assistant', icon: 'fa-bolt-lightning' },
    { id: NavigationTab.Admin, label: 'Admin Hub', icon: 'fa-gear' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case NavigationTab.Dashboard:
        return <Dashboard />;
      case NavigationTab.Inventory:
        return <InfrastructureView />;
      case NavigationTab.Library:
        return <Library />;
      case NavigationTab.Assistant:
        return <ChatInterface />;
      case NavigationTab.Admin:
        return <AdminPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
      {/* Sidebar - Deep Onyx (always dark) */}
      <aside className="w-full md:w-72 bg-[#111111] text-slate-300 flex flex-col h-auto md:h-screen md:sticky md:top-0 z-20 shadow-2xl">
        <div className="p-8 flex flex-col items-center md:items-start gap-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-2xl tracking-tighter">PHONEME</span>
            <span className="text-brand-500 font-black text-2xl tracking-tighter">OPS</span>
          </div>
          <p className="text-[10px] uppercase font-black text-brand-500 tracking-widest">Master Control Portal</p>
        </div>

        <nav className="flex-1 px-6 space-y-4 mt-8 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:whitespace-normal pb-4 md:pb-0 custom-scrollbar">
          <div className="flex md:flex-col gap-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-full w-full transition-all group font-bold ${
                  activeTab === item.id
                    ? 'bg-brand-500 text-white pill-shadow scale-105'
                    : 'hover:text-brand-500 text-slate-400'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center ${
                  activeTab === item.id ? 'text-white' : 'group-hover:text-brand-500'
                }`}></i>
                <span className="text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-8 mt-auto border-t border-white/5 space-y-6">
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-between w-full p-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
          >
            <span className="flex items-center gap-3">
              <i className={`fa-solid ${resolvedTheme === 'dark' ? 'fa-moon text-blue-400' : 'fa-sun text-brand-500'}`}></i>
              {resolvedTheme === 'dark' ? 'Dark' : 'Light'} Mode
            </span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${resolvedTheme === 'dark' ? 'bg-brand-500' : 'bg-slate-700'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${resolvedTheme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </button>

          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-xs font-black text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-white tracking-tight">{user.name}</p>
              <p className="text-[10px] text-brand-500 font-black uppercase tracking-widest">
                {user.role === 'admin' ? 'Admin' : 'L2 Engineer'}
              </p>
            </div>
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-slate-500 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 lg:p-16 overflow-hidden transition-colors duration-300 bg-slate-100 dark:bg-[#0A0A0A]">
        {/* Page Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-1 bg-brand-500 rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">PhoneMe Cloud Infrastructure</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
              {activeTab === NavigationTab.Dashboard && 'Dashboard'}
              {activeTab === NavigationTab.Inventory && 'Infrastructure'}
              {activeTab === NavigationTab.Library && 'Ops Library'}
              {activeTab === NavigationTab.Assistant && 'AI Assistant'}
              {activeTab === NavigationTab.Admin && 'Admin Hub'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-6 py-3 bg-brand-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest pill-shadow flex items-center gap-3">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              System Healthy
            </span>
          </div>
        </header>

        <div className="max-w-8xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
