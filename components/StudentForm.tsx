import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Camera, Upload } from 'lucide-react';
import { studentService } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface StudentFormData {
  name: string;
  email: string;
  rollNo: string;
  department: string;
  attendance: number;
  cgpa: number;
  feesStatus: 'Paid' | 'Pending' | 'Overdue';
  status: 'Active' | 'Inactive';
  photo?: string;
}

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: any) => void;
  editingStudent?: any;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingStudent,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    email: '',
    rollNo: '',
    department: '',
    attendance: 0,
    cgpa: 0,
    feesStatus: 'Pending',
    status: 'Active',
    photo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        email: editingStudent.email || '',
        rollNo: editingStudent.rollNo || '',
        department: editingStudent.department || '',
        attendance: editingStudent.attendance || 0,
        cgpa: editingStudent.cgpa || 0,
        feesStatus: editingStudent.feesStatus || 'Pending',
        status: editingStudent.status || 'Active',
        photo: editingStudent.photo || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        rollNo: '',
        department: '',
        attendance: 0,
        cgpa: 0,
        feesStatus: 'Pending',
        status: 'Active',
        photo: '',
      });
    }
    setErrors({});
  }, [editingStudent, isOpen]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Photo upload started:', file.name, file.size, file.type);
    setUploadingPhoto(true);
    try {
      // For now, convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        console.log('Photo converted to base64, length:', base64String.length);
        setFormData(prev => ({ ...prev, photo: base64String }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameIsRequired');
    }
    // Email is optional - only validate if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmailFormat');
    }
    if (!formData.rollNo.trim()) {
      newErrors.rollNo = t('rollNoIsRequired');
    }
    if (!formData.department.trim()) {
      newErrors.department = t('departmentIsRequired');
    }
    if (Number(formData.attendance) < 0 || Number(formData.attendance) > 100) {
      newErrors.attendance = t('attendanceBetween0And10');
    }
    if (Number(formData.cgpa) < 0 || Number(formData.cgpa) > 10) {
      newErrors.cgpa = t('cgpaBetween0And10');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called!');
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('Validation failed');
      return;
    }
    
    console.log('Validation passed');

    setIsLoading(true);
    try {
      let studentData;
      if (editingStudent) {
        // Create update data for parent to handle
        studentData = {
          name: formData.name,
          department: formData.department,
          attendance: Number(formData.attendance),
          cgpa: Number(formData.cgpa),
          feesStatus: formData.feesStatus,
          status: formData.status,
          photo: formData.photo, // Include photo in update data!
        };
        
        // Only add rollNo if it changed
        if (formData.rollNo !== editingStudent.rollNo) {
          (studentData as any).rollNo = formData.rollNo;
        }
        
        console.log('Passing update data to parent:', studentData);
      } else {
        // Create data for new student
        studentData = {
          name: formData.name,
          rollNo: formData.rollNo,
          department: formData.department,
          attendance: Number(formData.attendance),
          cgpa: Number(formData.cgpa),
          feesStatus: formData.feesStatus,
          status: formData.status,
        };
        
        console.log('Passing create data to parent:', studentData);
      }
      
      // Pass data to parent for API handling
      onSubmit(studentData);
    } catch (error) {
      console.error('Failed to prepare student data:', error);
      alert(t('failedToSaveStudent'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof StudentFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-end z-[9999] p-4">
      <div className="glass-panel rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in relative z-[10000] shadow-2xl shadow-black/20 mr-24">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <h3 className="text-lg font-medium text-white">{editingStudent ? t('editStudent') : t('addNewStudent')}</h3>
            <p className="text-sm text-slate-500 mt-1">Please fill in all required fields marked with *</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
                placeholder="e.g. John Doe"
              />
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
                placeholder="e.g. john@edunexus.com"
                readOnly={editingStudent ? true : false}
              />
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Roll Number *</label>
              <input
                type="text"
                value={formData.rollNo}
                onChange={(e) => handleChange('rollNo', e.target.value)}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
                placeholder="e.g., CS2024001"
              />
              {errors.rollNo && <p className="text-rose-400 text-xs mt-1">{errors.rollNo}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
              >
                <option value="">Select Department...</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
              </select>
              {errors.department && <p className="text-rose-400 text-xs mt-1">{errors.department}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Attendance (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.attendance}
                onChange={(e) => handleChange('attendance', parseFloat(e.target.value) || 0)}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
                placeholder="85"
              />
              {errors.attendance && <p className="text-rose-400 text-xs mt-1">{errors.attendance}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">CGPA</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={formData.cgpa}
                onChange={(e) => handleChange('cgpa', parseFloat(e.target.value) || 0)}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
                placeholder="8.5"
              />
              {errors.cgpa && <p className="text-rose-400 text-xs mt-1">{errors.cgpa}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Fee Status</label>
              <select
                value={formData.feesStatus}
                onChange={(e) => handleChange('feesStatus', e.target.value as 'Paid' | 'Pending' | 'Overdue')}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as 'Active' | 'Inactive')}
                className="glass-input w-full rounded-lg py-2 px-3 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div>
            <h4 className="text-sm font-medium text-indigo-400 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
              Student Photo
            </h4>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
                id="photo-upload"
              />
              <label 
                htmlFor="photo-upload"
                className="cursor-pointer block"
              >
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-500 group-hover:scale-110 transition-transform group-hover:text-indigo-400">
                  {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <p className="text-sm text-slate-300 font-medium">
                  {uploadingPhoto ? 'Uploading...' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-slate-500 mt-1">JPG or PNG (max. 5MB)</p>
                {formData.photo && (
                  <div className="mt-3">
                    <img src={formData.photo} alt="Student" className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-indigo-500/20" />
                    <p className="text-xs text-green-400 mt-1">Photo uploaded</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-900/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingStudent ? 'Update' : 'Submit'} Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
