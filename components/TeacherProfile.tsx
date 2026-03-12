import React from 'react';
import { X, Mail, Clock, Star, Shield, Briefcase, GraduationCap, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TeacherProfileProps {
  teacher: any;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, isOpen, onClose }) => {
  const { t } = useLanguage();

  // Handle body scroll lock and Escape key
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !teacher) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-rose-950/40 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-rose-100 dark:border-white/10 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        
        {/* Scrollable Container */}
        <div className="overflow-y-auto max-h-[85vh] scrollbar-hide">
          {/* Header/Cover Area */}
          <div className="relative h-28 bg-gradient-to-br from-rose-500 to-pink-600 dark:from-indigo-600 dark:to-violet-700">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-inner" />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-8">
            {/* Avatar - Positioned to side/top and smaller */}
            <div className="absolute -top-10 left-6">
              <div className="relative">
                <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-2xl -m-1 shadow-lg" />
                <img 
                  src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`}
                  alt={teacher.name}
                  className="relative w-20 h-20 rounded-xl bg-white dark:bg-slate-800 object-cover border-2 border-white dark:border-slate-900 shadow-xl"
                />
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${teacher.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </div>
            </div>

            <div className="pt-14">
              {/* Identity Info - Not overlapping avatar */}
              <div className="flex flex-col mb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-rose-950 dark:text-white leading-tight">
                      {teacher.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-rose-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-[9px]">
                      <Briefcase className="w-3 h-3" />
                      {teacher.department}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 bg-rose-50 dark:bg-white/5 rounded-lg border border-rose-100 dark:border-white/10 flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black text-rose-950 dark:text-white">{teacher.rating}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 mb-8 text-center">
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-white/[0.03] border border-rose-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-rose-400 dark:text-slate-600 uppercase tracking-widest mb-1">Experience</p>
                  <p className="text-base font-black text-rose-950 dark:text-white">{teacher.experience}Y</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-white/[0.03] border border-rose-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-rose-400 dark:text-slate-600 uppercase tracking-widest mb-1">Weekly Load</p>
                  <p className="text-base font-black text-rose-950 dark:text-white">{teacher.classesPerWeek}H</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-white/[0.03] border border-rose-100 dark:border-white/5">
                  <p className="text-[8px] font-black text-rose-400 dark:text-slate-600 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-base font-black text-rose-950 dark:text-white uppercase tracking-tighter">Senior</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Specializations */}
                <div>
                  <h3 className="text-[9px] font-black text-rose-950 dark:text-white uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Shield className="w-3 h-3 text-rose-500" />
                    Areas of Expertise
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(teacher.specialization || []).map((spec: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white dark:bg-slate-800 border border-rose-100 dark:border-white/10 rounded-xl text-[10px] font-bold text-rose-700 dark:text-slate-300 shadow-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Gateway */}
                <div className="pt-6 border-t border-rose-100 dark:border-white/10">
                  <h3 className="text-[9px] font-black text-rose-950 dark:text-white uppercase tracking-[0.2em] mb-4">Contact Gateway</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/30 dark:bg-white/[0.02] border border-transparent hover:border-rose-100 dark:hover:border-white/10 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-rose-500 dark:text-indigo-400 transition-transform group-hover:scale-110">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7px] font-black text-rose-700/50 dark:text-slate-500 uppercase tracking-widest mb-0.5">Email</span>
                        <span className="text-[11px] font-bold text-rose-950 dark:text-white truncate">{teacher.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/30 dark:bg-white/[0.02] border border-transparent hover:border-rose-100 dark:hover:border-white/10 transition-all group">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-rose-500 dark:text-indigo-400 transition-transform group-hover:scale-110">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[7px] font-black text-rose-700/50 dark:text-slate-500 uppercase tracking-widest mb-0.5">Contact Number</span>
                        <span className="text-[11px] font-bold text-rose-950 dark:text-white truncate">+91 98765 43210</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
