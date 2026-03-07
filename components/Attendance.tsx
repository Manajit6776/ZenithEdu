import React, { useEffect, useState } from 'react';
import {
  Search, Filter, Calendar, Users, CheckCircle, XCircle,
  Clock, Plus, Loader2, Save, MoreVertical, Download,
  ChevronDown, AlertCircle, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentService, attendanceService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Attendance: React.FC = () => {
  const { t } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('Computer Science');
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pattern consistency: Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');

  const { user } = useAuth();

  const isTeacher = user?.role === 'Teacher';
  const isAdmin = user?.role === 'Admin';
  const isStudent = user?.role === 'Student';

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isStudent) {
        // For students, first get their student record
        const currentStudent = await studentService.getStudentByUserId(user?.id || '');

        if (currentStudent) {
          setStudents([currentStudent]);
          // Then get attendance records for this student on the selected date
          const attendanceData = await attendanceService.getAttendance({
            date: selectedDate,
            studentId: currentStudent.id
          });
          setAttendanceRecords(attendanceData);
        }
      } else {
        // For teachers/admins, get all students and all attendance records for the date
        const [studentsData, attendanceData] = await Promise.all([
          studentService.getAllStudents(),
          attendanceService.getAttendance({
            date: selectedDate,
            teacherId: isAdmin ? undefined : user?.id
          })
        ]);
        setStudents(studentsData);
        setAttendanceRecords(attendanceData);
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    if (!isTeacher && !isAdmin) return;
    setSaving(true);
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      await attendanceService.markAttendance({
        studentId,
        studentName: student.name,
        date: new Date(selectedDate).toISOString(),
        status,
        subject: selectedSubject,
        markedBy: user?.id || '',
        markedByTeacher: user?.name || ''
      });
      await loadData();
    } catch (error) {
      alert(t('failedToMarkAttendance'));
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    const record = attendanceRecords.find(a => a.studentId === studentId);
    return record?.status || null;
  };

  // Applied Pattern: Advanced Filtering
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDepartment ? s.department === filterDepartment : true;
    return matchesSearch && matchesDept;
  });

  const attendanceStats = {
    total: students.length,
    present: attendanceRecords.filter(a => a.status === 'Present').length,
    absent: attendanceRecords.filter(a => a.status === 'Absent').length,
    late: attendanceRecords.filter(a => a.status === 'Late').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 dark:border-indigo-500"></div>
        <p className="text-rose-800 dark:text-indigo-400 animate-pulse font-black uppercase tracking-widest text-xs">Loading Attendance Records</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Preparing your classroom data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 custom-scrollbar relative">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 filter blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2 bg-indigo-900/10"></div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10"
      >
        <div>
          <h1 className="text-3xl font-black text-rose-800 dark:text-blue-300 uppercase tracking-tight flex items-center gap-4">
            <div className="p-3.5 rounded-[1.25rem] bg-rose-600 dark:bg-blue-600 shadow-lg shadow-rose-200 dark:shadow-blue-900/40">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            {isStudent ? t('myAttendance') : t('attendance')}
          </h1>
          <p className="text-[11px] font-black text-rose-700/60 dark:text-blue-800 mt-3 flex items-center gap-3 uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.5)]"></span>
            ACTIVE SESSION: {selectedDate} • SECTION {selectedSubject.toUpperCase()}
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="w-14 h-14 flex items-center justify-center bg-white/40 dark:bg-white/5 border border-rose-100 dark:border-white/10 rounded-[1.25rem] text-rose-600 dark:text-slate-400 hover:bg-rose-100 dark:hover:bg-white/10 transition-all shadow-sm"
          >
            <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          {!isStudent && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMarkingMode(!isMarkingMode)}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-[1.25rem] font-black transition-all shadow-lg uppercase text-[10px] tracking-widest ${isMarkingMode
                  ? 'bg-rose-600 dark:bg-blue-600 text-white hover:bg-rose-700 dark:hover:bg-blue-700 shadow-rose-200/50 dark:shadow-blue-900/40'
                  : 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 text-white hover:from-rose-500 hover:to-pink-500 shadow-rose-200/50 dark:shadow-blue-900/40'
                }`}
            >
              {isMarkingMode ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isMarkingMode ? t('doneMarking') : t('markAttendance')}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <StatCard title="Total Students" value={attendanceStats.total} icon={<Users />} color="rose" />
        <StatCard title="Present Today" value={attendanceStats.present} icon={<CheckCircle />} color="emerald" />
        <StatCard title="Absent" value={attendanceStats.absent} icon={<XCircle />} color="rose" />
        <StatCard title="Late" value={attendanceStats.late} icon={<Clock />} color="blue" />
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/40 dark:bg-slate-900/40 p-6 rounded-[2rem] border border-rose-100 dark:border-white/5 backdrop-blur-xl shadow-xl shadow-rose-200/5 flex flex-col lg:flex-row gap-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400/60 dark:text-blue-700" />
          <input
            type="text"
            placeholder="Search Resident Records via UID or Label..."
            className="w-full pl-14 pr-6 py-4 bg-white/60 dark:bg-slate-950/50 border border-rose-200 dark:border-blue-500/10 rounded-2xl text-rose-950 dark:text-blue-300 placeholder-rose-300 dark:placeholder-blue-900 focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-blue-500/20 focus:border-rose-300 dark:focus:border-blue-500 transition-all font-black uppercase text-[10px] tracking-widest shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-6 py-4 bg-white/60 dark:bg-slate-950/50 border border-rose-200 dark:border-white/10 rounded-2xl text-rose-950 dark:text-slate-200 outline-none focus:border-rose-300 transition-all font-black text-[10px] uppercase tracking-widest shadow-inner"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-4 px-8 py-4 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-white/10 rounded-2xl hover:bg-rose-100 transition-all text-rose-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest shadow-sm"
            >
              <Filter className="w-5 h-5 text-rose-400" />
              <span>Catalog Parameters</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-500 ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-72 glass-panel rounded-2xl shadow-2xl border border-white/10 z-50 p-6 overflow-hidden backdrop-blur-xl"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Department</label>
                  <select
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-white/10 rounded-xl mb-5 text-rose-900 dark:text-white outline-none font-bold text-xs uppercase tracking-widest"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="" className="bg-white dark:bg-slate-900">All Departments</option>
                    <option value="CS" className="bg-white dark:bg-slate-900">Computer Science</option>
                    <option value="ME" className="bg-white dark:bg-slate-900">Mechanical</option>
                    <option value="Electrical" className="bg-white dark:bg-slate-900">Electrical</option>
                  </select>
                  <button
                    onClick={() => { setFilterDepartment(''); setShowFilterDropdown(false); }}
                    className="w-full py-2.5 text-[10px] text-rose-600 dark:text-blue-400 font-black uppercase tracking-widest hover:bg-rose-500 dark:hover:bg-blue-600 hover:text-white transition-all border border-rose-500/20 dark:border-blue-500/20 rounded-xl"
                  >
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-panel rounded-2xl border border-white/5 overflow-hidden backdrop-blur-lg"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/30 dark:bg-white/5 text-slate-700 dark:text-slate-400">
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider">Student Info</th>
                <th className="px-6 py-5 text-xs font-black uppercase tracking-wider">Roll No</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider">Status</th>
                {(isTeacher || isAdmin) && isMarkingMode && (
                  <th className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-right">Action</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100/50 dark:divide-white/5">
              {filteredStudents.map((student, idx) => {
                const status = getAttendanceStatus(student.id);
                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    className="hover:bg-rose-50/30 dark:hover:bg-indigo-950/20 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <img
                            src={student.photo || `https://ui-avatars.com/api/?name=${student.name}&background=e11d48&color=fff`}
                            className="w-14 h-14 rounded-2xl border-2 border-white dark:border-slate-800 shadow-xl group-hover:scale-110 group-hover:border-rose-400 dark:group-hover:border-indigo-500 transition-all duration-500 object-cover"
                            alt=""
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-2xl shadow-lg"></div>
                        </div>
                        <div>
                          <p className="text-base font-black text-rose-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{student.name}</p>
                          <p className="text-[9px] font-black text-rose-400 dark:text-slate-500 flex items-center gap-2 mt-1 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-200 dark:bg-slate-700"></span>
                            {student.department}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 bg-rose-50 dark:bg-slate-900/50 border border-rose-100 dark:border-white/10 text-rose-800 dark:text-indigo-400 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-inner">
                        {student.rollNo}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={status} />
                    </td>
                    {(isTeacher || isAdmin) && isMarkingMode && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <ActionButton color="emerald" onClick={() => handleMarkAttendance(student.id, 'Present')} disabled={saving || loading}>PR</ActionButton>
                          <ActionButton color="rose" onClick={() => handleMarkAttendance(student.id, 'Absent')} disabled={saving || loading}>AB</ActionButton>
                          <ActionButton color="blue" onClick={() => handleMarkAttendance(student.id, 'Late')} disabled={saving || loading}>LT</ActionButton>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center border border-white/5">
              <Users className="w-10 h-10 text-slate-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-300">No students found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Internal Pattern Components
const StatCard = ({ title, value, icon, color }: any) => {
  const colorMap: any = {
    rose: "from-rose-500/20 to-rose-500/5 text-rose-600 dark:text-blue-400 border-rose-200 dark:border-blue-500/20 shadow-rose-200/20 dark:shadow-blue-900/10",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 border-rose-100 dark:border-emerald-500/10 shadow-rose-100/20",
    blue: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-rose-100 dark:border-blue-500/10 shadow-rose-100/20",
  };

  return (
    <div className={`bg-white/40 dark:bg-slate-900/40 p-8 rounded-[2.5rem] border backdrop-blur-md relative overflow-hidden group hover:scale-[1.05] transition-all duration-500 shadow-lg ${colorMap[color] || colorMap['rose']}`}>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black text-rose-400 dark:text-slate-500 mb-2 uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-4xl font-black text-rose-950 dark:text-white tracking-tighter uppercase">{value}</h3>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-rose-100 dark:border-white/10 flex items-center justify-center transform group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm">
          {React.cloneElement(icon, { size: 28, className: "stroke-[2.5px]" })}
        </div>
      </div>
      
      <div className={`absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[80px] opacity-10 pointer-events-none ${color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-rose-50 dark:bg-slate-900/50 text-rose-300 dark:text-slate-600 border border-rose-100 dark:border-white/5 shadow-inner">
      <AlertCircle className="w-4 h-4" />
      Pending Vector
    </span>
  );

  const styles: any = {
    Present: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-200/20",
    Absent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-rose-200/20",
    Late: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-blue-200/20",
  };

  const icons: any = {
    Present: <CheckCircle className="w-3.5 h-3.5" />,
    Absent: <XCircle className="w-3.5 h-3.5" />,
    Late: <Clock className="w-3.5 h-3.5" />,
  };

  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all group-hover:scale-105 ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const ActionButton = ({ color, children, onClick, disabled }: any) => {
  const styles: any = {
    emerald: "bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-500/20 shadow-emerald-200/20",
    rose: "bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border-rose-500/20 shadow-rose-200/20",
    blue: "bg-blue-500/10 hover:bg-blue-600 text-blue-600 hover:text-white border-blue-500/20 shadow-blue-200/20",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.1, translateY: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border disabled:opacity-30 flex items-center justify-center shadow-sm ${styles[color]}`}
    >
      {children}
    </motion.button>
  );
};