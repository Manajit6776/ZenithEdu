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

  useEffect(() => { loadTeachers(); }, []);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      const data = allUsers.filter((u: any) => u.role === 'Teacher');
      const enhanced = data.map((teacher: any) => ({
        ...teacher,
        department: teacher.department || 'Computer Science',
        specialization: Array.isArray(teacher.specialization) ? teacher.specialization
          : teacher.specialization ? teacher.specialization.split(', ').map((s: string) => s.trim()) : ['Programming', 'Algorithms'],
        experience: teacher.experience || Math.floor(Math.random() * 20) + 5,
        classesPerWeek: teacher.classesPerWeek || Math.floor(Math.random() * 10) + 8,
        rating: teacher.rating || (Math.random() * 2 + 3).toFixed(1),
        status: teacher.status || 'Active'
      }));
      setTeachers(enhanced);
    } catch (error) {
      console.error('Failed to load teachers', error);
      setTeachers([
        { id: '1', name: 'Dr. Eleanor Pena', email: 'eleanor@zenithedu.com', role: 'Teacher', department: 'Physics Department', specialization: ['Quantum Mechanics', 'Thermodynamics'], experience: 15, classesPerWeek: 12, rating: '4.8', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfX' },
        { id: '2', name: 'Prof. Guy Hawkins', email: 'guy@zenithedu.com', role: 'Teacher', department: 'Mathematics', specialization: ['Calculus', 'Algebra'], experience: 8, classesPerWeek: 18, rating: '4.6', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProfY' }
      ]);
    } finally { setLoading(false); }
  };

  const handleExport = () => alert(t('exportingTeacherRecordsCsv'));
  const handleAddTeacher = () => {
    if (!isAdmin()) { alert(t('onlyAdminsCanAddTeachers')); return; }
    setEditingTeacher(null); setIsFormOpen(true);
  };
  const handleEditTeacher = (teacher: any) => {
    if (!isAdmin()) { alert(t('onlyAdminsCanEditTeachers')); return; }
    setEditingTeacher(teacher); setIsFormOpen(true);
  };
  const handleDeleteTeacher = async (teacher: any) => {
    if (!isAdmin()) { alert(t('onlyAdminsCanDeleteTeachers')); return; }
    if (confirm(t('confirmDeleteTeacher', { name: teacher.name }))) {
      setLoading(true);
      try { await userService.deleteUser(teacher.id); await loadTeachers(); }
      catch (e) { console.error(e); } finally { setLoading(false); }
    }
  };
  const handleFormSubmit = async (teacher: any) => {
    try {
      if (editingTeacher) {
        await userService.updateUser(editingTeacher.id, { name: teacher.name, email: teacher.email, role: 'Teacher', avatar: teacher.photo, department: teacher.department, specialization: teacher.specialization, experience: teacher.experience });
      } else {
        await userService.createUser({ name: teacher.name, email: teacher.email, role: 'Teacher', avatar: teacher.photo, department: teacher.department, specialization: teacher.specialization, experience: teacher.experience });
      }
      await loadTeachers();
    } catch (e) { console.error(e); }
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
          <h1 className="text-3xl font-black text-rose-900 dark:text-white tracking-tight">{t('teacherRecords')}</h1>
          <p className="text-xs text-rose-700/60 dark:text-slate-500 mt-1 uppercase tracking-widest">{t('manageTeacherProfiles')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 text-rose-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" />{t('export')}
          </button>
          {isAdmin() && (
            <button onClick={handleAddTeacher}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20 active:scale-95 text-[10px] uppercase tracking-widest">
              <Plus className="w-4 h-4" />{t('addTeacher')}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 dark:text-slate-500" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, department..."
              className="w-full pl-11 pr-4 py-3 bg-rose-50/50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 rounded-xl text-rose-950 dark:text-white placeholder-rose-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/30 dark:focus:ring-indigo-500/30 transition-all text-sm" />
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 text-rose-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 dark:hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" />Filters
          </button>
        </div>
      </div>

      {/* Teacher Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 dark:text-indigo-500" />
          <span className="text-xs font-medium text-slate-500 uppercase tracking-widest animate-pulse">Loading Faculty Data</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-rose-200/50 dark:border-white/8 p-10 text-center bg-white/40 dark:bg-white/[0.03]">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center">
                <Search className="w-7 h-7 text-rose-400 dark:text-indigo-400" />
              </div>
              <h3 className="text-base font-bold text-rose-800 dark:text-white mb-1">No teachers found</h3>
              <p className="text-rose-900/40 dark:text-slate-500 text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="rounded-2xl p-6 border border-rose-100 dark:border-white/8 bg-white/40 dark:bg-white/[0.03] backdrop-blur-md hover:border-rose-500/30 dark:hover:border-indigo-500/30 transition-all flex flex-col items-center text-center group relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-rose-500/5 dark:bg-indigo-500/5 blur-2xl rounded-full" />
                <div className="relative mb-5">
                  <img
                    src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`}
                    alt={teacher.name}
                    className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 object-cover border-2 border-rose-200/50 dark:border-white/8 shadow-lg group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-xl border-2 border-white dark:border-slate-950 flex items-center justify-center ${teacher.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  </div>
                </div>
                <h3 className="text-base font-black text-rose-950 dark:text-white mb-0.5">{teacher.name}</h3>
                <p className="text-[10px] text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mb-4">{teacher.department}</p>
                <div className="flex gap-1.5 mb-5 w-full justify-center flex-wrap">
                  {(teacher.specialization || []).slice(0, 2).map((spec: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-500/10 dark:bg-indigo-500/10 rounded-full text-[9px] font-bold text-rose-600 dark:text-indigo-400 border border-rose-500/20 dark:border-indigo-500/20">{spec}</span>
                  ))}
                </div>
                <div className="w-full grid grid-cols-2 bg-rose-50/80 dark:bg-white/[0.03] rounded-xl p-3 border border-rose-100 dark:border-white/5 mb-5">
                  <div className="border-r border-rose-100 dark:border-white/5">
                    <p className="text-[8px] font-bold text-rose-400 dark:text-slate-600 uppercase tracking-wider mb-0.5">Classes/wk</p>
                    <p className="text-sm font-black text-rose-950 dark:text-white">{teacher.classesPerWeek || 12}</p>
                  </div>
                  <div className="pl-3">
                    <p className="text-[8px] font-bold text-rose-400 dark:text-slate-600 uppercase tracking-wider mb-0.5">Rating</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <p className="text-sm font-black text-rose-950 dark:text-white">{teacher.rating || '4.5'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-auto w-full">
                  <button className="flex-1 py-2.5 rounded-xl bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-[10px] font-bold text-white uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20 active:scale-95">
                    Analysis
                  </button>
                  {isAdmin() && (
                    <button onClick={() => handleEditTeacher(teacher)}
                      className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 rounded-xl text-rose-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-white/10 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {isAdmin() && (
            <div onClick={handleAddTeacher}
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-center border-dashed border-2 border-rose-200 dark:border-white/10 hover:border-rose-500/50 dark:hover:border-indigo-500/50 cursor-pointer transition-all group min-h-[380px]">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-rose-500/20 dark:border-indigo-500/20">
                <Plus className="w-8 h-8 text-rose-500 dark:text-indigo-500" />
              </div>
              <h3 className="text-base font-black text-rose-950 dark:text-white">Onboard Faculty</h3>
              <p className="text-[10px] text-rose-700/60 dark:text-slate-500 mt-1 uppercase tracking-widest">Register New Academic Resource</p>
            </div>
          )}
        </div>
      )}

      <TeacherForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} editingTeacher={editingTeacher} />
    </div>
  );
};
