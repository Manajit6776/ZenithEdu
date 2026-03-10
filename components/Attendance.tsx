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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-rose-500 dark:border-indigo-500"></div>
        <p className="text-slate-500 animate-pulse text-xs font-medium uppercase tracking-widest">Loading Attendance Records</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 custom-scrollbar relative">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-96 filter blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2 bg-rose-900/10 dark:bg-indigo-900/10"></div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10"
      >
        <div>
          <h1 className="text-3xl font-black text-rose-800 dark:text-white tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-rose-600 dark:bg-indigo-600 shadow-lg shadow-rose-500/20 dark:shadow-indigo-500/20">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            {isStudent ? t('myAttendance') : t('attendance')}
          </h1>
          <p className="text-xs text-rose-700/60 dark:text-slate-500 mt-2 flex items-center gap-2 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-rose-500 dark:bg-indigo-500 animate-pulse"></span>
            Active Session: {selectedDate} • {selectedSubject}
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
              className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-lg uppercase text-[10px] tracking-widest ${isMarkingMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white shadow-rose-500/20 dark:shadow-indigo-500/20'
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
        className="p-4 rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-rose-50/50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 text-rose-950 dark:text-white placeholder:text-rose-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-rose-500/30 dark:focus:ring-indigo-500/30 transition-all"
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
              className="px-4 py-2.5 bg-rose-50/50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 rounded-xl text-rose-950 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/30 dark:focus:ring-indigo-500/30 transition-all text-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 rounded-xl hover:bg-rose-100 dark:hover:bg-white/10 transition-all text-rose-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest"
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-rose-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-900 z-50 p-4 backdrop-blur-xl"
                >
                  <label className="block text-[10px] font-bold text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mb-2">Department</label>
                  <select
                    className="w-full p-2.5 bg-rose-50 dark:bg-slate-800 border border-rose-200/50 dark:border-white/10 rounded-xl mb-3 text-rose-900 dark:text-white outline-none text-sm"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    <option value="CS">Computer Science</option>
                    <option value="ME">Mechanical</option>
                    <option value="Electrical">Electrical</option>
                  </select>
                  <button
                    onClick={() => { setFilterDepartment(''); setShowFilterDropdown(false); }}
                    className="w-full py-2 text-[10px] font-bold text-rose-600 dark:text-indigo-400 uppercase tracking-widest hover:bg-rose-500 dark:hover:bg-indigo-500 hover:text-white transition-all border border-rose-500/20 dark:border-indigo-500/20 rounded-xl"
                  >
                    Reset
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
        className="rounded-2xl border border-rose-200/50 dark:border-white/8 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-rose-50/80 dark:bg-white/[0.03] border-b border-rose-200/30 dark:border-white/5 text-rose-700/60 dark:text-slate-500">
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
                    className="hover:bg-rose-50/30 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative">
                          <img
                            src={student.photo || `https://ui-avatars.com/api/?name=${student.name}&background=e11d48&color=fff`}
                            className="w-12 h-12 rounded-xl border-2 border-rose-200 dark:border-white/10 group-hover:scale-105 group-hover:border-indigo-500/40 transition-all duration-300 object-cover"
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
                      <span className="px-3 py-1 bg-rose-50 dark:bg-white/5 border border-rose-200/50 dark:border-white/8 text-rose-700 dark:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">
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
                          <ActionButton color="rose" darkColor="blue" onClick={() => handleMarkAttendance(student.id, 'Late')} disabled={saving || loading}>LT</ActionButton>
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
    rose: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200/50 dark:border-rose-500/20', glow: 'bg-rose-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200/50 dark:border-emerald-500/20', glow: 'bg-emerald-500' },
    blue: { bg: 'bg-rose-500/10 dark:bg-indigo-500/10', text: 'text-rose-600 dark:text-indigo-400', border: 'border-rose-200/50 dark:border-indigo-500/20', glow: 'bg-rose-500 dark:bg-indigo-500' },
  };
  const c = colorMap[color] || colorMap['rose'];

  return (
    <div className={`p-5 rounded-2xl border ${c.border} bg-white/60 dark:bg-white/[0.03] backdrop-blur-md relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-rose-400 dark:text-slate-500 mb-1 uppercase tracking-widest">{title}</p>
          <h3 className="text-3xl font-black text-rose-950 dark:text-white">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center ${c.text} group-hover:scale-110 transition-all`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
      </div>
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none ${c.glow}`} />
    </div>
  );
};

const StatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 border border-slate-200/50 dark:border-white/8">
      <AlertCircle className="w-3.5 h-3.5" />
      Not Marked
    </span>
  );

  const styles: any = {
    Present: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Absent: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    Late: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  };

  const icons: any = {
    Present: <CheckCircle className="w-3.5 h-3.5" />,
    Absent: <XCircle className="w-3.5 h-3.5" />,
    Late: <Clock className="w-3.5 h-3.5" />,
  };

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

const ActionButton = ({ color, children, onClick, disabled }: any) => {
  const styles: any = {
    emerald: "bg-emerald-500/10 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-500/20",
    rose: "bg-rose-500/10 hover:bg-rose-600 text-rose-600 hover:text-white border-rose-500/20",
    blue: "bg-rose-500/10 dark:bg-indigo-500/10 hover:bg-rose-600 dark:hover:bg-indigo-600 text-rose-600 dark:text-indigo-400 hover:text-white border-rose-500/20 dark:border-indigo-500/20",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-11 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all border disabled:opacity-30 flex items-center justify-center ${styles[color]}`}
    >
      {children}
    </motion.button>
  );
};