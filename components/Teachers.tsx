import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Edit, Trash2, Download, Plus, Loader2, Star } from 'lucide-react';
import { userService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { TeacherForm } from './TeacherForm';
import { TeacherProfile } from './TeacherProfile';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

export const Teachers: React.FC = () => {
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  const [viewingTeacher, setViewingTeacher] = useState<any>(null);
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
  const handleViewProfile = (teacher: any) => {
    setViewingTeacher(teacher); setIsProfileOpen(true);
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
        alert(t('teacherCreatedSuccessfully'));
      }
      await loadTeachers();
    } catch (e) { 
      console.error(e); 
      alert(t('failedToSaveTeacher'));
    }
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
          <h1 className="text-3xl font-black tracking-tight  text-rose-800 dark:text-white">{t('teacherRecords')}</h1>
          <p className="text-xs /60 dark: mt-1  tracking-widest">{t('manageTeacherProfiles')}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8  dark: text-[10px] font-bold  tracking-widest hover:bg-rose-100 dark:hover:bg-white/10 transition-all">
            <Download className="w-4 h-4" />{t('export')}
          </button>
          {isAdmin() && (
            <button onClick={handleAddTeacher}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20 active:scale-95 text-[10px]  tracking-widest">
              <Plus className="w-4 h-4" />{t('addTeacher')}
            </button>
          )}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-3xl border border-rose-200/50 dark:border-white/8 bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl shadow-xl shadow-rose-900/5 dark:shadow-none">
        <div className="relative flex-1 group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-pink-500/5 dark:from-indigo-500/5 dark:to-violet-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4  dark:" />
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search our world-class faculty..."
            className="w-full pl-11 pr-4 py-3.5 bg-rose-50/50 dark:bg-white/5 border border-rose-200/40 dark:border-white/8 rounded-2xl   placeholder-rose-300 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:focus:ring-indigo-500/20 transition-all text-sm font-medium" 
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8  dark: text-[10px] font-bold  tracking-widest hover:bg-white dark:hover:bg-white/10 transition-all hover:shadow-lg active:scale-95">
            <Filter className="w-4 h-4" />{t('filters')}
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8  dark: text-[10px] font-bold  tracking-widest hover:bg-white dark:hover:bg-white/10 transition-all hover:shadow-lg active:scale-95">
            <Download className="w-4 h-4" />{t('export')}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Loader2 className="w-8 h-8 animate-spin  dark:" />
          <span className="text-xs font-medium   tracking-widest animate-pulse">Loading Faculty Data</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-rose-200/50 dark:border-white/8 p-10 text-center bg-white/40 dark:bg-white/[0.03]">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center">
                <Search className="w-7 h-7  dark:" />
              </div>
              <h3 className="text-base font-bold   mb-1">No teachers found</h3>
              <p className="/40 dark: text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="relative group rounded-[2rem] border border-rose-100/50 dark:border-white/8 bg-white/50 dark:bg-white/[0.02] backdrop-blur-3xl p-6 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(159,18,57,0.06)] dark:hover:shadow-none hover:-translate-y-1.5 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-500/5 to-pink-500/5 dark:from-indigo-500/5 dark:to-violet-500/5 blur-3xl rounded-full" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-rose-500/5 to-pink-500/5 dark:from-indigo-500/5 dark:to-violet-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Top Actions (Admin Only) */}
                {isAdmin() && (
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => handleEditTeacher(teacher)}
                      className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-rose-200/50 dark:border-white/10  dark: hover:bg-rose-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all shadow-sm"
                      title="Edit Profile"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTeacher(teacher)}
                      className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-rose-200/50 dark:border-white/10  dark: hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Delete Teacher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col items-center">
                  {/* Profile Picture */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 to-pink-500 dark:from-indigo-500 dark:to-violet-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <img
                      src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`}
                      alt={teacher.name}
                      className="relative w-28 h-28 rounded-3xl bg-white dark:bg-slate-800 object-cover border-4 border-white dark:border-slate-900 shadow-xl group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className={cn("absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full border-2 border-white dark:border-slate-900 text-[8px] font-black  tracking-widest shadow-lg",
                      teacher.status === 'Active' ?"bg-emerald-500 text-white" :"bg-slate-400 text-white"
                    )}>
                      {teacher.status}
                    </div>
                  </div>

                  {/* Identity */}
                  <h3 className="text-lg font-black   leading-tight mb-1 group-hover: dark:group-hover: transition-colors">
                    {teacher.name}
                  </h3>
                  <p className="text-[10px] /50 dark: font-bold  tracking-[0.2em] mb-4">
                    {teacher.department}
                  </p>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1.5 mb-6 justify-center">
                    {(teacher.specialization || []).slice(0, 3).map((spec: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-rose-500/5 dark:bg-indigo-500/5 rounded-full text-[9px] font-black  dark: border border-rose-500/10 dark:border-indigo-500/10 group-hover:border-rose-500/30 transition-colors">
                        {spec}
                      </span>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="w-full grid grid-cols-2 gap-px bg-rose-100/30 dark:bg-white/5 rounded-2xl overflow-hidden border border-rose-200/20 dark:border-white/5 mb-2">
                    <div className="bg-white/40 dark:bg-white/[0.01] p-4 text-center">
                      <p className="text-[9px] font-black  dark:  tracking-widest mb-1.5">Load</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-sm font-black">{teacher.classesPerWeek || 12}</span>
                        <span className="text-[10px]  font-medium">hr/wk</span>
                      </div>
                    </div>
                    <div className="bg-white/40 dark:bg-white/[0.01] p-4 text-center">
                      <p className="text-[9px] font-black  dark:  tracking-widest mb-1.5">Rating</p>
                      <div className="flex items-center justify-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-sm font-black">{teacher.rating || '4.5'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info (Quick View) */}
                  <div className="w-full pt-4 border-t border-rose-100 dark:border-white/5 flex items-center justify-between">
                    <p className="text-[10px] /40 dark: font-medium truncate max-w-[140px] italic">
                      {teacher.email}
                    </p>
                    <button 
                      onClick={() => handleViewProfile(teacher)}
                      className="flex items-center gap-1 text-[9px] font-black  dark:  tracking-widest hover:translate-x-1 transition-transform"
                    >
                      View Profile <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          {isAdmin() && (
            <div onClick={handleAddTeacher}
              className="group relative rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border-2 border-dashed border-rose-200 dark:border-white/10 hover:border-rose-500 dark:hover:border-indigo-500 cursor-pointer transition-all duration-500 min-h-[420px] bg-rose-500/[0.01] dark:bg-white/[0.01]">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 dark:from-indigo-500/5 dark:to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />
              <div className="relative w-20 h-20 rounded-[2rem] bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500 border border-rose-500/20 dark:border-indigo-500/20">
                <Plus className="w-10 h-10  dark:" />
              </div>
              <h3 className="relative text-lg font-black   mb-2">Deploy Faculty</h3>
              <p className="relative text-[10px] /60 dark: font-bold  tracking-[0.2em] max-w-[160px] leading-relaxed"> Register New Elite Academic Resource </p>
            </div>
          )}
        </div>
      )}

      <TeacherForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleFormSubmit} editingTeacher={editingTeacher} />
      <TeacherProfile isOpen={isProfileOpen} teacher={viewingTeacher} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};