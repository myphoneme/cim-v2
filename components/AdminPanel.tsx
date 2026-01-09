
import React, { useState } from 'react';
import { Equipment, DeviceArea, ManualContent, Attachment } from '../types';
import ManualGenerator from './ManualGenerator';

interface AdminPanelProps {
  inventory: Equipment[];
  onAdd: (item: Equipment) => void;
  onUpdate: (item: Equipment) => void;
  onDelete: (id: string) => void;
  onSaveManual: (assetId: string, manual: ManualContent) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ inventory, onAdd, onUpdate, onDelete, onSaveManual }) => {
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'generator'>('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  
  const emptyItem: Equipment = {
    id: '', name: '', area: 'Network', type: '', vendor: '', model: '', serialNumber: '', licenseDetails: '', qty: 1, sopStatus: 'Pending',
    email: '', phone: '', licenseApplicable: 'No', webSupport: '', userName: '', credentials: '',
    otpRequired: 'No', contactPersonOTP: '', validity: '', contactInfo: '', contactNumber: '',
    attachments: []
  };

  const [formData, setFormData] = useState<Equipment>(emptyItem);

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    setFormData(JSON.parse(JSON.stringify(item)));
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormData({ ...emptyItem, id: Date.now().toString() });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate(formData);
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Admin Navigation */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm inline-flex mb-2 overflow-hidden">
        <button 
          onClick={() => setActiveSubTab('inventory')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'inventory' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-server mr-2"></i> DC Inventory
        </button>
        <button 
          onClick={() => setActiveSubTab('generator')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeSubTab === 'generator' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> SOP & Media Lab
        </button>
      </div>

      {activeSubTab === 'inventory' ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Equipment Master List</h2>
              <p className="text-slate-500 text-sm mt-1">Manage physical hardware, software licenses, and support credentials.</p>
            </div>
            <button 
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <i className="fa-solid fa-plus-circle"></i> Add New Equipment
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-8 py-5">Equipment & Area</th>
                  <th className="px-8 py-5">OEM / Model</th>
                  <th className="px-8 py-5">Serial No.</th>
                  <th className="px-8 py-5">License Info</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{item.area}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-slate-600 font-medium">{item.vendor}</div>
                      <div className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded inline-block text-slate-500 mt-1">{item.model}</div>
                    </td>
                    <td className="px-8 py-5 font-mono text-slate-500 text-xs">
                      {item.serialNumber || 'N/A'}
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs text-slate-600 truncate max-w-[150px]">{item.licenseDetails || 'None'}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.validity ? `Valid: ${item.validity}` : 'No Expire Date'}</div>
                    </td>
                    <td className="px-8 py-5 text-right space-x-2">
                      <button onClick={() => handleEdit(item)} className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center">
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button onClick={() => onDelete(item.id)} className="w-9 h-9 rounded-xl hover:bg-white hover:shadow-md text-slate-400 hover:text-red-600 transition-all flex items-center justify-center">
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <ManualGenerator inventory={inventory} onSaveManual={onSaveManual} onUpdateAsset={onUpdate} />
      )}

      {/* Asset CRUD Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingItem ? 'Edit Equipment Detail' : 'Initialize New Asset'}</h3>
                <p className="text-slate-500 font-medium mt-1">Update operational database with technical metadata.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 transition-all flex items-center justify-center shadow-sm">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Core Details */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 border-b pb-2">Technical Properties</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Asset Name</label>
                      <input required type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Vendor</label>
                        <input required type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Model</label>
                        <input required type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Serial Number</label>
                        <input type="text" placeholder="S/N: 0000-0000" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Quantity</label>
                        <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operations & Support */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border-b pb-2">Logistics & Support</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Functional Area</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value as DeviceArea})}>
                        <option>Network</option>
                        <option>Security</option>
                        <option>Comput</option>
                        <option>Software</option>
                        <option>Application</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">License Details</label>
                      <input type="text" placeholder="Enterprise Plus / Support Tier..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.licenseDetails} onChange={e => setFormData({...formData, licenseDetails: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Support Contact</label>
                        <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Validity</label>
                        <input type="text" placeholder="12-Oct-26" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-3 text-sm focus:border-blue-500 outline-none transition-all" value={formData.validity} onChange={e => setFormData({...formData, validity: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-10 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">Cancel</button>
                <button type="submit" className="px-12 py-4 rounded-2xl font-black bg-slate-900 text-white hover:bg-slate-800 transition-all text-xs uppercase tracking-widest shadow-xl active:scale-95">
                  {editingItem ? 'Save Asset Update' : 'Initialize Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
