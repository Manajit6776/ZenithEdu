import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, CheckCircle, XCircle, Clock,
  AlertCircle, TrendingUp, Activity,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { studentService, attendanceService } from '../lib/api';

interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: string;
  subject: string;
  markedBy: string;
  markedByTeacher: string;
  createdAt: string;
}

interface StudentInfo {
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendance: number;
}

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonth, selectedYear]);

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      if (!user?.id) return;

      const studentRecord = await studentService.getStudentByUserId(user.id);
      if (!studentRecord) return;

      setStudentInfo({
        presentDays: (studentRecord as any).presentDays || 0,
        absentDays: (studentRecord as any).absentDays || 0,
        lateDays: (studentRecord as any).lateDays || 0,
        attendance: studentRecord.attendance || 0
      });

      const studentAttendance = await attendanceService.getAttendance({ studentId: studentRecord.id });

      const filteredAttendance = studentAttendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.getUTCMonth() === selectedMonth &&
          recordDate.getUTCFullYear() === selectedYear;
      });

      filteredAttendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendanceRecords(filteredAttendance);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const pieData = [
    { name: 'Present', value: studentInfo?.presentDays || 0, color: '#10b981' },
    { name: 'Absent', value: studentInfo?.absentDays || 0, color: '#ef4444' },
    { name: 'Late', value: studentInfo?.lateDays || 0, color: '#f59e0b' },
  ];

  const chartData = attendanceRecords.slice().reverse().map(record => ({
    date: new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    statusValue: record.status === 'Present' ? 100 : record.status === 'Late' ? 50 : 0
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
        </div>
        <p className="text-slate-400 font-medium tracking-wide">Analysing Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full"></div>
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <CalendarIcon className="w-8 h-8 text-indigo-400" />
            </div>
            My Attendance
          </h1>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Overall Presence: <span className="text-white font-semibold">{studentInfo?.attendance}%</span>
          </p>
        </div>

        <div className="flex items-center gap-3 glass-panel p-1.5 rounded-2xl border border-white/10 shadow-xl">
          <button
            onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="px-4 py-1 text-center min-w-[140px] flex flex-col items-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer hover:text-indigo-400 transition-colors text-center appearance-none"
            >
              {months.map((month, i) => (
                <option key={i} value={i} className="bg-slate-900 text-white">{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-[10px] text-slate-500 uppercase tracking-widest outline-none cursor-pointer hover:text-indigo-400 transition-colors text-center appearance-none"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year} className="bg-slate-900 text-white">{year}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* Main Percentage Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel rounded-3xl p-8 border border-white/10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>

          <div className="relative flex-shrink-0">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={440}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * (studentInfo?.attendance || 0)) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-indigo-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{studentInfo?.attendance}</span>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">%</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold text-white">Academic Presence</h3>
              <p className="text-sm text-slate-400 mt-1">Consistency in attendance is key to your academic success.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Days</p>
                <p className="text-lg font-bold text-white">{(studentInfo?.presentDays || 0) + (studentInfo?.absentDays || 0) + (studentInfo?.lateDays || 0)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-emerald-500/70 uppercase font-bold mb-1">Present</p>
                <p className="text-lg font-bold text-emerald-400">{studentInfo?.presentDays}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-3xl p-6 border border-white/10 hidden md:flex flex-col items-center justify-center"
        >
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={8}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] text-slate-400 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-semibold text-white">Monthly Distribution</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Summary for {months[selectedMonth]}</p>
          </div>
        </motion.div>

        {/* Trend Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">+2.4%</span>
          </div>
          <div>
            <h4 className="text-2xl font-bold text-white mt-4">Good Status</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Your attendance is above the 75% threshold recommended by the department.</p>
          </div>
          <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all">
            View Analytics
          </button>
        </motion.div>
      </div>

      {/* Monthly Trend Area Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-panel rounded-3xl p-8 border border-white/10 relative z-10 h-80 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-white">Attendance Activity Trend</h3>
            <p className="text-xs text-slate-500 mt-1">Daily presence consistency for the current month</p>
          </div>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Present Status
            </span>
          </div>
        </div>

        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                dy={10}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
                itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
              />
              <Area
                type="monotone"
                dataKey="statusValue"
                name="Presence Score"
                stroke="#6366f1"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorStatus)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

