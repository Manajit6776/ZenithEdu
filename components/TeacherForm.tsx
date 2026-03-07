import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Camera, Upload } from 'lucide-react';
import { userService } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface TeacherFormData {
  name: string;
  email: string;
  department: string;
  specialization: string;
  experience: number;
  photo?: string;
}

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacher: any) => void;
  editingTeacher?: any;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTeacher,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    department: '',
    specialization: '',
    experience: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (editingTeacher) {
      setFormData({
        name: editingTeacher.name || '',
        email: editingTeacher.email || '',
        department: editingTeacher.department || '',
        specialization: editingTeacher.specialization || '',
        experience: editingTeacher.experience || 0,
        photo: editingTeacher.avatar || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: '',
        specialization: '',
        experience: 0,
        photo: '',
      });
    }
    setErrors({});
  }, [editingTeacher, isOpen]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('photo', file);

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: uploadFormData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData({ ...formData, photo: result.url });
        alert(t('photoUploadedSuccessfully'));
      } else {
        alert(t('failedToUploadPhoto'));
      }
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert(t('failedToUploadPhoto'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('nameIsRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('emailIsRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmailFormat');
    }
    if (!formData.department.trim()) {
      newErrors.department = t('departmentIsRequired');
    }
    if (!formData.specialization.trim()) {
      newErrors.specialization = t('specializationIsRequired');
    }
    if (Number(formData.experience) < 0 || Number(formData.experience) > 50) {
      newErrors.experience = t('experienceBetween0And50');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let savedTeacher;
      if (editingTeacher) {
        savedTeacher = await userService.updateUser(editingTeacher.id, {
          name: formData.name,
          email: formData.email,
          role: 'Teacher',
          avatar: formData.photo,
          department: formData.department,
          specialization: formData.specialization,
          experience: formData.experience
        });
      } else {
        savedTeacher = await userService.createUser({
          name: formData.name,
          email: formData.email,
          role: 'Teacher',
          avatar: formData.photo,
          department: formData.department,
          specialization: formData.specialization,
          experience: formData.experience
        });
      }

      // Photo is now saved directly in the create/update function

      onSubmit(savedTeacher);
      onClose();
    } catch (error) {
      console.error('Failed to save teacher:', error);
      alert(t('failedToSaveTeacher'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                {formData.photo ? (
                  <img src={formData.photo} alt="Teacher" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="teacher-photo"
                disabled={uploadingPhoto}
              />
              <label
                htmlFor="teacher-photo"
                className={`absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {uploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              placeholder="Enter teacher's full name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              placeholder="teacher@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Department *
            </label>
            <select
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.department ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Engineering">Engineering</option>
            </select>
            {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Specialization *
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.specialization ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              placeholder="e.g., Artificial Intelligence, Data Structures"
            />
            {errors.specialization && <p className="mt-1 text-sm text-red-600">{errors.specialization}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Years of Experience *
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={formData.experience}
              onChange={(e) => handleChange('experience', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white ${errors.experience ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              placeholder="5"
            />
            {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingTeacher ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
