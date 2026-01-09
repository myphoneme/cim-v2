import { useState, useRef, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  useEquipment,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  useGenerateManual,
  useEquipmentById,
} from '../hooks/useEquipment';
import { attachmentsApi } from '../api/equipment';
import type { DeviceArea, DocumentCategory, EquipmentListItem, Attachment } from '../types';

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

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const { data: inventory = [], isLoading } = useEquipment();
  const createMutation = useCreateEquipment();
  const updateMutation = useUpdateEquipment();
  const deleteMutation = useDeleteEquipment();
  const generateManualMutation = useGenerateManual();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Equipment Master List</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage equipment and upload training documentation.
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20"
        >
          <i className="fa-solid fa-plus-circle"></i> Add New Equipment
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
