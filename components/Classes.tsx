import React, { useState, useEffect } from 'react';
import {
  Video, Calendar, User, Clock, MoreVertical, Link as LinkIcon, Bell, Check, Plus, Edit, Trash2, Loader2, Copy,
  Search, Filter, ChevronLeft, ChevronRight, AlertCircle, RefreshCcw, ChevronDown, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveClass } from '../src/types';
import { liveClassService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ClassCardProps {
  classItem: LiveClass;
  onEdit: (classItem: LiveClass) => void;
  onDelete: (classItem: LiveClass) => void;
  onJoin: (classItem: LiveClass) => void;
  onToggleReminder: (id: string) => void;
  onCopyLink: (classId: string) => void;
  hasReminder: boolean;
  key?: string; // Add optional key prop for React list rendering
}

const ClassCard: React.FC<ClassCardProps> = ({
  classItem, onEdit, onDelete, onJoin, onToggleReminder, onCopyLink, hasReminder
}) => {
  const { t } = useLanguage();
  const { isTeacher, isAdmin } = useAuth();

  const statusStyles: any = {
    Live: "bg-rose-500/10 dark:bg-indigo-500/10 text-rose-600 dark:text-indigo-400 border-rose-500/20 dark:border-indigo-500/20 animate-pulse",
    Upcoming: "bg-rose-50 dark:bg-slate-800 text-rose-700 dark:text-slate-300 border-rose-200/50 dark:border-slate-700",
    Ended: "bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800",
  };

  const platformIcons: any = {
    Zoom: "https://upload.wikimedia.org/wikipedia/commons/9/94/Zoom_app_icon.png",
    GoogleMeet: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Meet_icon_%282020%29.svg/1024px-Google_Meet_icon_%282020%29.svg.png",
    MicrosoftTeams: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png",
    Other: null
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white/40 dark:bg-slate-900 rounded-3xl overflow-hidden group transition-all duration-500 border p-1 relative shadow-xl shadow-rose-200/5 dark:shadow-none ${classItem.status === 'Live'
        ? 'border-rose-500/30 dark:border-indigo-500/30 ring-1 ring-rose-500/20 dark:ring-indigo-500/20'
        : 'border-rose-200/40 dark:border-slate-800'
        }`}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border shadow-sm ${statusStyles[classItem.status]}`}>
            {classItem.status === 'Live' && <span className="w-1.5 h-1.5 bg-rose-500 dark:bg-indigo-500 rounded-full"></span>}
            {t(classItem.status.toLowerCase())}
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onCopyLink(classItem.id)}
              className="p-2.5 rounded-xl bg-rose-100 dark:bg-slate-800 text-rose-600 dark:text-slate-400 hover:text-rose-800 dark:hover:text-white border border-rose-200/30 dark:border-slate-700 transition-all"
              title="Copy meeting link"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
            {(isTeacher() || isAdmin()) && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(classItem)}
                  className="p-2.5 rounded-xl bg-rose-100 dark:bg-slate-800 text-rose-600 dark:text-slate-400 hover:text-rose-800 dark:hover:text-white border border-rose-200/30 dark:border-slate-700 transition-all"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        <h3 className="text-xl font-black text-rose-900 dark:text-white mb-1 group-hover:text-rose-700 transition-colors tracking-tight uppercase">{classItem.subject}</h3>
        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-6 uppercase tracking-widest">{classItem.topic}</p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-xs">
            <div className="w-9 h-9 rounded-2xl bg-rose-600 dark:bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20">
              {classItem.instructor.charAt(0)}
            </div>
            <span className="font-bold text-rose-800 dark:text-slate-300 text-xs">{classItem.instructor}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5 text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
              <Calendar className="w-4 h-4 text-rose-400" />
              {classItem.date || 'TBD'}
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
              <Clock className="w-4 h-4 text-rose-400" />
              {classItem.startTime}
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
            <Video className="w-4 h-4 text-rose-400" />
            <span className="flex items-center gap-2">
              VIA {classItem.platform.toUpperCase()}
              {platformIcons[classItem.platform] && (
                <img src={platformIcons[classItem.platform]} alt="" className="w-4 h-4 object-contain filter grayscale group-hover:grayscale-0 transition-all" />
              )}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => classItem.status === 'Live' ? onJoin(classItem) : onToggleReminder(classItem.id)}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${classItem.status === 'Live'
            ? 'bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white shadow-xl shadow-rose-200/50 dark:shadow-indigo-500/20'
            : hasReminder
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50'
              : 'bg-rose-50 dark:bg-indigo-500/10 text-rose-600 dark:text-indigo-400 hover:bg-rose-600 dark:hover:bg-indigo-600 hover:text-white border border-rose-200/50 dark:border-indigo-500/20'
            }`}
        >
          {classItem.status === 'Live' ? (
            <>{t('joinSession')} <LinkIcon className="w-4 h-4" /></>
          ) : hasReminder ? (
            <>{t('reminderActive')} <Check className="w-4 h-4" /></>
          ) : (
            <>{t('notifyMe')} <Bell className="w-4 h-4" /></>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export const Classes: React.FC = () => {
  const { t } = useLanguage();
  const { user, isTeacher, isAdmin } = useAuth();

  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<LiveClass | null>(null);
  const [formData, setFormData] = useState<Partial<LiveClass> & { meetingLink?: string }>({});
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Live' | 'Upcoming' | 'Ended'>('All');
  const [filterPlatform, setFilterPlatform] = useState<string>('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await liveClassService.getAllLiveClasses();
      setClasses(data || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    if (!isTeacher() && !isAdmin()) {
      alert(t('onlyTeachersCanScheduleClasses'));
      return;
    }
    setEditingClass(null);
    setFormData({
      instructor: user?.name || '',
      status: 'Upcoming',
      meetingLink: ''
    });
    setShowForm(true);
  };

  const handleEditClass = (classItem: LiveClass) => {
    if (!isTeacher() && !isAdmin()) {
      alert(t('onlyTeachersCanEditClasses'));
      return;
    }
    if (isTeacher() && classItem.instructor !== user?.name) {
      alert(t('canOnlyEditOwnClasses'));
      return;
    }
    setEditingClass(classItem);
    setFormData({
      ...classItem,
      meetingLink: meetingLinks[classItem.id] || ''
    });
    setShowForm(true);
  };

  const handleDeleteClass = async (classItem: LiveClass) => {
    if (!isTeacher() && !isAdmin()) {
      alert(t('onlyTeachersCanDeleteClasses'));
      return;
    }
    if (isTeacher() && classItem.instructor !== user?.name) {
      alert(t('canOnlyDeleteOwnClasses'));
      return;
    }

    if (confirm(t('confirmDeleteClass', { subject: classItem.subject }))) {
      try {
        await liveClassService.updateLiveClass(classItem.id, { status: 'Ended' });
        await loadClasses();
        alert(t('classDeletedSuccessfully'));
      } catch (error) {
        console.error('Failed to delete class:', error);
        // Fallback to local state update
        setClasses(classes.filter(c => c.id !== classItem.id));
        alert(t('classDeletedSuccessfully'));
      }
    }
  };

  const handleFormSubmit = async (classData: Partial<LiveClass>) => {
    try {
      if (editingClass) {
        await liveClassService.updateLiveClass(editingClass.id, classData);
        alert(t('classUpdatedSuccessfully'));
      } else {
        await liveClassService.createLiveClass(classData as LiveClass);
        alert(t('classCreatedSuccessfully'));
      }
      setShowForm(false);
      await loadClasses();
    } catch (error) {
      console.error('Failed to save class:', error);
      alert('Failed to save class. Please try again.');
    }
  };

  const handleJoinClass = (classItem: LiveClass) => {
    if (classItem.status !== 'Live') {
      alert(t('classNotLive'));
      return;
    }

    if (classItem.meetingLink) {
      window.open(classItem.meetingLink, '_blank');
    } else {
      alert(t('meetingLinkNotAvailable'));
    }
  };

  const handleToggleReminder = (id: string) => {
    setReminders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    if (!reminders[id]) {
      alert("Reminder set successfully!");
    }
  };

  // Get unique platforms for filter
  const platforms = ['All', ...Array.from(new Set(classes.map(c => c.platform)))];

  const filteredClasses = classes.filter(classItem => {
    const subject = classItem.subject || '';
    const topic = classItem.topic || '';
    const instructor = classItem.instructor || '';

    const matchesSearch = subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instructor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'All' || classItem.status === filterStatus;
    const matchesPlatform = filterPlatform === 'All' || classItem.platform === filterPlatform;

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, startIndex + itemsPerPage);

  const handleFilterReset = () => {
    setFilterStatus('All');
    setFilterPlatform('All');
    setShowFilterDropdown(false);
  };

  const handleCopyLink = (classId: string) => {
    const classItem = classes.find(c => c.id === classId);
    if (classItem?.meetingLink) {
      navigator.clipboard.writeText(classItem.meetingLink);
      alert("Meeting link copied to clipboard!");
    } else {
      alert("No meeting link available for this class.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500 dark:border-indigo-500"></div>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse text-xs font-medium uppercase tracking-widest">Loading Classes</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 custom-scrollbar relative">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 filter blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2 bg-rose-900/10 dark:bg-indigo-900/10"></div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10"
      >
        <div>
          <h1 className="text-3xl font-black text-rose-800 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-rose-600/10 dark:bg-indigo-600/10 text-rose-600 dark:text-indigo-400 border border-rose-500/20 dark:border-indigo-500/20">
              <Video className="w-8 h-8" />
            </span>
            {t('liveClasses')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-indigo-500 animate-pulse"></span>
            {t('virtualClassroomsDesc')}
          </p>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadClasses}
            className="p-3.5 text-rose-600 hover:text-rose-800 bg-rose-50/50 dark:bg-slate-900 rounded-2xl border border-rose-200/30 dark:border-slate-700 transition-all shadow-md"
          >
            <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          {(isTeacher() || isAdmin()) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddClass}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-rose-600 dark:bg-indigo-600 text-white hover:bg-rose-500 dark:hover:bg-indigo-500 transition-all shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20 text-xs"
            >
              <Plus className="w-5 h-5" />
              {t('scheduleClass')}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/40 dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/30 dark:border-slate-700 flex flex-col lg:flex-row gap-4 relative z-20"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
          <input
            type="text"
            placeholder={t('searchClassesPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-white/50 dark:bg-slate-800 rounded-xl border border-rose-200/30 dark:border-slate-700 text-rose-900 dark:text-white placeholder:text-rose-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-rose-500/30 dark:focus:ring-indigo-500/30 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-slate-800 border border-rose-200/30 dark:border-slate-700 rounded-xl hover:bg-rose-50 dark:hover:bg-slate-700 transition-all text-rose-800 dark:text-slate-300 text-xs"
            >
              <Filter className="w-5 h-5 text-rose-400" />
              <span>{t('filter')}</span>
              <ChevronDown className={`w-5 h-5 transition-transform duration-500 ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white/95 dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-700 z-50 p-8 overflow-hidden backdrop-blur-2xl"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest mb-3">{t('status')}</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className="w-full p-3.5 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white outline-none font-bold text-sm"
                      >
                        <option value="All">{t('allStatus')}</option>
                        <option value="Live">{t('live')}</option>
                        <option value="Upcoming">{t('upcoming')}</option>
                        <option value="Ended">{t('ended')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest mb-3">{t('platform')}</label>
                      <select
                        value={filterPlatform}
                        onChange={(e) => setFilterPlatform(e.target.value)}
                        className="w-full p-3.5 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white outline-none font-bold text-sm"
                      >
                        <option value="All">{t('allPlatforms')}</option>
                        {platforms.filter(p => p !== 'All').map(platform => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleFilterReset}
                      className="w-full py-3.5 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:text-rose-800 transition-all border border-rose-200 dark:border-slate-700 rounded-2xl hover:bg-rose-50 dark:hover:bg-slate-800"
                    >
                      {t('resetFilters')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedClasses.map((classItem) => (
          <ClassCard
            key={classItem.id}
            classItem={classItem}
            onEdit={handleEditClass}
            onDelete={handleDeleteClass}
            onJoin={handleJoinClass}
            onToggleReminder={handleToggleReminder}
            onCopyLink={handleCopyLink}
            hasReminder={reminders[classItem.id] || false}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-3 bg-rose-50/50 dark:bg-slate-900 p-2 rounded-2xl border border-rose-100 dark:border-slate-800 shadow-lg shadow-rose-200/5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-slate-400 hover:text-rose-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-black text-rose-900 dark:text-slate-300 px-6 uppercase tracking-widest">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 text-rose-600 dark:text-slate-400 hover:text-rose-800 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {filteredClasses.length === 0 && !loading && (
        <div className="bg-white/40 dark:bg-slate-900 rounded-3xl p-10 sm:p-24 text-center border border-rose-200/30 dark:border-slate-800 shadow-xl shadow-rose-200/5">
          <Video className="w-24 h-24 text-rose-100 dark:text-slate-800 mx-auto mb-8" />
          <h3 className="text-2xl font-black text-rose-900 dark:text-white uppercase tracking-tight mb-3">{t('noClassesFound')}</h3>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm mx-auto">{t('tryAdjustingFilters')}</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white/95 dark:bg-slate-900 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-rose-200/50 dark:border-slate-700 shadow-2xl relative"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-600 rounded-t-3xl"></div>

            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-black text-rose-800 dark:text-white uppercase tracking-tight">
                  {editingClass ? t('editClassDetails') : t('scheduleNewSession')}
                </h2>
                <p className="text-[10px] font-black text-rose-700/60 dark:text-slate-400 uppercase tracking-widest mt-2">{t('fillSessionDetails')}</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-12 h-12 flex items-center justify-center bg-rose-50 dark:bg-slate-800 rounded-full text-rose-600 dark:text-white hover:bg-rose-100 transition-all font-black"
              >
                <X className="w-6 h-6 rotate-0" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit(formData);
            }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest ml-1">{t('subject')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('subjectPlaceholder')}
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-6 py-4 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white placeholder:text-rose-200 dark:placeholder-slate-600 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest ml-1">{t('topic')}</label>
                  <input
                    type="text"
                    required
                    placeholder={t('descriptionPlaceholder')}
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-6 py-4 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white placeholder:text-rose-200 dark:placeholder-slate-600 outline-none focus:ring-4 focus:ring-rose-500/10 transition-all font-bold"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest ml-1">{t('instructor')}</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.instructor || ''}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      className="w-full px-6 py-4 bg-rose-50/50 dark:bg-slate-800/50 border border-rose-100/50 dark:border-slate-700 rounded-2xl text-rose-900/40 dark:text-white/40 cursor-not-allowed outline-none font-bold"
                      readOnly
                    />
                    <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-300" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest ml-1">{t('platform')}</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.platform || ''}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                      className="w-full px-6 py-4 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white outline-none focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-indigo-500/10 transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="">{t('selectPlatform')}</option>
                      <option value="Zoom">Zoom Video</option>
                      <option value="GoogleMeet">Google Meet</option>
                      <option value="MicrosoftTeams">MS Teams</option>
                      <option value="Other">Other Platform</option>
                    </select>
                    <Video className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3 md:col-span-2">
                  <label className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest ml-1">{t('meetingLink')}</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://zoom.us/j/..."
                      value={formData.meetingLink || ''}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full pl-14 pr-6 py-4 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white placeholder:text-rose-200 dark:placeholder:slate-600 outline-none focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-indigo-500/10 transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest ml-1">{t('selectDate')}</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-6 py-4 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white outline-none focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-indigo-500/10 transition-all font-bold"
                    />
                    <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest ml-1">{t('startTime')}</label>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={formData.startTime || ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-6 py-4 bg-rose-50 dark:bg-slate-800 border border-rose-100 dark:border-slate-700 rounded-2xl text-rose-900 dark:text-white outline-none focus:ring-4 focus:ring-rose-500/10 dark:focus:ring-indigo-500/10 transition-all font-bold"
                    />
                    <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6 border-t border-rose-50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 rounded-2xl bg-rose-50 dark:bg-slate-800 text-rose-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all border border-rose-100 dark:border-slate-700"
                >
                  {t('discard')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-rose-500/20 dark:shadow-indigo-500/20"
                >
                  {editingClass ? t('updateSession') : t('createSession')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
