import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Download, Plus, Loader2, Users, Calendar, Phone, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentName: string;
  studentRollNo: string;
  relationship: string;
  occupation: string;
  address: string;
  emergencyContact: string;
}

export const Parents: React.FC = () => {
  const { t } = useLanguage();
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState<Partial<Parent>>({});
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockParents: Parent[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+1234567890',
          studentName: 'Alex Smith',
          studentRollNo: 'CS2024001',
          relationship: 'Father',
          occupation: 'Engineer',
          address: '123 Main St, City',
          emergencyContact: '+1234567890'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@email.com',
          phone: '+0987654321',
          studentName: 'Emma Johnson',
          studentRollNo: 'EC2024002',
          relationship: 'Mother',
          occupation: 'Teacher',
          address: '456 Oak Ave, City',
          emergencyContact: '+0987654321'
        }
      ];
      setParents(mockParents);
    } catch (error) {
      console.error("Failed to load parents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParent = () => {
    if (!isAdmin()) {
      alert(t('onlyAdminsCanAddParents'));
      return;
    }
    setEditingParent(null);
    setFormData({});
    setShowForm(true);
  };

  const handleEditParent = (parent: Parent) => {
    if (!isAdmin()) {
      alert(t('onlyAdminsCanEditParents'));
      return;
    }
    setEditingParent(parent);
    setFormData(parent);
    setShowForm(true);
  };

  const handleDeleteParent = async (parent: Parent) => {
    if (!isAdmin()) {
      alert(t('onlyAdminsCanDeleteParents'));
      return;
    }
    
    if (confirm(t('confirmDeleteParent', { name: parent.name }))) {
      setLoading(true);
      try {
        // TODO: Implement actual delete API call
        setParents(parents.filter(p => p.id !== parent.id));
        alert(t('parentDeletedSuccessfully'));
      } catch (error) {
        console.error("Failed to delete parent", error);
        alert(t('failedToDeleteParent'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (parent: Parent) => {
    alert(t('viewingParentDetails', { name: parent.name, email: parent.email, phone: parent.phone, studentName: parent.studentName, studentRollNo: parent.studentRollNo, relationship: parent.relationship, occupation: parent.occupation, address: parent.address, emergencyContact: parent.emergencyContact }));
  };

  const handleFormSubmit = async (parent: Partial<Parent>) => {
    try {
      if (editingParent) {
        // TODO: Implement actual update API call
        setParents(parents.map(p => p.id === editingParent.id ? { ...p, ...parent } as Parent : p));
        alert(t('parentUpdatedSuccessfully'));
      } else {
        // TODO: Implement actual create API call
        const newParent: Parent = {
          id: Date.now().toString(),
          ...parent as Parent
        };
        setParents([...parents, newParent]);
        alert(t('parentAddedSuccessfully'));
      }
      setShowForm(false);
      await loadParents();
    } catch (error) {
      console.error("Failed to save parent", error);
      alert(t('failedToSaveParent'));
    }
  };

  const filteredParents = parents.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.relationship.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t('parents')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('manageParentInformation')}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search parents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
            {isAdmin() && (
              <button
                onClick={handleAddParent}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Parent
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Parent Name</th>
                <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Contact</th>
                <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Student</th>
                <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Relationship</th>
                <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Occupation</th>
                <th className="text-left p-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredParents.map((parent) => (
                <tr key={parent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">{parent.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{parent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-3 h-3" />
                        {parent.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="w-3 h-3" />
                        {parent.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{parent.studentName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{parent.studentRollNo}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                      {parent.relationship}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-600 dark:text-slate-400">{parent.occupation}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(parent)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {isAdmin() && (
                        <>
                          <button
                            onClick={() => handleEditParent(parent)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteParent(parent)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-600 dark:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {editingParent ? 'Edit Parent' : 'Add Parent'}
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit(formData);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parent Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentName || ''}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Roll No *</label>
                  <input
                    type="text"
                    required
                    value={formData.studentRollNo || ''}
                    onChange={(e) => setFormData({ ...formData, studentRollNo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship *</label>
                  <select
                    required
                    value={formData.relationship || ''}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation || ''}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                <textarea
                  rows={3}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingParent ? 'Update' : 'Add'} Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
