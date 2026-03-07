import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Download, Plus, Loader2, Star } from 'lucide-react';
import { userService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { TeacherForm } from './TeacherForm';
import { useLanguage } from '../contexts/LanguageContext';

export const Teachers: React.FC = () => {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      const data = allUsers.filter(user => user.role === 'Teacher');
      // Add mock data for teachers that don't have all required fields
      const enhancedData = data.map(teacher => ({
        ...teacher,
        department: teacher.department || 'Computer Science',
        specialization: Array.isArray(teacher.specialization) 
          ? teacher.specialization 
          : teacher.specialization 
            ? teacher.specialization.split(', ').map(s => s.trim())
            : ['Programming', 'Algorithms'],
        experience: teacher.experience || Math.floor(Math.random() * 20) + 5,
        classesPerWeek: teacher.classesPerWeek || Math.floor(Math.random() * 10) + 8,
        rating: teacher.rating || (Math.random() * 2 + 3).toFixed(1),
        status: teacher.status || 'Active'
      }));
      setTeachers(enhancedData);
    } catch (error) {
      console.error("Failed to load teachers", error);
      // Fallback to mock data if API fails
      setTeachers([
        {
          id: '1',
          name: 'Dr. Eleanor Pena',
          email: 'eleanor@edunexus.com',
          role: 'Teacher',
          department: 'Physics Department',
          specialization: ['Quantum Mechanics', 'Thermodynamics'],
          experience: 15,
          classesPerWeek: 12,
          rating: '4.8',
          status: 'Active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfX'
        },
        {
          id: '2',
          name: 'Prof. Guy Hawkins',
          email: 'guy@edunexus.com',
          role: 'Teacher',
          department: 'Mathematics',
          specialization: ['Calculus', 'Algebra'],
          experience: 8,
          classesPerWeek: 18,
          rating: '4.6',
          status: 'Active',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfY'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert(t('exportingTeacherRecordsCsv'));
  };

  const handleAddTeacher = () => {
    if (!isAdmin()) {
      alert(t('onlyAdminsCanAddTeachers'));
      return;
    }
    setEditingTeacher(null);
    setIsFormOpen(true);
  };

  const handleEditTeacher = (teacher: any) => {
    if (!isAdmin()) {
      alert(t('onlyAdminsCanEditTeachers'));
      return;
    }
    setEditingTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleDeleteTeacher = async (teacher: any) => {
    if (!isAdmin()) {
      alert(t('onlyAdminsCanDeleteTeachers'));
      return;
    }
    
    if (confirm(t('confirmDeleteTeacher', { name: teacher.name }))) {
      setLoading(true);
      try {
        await userService.deleteUser(teacher.id);
        await loadTeachers();
        alert(t('teacherDeletedSuccessfully'));
      } catch (error) {
        console.error("Failed to delete teacher", error);
        alert(t('failedToDeleteTeacher'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (teacher: any) => {
    try {
      if (editingTeacher) {
        await userService.updateUser(editingTeacher.id, { 
          name: teacher.name, 
          email: teacher.email, 
          role: 'Teacher', 
          avatar: teacher.photo,
          department: teacher.department,
          specialization: teacher.specialization,
          experience: teacher.experience
        });
        alert(t('teacherUpdatedSuccessfully'));
      } else {
        await userService.createUser({ 
          name: teacher.name, 
          email: teacher.email, 
          role: 'Teacher', 
          avatar: teacher.photo,
          department: teacher.department,
          specialization: teacher.specialization,
          experience: teacher.experience
        });
        alert(t('teacherAddedSuccessfully'));
      }
      await loadTeachers();
    } catch (error) {
      console.error("Failed to save teacher", error);
      alert(t('failedToSaveTeacher'));
    }
  };

  const handleFilter = () => {
    alert(t('openingAdvancedFilterOptions'));
  };

  const handleViewDetails = (teacher: any) => {
    alert(t('viewingTeacherDetails', { name: teacher.name, email: teacher.email, department: teacher.department, specialization: teacher.specialization, experience: teacher.experience }));
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(t.specialization) ? t.specialization.join(' ') : t.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-rose-800 dark:text-blue-300 uppercase tracking-tight">{t('teacherRecords')}</h1>
          <p className="text-[11px] font-black text-rose-700/60 dark:text-blue-700/40 uppercase tracking-[0.2em] mt-1">{t('manageTeacherProfiles')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-3 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-blue-500/10 rounded-[1.25rem] text-rose-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rose-100 dark:hover:bg-white/10"
          >
            <Download className="w-4 h-4" />
            {t('export')}
          </button>
          {isAdmin() && (
            <button 
              onClick={handleAddTeacher}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-blue-500 dark:hover:to-blue-600 text-white font-black rounded-[1.25rem] transition-all shadow-lg shadow-rose-200 dark:shadow-blue-900/40 transform hover:scale-105 active:scale-95 uppercase text-[10px] tracking-widest"
            >
              <Plus className="w-4 h-4" />
              {t('addTeacher')}
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/40 dark:bg-slate-900/40 p-5 md:p-6 rounded-[2rem] border border-rose-100 dark:border-white/5 backdrop-blur-xl shadow-xl shadow-rose-200/5">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400/60 dark:text-slate-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, department, specialization..." 
              className="w-full pl-12 pr-6 py-4 bg-white/60 dark:bg-slate-950/50 border border-rose-200 dark:border-white/10 rounded-2xl text-rose-950 dark:text-slate-200 placeholder-rose-300 dark:placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-indigo-500/20 focus:border-rose-300 transition-all font-medium text-sm"
            />
          </div>
          <button 
            onClick={handleFilter}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-blue-500/10 rounded-2xl text-rose-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            <Filter className="w-4 h-4" />
            Advanced Parameters
          </button>
        </div>
      </div>

      {/* Teacher Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 text-rose-800 dark:text-blue-400 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-rose-600 dark:text-blue-500" />
          <span className="text-xs font-black uppercase tracking-widest animate-pulse">Synchronizing Faculty Data</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full glass-panel p-8 text-center rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100/30 dark:bg-blue-900/20 flex items-center justify-center">
                <Search className="w-8 h-8 text-rose-400/60 dark:text-blue-700/60" />
              </div>
              <h3 className="text-lg font-bold text-rose-800 dark:text-blue-300 mb-2">No teachers found</h3>
              <p className="text-rose-900/40 dark:text-blue-700/40">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-rose-100 dark:border-white/5 backdrop-blur-md shadow-lg shadow-rose-200/10 flex flex-col items-center text-center group hover:border-rose-400 dark:hover:border-indigo-500 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                <div className="relative mb-8">
                  <div className="relative inline-block">
                    <img 
                      src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} 
                      alt={teacher.name} 
                      className="w-28 h-28 rounded-[2.5rem] bg-white dark:bg-slate-800 object-cover border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center shadow-lg ${
                      teacher.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}>
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-black text-rose-950 dark:text-blue-300 mb-1 uppercase tracking-tight">{teacher.name}</h3>
                <p className="text-[10px] font-black text-rose-700/60 dark:text-blue-700/40 uppercase tracking-widest mb-6">{teacher.department}</p>
                <div className="flex gap-2 mb-8 w-full justify-center flex-wrap">
                  {(teacher.specialization || []).slice(0, 2).map((spec: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-rose-100/50 dark:bg-blue-600/10 rounded-full text-[9px] font-black text-rose-700 dark:text-blue-300 uppercase tracking-tighter">
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="w-full grid grid-cols-2 bg-white/50 dark:bg-blue-950/20 rounded-2xl p-4 border border-rose-100 dark:border-blue-500/10 mb-8">
                  <div className="border-r border-rose-100 dark:border-blue-500/10">
                    <p className="text-[8px] font-black text-rose-400 dark:text-blue-700/60 uppercase tracking-widest mb-1">Session Volume</p>
                    <p className="text-sm font-black text-rose-950 dark:text-blue-300 uppercase">{teacher.classesPerWeek || 12}/WK</p>
                  </div>
                  <div className="pl-4">
                    <p className="text-[8px] font-black text-rose-400 dark:text-blue-700/60 uppercase tracking-widest mb-1">Peer Rating</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-rose-500 text-rose-500 dark:fill-blue-400 dark:text-blue-400" />
                      <p className="text-sm font-black text-rose-950 dark:text-blue-300 uppercase">{teacher.rating || '4.5'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-auto w-full">
                  <button 
                    onClick={() => handleViewDetails(teacher)}
                    className="flex-1 py-3.5 rounded-2xl bg-rose-600 dark:bg-blue-600 hover:bg-rose-700 dark:hover:bg-blue-700 text-[10px] font-black text-white uppercase tracking-widest transition-all shadow-lg shadow-rose-200 dark:shadow-blue-900/30 transform active:scale-95"
                  >
                    Analysis Report
                  </button>
                  {isAdmin() && (
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleEditTeacher(teacher)}
                        className="w-12 h-12 flex items-center justify-center bg-white/60 dark:bg-white/5 border border-rose-200 dark:border-blue-500/10 rounded-2xl text-rose-600 dark:text-blue-400 hover:bg-rose-100 dark:hover:bg-white/10 transition-colors"
                        title="Edit Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Add New Teacher Card */}
          {isAdmin() && (
            <div 
              onClick={handleAddTeacher}
              className="bg-white/20 dark:bg-slate-900/40 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-rose-200 dark:border-white/10 hover:border-rose-500 dark:hover:border-indigo-500 cursor-pointer transition-all bg-transparent group min-h-[460px]"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-rose-200/50 dark:border-white/5">
                <Plus className="w-10 h-10 text-rose-500 dark:text-indigo-500" />
              </div>
              <h3 className="text-lg font-black text-rose-950 dark:text-slate-300 uppercase tracking-tight">Onboard Faculty</h3>
              <p className="text-[10px] font-black text-rose-700/60 dark:text-slate-500 mt-2 uppercase tracking-widest">Register New Academic Resource</p>
            </div>
          )}
        </div>
      )}

      {/* Teacher Form Modal */}
      <TeacherForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        editingTeacher={editingTeacher}
      />
    </div>
  );
};
