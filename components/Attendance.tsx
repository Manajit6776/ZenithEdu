import React, { useEffect, useState } from 'react';
import {
  Search, Filter, Calendar, Users, CheckCircle, XCircle,
  Clock, Plus, Loader2, Save, MoreVertical, Download,
  ChevronDown, AlertCircle, RefreshCcw, FileText, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { studentService, attendanceService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../src/contexts/ThemeContext';

export const Attendance: React.FC = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('Computer Science');
  const [isMarkingMode, setIsMarkingMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');

  const { user } = useAuth();
  const isDark = theme === 'dark';

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
        const currentStudent = await studentService.getStudentByUserId(user?.id || '');
        if (currentStudent) {
          setStudents([currentStudent]);
          const attendanceData = await attendanceService.getAttendance({
            date: selectedDate,
            studentId: currentStudent.id
          });
          setAttendanceRecords(attendanceData);
        }
      } else {
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-indigo-500"></div>
        <p className="dark: animate-pulse font-black  text-xs tracking-widest">Syncing Attendance Data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 custom-scrollbar relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className={cn("absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20",
          isDark ?"bg-indigo-600/20" :"bg-rose-500/10"
        )} />
        <div className={cn("absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20",
          isDark ?"bg-purple-600/20" :"bg-amber-500/10"
        )} />
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        <div className="relative">
          <h1 className={cn("text-4xl font-black tracking-tight flex items-center gap-4",
            isDark ? "text-white" : "text-rose-950"
          )}>
            {isStudent ? t('myAttendance') : t('attendance')}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold  tracking-widest flex items-center gap-2",
              isDark ?"bg-white/5  border border-white/10" :"bg-rose-500/5  border border-rose-200/50"
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
              Session: {selectedDate}
            </div>
            <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold  tracking-widest border",
              isDark ?"bg-white/5  border-white/10" :"bg-amber-500/5  border-amber-200"
            )}>
              {selectedSubject}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            title="Refresh Data"
            className={cn("w-12 h-12 flex items-center justify-center rounded-2xl border transition-all",
              isDark 
                ?"bg-white/5 border-white/10  hover:bg-white/10 hover:text-white" 
                :"bg-white border-rose-200/50  hover:bg-rose-50 hover: shadow-sm"
            )}
          >
            <RefreshCcw className={cn("w-5 h-5", loading &&"animate-spin")} />
          </motion.button>
          
          {!isStudent && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsMarkingMode(!isMarkingMode)}
              className={cn("flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold transition-all shadow-xl text-[11px]  tracking-[0.15em]",
                isMarkingMode
                  ?"bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/30"
                  : isDark 
                    ?"bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30"
                    :"bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30"
              )}
            >
              {isMarkingMode ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  {t('doneMarking')}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t('markAttendance')}
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard title="Total Capacity" value={attendanceStats.total} icon={<Users />} color="blue" delay={0.1} />
        <StatCard title="Present Records" value={attendanceStats.present} icon={<CheckCircle />} color="emerald" delay={0.2} />
        <StatCard title="Absent Students" value={attendanceStats.absent} icon={<XCircle />} color="rose" delay={0.3} />
        <StatCard title="Late Arrivals" value={attendanceStats.late} icon={<Clock />} color="amber" delay={0.4} />
      </motion.div>

      {/* Search & Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn("p-4 rounded-3xl border backdrop-blur-2xl flex flex-col lg:flex-row gap-4 items-center shadow-2xl shadow-black/5",
          isDark ?"bg-white/[0.03] border-white/8" :"bg-white/80 border-rose-200/50"
        )}
      >
        <div className="relative w-full lg:flex-1 group">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
            isDark ?" group-focus-within:" :" group-focus-within:"
          )} />
          <input
            type="text"
            placeholder="Quick search by name or roll number..."
            className={cn("w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm transition-all focus:outline-none focus:ring-2",
              isDark 
                ?"bg-slate-900/50 border-white/5 text-white placeholder: focus:ring-indigo-500/20 focus:bg-slate-900" 
                :"bg-rose-50/50 border-rose-100  placeholder: focus:ring-rose-500/10 focus:bg-white"
            )}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 lg:flex-none">
            <Calendar className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors",
              isDark ?" group-focus-within:" :" group-focus-within:"
            )} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={cn("pl-11 pr-4 py-3.5 w-full rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 appearance-none",
                isDark 
                  ?"bg-slate-900/50 border-white/5 text-white focus:ring-indigo-500/20" 
                  :"bg-rose-50/50 border-rose-100  focus:ring-rose-500/10"
              )}
            />
          </div>

          <div className="relative flex-1 lg:flex-none">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={cn("flex items-center justify-center gap-3 px-6 py-3.5 w-full rounded-2xl transition-all border text-[11px] font-bold  tracking-widest",
                isDark 
                  ?"bg-white/5 border-white/10  hover:bg-white/10" 
                  :"bg-white border-rose-200  hover:bg-rose-50 shadow-sm"
              )}
            >
              <Filter className="w-4 h-4" />
              Filter
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", showFilterDropdown &&"rotate-180")} />
            </button>

            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.95 }}
                  className={cn("absolute right-0 mt-3 w-72 rounded-3xl shadow-2xl border z-[60] p-5 backdrop-blur-xl overflow-hidden",
                    isDark ?"bg-slate-900/95 border-white/10 shadow-black/80" :"bg-white/95 border-rose-200 shadow-rose-200/40"
                  )}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl -z-10 rounded-full" />
                  
                  <p className={cn("text-[10px] font-black  tracking-[0.2em] mb-4 flex items-center gap-2",
                    isDark ?"" :""
                  )}>
                    <Filter className="w-3 h-3" />
                    Refine List
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className={cn("block text-[10px] font-bold  tracking-widest mb-1.5 ml-1", isDark ?"" :"/60")}>Department</label>
                      <select
                        className={cn("w-full p-3 rounded-xl border outline-none text-sm transition-all appearance-none cursor-pointer focus:ring-2",
                          isDark 
                            ?"bg-slate-800 border-white/10 text-white focus:ring-indigo-500/30" 
                            :"bg-rose-50/50 border-rose-100  focus:ring-rose-500/10"
                        )}
                        value={filterDepartment}
                        onChange={(e) => setFilterDepartment(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        <option value="CS">Computer Science</option>
                        <option value="ME">Mechanical</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                       <button
                        onClick={() => { setFilterDepartment(''); setShowFilterDropdown(false); }}
                        className={cn("py-3 text-[10px] font-bold  tracking-widest rounded-xl transition-all border",
                          isDark ?"border-white/10  hover:bg-white/5" :"border-rose-200  hover:bg-rose-50"
                        )}
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => setShowFilterDropdown(false)}
                        className={cn("py-3 text-[10px] font-bold  tracking-widest rounded-xl transition-all text-white",
                          isDark ?"bg-indigo-600 hover:bg-indigo-500" :"bg-rose-600 hover:bg-rose-500"
                        )}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className={cn("rounded-[2.5rem] border shadow-[0_25px_100px_rgba(0,0,0,0.02)] overflow-hidden",
          isDark ?"border-white/5 bg-white/[0.02]" :"bg-white/50 border-white/80 backdrop-blur-xl"
        )}
      >
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={cn("border-b",
                isDark ?"bg-white/[0.02] border-white/5" :"bg-rose-50/30 border-rose-100/50"
              )}>
                <th className={cn("px-8 py-6 text-[10px] font-black  tracking-[0.25em]", isDark ?"" :"")}>Student Profile</th>
                <th className={cn("px-8 py-6 text-[10px] font-black  tracking-[0.25em]", isDark ?"" :"")}>Official ID</th>
                <th className={cn("px-8 py-6 text-[10px] font-black  tracking-[0.25em]", isDark ?"" :"")}>Current Status</th>
                {(isTeacher || isAdmin) && isMarkingMode && (
                  <th className={cn("px-8 py-6 text-[10px] font-black  tracking-[0.25em] text-right", isDark ?"" :"")}>Quick Mark</th>
                )}
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDark ?"divide-white/5" :"divide-rose-100/50")}>
              {filteredStudents.map((student, idx) => {
                const status = getAttendanceStatus(student.id);
                return (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * idx }}
                    className={cn("transition-all duration-300 group relative",
                      isDark ?"hover:bg-white/[0.02]" :"hover:bg-rose-50/40"
                    )}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="relative flex-shrink-0">
                           <img
                            src={student.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`}
                            className={cn("w-14 h-14 rounded-full object-cover transition-all duration-500 group-hover:scale-110",
                              isDark ?"bg-slate-900 border-2 border-white/10" :"bg-white border-2 border-rose-100 shadow-sm"
                            )}
                            alt=""
                          />
                          {!status && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse shadow-lg" />
                          )}
                        </div>
                        <div>
                          <p className={cn("text-base font-bold tracking-tight transition-colors group-hover:",
                            isDark ?"text-white" :""
                          )}>{student.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={cn("text-[9px] font-black tracking-widest  px-2 py-0.5 rounded-md",
                              isDark ?"bg-white/5" :"bg-rose-100"
                            )}>{student.department}</span>
                            {idx < 3 && !isStudent && (
                              <span className="flex items-center gap-1 text-[9px] font-bold   tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-current" />
                                Merit Student
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold tracking-[0.1em]",
                        isDark ?"bg-white/5" :"bg-rose-50/80  border border-rose-100 shadow-sm"
                      )}>
                        #{student.rollNo}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={status} />
                    </td>
                    {(isTeacher || isAdmin) && isMarkingMode && (
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end items-center gap-2.5">
                          <MarkButton 
                            label="PR" 
                            type="Present" 
                            isActive={status === 'Present'} 
                            onClick={() => handleMarkAttendance(student.id, 'Present')} 
                            disabled={saving} 
                          />
                          <MarkButton 
                            label="AB" 
                            type="Absent" 
                            isActive={status === 'Absent'} 
                            onClick={() => handleMarkAttendance(student.id, 'Absent')} 
                            disabled={saving} 
                          />
                          <MarkButton 
                            label="LT" 
                            type="Late" 
                            isActive={status === 'Late'} 
                            onClick={() => handleMarkAttendance(student.id, 'Late')} 
                            disabled={saving} 
                          />
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
          <div className="py-24 text-center flex flex-col items-center gap-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent pointer-events-none" />
            <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center border animate-bounce duration-[2000ms]",
              isDark ?"bg-white/[0.03] border-white/5" :"bg-rose-50 border-rose-100"
            )}>
              <Users className={cn("w-10 h-10", isDark ?"" :"")} />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className={cn("text-xl font-black  tracking-widest", isDark ?"text-white" :"")}>No records found</h3>
              <p className={cn("text-sm max-w-[280px] mx-auto", isDark ?"" :"")}>We couldn't find any students matching your current search or filter criteria.</p>
            </div>
            <button 
              onClick={() => { setSearchTerm(''); setFilterDepartment(''); }}
              className={cn("px-8 py-3 rounded-2xl text-[10px] font-black  tracking-[0.2em] transition-all",
                isDark ?"bg-white/5  hover:bg-white/10" :"bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-500/30"
              )}
            >
              Clear all filters
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Pattern Components ---

const StatCard = ({ title, value, icon, color, delay }: any) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const styles: any = {
    rose: {
      gradient:"from-rose-500/20 via-rose-500/5 to-transparent",
      text:" dark:",
      iconBg:"bg-rose-500",
      glow:"shadow-rose-500/20",
      border:"border-rose-500/20"
    },
    emerald: {
      gradient:"from-emerald-500/20 via-emerald-500/5 to-transparent",
      text:" dark:",
      iconBg:"bg-emerald-500",
      glow:"shadow-emerald-500/20",
      border:"border-emerald-500/20"
    },
    amber: {
      gradient:"from-amber-500/20 via-amber-500/5 to-transparent",
      text:" dark:",
      iconBg:"bg-amber-500",
      glow:"shadow-amber-500/20",
      border:"border-amber-500/20"
    },
    blue: {
      gradient: isDark ?"from-indigo-500/20 via-indigo-500/5 to-transparent" :"from-blue-500/20 via-blue-500/5 to-transparent",
      text: isDark ?"" :"",
      iconBg: isDark ?"bg-indigo-600" :"bg-blue-600",
      glow: isDark ?"shadow-indigo-500/20" :"shadow-blue-500/20",
      border: isDark ?"border-white/10" :"border-blue-500/20"
    }
  };

  const s = styles[color] || styles.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn("p-6 rounded-[2rem] border backdrop-blur-md relative overflow-hidden group hover:scale-[1.02] transition-all duration-500",
        isDark ?"bg-white/[0.03] border-white/5 shadow-2xl" :"bg-white border-white shadow-xl shadow-black/5"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 -z-10", s.gradient)} />
      <div className="flex items-center justify-between mb-2">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:rotate-6",
          s.iconBg, s.glow
        )}>
          {React.cloneElement(icon, { size: 20, strokeWidth: 2.5 })}
        </div>
        <div className={cn("px-3 py-1 rounded-full text-[9px] font-black  tracking-widest",
          isDark ?"bg-white/5" :"bg-slate-100"
        )}>
          +2.4%
        </div>
      </div>
      <p className={cn("text-[10px] font-black  tracking-[0.2em] mb-1.5", isDark ?"" :"")}>{title}</p>
      <h3 className={cn("text-3xl font-black tracking-tight", isDark ?"text-white" :"")}>{value}</h3>
    </motion.div>
  );
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!status) return (
    <span className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black  tracking-widest border transition-all",
      isDark ?"bg-slate-900 border-white/5" :"bg-slate-50 border-slate-200"
    )}>
      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      Unmarked
    </span>
  );

  const configs: any = {
    Present: {
      bg: isDark ?"bg-emerald-500/10 border-emerald-500/20" :"bg-emerald-50 border-emerald-100",
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    Absent: {
      bg: isDark ?"bg-rose-500/10 border-rose-500/20" :"bg-rose-50 border-rose-100",
      icon: <XCircle className="w-3.5 h-3.5" />
    },
    Late: {
      bg: isDark ?"bg-amber-500/10 border-amber-500/20" :"bg-amber-50 border-amber-100",
      icon: <Clock className="w-3.5 h-3.5" />
    }
  };

  const config = configs[status] || configs.Present;

  return (
    <span className={cn("inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[9px] font-black  tracking-[0.15em] border transition-all shadow-sm",
      config.bg
    )}>
      {config.icon}
      {status}
    </span>
  );
};

const MarkButton = ({ label, type, isActive, onClick, disabled }: any) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const types: any = {
    Present: {
      active:"bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-emerald-500",
      hover: isDark ?"bg-emerald-500/10  hover:bg-emerald-500 hover:text-white" :"bg-emerald-50  hover:bg-emerald-500 hover:text-white"
    },
    Absent: {
      active:"bg-rose-500 text-white shadow-lg shadow-rose-500/30 border-rose-500",
      hover: isDark ?"bg-rose-500/10  hover:bg-rose-500 hover:text-white" :"bg-rose-50  hover:bg-rose-500 hover:text-white"
    },
    Late: {
      active:"bg-amber-500 text-white shadow-lg shadow-amber-500/30 border-amber-500",
      hover: isDark ?"bg-amber-500/10  hover:bg-amber-500 hover:text-white" :"bg-amber-50  hover:bg-amber-500 hover:text-white"
    }
  };

  const t = types[type];

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black tracking-widest border transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed",
        isActive ? t.active : t.hover,
        !isDark && !isActive &&"border-rose-100 shadow-sm"
      )}
    >
      {label}
    </motion.button>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}